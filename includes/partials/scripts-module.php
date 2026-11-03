<?php
declare(strict_types=1);

/**
 * One ES module for a document tool. No Leaflet and no Chart.js.
 * Expects $route from route_dispatch(). The path starts with /assets/.
 */
require __DIR__ . '/format-config.php';

$moduleSrc = '';
if (
    isset($route['module'])
    && is_string($route['module'])
    && str_starts_with($route['module'], '/assets/')
    && !str_contains($route['module'], '..')
) {
    $moduleSrc = $route['module'];
    $moduleFile = APP_ROOT . '/public' . $moduleSrc;
    $moduleSrc .= '?v=' . (is_file($moduleFile) ? (string) filemtime($moduleFile) : '1');
}
?>
<?php if ($moduleSrc !== '') : ?>
<script type="module" src="<?= e($moduleSrc) ?>"></script>
<?php endif; ?>
