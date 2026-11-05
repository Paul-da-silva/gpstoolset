<?php
declare(strict_types=1);

namespace App\Controllers;

use Kuiper\Core\Controller;

/**
 * Default controller for `/` until Phase 2 registers an explicit home route.
 * Delegates to the legacy front-controller body so Phase 1 does not change `/`.
 * <!-- kuiper-core-ref: 1.1.3-draft -->
 */
final class Home extends Controller
{
    public function index(): void
    {
        require $this->app->root . '/includes/bootstrap.php';
        route_dispatch();
    }
}
