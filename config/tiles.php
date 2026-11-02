<?php
declare(strict_types=1);

/**
 * The only tile provider. Do not hardcode a tile URL in page JS.
 * public/assets/js/map/tiles.js reads this array (json_encode) and is the
 * only place that may construct a Leaflet tileLayer.
 *
 * OpenStreetMap tile usage for this host:
 * - No {s} subdomain. The template below is the whole URL.
 * - Attribution must stay visible on every map.
 * - Do not send a Referrer-Policy that strips Referer.
 * - Do not send Cache-Control: no-cache on tile requests.
 * - Do not prefetch tiles or download them for offline use.
 */
return [
    'urlTemplate' => 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    'attribution' => '© OpenStreetMap contributors',
    'maxZoom' => 19,
];
