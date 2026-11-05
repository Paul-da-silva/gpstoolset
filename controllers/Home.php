<?php
declare(strict_types=1);

namespace App\Controllers;

use Kuiper\Core\Controller;

/**
 * `/` → tools registry slug "home" → includes/pages/home.php.
 * <!-- kuiper-core-ref: 1.1.3-draft -->
 */
final class Home extends Controller
{
    public function index(): void
    {
        if (!isset($GLOBALS['SITE']) || !function_exists('site')) {
            require $this->app->root . '/includes/bootstrap.php';
        }
        route_render_slug('home');
    }
}
