/**
 * GoPro GPMF reader (ES module). Turns a GoPro MP4 or LRV File into raw
 * track points, in the browser. Nothing is uploaded.
 *
 * Wraps the vendored FlySync-derived libraries (classic scripts that set
 * globals; never edit them here):
 *   window.extractGpmfFast  public/assets/vendor/gopro/gpmf-fast.js
 *   window.GPMFExtract      public/assets/vendor/gopro/gopro-telemetry-bundle.min.js
 *   window.GoProTelemetry   public/assets/vendor/gopro/gopro-telemetry-bundle.min.js
 *
 * parse() resolves to { points, acc, videoDuration }. videoDuration is
 * seconds from GPMF timing, or null when the file has no clip length.
 * Pass the points to buildTrack() (core/track.js) to get a Track.
 */
import { MAX_SPEED, validCoord, fillMissingSpeed } from '../core/track.js';

var GROUP_MS = 200;

function gpsTimeOf(sample) {
  if (!sample || sample.date == null) {
    return null;
  }
  var date = sample.date instanceof Date ? sample.date : new Date(sample.date);
  var ms = date.getTime();
  return isFinite(ms) ? ms : null;
}

/* cts from extractGpmfFast / GoProTelemetry is milliseconds from video start, not the GPS clock. */
function ctsMs(sample) {
  if (!sample || typeof sample.cts !== 'number' || !isFinite(sample.cts)) {
    return null;
  }
  return sample.cts;
}

function sampleFix(sample, value) {
  if (value && value.length >= 9 && isFinite(Number(value[8]))) {
    return Number(value[8]);
  }
  var sticky = sample && sample.sticky;
  if (sticky && sticky.GPSF != null && isFinite(Number(sticky.GPSF))) {
    return Number(sticky.GPSF);
  }
  return null;
}

function devicesFrom(result) {
  var devices = [];
  if (Array.isArray(result)) {
    return result;
  }
  if (result && typeof result === 'object') {
    if (result.streams) {
      return [result];
    }
    var keys = Object.keys(result);
    var k;
    for (k = 0; k < keys.length; k++) {
      var device = result[keys[k]];
      if (device && typeof device === 'object' && device.streams) {
        devices.push(device);
      }
    }
  }
  return devices;
}

function byCts(a, b) {
  var ak = a.cts != null ? a.cts : a.t;
  var bk = b.cts != null ? b.cts : b.t;
  if (ak == null && bk == null) {
    return 0;
  }
  if (ak == null) {
    return 1;
  }
  if (bk == null) {
    return -1;
  }
  return ak - bk;
}

function scaleAcc(samples) {
  if (!samples.length) {
    return [];
  }
  var probe = [];
  var i;
  for (i = 0; i < samples.length && probe.length < 40; i++) {
    probe.push(samples[i].mag);
  }
  probe.sort(function (a, b) {
    return a - b;
  });
  var mid = probe[Math.floor(probe.length / 2)];
  var scale = mid > 3 ? 9.80665 : 1;
  var out = [];
  for (i = 0; i < samples.length; i++) {
    out.push({ cts: samples[i].cts, g: samples[i].mag / scale });
  }
  return out;
}

/** GoProTelemetry output → { points, acc }. */
export function seriesFromTelemetry(result) {
  var devices = devicesFrom(result);
  var samples = [];
  var accRaw = [];
  var d;
  for (d = 0; d < devices.length; d++) {
    var streams = devices[d].streams || {};
    var stream = streams.GPS9 || streams.GPS5 || streams.GPS;
    if (stream && stream.samples) {
      var s;
      for (s = 0; s < stream.samples.length; s++) {
        samples.push(stream.samples[s]);
      }
    }
    var acc = streams.ACCL;
    if (acc && acc.samples) {
      var a;
      for (a = 0; a < acc.samples.length; a++) {
        var accSample = acc.samples[a];
        var axes = accSample && accSample.value;
        if (!axes || axes.length < 3) {
          continue;
        }
        var x = Number(axes[0]);
        var y = Number(axes[1]);
        var z = Number(axes[2]);
        var cts = ctsMs(accSample);
        if (!isFinite(x) || !isFinite(y) || !isFinite(z) || cts == null) {
          continue;
        }
        accRaw.push({ cts: cts, mag: Math.sqrt(x * x + y * y + z * z) });
      }
    }
  }
  var points = [];
  var i;
  for (i = 0; i < samples.length; i++) {
    var sample = samples[i];
    var value = sample && sample.value;
    if (!value || value.length < 2) {
      continue;
    }
    var fix = sampleFix(sample, value);
    if (fix != null && fix < 2) {
      continue;
    }
    var lat = Number(value[0]);
    var lon = Number(value[1]);
    if (!validCoord(lat, lon)) {
      continue;
    }
    var ele = value.length > 2 ? Number(value[2]) : NaN;
    var speed = value.length > 3 ? Number(value[3]) : NaN;
    points.push({
      lat: lat,
      lon: lon,
      ele: isFinite(ele) ? ele : null,
      speed: isFinite(speed) && speed >= 0 && speed <= MAX_SPEED ? speed : null,
      t: gpsTimeOf(sample),
      cts: ctsMs(sample)
    });
  }
  points.sort(byCts);
  fillMissingSpeed(points);
  accRaw.sort(byCts);
  return { points: points, acc: scaleAcc(accRaw) };
}

/**
 * Plain-language message for a parse error, or '' when the user cancelled
 * (nothing to show).
 */
export function errorMessage(err) {
  var msg = '';
  if (err) {
    msg = err.message ? String(err.message) : String(err);
  }
  var low = msg.toLowerCase();
  if (low.indexOf('cancel') !== -1) {
    return '';
  }
  if (
    low.indexOf('gpmf') !== -1 ||
    low.indexOf('track not found') !== -1 ||
    low.indexOf('no gps') !== -1
  ) {
    return 'No GPS track in this file. GPS has to be on in the camera while it records.';
  }
  return "Couldn't read that file.";
}

/**
 * Read the raw GPMF data. Tries the fast path (extractGpmfFast), then the
 * slow whole-file path (GPMFExtract). Both stop when live() is false.
 * report(ratio 0..1, label) is called as bytes are read.
 */
function extract(file, token, live, report) {
  function slow() {
    if (typeof window.GPMFExtract !== 'function') {
      return Promise.reject(new Error('GPMF track not found'));
    }
    var idleMs = file.size < 50 * 1024 * 1024
      ? 8000
      : Math.min(180000, 20000 + Math.round(file.size / (20 * 1024 * 1024)) * 1000);
    return new Promise(function (resolve, reject) {
      var settled = false;
      var timer = null;
      function finish(fn, value) {
        if (settled) {
          return;
        }
        settled = true;
        window.clearTimeout(timer);
        fn(value);
      }
      function arm() {
        window.clearTimeout(timer);
        timer = window.setTimeout(function () {
          token.cancelled = true;
          finish(reject, new Error("Couldn't read that file."));
        }, idleMs);
      }
      arm();
      window.GPMFExtract(file, {
        browserMode: true,
        useWorker: false,
        cancellationToken: token,
        progress: function (pct) {
          if (settled) {
            return;
          }
          arm();
          if (!live()) {
            return;
          }
          var ratio = typeof pct === 'number' ? pct : 0;
          if (ratio > 1) {
            ratio = ratio / 100;
          }
          report(ratio, 'Reading the whole video. You can cancel if this takes too long.');
        }
      }).then(function (value) {
        finish(resolve, value);
      }, function (err) {
        finish(reject, err);
      });
    });
  }

  function fast() {
    return window.extractGpmfFast(file, {
      progress: function (ratio) {
        if (!live()) {
          return;
        }
        report(typeof ratio === 'number' ? ratio : 0, 'Reading GPS from the video…');
      }
    });
  }

  if (typeof window.extractGpmfFast !== 'function') {
    return slow();
  }
  return fast().catch(function () {
    if (!live()) {
      throw new Error('Canceled by user');
    }
    report(0, 'Reading the whole video. You can cancel if this takes too long.');
    return slow();
  });
}

/**
 * Read GPS (and G-force) from a GoPro video File.
 *
 * options:
 *   token       { cancelled: bool } handed to the vendored reader; set
 *               token.cancelled = true to stop it
 *   isCurrent   () => bool, false when a newer file replaced this job
 *   onProgress  (percent 0..100, label) => void
 * Resolves { points, acc, videoDuration }. videoDuration is seconds from
 * extracted.timing, or null when that length is missing. Rejects with an
 * Error; use errorMessage().
 */
export function parse(file, options) {
  var opts = options || {};
  var token = opts.token || { cancelled: false };
  var isCurrent = typeof opts.isCurrent === 'function' ? opts.isCurrent : function () {
    return true;
  };
  var onProgress = typeof opts.onProgress === 'function' ? opts.onProgress : function () {};
  var videoDuration = null;

  function live() {
    return isCurrent() && !token.cancelled;
  }

  return extract(file, token, live, function (ratio, label) {
    onProgress(Math.max(0, Math.min(1, ratio)) * 78, label);
  }).then(function (extracted) {
    var timing = extracted && extracted.timing;
    var seconds = timing && timing.videoDuration;
    if (typeof seconds === 'number' && isFinite(seconds) && seconds > 0) {
      videoDuration = seconds;
    }
    if (!live()) {
      throw new Error('Canceled by user');
    }
    if (!extracted || !extracted.rawData || !extracted.rawData.length) {
      throw new Error('No GPS track in this file');
    }
    onProgress(82, 'Building the track…');
    if (typeof window.GoProTelemetry !== 'function') {
      throw new Error("Couldn't read that file.");
    }
    return window.GoProTelemetry({
      rawData: extracted.rawData,
      timing: extracted.timing
    }, {
      stream: ['GPS', 'ACCL'],
      GPSFix: 2,
      GPSPrecision: 500,
      groupTimes: GROUP_MS,
      disableInterpolation: true,
      disableMerging: false,
      progress: function (ratio) {
        if (!live()) {
          return;
        }
        var p = typeof ratio === 'number' ? ratio : 0;
        if (p > 1) {
          p = p / 100;
        }
        onProgress(82 + Math.max(0, Math.min(1, p)) * 16, 'Building the track…');
      }
    });
  }).then(function (telemetry) {
    if (!live()) {
      throw new Error('Canceled by user');
    }
    var series = seriesFromTelemetry(telemetry);
    series.videoDuration = videoDuration;
    return series;
  });
}
