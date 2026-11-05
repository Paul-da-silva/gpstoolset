<?php
declare(strict_types=1);
namespace Kuiper\Core;
/**
 * Exception / error handling driven by APP_ENV and STRICT_ERRORS.
 * <!-- kuiper-core-ref: 1.1.3-draft -->
 *
 * Prod (default): warnings, notices, deprecations are logged only — they never
 * become HTTP 500. Uncaught exceptions and fatal errors (shutdown) return 500.
 * STRICT_ERRORS=true (default when APP_ENV is dev/development/local): every
 * reported error becomes an ErrorException (strict).
 */
final class ErrorHandler
{
    private static bool $registered = false;

    public static function register(): void
    {
        if (self::$registered) {
            return;
        }
        self::$registered = true;

        $env = strtolower((string) Env::get('APP_ENV', 'prod'));
        $dev = in_array($env, ['dev', 'development', 'local'], true);

        $strictRaw = Env::get('STRICT_ERRORS', null);
        if ($strictRaw === null || $strictRaw === '') {
            $strict = $dev;
        } else {
            $strict = $strictRaw === true || $strictRaw === 1 || $strictRaw === '1' || $strictRaw === 'true';
        }

        if ($dev || $strict) {
            ini_set('display_errors', $dev ? '1' : '0');
            error_reporting(E_ALL);
        } else {
            ini_set('display_errors', '0');
            error_reporting(E_ALL);
        }

        set_exception_handler(static function (\Throwable $e) use ($dev): void {
            error_log('Kuiper uncaught: ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine());
            self::send500($dev, $e);
        });

        set_error_handler(static function (int $severity, string $message, string $file, int $line) use ($strict): bool {
            if (!(error_reporting() & $severity)) {
                return false;
            }

            if ($strict) {
                throw new \ErrorException($message, 0, $severity, $file, $line);
            }

            // Prod / lenient: log non-fatals; do not convert to 500
            if (self::isNonFatal($severity)) {
                error_log(sprintf('Kuiper %s: %s in %s:%d', self::severityName($severity), $message, $file, $line));
                return true;
            }

            throw new \ErrorException($message, 0, $severity, $file, $line);
        });

        register_shutdown_function(static function () use ($dev): void {
            $err = error_get_last();
            if ($err === null) {
                return;
            }
            if (!in_array($err['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR], true)) {
                return;
            }
            error_log('Kuiper fatal: ' . $err['message'] . ' in ' . $err['file'] . ':' . $err['line']);
            self::send500($dev, null, $err['message']);
        });
    }

    /** @for tests */
    public static function resetForTests(): void
    {
        self::$registered = false;
        restore_error_handler();
        restore_exception_handler();
    }

    private static function isNonFatal(int $severity): bool
    {
        $list = [
            E_WARNING,
            E_NOTICE,
            E_USER_WARNING,
            E_USER_NOTICE,
            E_DEPRECATED,
            E_USER_DEPRECATED,
        ];
        // E_STRICT removed in PHP 8.4; only append when the constant still exists and is non-deprecated usable.
        if (\PHP_VERSION_ID < 80400 && \defined('E_STRICT')) {
            $list[] = \constant('E_STRICT');
        }
        return in_array($severity, $list, true);
    }

    private static function severityName(int $severity): string
    {
        return match ($severity) {
            E_WARNING, E_USER_WARNING => 'warning',
            E_NOTICE, E_USER_NOTICE => 'notice',
            E_DEPRECATED, E_USER_DEPRECATED => 'deprecated',
            default => 'error',
        };
    }

    /** @param array<string,mixed>|null $unused */
    private static function send500(bool $dev, ?\Throwable $e = null, string $fallback = ''): void
    {
        // C1: drop any partial page so the 500 body is clean
        while (ob_get_level() > 0) {
            ob_end_clean();
        }
        if (!headers_sent()) {
            http_response_code(500);
            header('Content-Type: text/plain; charset=UTF-8');
        }
        if ($dev) {
            if ($e !== null) {
                echo 'Error: ' . $e->getMessage() . "\n" . $e->getFile() . ':' . $e->getLine();
            } else {
                echo 'Error: ' . $fallback;
            }
        } else {
            echo 'Internal Server Error';
        }
    }
}
