<?php
declare(strict_types=1);

/**
 * Inject config/tiles.php for public/assets/js/tiles.js.
 * Include this on map pages only, before the map creates its tile layer.
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
<script src="/assets/js/tiles.js"></script>
