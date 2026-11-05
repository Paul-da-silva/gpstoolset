<?php
declare(strict_types=1);

namespace App\Controllers;

use Kuiper\Core\Controller;

/**
 * Thin wrapper: registry slug to includes/pages or tools page entry.
 * <!-- kuiper-core-ref: 1.1.3-draft -->
 */
final class Registry extends Controller
{
    public function show(string $slug): void
    {
        // routes.php may already have loaded router helpers; still need full bootstrap
        // ($SITE, seo, ads, e(), layouts) before including page entries.
        if (!isset($GLOBALS['SITE']) || !function_exists('site')) {
            require $this->app->root . '/includes/bootstrap.php';
        }
        route_render_slug($slug);
    }
}
