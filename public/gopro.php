<?php
declare(strict_types=1);

require dirname(__DIR__) . '/includes/bootstrap.php';

$page = [
    'title' => 'GoPro GPS Extractor — Free, No Upload',
    'description' => 'Read the GPS track from a GoPro Hero video in your browser. Nothing is uploaded. GPS Toolset charts speed and altitude, then saves GPX, CSV, or KML on your device.',
    'isMapPage' => true,
];

$mapShellHeading = 'GPS from a GoPro video';
$mapShellLead = 'Drop a video or choose one. Nothing is uploaded.';
$mapShellNote = 'Works with GoPro Hero video that recorded GPS (GPMF). The video stays in this browser.';
$mapShellDropText = 'Drop a GoPro video. Nothing is uploaded.';
$mapShellAccept = '.mp4,.lrv,video/*';

require APP_ROOT . '/includes/layout/map-shell.php';
?>
<script src="/assets/vendor/chartjs/chart.umd.min.js"></script>
<script src="/assets/vendor/gopro/gpmf-fast.js"></script>
<script src="/assets/vendor/gopro/gopro-telemetry-bundle.min.js"></script>
<script src="/assets/js/gopro-app.js"></script>
<?php require APP_ROOT . '/includes/layout/close.php'; ?>
