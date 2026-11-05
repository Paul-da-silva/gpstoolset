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
        $legacy = $this->app->root . '/includes/pages/not-found.php';
        if (is_file($legacy)) {
            if (!defined('APP_ROOT')) {
                require $this->app->root . '/includes/bootstrap.php';
            }
            $route = [
                'slug' => '404',
                'path' => '',
                'title' => 'Page not found',
                'description' => 'That page does not exist.',
                'noindex' => true,
            ];
            $page = [
                'title' => 'Page not found',
                'description' => 'That page does not exist.',
                'path' => '',
                'noindex' => true,
                'flags' => ['map' => false, 'video' => false, 'ads' => true],
            ];
            $GLOBALS['route'] = $route;
            require $legacy;
            return;
        }
        if (is_file($this->app->viewPath('errors/not_found'))) {
            $this->view('errors/not_found', ['title' => 'Not found']);
            return;
        }
        echo 'Not found';
    }
}
