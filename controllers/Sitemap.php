<?php
declare(strict_types=1);

namespace App\Controllers;

use Kuiper\Core\Controller;

/**
 * Generated /sitemap.xml (seo_sitemap_xml). Not a static file.
 * <!-- kuiper-core-ref: 1.1.3-draft -->
 */
final class Sitemap extends Controller
{
    public function index(): void
    {
        if (!isset($GLOBALS['SITE']) || !function_exists('seo_sitemap_xml')) {
            require $this->app->root . '/includes/bootstrap.php';
        }
        route_render_sitemap();
    }
}
