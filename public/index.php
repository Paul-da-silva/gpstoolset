<?php
declare(strict_types=1);

/**
 * Front controller. Apache sends every non-file route here (public/.htaccess).
 * Phase 1: Kuiper Router::plan() with mandatory legacy fallthrough on not_found.
 * <!-- kuiper-core-ref: 1.1.3-draft -->
 */

$root = dirname(__DIR__);

if (is_file($root . '/vendor/autoload.php')) {
    require $root . '/vendor/autoload.php';
} else {
    require_once $root . '/core/helpers.php';
    spl_autoload_register(static function (string $class) use ($root): void {
        $map = [
            'Kuiper\\Core\\' => $root . '/core/',
            'App\\Controllers\\' => $root . '/controllers/',
        ];
        foreach ($map as $prefix => $dir) {
            if (!str_starts_with($class, $prefix)) {
                continue;
            }
            $rel = str_replace('\\', '/', substr($class, strlen($prefix))) . '.php';
            $file = $dir . $rel;
            if (is_file($file)) {
                require $file;
            }
            return;
        }
    });
}

use Kuiper\Core\App;
use Kuiper\Core\Env;
use Kuiper\Core\ErrorHandler;
use Kuiper\Core\Router;

try {
    Env::load($root);
} catch (\Throwable $e) {
    error_log('GPS Toolset env load failed: ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine());
    while (ob_get_level() > 0) {
        ob_end_clean();
    }
    if (!headers_sent()) {
        http_response_code(500);
        header('Content-Type: text/plain; charset=UTF-8');
    }
    echo 'Internal Server Error';
    exit(1);
}
ErrorHandler::register();

$app = App::boot($root);

$config = require $root . '/config/routes.php';
if (isset($config['route']) && is_array($config['route'])) {
    $routes = $config['route'];
    $redirects = is_array($config['redirect'] ?? null) ? $config['redirect'] : [];
} else {
    $routes = $config;
    $redirects = [];
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$uri = $_SERVER['REQUEST_URI'] ?? '/';

$router = new Router($app, $routes, $redirects);
$plan = $router->plan($method, $uri);

// Mandatory legacy fallthrough: never dispatch() on not_found (that would
// emit the Kuiper 404 and skip includes/router.php).
if (($plan['status'] ?? '') === 'not_found') {
    require $root . '/includes/bootstrap.php';
    route_dispatch();
    return;
}

$router->dispatch($method, $uri);
