<?php
declare(strict_types=1);

/**
 * The one script stack for every map tool page. Print it once, after the
 * page markup (including layout/map-app.php).
 *
 * Order matters:
 *   1. window.GPS_TILE_CONFIG (config/tiles.php, inline)
 *   2. Leaflet and Chart.js as classic scripts (globals L and Chart)
 *   3. the tool's vendor scripts, if any (route "vendorScripts")
 *   4. the tool's ES module (route "module"), which imports the shared
 *      map modules (map-shell, graph-dock, file-drop, tiles…)
 *
 * Modules are deferred, so 1–3 have run before the module starts.
 * Expects $route from route_dispatch(). Every path starts with /assets/.
 */
$assetPath = static function (mixed $src): string {
    return is_string($src) && str_starts_with($src, '/assets/') && !str_contains($src, '..') ? $src : '';
};

require __DIR__ . '/tile-config.php';
?>
<script src="/assets/vendor/leaflet/leaflet.js"></script>
<script src="/assets/vendor/chartjs/chart.umd.min.js"></script>
<?php foreach (($route['vendorScripts'] ?? []) as $src) : ?>
<?php if ($assetPath($src) !== '') : ?>
<script src="<?= e($assetPath($src)) ?>"></script>
<?php endif; ?>
<?php endforeach; ?>
<?php
$moduleSrc = $assetPath($route['module'] ?? null);
if ($moduleSrc !== '') {
    $moduleFile = APP_ROOT . '/public' . $moduleSrc;
    $moduleSrc .= '?v=' . (is_file($moduleFile) ? filemtime($moduleFile) : '1');
}
?>
<?php if ($moduleSrc !== '') : ?>
<script type="module" src="<?= e($moduleSrc) ?>"></script>
<?php endif; ?>
