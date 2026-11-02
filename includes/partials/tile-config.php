<?php
declare(strict_types=1);

/**
 * Inject config/tiles.php as window.GPS_TILE_CONFIG for
 * public/assets/js/map/tiles.js (an ES module imported by the map shell).
 * Included by partials/scripts-map.php, before any map module runs.
 * Do not add a Referrer-Policy tag here.
 */
$tiles = $GLOBALS['TILES'] ?? [];
$payload = [
    'urlTemplate' => (string) ($tiles['urlTemplate'] ?? ''),
    'attribution' => (string) ($tiles['attribution'] ?? ''),
    'maxZoom' => (int) ($tiles['maxZoom'] ?? 0),
];
$json = json_encode(
    $payload,
    JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_THROW_ON_ERROR
);
?>
<script>
window.GPS_TILE_CONFIG = <?= $json ?>;
</script>
