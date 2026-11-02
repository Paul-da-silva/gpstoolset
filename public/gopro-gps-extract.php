<?php
declare(strict_types=1);

require dirname(__DIR__) . '/includes/bootstrap.php';

$page = [
    'title' => 'GoPro GPS Extractor — Free, No Upload',
    'description' => 'Extract GPS from a GoPro video in your browser. View the GoPro GPS data on a map, export GPX, CSV, or KML, and play the clip with a live map. Nothing is uploaded.',
    'isMapPage' => true,
];

$mapShellHeading = 'GoPro GPS extractor';
$mapShellLead = 'Drop a video or choose one. Nothing is uploaded.';
$mapShellNote = 'Works with GoPro HERO video that recorded GPS (GPMF). The file stays in this browser.';
$mapShellDropText = 'Drop a GoPro video. Nothing is uploaded.';
$mapShellAccept = '.mp4,.lrv,video/*';
$mapShellVideo = true;
$mapShellPreamble = APP_ROOT . '/includes/partials/gopro-preamble.php';

require APP_ROOT . '/includes/layout/map-shell.php';
?>
<script src="/assets/vendor/chartjs/chart.umd.min.js"></script>
<script src="/assets/vendor/gopro/gpmf-fast.js"></script>
<script src="/assets/vendor/gopro/gopro-telemetry-bundle.min.js"></script>
<script src="/assets/js/gopro-app.js"></script>
<?php require APP_ROOT . '/includes/layout/close.php'; ?>
