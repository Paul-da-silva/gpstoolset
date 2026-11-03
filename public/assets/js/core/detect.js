/**
 * Detect a GPS file format from the extension and the first bytes.
 * Reads window.GPS_FORMATS (config/formats.php). The file is not uploaded.
 *
 * An extension that names a format wins, except .xml, .zip, .txt, and a
 * missing extension: those follow the magic hint (xml root, ZIP header,
 * or the .FIT signature).
 */

function list() {
  return Array.isArray(window.GPS_FORMATS) ? window.GPS_FORMATS : [];
}

export function extensionOf(file) {
  var name = String(file && file.name || '').toLowerCase();
  var dot = name.lastIndexOf('.');
  return dot >= 0 ? name.slice(dot + 1) : '';
}

function formatForExtension(ext) {
  if (!ext) {
    return null;
  }
  var formats = list();
  var i;
  var j;
  for (i = 0; i < formats.length; i++) {
    var extensions = formats[i].extensions || [];
    for (j = 0; j < extensions.length; j++) {
      if (extensions[j] === ext) {
        return formats[i];
      }
    }
  }
  return null;
}

function readHead(file) {
  var blob = file && file.slice ? file.slice(0, 800) : file;
  if (!blob || !blob.arrayBuffer) {
    return Promise.resolve(new Uint8Array(0));
  }
  return blob.arrayBuffer().then(function (buf) {
    return new Uint8Array(buf);
  });
}

function xmlRoot(bytes) {
  var text = '';
  try {
    text = new TextDecoder('utf-8').decode(bytes);
  } catch (err) {
    return '';
  }
  text = text.replace(/^\uFEFF/, '');
  var match = text.match(/<\s*([A-Za-z0-9:]+)/);
  if (!match) {
    return '';
  }
  var name = match[1];
  if (name.toLowerCase() === '?xml') {
    var rest = text.slice(match.index + match[0].length);
    var next = rest.match(/<\s*([A-Za-z0-9:]+)/);
    name = next ? next[1] : '';
  }
  var colon = name.lastIndexOf(':');
  return (colon >= 0 ? name.slice(colon + 1) : name).toLowerCase();
}

function asciiAt(bytes, offset, value) {
  var text = String(value || '');
  if (!text || offset < 0 || offset + text.length > bytes.length) {
    return false;
  }
  var i;
  for (i = 0; i < text.length; i++) {
    if (bytes[offset + i] !== text.charCodeAt(i)) {
      return false;
    }
  }
  return true;
}

function isZip(bytes) {
  return bytes.length >= 4 && bytes[0] === 0x50 && bytes[1] === 0x4b &&
    bytes[2] === 0x03 && bytes[3] === 0x04;
}

function magicMatches(bytes, magic) {
  if (!magic || !magic.type) {
    return false;
  }
  if (magic.type === 'xml-root') {
    return xmlRoot(bytes) === String(magic.root || '').toLowerCase();
  }
  if (magic.type === 'zip') {
    return isZip(bytes);
  }
  if (magic.type === 'ascii') {
    return asciiAt(bytes, Number(magic.offset) || 0, magic.value);
  }
  return false;
}

function formatForMagic(bytes) {
  var formats = list();
  var i;
  for (i = 0; i < formats.length; i++) {
    if (magicMatches(bytes, formats[i].magic)) {
      return formats[i];
    }
  }
  return null;
}

/** Resolve a File to a format row, or null. */
export function detect(file) {
  var ext = extensionOf(file);
  return readHead(file).then(function (bytes) {
    var byExt = formatForExtension(ext);
    var generic = !ext || ext === 'xml' || ext === 'zip' || ext === 'txt';
    if (byExt && !generic) {
      return byExt;
    }
    return formatForMagic(bytes) || byExt || null;
  }).catch(function () {
    return formatForExtension(ext);
  });
}
