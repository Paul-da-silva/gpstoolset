<?php
declare(strict_types=1);

/**
 * Front controller. Apache sends every route here (public/.htaccess);
 * real files under public/ (assets, robots.txt, favicon) are served as files.
 * Routes live in config/tools.php.
 */

require dirname(__DIR__) . '/includes/bootstrap.php';

route_dispatch();
