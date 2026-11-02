<?php
declare(strict_types=1);

/**
 * Full-screen map layout: slim top bar, map, graph dock, floating chips.
 * No footer and no ad slots. The page may print scripts after this file,
 * then include close.php.
 *
 * Set $mapShellEmpty = false before including when the page already has a track.
 * Optional copy: $mapShellHeading, $mapShellLead, $mapShellNote,
 * $mapShellDropText, $mapShellAccept.
 * $mapShellVideo: include the video stage (GoPro tool).
 * $mapShellPreamble: absolute path of HTML shown under the map until a file loads.
 */

if (!isset($page) || !is_array($page)) {
    $page = [];
}
$page['isMapPage'] = true;

$mapShellPreamble = isset($mapShellPreamble) && is_string($mapShellPreamble) ? $mapShellPreamble : '';

require __DIR__ . '/head.php';
require __DIR__ . '/topbar.php';
require __DIR__ . '/map-app.php';
?>
<?php if ($mapShellPreamble !== '' && is_file($mapShellPreamble)) : ?>
<div id="tool-preamble" class="tool-preamble">
<?php
    require $mapShellPreamble;
    $footerInPreamble = true;
    require __DIR__ . '/footer.php';
    $footerInPreamble = false;
?>
</div>
<?php endif; ?>
<?php require APP_ROOT . '/includes/partials/tile-config.php'; ?>
<script src="/assets/vendor/leaflet/leaflet.js"></script>
<script src="/assets/js/ui-state.js"></script>
<script src="/assets/js/graph-dock.js"></script>
<script src="/assets/js/file-drop.js"></script>
<script src="/assets/js/map-shell.js"></script>
<script>
GpsMapShell.init();
</script>
