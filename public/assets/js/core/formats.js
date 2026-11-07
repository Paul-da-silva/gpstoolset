/**
 * Format registry on the client (ES module).
 * window.GPS_FORMATS comes from config/formats.php.
 * parse() is loaded with a dynamic import so the viewer, editor, and
 * converter modules never import a parser themselves.
 */
import { detect } from './detect.js';

export function all() {
  return Array.isArray(window.GPS_FORMATS) ? window.GPS_FORMATS : [];
}

export function byId(id) {
  var formats = all();
  var key = String(id || '');
  var i;
  for (i = 0; i < formats.length; i++) {
    if (formats[i].id === key) {
      return formats[i];
    }
  }
  return null;
}

export function writable() {
  return all().filter(function (format) {
    return format.writable && format.exporter;
  });
}

/** Export menu: every writable format, then CSV. */
export function exportChoices() {
  var list = writable().map(function (format) {
    return { id: format.exporter, label: format.label };
  });
  list.push({ id: 'csv', label: 'CSV' });
  return list;
}

export function acceptAttr() {
  return all().map(function (format) {
    return format.accept;
  }).filter(Boolean).join(',');
}

function stem(name) {
  var base = String(name || 'track');
  var cut = base.lastIndexOf('.');
  if (cut > 0) {
    base = base.slice(0, cut);
  }
  return base || 'track';
}

/** Parsers return { name, segments, waypoints }. Normalise that shape. */
export function asDocument(parsed, fallbackName) {
  var source = parsed || {};
  var segments = source.segments || source.tracks || [];
  var name = source.name || fallbackName || 'track';
  return {
    name: name,
    segments: segments.map(function (seg, index) {
      var points = seg && seg.points ? seg.points : [];
      var segName = seg && seg.name ? seg.name : '';
      if (!segName) {
        segName = segments.length > 1 ? 'Part ' + (index + 1) : name;
      }
      return {
        name: segName,
        points: points,
        acc: seg && seg.acc ? seg.acc : []
      };
    }),
    waypoints: source.waypoints || []
  };
}

export function hasGeometry(doc) {
  var i;
  if (!doc) {
    return false;
  }
  if (doc.waypoints && doc.waypoints.length) {
    return true;
  }
  var segments = doc.segments || [];
  for (i = 0; i < segments.length; i++) {
    if (segments[i].points && segments[i].points.length) {
      return true;
    }
  }
  return false;
}

function loadParser(format) {
  var url = format && format.parser;
  if (!url || url.indexOf('/assets/js/') !== 0 || url.indexOf('..') !== -1) {
    return Promise.reject(new Error('This format cannot be read yet.'));
  }
  return import(url);
}

/** Parse with a known format row. */
export function parseWith(format, file) {
  return loadParser(format).then(function (mod) {
    if (!mod || typeof mod.parse !== 'function') {
      throw new Error('This format cannot be read yet.');
    }
    return mod.parse(file);
  }).then(function (parsed) {
    return {
      format: format,
      doc: asDocument(parsed, stem(file && file.name))
    };
  });
}

/**
 * Detect the format, then parse.
 * Returns { format, doc }.
 */
export function parseFile(file) {
  return detect(file).then(function (format) {
    if (!format) {
      throw new Error('Drop a GPX, KML, KMZ, FIT, or UBX file.');
    }
    return parseWith(format, file);
  });
}
