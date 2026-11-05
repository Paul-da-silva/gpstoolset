<?php
declare(strict_types=1);

namespace App\Controllers;

use Kuiper\Core\Controller;

/**
 * 404_override target. Method must NOT be named notFound — reserved on Controller.
 * <!-- kuiper-core-ref: 1.1.3-draft -->
 */
final class Errors extends Controller
{
    public function index(): void
    {
        // Status already set to 404 by Router before invoke.
        if (!isset($GLOBALS['SITE']) || !function_exists('site')) {
            require $this->app->root . '/includes/bootstrap.php';
        }
        route_render(route_not_found());
    }
}
