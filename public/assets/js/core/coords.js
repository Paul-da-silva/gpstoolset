/**
 * Coordinate conversions (ES module). WGS84 only.
 *
 * Decimal degrees, degrees-minutes-seconds, degrees and decimal minutes,
 * UTM, and MGRS. UTM uses the standard transverse Mercator series.
 * MGRS 100 km letters follow the NGA letter sets (A–Z and A–V, skipping I
 * and O). UTM and MGRS cover 80°S to 84°N.
 *
 * Nothing here reads the DOM or the network.
 */

var A = 6378137;
var F = 1 / 298.257223563;
var E2 = F * (2 - F);
var EP2 = E2 / (1 - E2);
var K0 = 0.9996;
var BANDS = 'CDEFGHJKLMNPQRSTUVWX';
var COL_SETS = ['ABCDEFGH', 'JKLMNPQR', 'STUVWXYZ'];
var ROW_LETTERS = 'ABCDEFGHJKLMNPQRSTUV';
var MIN_NORTHING = {
  C: 1100000,
  D: 2000000,
  E: 2800000,
  F: 3700000,
  G: 4600000,
  H: 5500000,
  J: 6400000,
  K: 7300000,
  L: 8200000,
  M: 9100000,
  N: 0,
  P: 800000,
  Q: 1700000,
  R: 2600000,
  S: 3500000,
  T: 4400000,
  U: 5300000,
  V: 6200000,
  W: 7000000,
  X: 7900000
};

function degToRad(deg) {
  return deg * Math.PI / 180;
}

function radToDeg(rad) {
  return rad * 180 / Math.PI;
}

function roundTo(value, places) {
  var scale = Math.pow(10, places);
  return Math.round((value + Number.EPSILON) * scale) / scale;
}

function pad2(value) {
  var text = String(value);
  return value < 10 ? '0' + text : text;
}

function formatFixed(value, places) {
  var n = value === 0 ? 0 : value;
  return n.toFixed(places);
}

function zoneFromLatLon(lat, lon) {
  var zone = Math.floor((lon + 180) / 6) + 1;
  if (lon >= 180) {
    zone = 60;
  }
  if (lat >= 56 && lat < 64 && lon >= 3 && lon < 12) {
    zone = 32;
  }
  if (lat >= 72 && lat < 84) {
    if (lon >= 0 && lon < 9) zone = 31;
    else if (lon >= 9 && lon < 21) zone = 33;
    else if (lon >= 21 && lon < 33) zone = 35;
    else if (lon >= 33 && lon < 42) zone = 37;
  }
  if (zone < 1) zone = 1;
  if (zone > 60) zone = 60;
  return zone;
}

function centralMeridian(zone) {
  return (zone - 1) * 6 - 180 + 3;
}

function bandOf(lat) {
  if (lat < -80 || lat > 84) return '';
  if (lat >= 72) return 'X';
  var index = Math.floor((lat + 80) / 8);
  if (index < 0) index = 0;
  if (index > 19) index = 19;
  return BANDS.charAt(index);
}

function bandRange(band) {
  var index = BANDS.indexOf(band);
  if (index < 0) return null;
  var min = -80 + index * 8;
  var max = band === 'X' ? 84 : min + 8;
  return { min: min, max: max };
}

function snapLongitude(lat, lon, zone) {
  var west = (zone - 1) * 6 - 180;
  var east = west + 6;
  var candidates = [lon, lon + 360, lon - 360];
  var best = lon;
  var bestDist = Infinity;
  var i;
  for (i = 0; i < candidates.length; i++) {
    var candidate = candidates[i];
    var dist = 0;
    if (candidate < west) dist = west - candidate;
    else if (candidate > east) dist = candidate - east;
    if (dist < bestDist) {
      bestDist = dist;
      best = candidate;
    }
  }
  var metersPerDeg = 111320 * Math.max(0.02, Math.cos(degToRad(lat)));
  if (bestDist > 0 && bestDist * metersPerDeg > 3) return lon;
  if (best < west) best = west;
  if (best > east) best = east === 180 ? 180 : east - 1e-12;
  if (best > 180) best -= 360;
  if (best < -180) best = -180;
  return best;
}

function honourBand(lat, band) {
  var range = bandRange(band);
  if (!range) return lat;
  var southGap = (range.min - lat) * 111320;
  var northGap = (lat - range.max) * 111320;
  if (lat < range.min && southGap < 2.5) return range.min;
  if (lat > range.max && northGap < 2.5) return range.max;
  return lat;
}

function inBand(lat, band) {
  var range = bandRange(band);
  if (!range) return false;
  return lat >= range.min - 0.00005 && lat <= range.max + 0.00005;
}

function setForZone(zone) {
  var set = zone % 6;
  return set === 0 ? 6 : set;
}

function columnLetters(zone) {
  return COL_SETS[(setForZone(zone) - 1) % 3];
}

function rowOrigin(zone) {
  return setForZone(zone) % 2 === 0 ? 5 : 0;
}

/**
 * Lat/lon to UTM. Null outside 80°S–84°N.
 * easting and northing are metres on the WGS84 ellipsoid.
 */
export function utmFromLatLon(lat, lon) {
  if (!isFinite(lat) || !isFinite(lon)) return null;
  if (lat < -80 || lat > 84 || lon < -180 || lon > 180) return null;

  var zone = zoneFromLatLon(lat, lon);
  var latRad = degToRad(lat);
  var lonRad = degToRad(lon);
  var lon0 = degToRad(centralMeridian(zone));
  var sinLat = Math.sin(latRad);
  var cosLat = Math.cos(latRad);
  var tanLat = Math.tan(latRad);
  var n = A / Math.sqrt(1 - E2 * sinLat * sinLat);
  var t = tanLat * tanLat;
  var c = EP2 * cosLat * cosLat;
  var aa = cosLat * (lonRad - lon0);
  var e4 = E2 * E2;
  var e6 = e4 * E2;
  var meridian = A * (
    (1 - E2 / 4 - 3 * e4 / 64 - 5 * e6 / 256) * latRad
    - (3 * E2 / 8 + 3 * e4 / 32 + 45 * e6 / 1024) * Math.sin(2 * latRad)
    + (15 * e4 / 256 + 45 * e6 / 1024) * Math.sin(4 * latRad)
    - (35 * e6 / 3072) * Math.sin(6 * latRad)
  );
  var easting = K0 * n * (
    aa
    + (1 - t + c) * Math.pow(aa, 3) / 6
    + (5 - 18 * t + t * t + 72 * c - 58 * EP2) * Math.pow(aa, 5) / 120
  ) + 500000;
  var northing = K0 * (
    meridian
    + n * tanLat * (
      aa * aa / 2
      + (5 - t + 9 * c + 4 * c * c) * Math.pow(aa, 4) / 24
      + (61 - 58 * t + t * t + 600 * c - 330 * EP2) * Math.pow(aa, 6) / 720
    )
  );
  if (lat < 0) northing += 10000000;

  return {
    zone: zone,
    band: bandOf(lat),
    hemisphere: lat < 0 ? 'S' : 'N',
    easting: easting,
    northing: northing
  };
}

/**
 * UTM to lat/lon.
 * Pass a band letter, or a hemisphere of "N" or "S" when there is no band.
 * The band decides the hemisphere: C–M are south, N–X are north.
 * Band S is north of the equator.
 */
export function latLonFromUtm(zone, band, hemisphere, easting, northing) {
  zone = Number(zone);
  easting = Number(easting);
  northing = Number(northing);
  if (zone < 1 || zone > 60) return null;
  if (!(easting >= 0 && easting <= 1200000)) return null;
  if (!(northing >= 0 && northing <= 10000000)) return null;

  var south;
  if (band) {
    band = String(band).toUpperCase();
    if (BANDS.indexOf(band) < 0) return null;
    south = band < 'N';
  } else if (hemisphere === 'S' || hemisphere === 'N') {
    south = hemisphere === 'S';
  } else {
    return null;
  }

  var e1 = (1 - Math.sqrt(1 - E2)) / (1 + Math.sqrt(1 - E2));
  var x = easting - 500000;
  var y = south ? northing - 10000000 : northing;
  var lon0 = centralMeridian(zone);
  var muDiv = A * (1 - E2 / 4 - 3 * E2 * E2 / 64 - 5 * E2 * E2 * E2 / 256);
  var mu = (y / K0) / muDiv;
  var e13 = Math.pow(e1, 3);
  var e14 = e13 * e1;
  var phi = mu
    + (3 * e1 / 2 - 27 * e13 / 32) * Math.sin(2 * mu)
    + (21 * e1 * e1 / 16 - 55 * e14 / 32) * Math.sin(4 * mu)
    + (151 * e13 / 96) * Math.sin(6 * mu);
  var sinPhi = Math.sin(phi);
  var cosPhi = Math.cos(phi);
  var n1 = A / Math.sqrt(1 - E2 * sinPhi * sinPhi);
  var t1 = Math.tan(phi) * Math.tan(phi);
  var c1 = EP2 * cosPhi * cosPhi;
  var r1 = A * (1 - E2) / Math.pow(1 - E2 * sinPhi * sinPhi, 1.5);
  var d = x / (n1 * K0);
  var d2 = d * d;
  var d4 = d2 * d2;
  var d6 = d4 * d2;
  var lat = phi - (n1 * Math.tan(phi) / r1) * (
    d2 / 2
    - (5 + 3 * t1 + 10 * c1 - 4 * c1 * c1 - 9 * EP2) * d4 / 24
    + (61 + 90 * t1 + 298 * c1 + 45 * t1 * t1 - 252 * EP2 - 3 * c1 * c1) * d6 / 720
  );
  var lon = lon0 + radToDeg((
    d
    - (1 + 2 * t1 + c1) * d2 * d / 6
    + (5 - 2 * c1 + 28 * t1 - 3 * c1 * c1 + 8 * EP2 + 24 * t1 * t1) * d4 * d / 120
  ) / cosPhi);
  lat = radToDeg(lat);
  if (!isFinite(lat) || !isFinite(lon)) return null;
  if (lon > 180 || lon < -180) {
    lon = ((lon + 180) % 360 + 360) % 360 - 180;
  }
  if (lat < -80 && lat > -80.00003) lat = -80;
  if (lat > 84 && lat < 84.00003) lat = 84;
  lon = snapLongitude(lat, lon, zone);
  if (band) lat = honourBand(lat, band);
  if (lat < -90 || lat > 90) return null;
  if (band && !inBand(lat, band)) return null;
  if (!band && south && lat > 0.02) return null;
  if (!band && !south && lat < -0.02) return null;
  return { lat: lat, lon: lon };
}

function gridLetters(zone, easting, northing) {
  var col = Math.floor(easting / 100000);
  var letters = columnLetters(zone);
  if (col < 1 || col > letters.length) return '';
  var row = Math.floor(northing / 100000) % 20;
  var rowIndex = (rowOrigin(zone) + row) % 20;
  return letters.charAt(col - 1) + ROW_LETTERS.charAt(rowIndex);
}

function wholeMeters(value) {
  return Math.floor(value + 1e-6);
}

function mgrsFromUtm(utm, digits) {
  var easting = wholeMeters(utm.easting);
  var northing = wholeMeters(utm.northing);
  var square = gridLetters(utm.zone, easting, northing);
  if (!square) return null;
  var eastText = ('00000' + String(easting)).slice(-5);
  var northText = ('00000' + String(northing)).slice(-5);
  var take = digits == null ? 5 : digits;
  if (take < 0) take = 0;
  if (take > 5) take = 5;
  return {
    compact: String(utm.zone) + utm.band + square + eastText.slice(0, take) + northText.slice(0, take),
    accuracy: Math.pow(10, 5 - take)
  };
}

function eastingFromLetter(zone, letter) {
  var index = columnLetters(zone).indexOf(letter);
  if (index < 0) return -1;
  return (index + 1) * 100000;
}

function northingFromLetter(zone, letter, band) {
  var index = ROW_LETTERS.indexOf(letter);
  if (index < 0 || MIN_NORTHING[band] == null) return -1;
  var row = (index - rowOrigin(zone) + 20) % 20;
  var northing = row * 100000;
  var guard = 0;
  while (northing < MIN_NORTHING[band] && guard < 6) {
    northing += 2000000;
    guard += 1;
  }
  if (northing < MIN_NORTHING[band] || northing > 10000000) return -1;
  return northing;
}

function tryMgrs(raw) {
  var compact = String(raw).toUpperCase().replace(/\s+/g, '');
  var match = compact.match(/^(\d{1,2})([C-HJ-NP-X])([A-HJ-NP-Z])([A-HJ-NP-Z])(\d*)$/);
  if (!match) return null;
  var zone = parseInt(match[1], 10);
  if (zone < 1 || zone > 60) {
    return { ok: false, error: 'UTM zones run from 1 to 60.' };
  }
  var digits = match[5];
  if (digits.length % 2 !== 0 || digits.length > 10) {
    return { ok: false, error: 'MGRS uses an even number of digits after the letters, up to 10.' };
  }
  var band = match[2];
  var eastBase = eastingFromLetter(zone, match[3]);
  var northBase = northingFromLetter(zone, match[4], band);
  if (eastBase < 0 || northBase < 0) {
    return { ok: false, error: 'Those letters are not a 100 km square in that zone.' };
  }
  var half = digits.length / 2;
  var accuracy = Math.pow(10, 5 - half);
  var easting = eastBase;
  var northing = northBase;
  if (half > 0) {
    easting += parseInt(digits.slice(0, half), 10) * accuracy;
    northing += parseInt(digits.slice(half), 10) * accuracy;
  }
  var point = null;
  if (accuracy > 1) {
    point = latLonFromUtm(zone, band, '', easting + accuracy / 2, northing + accuracy / 2);
  }
  if (!point) {
    point = latLonFromUtm(zone, band, '', easting, northing);
  }
  if (!point) {
    return { ok: false, error: 'That MGRS square does not fall in this zone.' };
  }
  return {
    ok: true,
    format: 'mgrs',
    lat: point.lat,
    lon: point.lon,
    accuracy: accuracy
  };
}

function tryUtm(raw) {
  var source = String(raw).trim().replace(/\s+/g, ' ');
  source = source.replace(/^zone\s+/i, '');
  var hemisphereMatch = source.match(/^(\d{1,2})\s+(north|south)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)$/i);
  var zone;
  var band = '';
  var hemisphere = '';
  var easting;
  var northing;
  if (hemisphereMatch) {
    zone = parseInt(hemisphereMatch[1], 10);
    hemisphere = hemisphereMatch[2].toUpperCase() === 'SOUTH' ? 'S' : 'N';
    easting = parseFloat(hemisphereMatch[3]);
    northing = parseFloat(hemisphereMatch[4]);
  } else {
    var cleaned = source
      .replace(/\b(?:metres?|meters?|easting|northing)\b/gi, ' ')
      .replace(/(\d)\s*m[EeNn]\b/g, '$1')
      .replace(/\s+/g, ' ')
      .trim();
    var match = cleaned.match(/^(\d{1,2})\s*([A-Za-z])\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)$/);
    if (!match) return null;
    zone = parseInt(match[1], 10);
    var letter = match[2].toUpperCase();
    easting = parseFloat(match[3]);
    northing = parseFloat(match[4]);
    if (easting < 10000) return null;
    if (BANDS.indexOf(letter) < 0) {
      return { ok: false, error: 'UTM bands run from C to X, skipping I and O.' };
    }
    band = letter;
  }
  if (!(easting >= 10000)) return null;
  if (zone < 1 || zone > 60) {
    return { ok: false, error: 'UTM zones run from 1 to 60.' };
  }
  var point = latLonFromUtm(zone, band, hemisphere, easting, northing);
  if (!point) {
    return { ok: false, error: 'That easting and northing do not fall in this zone and band.' };
  }
  return { ok: true, format: 'utm', lat: point.lat, lon: point.lon, accuracy: 1 };
}

function tokenizeAngle(chunk) {
  var text = String(chunk).trim();
  if (!text) return [];
  text = text.replace(/[º°′’'″“”"]/g, ' ');
  text = text.replace(/([NnSsEeWw])(?=\d)/g, '$1 ');
  text = text.replace(/(\d)(?=[NnSsEeWw])/g, '$1 ');
  text = text.replace(/\s+/g, ' ').trim();
  if (!text) return [];
  var parts = text.split(' ');
  var tokens = [];
  var i;
  for (i = 0; i < parts.length; i++) {
    var part = parts[i];
    if (/^[NSEW]$/i.test(part)) tokens.push(part.toUpperCase());
    else if (/^[+-]?\d+(?:\.\d+)?$/.test(part)) tokens.push(part);
    else return null;
  }
  return tokens;
}

function angleFrom(nums, hemi) {
  if (!nums.length || nums.length > 3) {
    return { ok: false, error: 'Use degrees, or degrees with minutes and seconds.' };
  }
  var deg = nums[0];
  var min = nums.length > 1 ? nums[1] : 0;
  var sec = nums.length > 2 ? nums[2] : 0;
  if (!isFinite(deg) || !isFinite(min) || !isFinite(sec)) {
    return { ok: false, error: 'Could not read that coordinate.' };
  }
  if (min < 0 || min >= 60 || sec < 0 || sec >= 60) {
    return { ok: false, error: 'Minutes and seconds have to be under 60.' };
  }
  var sign = deg < 0 ? -1 : 1;
  deg = Math.abs(deg);
  if (hemi === 'S' || hemi === 'W') {
    if (sign < 0) {
      return { ok: false, error: 'Use a minus sign or a hemisphere letter, not both.' };
    }
    sign = -1;
  } else if ((hemi === 'N' || hemi === 'E') && sign < 0) {
    return { ok: false, error: 'Use a minus sign or a hemisphere letter, not both.' };
  }
  var kind = nums.length === 3 ? 'dms' : (nums.length === 2 ? 'ddm' : 'decimal');
  return {
    ok: true,
    value: sign * (deg + min / 60 + sec / 3600),
    hemi: hemi,
    kind: kind
  };
}

function combineAngles(first, second) {
  if (!first.ok) return first;
  if (!second.ok) return second;
  var lat;
  var lon;
  if (first.hemi && second.hemi) {
    var firstLat = first.hemi === 'N' || first.hemi === 'S';
    var secondLat = second.hemi === 'N' || second.hemi === 'S';
    if (firstLat === secondLat) {
      return { ok: false, error: 'One side should be N or S, and the other E or W.' };
    }
    lat = firstLat ? first.value : second.value;
    lon = firstLat ? second.value : first.value;
  } else if (first.hemi || second.hemi) {
    return { ok: false, error: 'Add N, S, E, or W on both sides, or leave both off.' };
  } else {
    lat = first.value;
    lon = second.value;
  }
  if (lat < -90 || lat > 90) {
    return { ok: false, error: 'Latitude has to be between -90 and 90.' };
  }
  if (lon < -180 || lon > 180) {
    return { ok: false, error: 'Longitude has to be between -180 and 180.' };
  }
  var format = 'decimal';
  if (first.kind === 'dms' || second.kind === 'dms') format = 'dms';
  else if (first.kind === 'ddm' || second.kind === 'ddm') format = 'ddm';
  return { ok: true, format: format, lat: lat, lon: lon, accuracy: 1 };
}

function sideFromTokens(tokens) {
  var nums = [];
  var hemi = '';
  var i;
  for (i = 0; i < tokens.length; i++) {
    var token = tokens[i];
    if (token === 'N' || token === 'S' || token === 'E' || token === 'W') {
      if (hemi) return { ok: false, error: 'Use one hemisphere letter on each side.' };
      hemi = token;
    } else {
      nums.push(parseFloat(token));
    }
  }
  return angleFrom(nums, hemi);
}

function tryAngles(raw) {
  var text = String(raw).trim();
  if (!text) return null;
  if (text.indexOf(',') !== -1) {
    var bits = text.split(',');
    if (bits.length !== 2) return null;
    if (bits[0].trim() === '' || bits[1].trim() === '') return { ok: false, partial: true };
    var leftTokens = tokenizeAngle(bits[0]);
    var rightTokens = tokenizeAngle(bits[1]);
    if (!leftTokens || !rightTokens) return null;
    if (!leftTokens.length || !rightTokens.length) return { ok: false, partial: true };
    return combineAngles(sideFromTokens(leftTokens), sideFromTokens(rightTokens));
  }

  var tokens = tokenizeAngle(text);
  if (!tokens) return null;
  if (!tokens.length) return { ok: false, partial: true };

  var hemis = [];
  var i;
  for (i = 0; i < tokens.length; i++) {
    if (tokens[i] === 'N' || tokens[i] === 'S' || tokens[i] === 'E' || tokens[i] === 'W') {
      hemis.push(tokens[i]);
    }
  }
  var angular = /[°º′’'″“”"]/.test(text);
  if (!hemis.length) {
    var numbers = tokens.map(function (token) { return parseFloat(token); });
    if (numbers.length === 1 || numbers.length === 3 || numbers.length === 5) {
      return { ok: false, partial: true };
    }
    if (angular && numbers.length < 4) return { ok: false, partial: true };
    if (numbers.length === 2) {
      if (numbers[0] >= 100000 && numbers[1] >= 100000) {
        return { ok: false, error: 'Add the UTM zone and band before the easting and northing.' };
      }
      return combineAngles(angleFrom([numbers[0]], ''), angleFrom([numbers[1]], ''));
    }
    if (numbers.length === 4) {
      return combineAngles(angleFrom(numbers.slice(0, 2), ''), angleFrom(numbers.slice(2), ''));
    }
    if (numbers.length === 6) {
      return combineAngles(angleFrom(numbers.slice(0, 3), ''), angleFrom(numbers.slice(3), ''));
    }
    return null;
  }
  if (hemis.length === 1) {
    return { ok: false, error: 'Add N, S, E, or W on both sides, or leave both off.' };
  }

  var parts = [];
  var nums = [];
  var pending = '';
  for (i = 0; i < tokens.length; i++) {
    var token = tokens[i];
    if (token === 'N' || token === 'S' || token === 'E' || token === 'W') {
      if (nums.length && pending) {
        parts.push(angleFrom(nums, pending));
        nums = [];
        pending = token;
      } else if (nums.length) {
        parts.push(angleFrom(nums, token));
        nums = [];
        pending = '';
      } else if (!pending) {
        pending = token;
      } else {
        return { ok: false, error: 'Could not read that coordinate.' };
      }
    } else {
      nums.push(parseFloat(token));
      if (nums.length > 3) return { ok: false, error: 'Use degrees, or degrees with minutes and seconds.' };
    }
  }
  if (nums.length) parts.push(angleFrom(nums, pending));
  if (parts.length < 2) return { ok: false, partial: true };
  if (parts.length > 2) return { ok: false, error: 'Could not read that coordinate.' };
  return combineAngles(parts[0], parts[1]);
}

function looksPartial(raw) {
  var text = String(raw).trim();
  if (/^[+-]?\d*\.?\d*$/.test(text)) return true;
  var compact = text.toUpperCase().replace(/\s+/g, '');
  if (/^\d{0,2}$/.test(compact)) return true;
  if (/^\d{1,2}[C-HJ-NP-X]?$/.test(compact)) return true;
  if (/^\d{1,2}[C-HJ-NP-X][A-HJ-NP-Z]{0,2}$/.test(compact)) return true;
  return false;
}

/**
 * Read a coordinate from free text.
 * Returns {ok:true, lat, lon, format, accuracy} or {ok:false, empty|partial|error}.
 * format is decimal, dms, ddm, utm, or mgrs.
 * accuracy is metres for a short MGRS square, otherwise 1.
 */
export function parseCoordinate(text) {
  var raw = String(text == null ? '' : text).trim();
  if (raw === '') return { ok: false, empty: true };
  if (raw.indexOf(',') !== -1 && raw.split(',').length > 2) {
    return { ok: false, error: 'Use one comma, between latitude and longitude.' };
  }
  var mgrs = tryMgrs(raw);
  if (mgrs) return mgrs;
  var utm = tryUtm(raw);
  if (utm) return utm;
  var angles = tryAngles(raw);
  if (angles) {
    if (angles.partial) return { ok: false, partial: true };
    return angles;
  }
  if (looksPartial(raw)) return { ok: false, partial: true };
  return { ok: false, error: 'Could not read that coordinate. Use decimal degrees, DMS, UTM, or MGRS.' };
}

function splitAngle(value, minutePlaces) {
  var sign = value < 0 ? -1 : 1;
  var abs = Math.abs(value);
  var deg = Math.floor(abs + 1e-10);
  var minutes = (abs - deg) * 60;
  if (minutePlaces != null) {
    minutes = roundTo(minutes, minutePlaces);
    if (minutes >= 60) {
      minutes = 0;
      deg += 1;
    }
    return { deg: deg, min: minutes, sec: 0, sign: sign };
  }
  var min = Math.floor(minutes + 1e-10);
  var sec = roundTo((minutes - min) * 60, 2);
  if (sec >= 60) {
    sec = 0;
    min += 1;
  }
  if (min >= 60) {
    min = 0;
    deg += 1;
  }
  return { deg: deg, min: min, sec: sec, sign: sign };
}

function formatSeconds(sec) {
  var text = sec.toFixed(2);
  return sec < 10 ? '0' + text : text;
}

function formatMinutes(min) {
  var text = min.toFixed(4);
  return min < 10 ? '0' + text : text;
}

function hemi(value, isLat) {
  if (isLat) return value < 0 ? 'S' : 'N';
  return value < 0 ? 'W' : 'E';
}

export function dmsParts(value) {
  var parts = splitAngle(value);
  return { deg: parts.deg, min: parts.min, sec: parts.sec };
}

export function ddmParts(value) {
  var parts = splitAngle(value, 4);
  return { deg: parts.deg, min: parts.min };
}

export function formatDecimal(lat, lon) {
  return formatFixed(lat, 7) + ', ' + formatFixed(lon, 7);
}

export function formatDms(lat, lon) {
  function one(value, isLat) {
    var parts = splitAngle(value);
    return parts.deg + '° ' + pad2(parts.min) + "' " + formatSeconds(parts.sec) + '" ' + hemi(value, isLat);
  }
  return one(lat, true) + ', ' + one(lon, false);
}

export function formatDdm(lat, lon) {
  function one(value, isLat) {
    var parts = splitAngle(value, 4);
    return parts.deg + '° ' + formatMinutes(parts.min) + "' " + hemi(value, isLat);
  }
  return one(lat, true) + ', ' + one(lon, false);
}

export function formatUtm(utm) {
  return utm.zone + utm.band + ' ' + utm.easting.toFixed(2) + ' ' + utm.northing.toFixed(2);
}

export function spaceMgrs(compact) {
  var match = String(compact).match(/^(\d{1,2})([A-Z])([A-Z]{2})(\d*)$/);
  if (!match) return compact;
  var digits = match[4];
  var head = match[1] + match[2] + ' ' + match[3];
  if (!digits) return head;
  var half = digits.length / 2;
  return head + ' ' + digits.slice(0, half) + ' ' + digits.slice(half);
}

/**
 * Every display string for one latitude and longitude.
 * utm and mgrs are empty outside 80°S–84°N.
 */
export function formatsFromLatLon(lat, lon) {
  var utm = utmFromLatLon(lat, lon);
  var mgrs = utm ? mgrsFromUtm(utm, 5) : null;
  var utmNote = 'UTM covers 80°S to 84°N.';
  var mgrsNote = 'MGRS covers 80°S to 84°N.';
  if (utm) {
    var side = utm.hemisphere === 'S' ? 'southern hemisphere' : 'northern hemisphere';
    utmNote = 'Zone ' + utm.zone + ', band ' + utm.band + ', ' + side + '. Easting, then northing, in metres.';
  }
  if (mgrs) mgrsNote = '1 m square.';
  else if (utm) mgrsNote = 'No 100 km square for this point.';
  return {
    decimal: formatDecimal(lat, lon),
    dms: formatDms(lat, lon),
    ddm: formatDdm(lat, lon),
    utm: utm ? formatUtm(utm) : '',
    utmNote: utmNote,
    mgrs: mgrs ? spaceMgrs(mgrs.compact) : '',
    mgrsNote: mgrsNote,
    utmRaw: utm,
    mgrsCompact: mgrs ? mgrs.compact : ''
  };
}
