/**
 * The only module that may create a Leaflet tile layer.
 *
 * A map page prints includes/partials/scripts-map.php, which sets
 * window.GPS_TILE_CONFIG from config/tiles.php before any module runs.
 * Do not hardcode a tile URL in this file or in page scripts.
 *
 * Tile requests use the browser default cache. Do not add cache-busting
 * query params, Cache-Control: no-cache, prefetch, or an offline pack.
 * Do not set a referrer policy on the layer. Leave the map attribution
 * control on so the provider credit stays visible.
 */

export function config() {
  var cfg = window.GPS_TILE_CONFIG;
  if (!cfg || typeof cfg.urlTemplate !== 'string' || cfg.urlTemplate === '') {
    throw new Error('GPS_TILE_CONFIG is missing. Print includes/partials/scripts-map.php before the map starts.');
  }
  if (cfg.urlTemplate.indexOf('{s}') !== -1) {
    throw new Error('Tile URL must not use a subdomain placeholder.');
  }
  return cfg;
}

export function createTileLayer(L) {
  if (!L || typeof L.tileLayer !== 'function') {
    throw new Error('Leaflet must be loaded before creating a tile layer.');
  }
  var cfg = config();
  return L.tileLayer(cfg.urlTemplate, {
    attribution: cfg.attribution,
    maxZoom: cfg.maxZoom
  });
}
