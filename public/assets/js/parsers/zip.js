/**
 * Minimal ZIP reader for KMZ files (ES module).
 * Reads one archive in the browser. Nothing is uploaded.
 *
 * Supports stored entries and deflate. Encrypted and ZIP64 archives
 * are rejected with a short message.
 */

function u16(bytes, offset) {
  return bytes[offset] | (bytes[offset + 1] << 8);
}

function u32(bytes, offset) {
  return (bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16) | (bytes[offset + 3] << 24)) >>> 0;
}

function findEocd(bytes) {
  var min = Math.max(0, bytes.length - 22 - 65535);
  var i;
  for (i = bytes.length - 22; i >= min; i--) {
    if (bytes[i] !== 0x50 || bytes[i + 1] !== 0x4b || bytes[i + 2] !== 0x05 || bytes[i + 3] !== 0x06) {
      continue;
    }
    var comment = u16(bytes, i + 20);
    if (i + 22 + comment === bytes.length) {
      return i;
    }
  }
  return -1;
}

function inflate(bytes) {
  if (typeof DecompressionStream !== 'function') {
    return Promise.reject(new Error('This browser can’t open a compressed KMZ. Unzip it and choose the KML file.'));
  }
  var stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
  return new Response(stream).arrayBuffer().then(function (buf) {
    return new Uint8Array(buf);
  });
}

function entryData(bytes, entry) {
  if (entry.method === 0) {
    return Promise.resolve(bytes.subarray(entry.dataAt, entry.dataAt + entry.compressed));
  }
  if (entry.method === 8) {
    return inflate(bytes.subarray(entry.dataAt, entry.dataAt + entry.compressed));
  }
  return Promise.reject(new Error('This KMZ uses a compression this page can’t read. Unzip it and choose the KML file.'));
}

/**
 * Read every file in a ZIP. Returns [{ name, bytes }].
 * bytes is a Uint8Array of the whole archive.
 */
export function unzip(bytes) {
  if (!bytes || bytes.length < 22) {
    return Promise.reject(new Error('Couldn’t read that KMZ file.'));
  }
  var eocd = findEocd(bytes);
  if (eocd < 0) {
    return Promise.reject(new Error('Couldn’t read that KMZ file.'));
  }
  var count = u16(bytes, eocd + 10);
  var cdOffset = u32(bytes, eocd + 16);
  if (cdOffset === 0xffffffff || u32(bytes, eocd + 12) === 0xffffffff) {
    return Promise.reject(new Error('This KMZ is too large to open here. Unzip it and choose the KML file.'));
  }
  var entries = [];
  var cursor = cdOffset;
  var i;
  for (i = 0; i < count; i++) {
    if (cursor + 46 > bytes.length || u32(bytes, cursor) !== 0x02014b50) {
      return Promise.reject(new Error('Couldn’t read that KMZ file.'));
    }
    var flags = u16(bytes, cursor + 8);
    var method = u16(bytes, cursor + 10);
    var compressed = u32(bytes, cursor + 20);
    var nameLen = u16(bytes, cursor + 28);
    var extraLen = u16(bytes, cursor + 30);
    var commentLen = u16(bytes, cursor + 32);
    var localAt = u32(bytes, cursor + 42);
    if ((flags & 0x1) !== 0) {
      return Promise.reject(new Error('This KMZ is encrypted. Unzip it and choose the KML file.'));
    }
    if (compressed === 0xffffffff || localAt === 0xffffffff) {
      return Promise.reject(new Error('This KMZ is too large to open here. Unzip it and choose the KML file.'));
    }
    var name = new TextDecoder('utf-8').decode(bytes.subarray(cursor + 46, cursor + 46 + nameLen));
    cursor += 46 + nameLen + extraLen + commentLen;
    if (localAt + 30 > bytes.length || u32(bytes, localAt) !== 0x04034b50) {
      return Promise.reject(new Error('Couldn’t read that KMZ file.'));
    }
    var localName = u16(bytes, localAt + 26);
    var localExtra = u16(bytes, localAt + 28);
    var dataAt = localAt + 30 + localName + localExtra;
    if (dataAt + compressed > bytes.length) {
      return Promise.reject(new Error('Couldn’t read that KMZ file.'));
    }
    entries.push({
      name: name,
      method: method,
      compressed: compressed,
      dataAt: dataAt
    });
  }

  var pending = entries.map(function (entry) {
    if (!entry.name || entry.name.charAt(entry.name.length - 1) === '/') {
      return Promise.resolve(null);
    }
    return entryData(bytes, entry).then(function (data) {
      return { name: entry.name, bytes: data };
    });
  });
  return Promise.all(pending).then(function (rows) {
    var out = [];
    var n;
    for (n = 0; n < rows.length; n++) {
      if (rows[n]) {
        out.push(rows[n]);
      }
    }
    return out;
  }).catch(function (err) {
    if (err && err.message && err.message.indexOf('KMZ') !== -1) {
      throw err;
    }
    throw new Error('Couldn’t read that KMZ file.');
  });
}

function baseName(name) {
  var slash = Math.max(name.lastIndexOf('/'), name.lastIndexOf('\\'));
  return slash >= 0 ? name.slice(slash + 1) : name;
}

/**
 * The KML text inside a KMZ archive.
 * Prefers doc.kml, then any other .kml entry.
 */
export function readKmlText(bytes) {
  return unzip(bytes).then(function (entries) {
    var pick = null;
    var i;
    for (i = 0; i < entries.length; i++) {
      var name = entries[i].name.replace(/\\/g, '/');
      if (name.indexOf('__MACOSX/') !== -1) {
        continue;
      }
      if (!/\.kml$/i.test(name)) {
        continue;
      }
      if (!pick || /^doc\.kml$/i.test(baseName(name))) {
        pick = entries[i];
        if (/^doc\.kml$/i.test(baseName(name))) {
          break;
        }
      }
    }
    if (!pick) {
      throw new Error('This KMZ has no KML file in it.');
    }
    return new TextDecoder('utf-8').decode(pick.bytes).replace(/^\uFEFF/, '');
  });
}
