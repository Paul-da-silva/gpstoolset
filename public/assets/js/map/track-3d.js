/**
 * 3D track view (ES module). Flat Web Mercator ground from the same street
 * tiles as the 2D map (GPS_TILE_CONFIG), tube path above it, custom orbit.
 * Three.js is lazy-loaded from /assets/vendor/three/three.min.js.
 *
 *   create(containerEl) → { setTrack(track), start(), stop(), dispose(), resize() }
 */
import { thinIndices, validCoord } from '../core/track.js';
import { config as tileConfig } from './tiles.js';

var MERCATOR_R = 6378137;
var EARTH_RADIUS_M = 6371000;
var TILE_MAX = 64;
var TILE_DIM = 8;
var TILE_Z_MAX = 19;
var TILE_Z_MIN = 6;
var TUBE_RADIUS = 3;
var TUBE_POINTS = 4000;
var DROP_CAP = 120;
var TRACK_COLOR = 0x0369a1;

var threePromise = null;

export function loadThree() {
  if (window.THREE) {
    return Promise.resolve(window.THREE);
  }
  if (threePromise) {
    return threePromise;
  }
  threePromise = new Promise(function (resolve, reject) {
    var existing = document.querySelector('script[data-gpstoolset-three]');
    if (existing) {
      existing.addEventListener('load', function () {
        if (window.THREE) {
          resolve(window.THREE);
        } else {
          reject(new Error('THREE missing after load'));
        }
      });
      existing.addEventListener('error', function () {
        reject(new Error('Failed to load Three.js'));
      });
      return;
    }
    var script = document.createElement('script');
    script.src = '/assets/vendor/three/three.min.js';
    script.async = true;
    script.setAttribute('data-gpstoolset-three', '1');
    script.onload = function () {
      if (window.THREE) {
        resolve(window.THREE);
      } else {
        reject(new Error('THREE missing after load'));
      }
    };
    script.onerror = function () {
      threePromise = null;
      reject(new Error('Failed to load Three.js'));
    };
    document.head.appendChild(script);
  });
  return threePromise;
}

function lonLatToMercator(lat, lon) {
  var x = lon * Math.PI / 180 * MERCATOR_R;
  var s = Math.sin(lat * Math.PI / 180);
  s = Math.min(0.9999, Math.max(-0.9999, s));
  var y = Math.log((1 + s) / (1 - s)) / 2 * MERCATOR_R;
  return { x: x, y: y };
}

function mercatorToLonLat(x, y) {
  var lon = (x / MERCATOR_R) * 180 / Math.PI;
  var lat = (2 * Math.atan(Math.exp(y / MERCATOR_R)) - Math.PI / 2) * 180 / Math.PI;
  return { lat: lat, lon: lon };
}

function localOffsetsMercator(lat0, lon0, lat, lon) {
  var a = lonLatToMercator(lat0, lon0);
  var b = lonLatToMercator(lat, lon);
  return { east: b.x - a.x, north: b.y - a.y };
}

function latLngToTile(lat, lon, z) {
  var n = Math.pow(2, z);
  var latRad = lat * Math.PI / 180;
  var x = Math.floor((lon + 180) / 360 * n);
  var y = Math.floor((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n);
  return { x: x, y: y };
}

function tileNw(x, y, z) {
  var n = Math.pow(2, z);
  return {
    lon: x / n * 360 - 180,
    lat: Math.atan(Math.sinh(Math.PI * (1 - 2 * y / n))) * 180 / Math.PI
  };
}

function pickTileGrid(minLat, maxLat, minLon, maxLon, maxTiles, maxDim, maxZ) {
  var cap = maxTiles > 0 ? maxTiles : TILE_MAX;
  var dim = maxDim > 0 ? maxDim : TILE_DIM;
  var zHi = maxZ > 0 ? maxZ : TILE_Z_MAX;
  var z;
  var a;
  var b;
  var x0;
  var y0;
  var x1;
  var y1;
  var w;
  var h;
  for (z = zHi; z >= TILE_Z_MIN; z--) {
    a = latLngToTile(maxLat, minLon, z);
    b = latLngToTile(minLat, maxLon, z);
    x0 = Math.min(a.x, b.x);
    y0 = Math.min(a.y, b.y);
    x1 = Math.max(a.x, b.x);
    y1 = Math.max(a.y, b.y);
    w = x1 - x0 + 1;
    h = y1 - y0 + 1;
    if (w * h <= cap && w <= dim && h <= dim) {
      return { z: z, x0: x0, y0: y0, x1: x1, y1: y1, w: w, h: h };
    }
  }
  a = latLngToTile(maxLat, minLon, TILE_Z_MIN);
  b = latLngToTile(minLat, maxLon, TILE_Z_MIN);
  x0 = Math.min(a.x, b.x);
  y0 = Math.min(a.y, b.y);
  x1 = Math.max(a.x, b.x);
  y1 = Math.max(a.y, b.y);
  return coveringGrid(
    { z: TILE_Z_MIN, x0: x0, y0: y0, x1: x1, y1: y1, w: x1 - x0 + 1, h: y1 - y0 + 1 },
    Math.min(cap, dim * dim)
  );
}

function tileRangeAtZoom(minLat, maxLat, minLon, maxLon, z) {
  var a = latLngToTile(maxLat, minLon, z);
  var b = latLngToTile(minLat, maxLon, z);
  var x0 = Math.min(a.x, b.x);
  var y0 = Math.min(a.y, b.y);
  var x1 = Math.max(a.x, b.x);
  var y1 = Math.max(a.y, b.y);
  return { z: z, x0: x0, y0: y0, x1: x1, y1: y1, w: x1 - x0 + 1, h: y1 - y0 + 1 };
}

function gridFits(grid) {
  return grid.w <= TILE_DIM && grid.h <= TILE_DIM && grid.w * grid.h <= TILE_MAX;
}

function expandTrackBbox(minLat, maxLat, minLon, maxLon) {
  var padFrac = 0.22;
  var padMinM = 120;
  var midLat = (minLat + maxLat) / 2;
  var cos = Math.cos(midLat * Math.PI / 180) || 1e-6;
  var padLat = Math.max((maxLat - minLat) * padFrac, padMinM / EARTH_RADIUS_M * 180 / Math.PI);
  var padLon = Math.max((maxLon - minLon) * padFrac, padMinM / (EARTH_RADIUS_M * cos) * 180 / Math.PI);
  return {
    minLat: minLat - padLat,
    maxLat: maxLat + padLat,
    minLon: minLon - padLon,
    maxLon: maxLon + padLon
  };
}

function coveringGrid(grid, maxTiles) {
  var z = grid.z;
  var x0 = grid.x0;
  var y0 = grid.y0;
  var x1 = grid.x1;
  var y1 = grid.y1;
  var cap = maxTiles > 0 ? maxTiles : 4;
  while (z > 0 && (x1 - x0 + 1) * (y1 - y0 + 1) > cap) {
    z--;
    x0 = Math.floor(x0 / 2);
    y0 = Math.floor(y0 / 2);
    x1 = Math.floor(x1 / 2);
    y1 = Math.floor(y1 / 2);
  }
  return { z: z, x0: x0, y0: y0, x1: x1, y1: y1, w: x1 - x0 + 1, h: y1 - y0 + 1 };
}

function mosaicPlaneEnu(grid, originLat, originLon) {
  var nw = tileNw(grid.x0, grid.y0, grid.z);
  var se = tileNw(grid.x1 + 1, grid.y1 + 1, grid.z);
  var corners = [
    [nw.lat, nw.lon],
    [nw.lat, se.lon],
    [se.lat, se.lon],
    [se.lat, nw.lon]
  ];
  var minX = Infinity;
  var maxX = -Infinity;
  var minZ = Infinity;
  var maxZ = -Infinity;
  var i;
  for (i = 0; i < corners.length; i++) {
    var off = localOffsetsMercator(originLat, originLon, corners[i][0], corners[i][1]);
    var x = off.east;
    var z = -off.north;
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (z < minZ) minZ = z;
    if (z > maxZ) maxZ = z;
  }
  return {
    minX: minX,
    maxX: maxX,
    minZ: minZ,
    maxZ: maxZ,
    w: Math.max(maxX - minX, 40),
    d: Math.max(maxZ - minZ, 40),
    cx: (minX + maxX) / 2,
    cz: (minZ + maxZ) / 2
  };
}

function tileUrl(z, x, y) {
  var tpl = tileConfig().urlTemplate;
  return tpl
    .replace('{z}', String(z))
    .replace('{x}', String(x))
    .replace('{y}', String(y));
}

function makeTileCancel() {
  return { aborted: false, imgs: [] };
}

function abortTileLoads(cancel) {
  if (!cancel || cancel.aborted) {
    return;
  }
  cancel.aborted = true;
  var i;
  for (i = 0; i < cancel.imgs.length; i++) {
    var img = cancel.imgs[i];
    img.onload = null;
    img.onerror = null;
    img.src = '';
  }
  cancel.imgs.length = 0;
}

function loadImage(url, cancel) {
  return new Promise(function (resolve, reject) {
    if (cancel && cancel.aborted) {
      resolve(null);
      return;
    }
    var img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function () {
      if (cancel && cancel.aborted) {
        resolve(null);
        return;
      }
      resolve(img);
    };
    img.onerror = function () {
      if (cancel && cancel.aborted) {
        resolve(null);
        return;
      }
      reject(new Error('tile'));
    };
    if (cancel) {
      cancel.imgs.push(img);
    }
    img.src = url;
  });
}

function isDarkTheme() {
  return !!(document.documentElement && document.documentElement.getAttribute('data-theme') === 'dark');
}

function osmDarkClone(src) {
  var out = document.createElement('canvas');
  out.width = src.width;
  out.height = src.height;
  var ctx = out.getContext('2d');
  ctx.filter = 'invert(1) hue-rotate(180deg) brightness(0.95) contrast(0.9)';
  ctx.drawImage(src, 0, 0);
  ctx.filter = 'none';
  return out;
}

function drawTileIntoMosaic(ctx, destGrid, img, tz, tx, ty) {
  var scale = Math.pow(2, destGrid.z - tz);
  ctx.drawImage(
    img,
    (tx * scale - destGrid.x0) * 256,
    (ty * scale - destGrid.y0) * 256,
    256 * scale,
    256 * scale
  );
}

function loadGridTiles(srcGrid, destGrid, ctx, poke, cancel) {
  var jobs = [];
  var x;
  var y;
  for (y = srcGrid.y0; y <= srcGrid.y1; y++) {
    for (x = srcGrid.x0; x <= srcGrid.x1; x++) {
      (function (tz, tx, ty) {
        jobs.push(loadImage(tileUrl(tz, tx, ty), cancel).then(function (img) {
          if (!img || (cancel && cancel.aborted)) {
            return false;
          }
          drawTileIntoMosaic(ctx, destGrid, img, tz, tx, ty);
          poke();
          return true;
        }));
      })(srcGrid.z, x, y);
    }
  }
  return Promise.allSettled(jobs);
}

function mosaicTiles(grid, onPaint, cancel) {
  var canvas = document.createElement('canvas');
  canvas.width = grid.w * 256;
  canvas.height = grid.h * 256;
  var ctx = canvas.getContext('2d');
  var painted = 0;
  var count = function () {
    painted++;
  };
  var emit = function () {
    if (!painted || !onPaint || (cancel && cancel.aborted)) {
      return;
    }
    onPaint(isDarkTheme() ? osmDarkClone(canvas) : canvas);
  };
  var cover = coveringGrid(grid, 4);
  return loadGridTiles(cover, grid, ctx, count, cancel).then(function () {
    if (cancel && cancel.aborted) {
      return null;
    }
    emit();
    if (cover.z === grid.z) {
      return;
    }
    return loadGridTiles(grid, grid, ctx, count, cancel);
  }).then(function () {
    if (cancel && cancel.aborted) {
      return null;
    }
    emit();
    return painted ? canvas : null;
  });
}

function parseCssColor(str, fallback) {
  var fb = fallback == null ? 0xeceff5 : fallback;
  if (!str) {
    return fb;
  }
  var s = String(str).trim();
  if (s.charAt(0) === '#') {
    var h = s.slice(1);
    if (h.length === 3) {
      h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    }
    var n = parseInt(h, 16);
    return isFinite(n) ? n : fb;
  }
  var m = /^rgba?\(\s*(\d+)\s*[, ]\s*(\d+)\s*[, ]\s*(\d+)/.exec(s);
  if (!m) {
    return fb;
  }
  return (parseInt(m[1], 10) << 16) | (parseInt(m[2], 10) << 8) | parseInt(m[3], 10);
}

function themeBackdrop(el) {
  var dark = isDarkTheme();
  var fallback = dark ? 0x0f172a : 0xf6f7f9;
  if (typeof getComputedStyle !== 'function' || !el) {
    return fallback;
  }
  return parseCssColor(getComputedStyle(el).backgroundColor, fallback);
}

function disposeObject3d(obj) {
  obj.traverse(function (child) {
    if (child.userData && child.userData.cancelTiles) {
      abortTileLoads(child.userData.cancelTiles);
      child.userData.cancelTiles = null;
    }
    if (child.geometry) {
      child.geometry.dispose();
    }
    if (child.material) {
      var mats = Array.isArray(child.material) ? child.material : [child.material];
      mats.forEach(function (m) {
        if (m.map) {
          m.map.dispose();
        }
        m.dispose();
      });
    }
  });
}

function packPoints(points) {
  if (!points || !points.length) {
    return null;
  }
  var originLat = null;
  var originLon = null;
  var minEle = Infinity;
  var hasEle = false;
  var i;
  var p;
  for (i = 0; i < points.length; i++) {
    p = points[i];
    if (!p || !validCoord(p.lat, p.lon)) {
      continue;
    }
    if (originLat === null) {
      originLat = p.lat;
      originLon = p.lon;
    }
    if (p.ele != null && isFinite(p.ele)) {
      hasEle = true;
      if (p.ele < minEle) {
        minEle = p.ele;
      }
    }
  }
  if (originLat === null) {
    return null;
  }
  if (!hasEle) {
    minEle = 0;
  }
  var idxs = thinIndices(points.length, TUBE_POINTS);
  var out = [];
  for (i = 0; i < idxs.length; i++) {
    p = points[idxs[i]];
    if (!p || !validCoord(p.lat, p.lon)) {
      continue;
    }
    var off = localOffsetsMercator(originLat, originLon, p.lat, p.lon);
    var y;
    if (hasEle && p.ele != null && isFinite(p.ele)) {
      y = Math.max(0, p.ele - minEle);
    } else {
      y = TUBE_RADIUS;
    }
    out.push({
      i: idxs[i],
      x: off.east,
      y: y,
      z: -off.north,
      lat: p.lat,
      lon: p.lon,
      t: p.t
    });
  }
  if (out.length < 2) {
    return null;
  }
  return {
    originLat: originLat,
    originLon: originLon,
    points: out,
    hasEle: hasEle
  };
}

function uniqueVectors(T, pts, yLift) {
  var vecs = [];
  var prev = null;
  var i;
  var lift = yLift || 0;
  for (i = 0; i < pts.length; i++) {
    var p = new T.Vector3(pts[i].x, pts[i].y + lift, pts[i].z);
    if (prev && prev.distanceToSquared(p) < 0.01) {
      continue;
    }
    vecs.push(p);
    prev = p;
  }
  return vecs;
}

function fitSphere(points) {
  var cx = 0;
  var cy = 0;
  var cz = 0;
  var i;
  var r = 0;
  if (!points.length) {
    return { x: 0, y: 0, z: 0, r: 200 };
  }
  for (i = 0; i < points.length; i++) {
    cx += points[i].x;
    cy += points[i].y;
    cz += points[i].z;
  }
  cx /= points.length;
  cy /= points.length;
  cz /= points.length;
  for (i = 0; i < points.length; i++) {
    var dx = points[i].x - cx;
    var dy = points[i].y - cy;
    var dz = points[i].z - cz;
    r = Math.max(r, Math.sqrt(dx * dx + dy * dy + dz * dz));
  }
  return { x: cx, y: cy, z: cz, r: Math.max(r, 50) };
}

function applyCanvasToMesh(T, mesh, canvas, renderer, sharp) {
  var mat = mesh.material;
  var tex = new T.CanvasTexture(canvas);
  if (T.SRGBColorSpace) {
    tex.colorSpace = T.SRGBColorSpace;
  }
  tex.flipY = true;
  tex.generateMipmaps = !sharp;
  tex.minFilter = sharp ? T.LinearFilter : T.LinearMipmapLinearFilter;
  tex.magFilter = T.LinearFilter;
  if (renderer && renderer.capabilities) {
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  }
  if (mat.map) {
    mat.map.dispose();
  }
  mat.map = tex;
  mat.color.set(0xffffff);
  mat.needsUpdate = true;
}

function sampleDropIndices(pts) {
  if (!pts.length) {
    return [];
  }
  var out = [];
  var hasTime = pts.some(function (p) {
    return p.t != null && isFinite(p.t);
  });
  if (hasTime) {
    var nextT = null;
    var i;
    for (i = 0; i < pts.length && out.length < DROP_CAP; i++) {
      var t = pts[i].t;
      if (t == null || !isFinite(t)) {
        continue;
      }
      if (nextT === null || t >= nextT) {
        out.push(i);
        nextT = t + 5000;
      }
    }
    return out;
  }
  var stride = Math.max(1, Math.ceil(pts.length / DROP_CAP));
  for (i = 0; i < pts.length; i += stride) {
    out.push(i);
  }
  if (out[out.length - 1] !== pts.length - 1) {
    out.push(pts.length - 1);
  }
  return out;
}

/**
 * Create a 3D track viewer inside containerEl (cleared/owned by this module).
 */
export function create(containerEl) {
  if (!containerEl) {
    throw new Error('track-3d needs a container');
  }

  var T = null;
  var renderer = null;
  var scene = null;
  var camera = null;
  var stage = containerEl;
  var canvas = null;
  var credit = null;
  var trackGroup = null;
  var dropGroup = null;
  var ground = null;
  var pendingGround = null;
  var groundGen = 0;
  var hd = null;
  var pendingHd = null;
  var hdGen = 0;
  var hdKey = '';
  var hdZoom = null;
  var hdTimer = null;
  var packed = null;
  var bounds = { x: 0, y: 0, z: 0, r: 200 };
  var target = null;
  var spherical = { theta: 0.85, phi: 1.05, radius: 480 };
  var raf = 0;
  var running = false;
  var pointers = {};
  var ro = null;
  var ready = false;
  var buildToken = 0;

  function killMesh(mesh) {
    if (!mesh) {
      return;
    }
    mesh.userData.alive = false;
    if (mesh.userData.cancelTiles) {
      abortTileLoads(mesh.userData.cancelTiles);
      mesh.userData.cancelTiles = null;
    }
    if (scene && mesh.parent) {
      scene.remove(mesh);
    }
    disposeObject3d(mesh);
  }

  function clearHd() {
    hdGen++;
    hdKey = '';
    hdZoom = null;
    if (hdTimer) {
      clearTimeout(hdTimer);
      hdTimer = null;
    }
    if (pendingHd) {
      killMesh(pendingHd);
      pendingHd = null;
    }
    if (hd) {
      killMesh(hd);
      hd = null;
    }
  }

  function makeMosaicMesh(grid, y, sharp, onFirstPaint) {
    var plane = mosaicPlaneEnu(grid, packed.originLat, packed.originLon);
    var geo = new T.PlaneGeometry(plane.w, plane.d);
    geo.rotateX(-Math.PI / 2);
    var mat = new T.MeshBasicMaterial({
      color: 0x1e293b,
      side: T.DoubleSide,
      polygonOffset: y > 0,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -4
    });
    var mesh = new T.Mesh(geo, mat);
    mesh.position.set(plane.cx, y, plane.cz);
    mesh.renderOrder = y > 0 ? 1 : 0;
    mesh.userData.alive = true;
    mesh.visible = false;
    var cancel = makeTileCancel();
    mesh.userData.cancelTiles = cancel;
    var first = onFirstPaint;
    mosaicTiles(grid, function (cvs) {
      if (!mesh.userData.alive || cancel.aborted) {
        return;
      }
      applyCanvasToMesh(T, mesh, cvs, renderer, sharp);
      mesh.visible = true;
      if (first) {
        first(mesh);
        first = null;
      }
    }, cancel);
    return mesh;
  }

  function makeGround(onFirstPaint) {
    var minLat = Infinity;
    var maxLat = -Infinity;
    var minLon = Infinity;
    var maxLon = -Infinity;
    packed.points.forEach(function (pt) {
      if (pt.lat < minLat) minLat = pt.lat;
      if (pt.lat > maxLat) maxLat = pt.lat;
      if (pt.lon < minLon) minLon = pt.lon;
      if (pt.lon > maxLon) maxLon = pt.lon;
    });
    if (!(maxLat >= minLat) || !(maxLon >= minLon)) {
      var fallback = new T.Mesh(
        new T.PlaneGeometry(200, 200).rotateX(-Math.PI / 2),
        new T.MeshBasicMaterial({ color: 0x1e293b, side: T.DoubleSide })
      );
      fallback.userData.alive = true;
      if (onFirstPaint) {
        onFirstPaint(fallback);
      }
      return fallback;
    }
    var pad = expandTrackBbox(minLat, maxLat, minLon, maxLon);
    var grid = pickTileGrid(pad.minLat, pad.maxLat, pad.minLon, pad.maxLon);
    return makeMosaicMesh(grid, 0, false, onFirstPaint);
  }

  function replaceGround() {
    var my = ++groundGen;
    if (pendingGround) {
      killMesh(pendingGround);
      pendingGround = null;
    }
    pendingGround = makeGround(function (mesh) {
      if (my !== groundGen || !mesh.userData.alive) {
        killMesh(mesh);
        return;
      }
      pendingGround = null;
      if (ground && ground !== mesh) {
        killMesh(ground);
      }
      if (!mesh.parent) {
        scene.add(mesh);
      }
      ground = mesh;
    });
  }

  function lookatBbox(halfM) {
    var o = lonLatToMercator(packed.originLat, packed.originLon);
    var east = o.x + target.x;
    var north = o.y + (-target.z);
    var sw = mercatorToLonLat(east - halfM, north - halfM);
    var ne = mercatorToLonLat(east + halfM, north + halfM);
    return {
      minLat: Math.min(sw.lat, ne.lat),
      maxLat: Math.max(sw.lat, ne.lat),
      minLon: Math.min(sw.lon, ne.lon),
      maxLon: Math.max(sw.lon, ne.lon)
    };
  }

  function refreshHd() {
    hdTimer = null;
    if (!running || !packed || pointerIds().length) {
      return;
    }
    if (spherical.radius >= bounds.r * 1.05) {
      hdZoom = null;
      hdKey = '';
      if (pendingHd) {
        killMesh(pendingHd);
        pendingHd = null;
      }
      if (hd) {
        killMesh(hd);
        hd = null;
      }
      return;
    }
    var bb = lookatBbox(Math.max(spherical.radius * 1.15, 80));
    var proposed = pickTileGrid(bb.minLat, bb.maxLat, bb.minLon, bb.maxLon, TILE_MAX, TILE_DIM, TILE_Z_MAX);
    if (hdZoom == null || proposed.z > hdZoom) {
      hdZoom = proposed.z;
    } else if (proposed.z < hdZoom) {
      var held = tileRangeAtZoom(bb.minLat, bb.maxLat, bb.minLon, bb.maxLon, hdZoom);
      if (!gridFits(held)) {
        hdZoom = proposed.z;
      }
    }
    var grid = tileRangeAtZoom(bb.minLat, bb.maxLat, bb.minLon, bb.maxLon, hdZoom);
    if (!gridFits(grid)) {
      hdZoom = proposed.z;
      grid = proposed;
    }
    var key = grid.z + ':' + grid.x0 + ':' + grid.y0 + ':' + grid.x1 + ':' + grid.y1;
    if (key === hdKey && (hd || pendingHd)) {
      return;
    }
    hdKey = key;
    var my = ++hdGen;
    if (pendingHd) {
      killMesh(pendingHd);
      pendingHd = null;
    }
    pendingHd = makeMosaicMesh(grid, 0.4, true, function (mesh) {
      if (my !== hdGen || !mesh.userData.alive) {
        killMesh(mesh);
        return;
      }
      pendingHd = null;
      if (hd && hd !== mesh) {
        killMesh(hd);
      }
      if (!mesh.parent) {
        scene.add(mesh);
      }
      hd = mesh;
    });
  }

  function scheduleHd() {
    if (pointerIds().length) {
      return;
    }
    if (hdTimer) {
      clearTimeout(hdTimer);
    }
    hdTimer = setTimeout(refreshHd, 180);
  }

  function syncCamera() {
    var phi = Math.min(Math.max(spherical.phi, 0.08), 1.45);
    spherical.phi = phi;
    camera.position.set(
      target.x + spherical.radius * Math.sin(phi) * Math.sin(spherical.theta),
      target.y + spherical.radius * Math.cos(phi),
      target.z + spherical.radius * Math.sin(phi) * Math.cos(spherical.theta)
    );
    camera.lookAt(target);
    if (scene.fog) {
      scene.fog.near = spherical.radius * 1.6;
      scene.fog.far = Math.max(spherical.radius * 8, scene.fog.near + 80);
    }
  }

  function clampRadius() {
    spherical.radius = Math.min(Math.max(spherical.radius, bounds.r * 0.06), bounds.r * 20);
  }

  function panGround(dx, dy) {
    var scale = spherical.radius / Math.max(stage.clientHeight, 1) * 1.5;
    var look = new T.Vector3();
    camera.getWorldDirection(look);
    var right = new T.Vector3().crossVectors(look, camera.up);
    if (right.lengthSq() < 1e-8) {
      right.set(1, 0, 0);
    } else {
      right.normalize();
    }
    look.y = 0;
    if (look.lengthSq() < 1e-8) {
      look.set(0, 0, -1);
    } else {
      look.normalize();
    }
    target.addScaledVector(right, -dx * scale);
    target.addScaledVector(look, dy * scale);
    syncCamera();
  }

  function pointerIds() {
    return Object.keys(pointers);
  }

  function onPointerDown(e) {
    if (e.target.closest && e.target.closest('.track3d-credit')) {
      return;
    }
    if (e.button != null && e.button === 2) {
      e.preventDefault();
    }
    pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
    e.preventDefault();
  }

  function onPointerMove(e) {
    if (!pointers[e.pointerId]) {
      return;
    }
    var rec = pointers[e.pointerId];
    var ids = pointerIds();
    if (ids.length >= 2) {
      var a = pointers[ids[0]];
      var b = pointers[ids[1]];
      var oldDist = Math.hypot(a.x - b.x, a.y - b.y);
      var oldMidX = (a.x + b.x) / 2;
      var oldMidY = (a.y + b.y) / 2;
      rec.x = e.clientX;
      rec.y = e.clientY;
      a = pointers[ids[0]];
      b = pointers[ids[1]];
      var newDist = Math.hypot(a.x - b.x, a.y - b.y);
      if (oldDist > 8 && newDist > 0) {
        spherical.radius *= oldDist / newDist;
        clampRadius();
      }
      panGround((a.x + b.x) / 2 - oldMidX, (a.y + b.y) / 2 - oldMidY);
      return;
    }
    var dx = e.clientX - rec.x;
    var dy = e.clientY - rec.y;
    rec.x = e.clientX;
    rec.y = e.clientY;
    if (e.shiftKey || e.buttons === 2 || e.buttons === 4) {
      panGround(dx, dy);
    } else {
      spherical.theta -= dx * 0.005;
      spherical.phi -= dy * 0.005;
      syncCamera();
    }
  }

  function onPointerUp(e) {
    delete pointers[e.pointerId];
    if (!pointerIds().length) {
      scheduleHd();
    }
  }

  function onWheel(e) {
    e.preventDefault();
    var dy = e.deltaY;
    if (e.deltaMode === 1) {
      dy *= 16;
    }
    if (e.deltaMode === 2) {
      dy *= 80;
    }
    spherical.radius *= Math.exp(dy * 0.0016);
    clampRadius();
    syncCamera();
    scheduleHd();
  }

  function onContextMenu(e) {
    e.preventDefault();
  }

  function bindPointers() {
    stage.addEventListener('pointerdown', onPointerDown);
    stage.addEventListener('pointermove', onPointerMove);
    stage.addEventListener('pointerup', onPointerUp);
    stage.addEventListener('pointercancel', onPointerUp);
    stage.addEventListener('wheel', onWheel, { passive: false });
    stage.addEventListener('contextmenu', onContextMenu);
  }

  function unbindPointers() {
    stage.removeEventListener('pointerdown', onPointerDown);
    stage.removeEventListener('pointermove', onPointerMove);
    stage.removeEventListener('pointerup', onPointerUp);
    stage.removeEventListener('pointercancel', onPointerUp);
    stage.removeEventListener('wheel', onWheel);
    stage.removeEventListener('contextmenu', onContextMenu);
    pointers = {};
  }

  function clearTrackMeshes() {
    if (trackGroup) {
      disposeObject3d(trackGroup);
      while (trackGroup.children.length) {
        trackGroup.remove(trackGroup.children[0]);
      }
    }
    if (dropGroup) {
      disposeObject3d(dropGroup);
      while (dropGroup.children.length) {
        dropGroup.remove(dropGroup.children[0]);
      }
    }
  }

  function buildTrackMeshes() {
    clearTrackMeshes();
    if (!packed || !T) {
      return;
    }
    var vecs = uniqueVectors(T, packed.points, TUBE_RADIUS);
    if (vecs.length >= 2) {
      var path = new T.CurvePath();
      var i;
      for (i = 0; i < vecs.length - 1; i++) {
        path.add(new T.LineCurve3(vecs[i], vecs[i + 1]));
      }
      var tubular = Math.min(Math.max(vecs.length - 1, 2), TUBE_POINTS);
      var geo = new T.TubeGeometry(path, tubular, TUBE_RADIUS, 5, false);
      trackGroup.add(new T.Mesh(geo, new T.MeshBasicMaterial({ color: TRACK_COLOR })));
    }

    var dropIdx = sampleDropIndices(packed.points);
    var arr = [];
    var d;
    for (d = 0; d < dropIdx.length; d++) {
      var pt = packed.points[dropIdx[d]];
      if (!pt) {
        continue;
      }
      arr.push(pt.x, pt.y + TUBE_RADIUS, pt.z, pt.x, 0.08, pt.z);
    }
    if (arr.length >= 6) {
      var dropGeo = new T.BufferGeometry();
      dropGeo.setAttribute('position', new T.BufferAttribute(new Float32Array(arr), 3));
      var line = new T.LineSegments(
        dropGeo,
        new T.LineBasicMaterial({
          color: TRACK_COLOR,
          transparent: true,
          opacity: 0.35,
          depthWrite: false
        })
      );
      line.renderOrder = 2;
      dropGroup.add(line);
    }
  }

  function ensureScene() {
    if (ready) {
      return Promise.resolve();
    }
    return loadThree().then(function (THREE) {
      if (ready) {
        return;
      }
      T = THREE;
      stage.innerHTML = '';
      stage.classList.add('track3d-host');
      canvas = document.createElement('canvas');
      canvas.className = 'track3d-canvas';
      canvas.setAttribute('aria-label', '3D track view');
      stage.appendChild(canvas);

      var voidColor = themeBackdrop(stage.closest('.track3d-stage') || stage);
      renderer = new T.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setClearColor(voidColor, 1);

      scene = new T.Scene();
      scene.background = new T.Color(voidColor);
      scene.fog = new T.Fog(voidColor, 400, 4000);
      camera = new T.PerspectiveCamera(50, 1, 1, 200000);
      target = new T.Vector3(0, 0, 0);

      trackGroup = new T.Group();
      trackGroup.renderOrder = 3;
      scene.add(trackGroup);
      dropGroup = new T.Group();
      dropGroup.renderOrder = 2;
      scene.add(dropGroup);

      bindPointers();
      if (typeof ResizeObserver === 'function') {
        ro = new ResizeObserver(function () {
          if (running) {
            resize();
          }
        });
        ro.observe(stage.closest('.track3d-stage') || stage);
      }
      ready = true;
    });
  }

  function paintCredit() {
    var root = stage.closest('.track3d-stage') || stage.parentElement;
    if (!root) {
      return;
    }
    credit = root.querySelector('.track3d-credit');
    if (!credit) {
      credit = document.createElement('a');
      credit.className = 'track3d-credit';
      credit.href = 'https://www.openstreetmap.org/copyright';
      credit.target = '_blank';
      credit.rel = 'noopener noreferrer';
      root.appendChild(credit);
    }
    try {
      credit.textContent = tileConfig().attribution || '© OpenStreetMap contributors';
    } catch (err) {
      credit.textContent = '© OpenStreetMap contributors';
    }
  }

  function loop() {
    if (!running) {
      return;
    }
    raf = requestAnimationFrame(loop);
    renderer.render(scene, camera);
  }

  function resize() {
    if (!renderer || !camera) {
      return;
    }
    var box = stage.closest('.track3d-stage') || stage;
    var w = box.clientWidth || 1;
    var h = box.clientHeight || 1;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }

  function start() {
    if (!ready || !packed) {
      return;
    }
    if (running) {
      resize();
      return;
    }
    running = true;
    resize();
    syncCamera();
    loop();
    scheduleHd();
  }

  function stop() {
    running = false;
    if (raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
    if (hdTimer) {
      clearTimeout(hdTimer);
      hdTimer = null;
    }
  }

  function setTrack(track) {
    var token = ++buildToken;
    var points = track && track.points ? track.points : [];
    packed = packPoints(points);
    return ensureScene().then(function () {
      if (token !== buildToken) {
        return;
      }
      clearHd();
      groundGen++;
      if (pendingGround) {
        killMesh(pendingGround);
        pendingGround = null;
      }
      if (ground) {
        killMesh(ground);
        ground = null;
      }
      clearTrackMeshes();
      paintCredit();
      if (!packed) {
        return;
      }
      bounds = fitSphere(packed.points);
      target.set(bounds.x, bounds.y * 0.35, bounds.z);
      spherical.theta = 0.85;
      spherical.phi = 1.05;
      spherical.radius = bounds.r * 2.4;
      var voidColor = themeBackdrop(stage.closest('.track3d-stage') || stage);
      renderer.setClearColor(voidColor, 1);
      scene.background.set(voidColor);
      if (scene.fog) {
        scene.fog.color.set(voidColor);
        scene.fog.near = bounds.r * 2;
        scene.fog.far = bounds.r * 12;
      }
      buildTrackMeshes();
      replaceGround();
      syncCamera();
      if (running) {
        scheduleHd();
      }
    });
  }

  function dispose() {
    stop();
    buildToken++;
    clearHd();
    groundGen++;
    if (pendingGround) {
      killMesh(pendingGround);
      pendingGround = null;
    }
    if (ground) {
      killMesh(ground);
      ground = null;
    }
    unbindPointers();
    if (ro) {
      ro.disconnect();
      ro = null;
    }
    if (scene) {
      disposeObject3d(scene);
    }
    if (renderer) {
      renderer.dispose();
      if (typeof renderer.forceContextLoss === 'function') {
        renderer.forceContextLoss();
      }
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    }
    packed = null;
    ready = false;
    renderer = null;
    scene = null;
    camera = null;
    trackGroup = null;
    dropGroup = null;
    canvas = null;
    T = null;
    stage.innerHTML = '';
  }

  return {
    setTrack: setTrack,
    start: start,
    stop: stop,
    dispose: dispose,
    resize: resize
  };
}
