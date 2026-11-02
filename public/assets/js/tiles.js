/**
 * The only module that may create a Leaflet tile layer.
 *
 * A map page includes includes/partials/tile-config.php first. That sets
 * window.GPS_TILE_CONFIG from config/tiles.php. Do not hardcode a tile
 * URL in this file or in page scripts.
 *
 * Tile requests use the browser default cache. Do not add cache-busting
 * query params, Cache-Control: no-cache, prefetch, or an offline pack.
 * Do not set a referrer policy on the layer. Leave the map attribution
 * control on so the provider credit stays visible.
 */
(function (global) {
  'use strict';

  function config() {
    var cfg = global.GPS_TILE_CONFIG;
    if (!cfg || typeof cfg.urlTemplate !== 'string' || cfg.urlTemplate === '') {
      throw new Error('GPS_TILE_CONFIG is missing. Inject config/tiles.php before tiles.js.');
    }
    if (cfg.urlTemplate.indexOf('{s}') !== -1) {
      throw new Error('Tile URL must not use a subdomain placeholder.');
    }
    return cfg;
  }

  function createTileLayer(L) {
    if (!L || typeof L.tileLayer !== 'function') {
      throw new Error('Leaflet must be loaded before creating a tile layer.');
    }
    var cfg = config();
    return L.tileLayer(cfg.urlTemplate, {
      attribution: cfg.attribution,
      maxZoom: cfg.maxZoom
    });
  }

  global.GpsTiles = {
    config: config,
    createTileLayer: createTileLayer
  };
})(window);
