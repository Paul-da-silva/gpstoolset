<?php
declare(strict_types=1);
namespace Kuiper\Core;
/**
 * Single access point for secrets and per-environment values.
 * <!-- kuiper-core-ref: 1.1.3-draft -->
 *
 * Behaviour:
 * - Order: server env ($_SERVER / Apache SetEnv) > getenv() > config/env.php > default.
 * - Missing or unreadable config/env.php is ignored silently (treated as []).
 * - www-data (or the PHP user) must be able to read config/env.php when present
 *   (e.g. chmod 640, owner paul:www-data). Never commit env.php.
 * - config/env.example.php is committed with the same keys and fake values.
 * - BASE_URL falls back to GPS_BASE_URL (temporary alias) when BASE_URL is unset.
 */
final class Env
{
    /** @var array<string,mixed>|null */
    private static ?array $file = null;
    private static string $root = '';

    public static function load(string $root): void
    {
        self::$root = $root;
        $path = $root . '/config/env.php';
        if (!is_readable($path)) {
            self::$file = [];
            return;
        }
        $values = require $path;
        self::$file = is_array($values) ? $values : [];
    }

    public static function get(string $key, mixed $default = null): mixed
    {
        $value = self::lookup($key);
        if ($value !== null && $value !== '') {
            return $value;
        }
        // Temporary alias until prod BASE_URL is confirmed (gpstoolset pilot Phase 6).
        // Prefer BASE_URL everywhere; GPS_BASE_URL still wins as a fallback for BASE_URL only.
        if ($key === 'BASE_URL') {
            $legacy = self::lookup('GPS_BASE_URL');
            if ($legacy !== null && $legacy !== '') {
                return $legacy;
            }
        }
        return $default;
    }

    private static function lookup(string $key): mixed
    {
        $server = $_SERVER[$key] ?? null;
        if (is_string($server) && $server !== '') {
            return $server;
        }
        $env = getenv($key);
        if (is_string($env) && $env !== '') {
            return $env;
        }
        if (self::$file === null) {
            self::load(self::$root !== '' ? self::$root : dirname(__DIR__));
        }
        $file = self::$file[$key] ?? null;
        if ($file !== null && $file !== '') {
            return $file;
        }
        return null;
    }

    public static function require(string $key): mixed
    {
        $value = self::get($key);
        if ($value === null || $value === '') {
            throw new \RuntimeException("Missing env key: {$key} (add it to config/env.php)");
        }
        return $value;
    }

    /** Reset cached file (tests). */
    public static function reset(): void
    {
        self::$file = null;
        self::$root = '';
    }
}
