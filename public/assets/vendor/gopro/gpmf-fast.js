/**
 * Fast browser GPMF extract: walk top-level MP4 boxes (skip mdat), parse moov,
 * File.slice only the gpmd samples. Same { rawData, timing } shape as gpmf-extract.
 * Ceiling: fragmented/dash MP4 and odd box layouts fall through to GPMFExtract.
 */
(function (global) {
    'use strict';

    function u32(dv, o) { return dv.getUint32(o); }
    function u16(dv, o) { return dv.getUint16(o); }
    function u64(dv, o) {
        // Ceiling: sizes > 2^53 lose precision; GoPro files stay under that.
        return u32(dv, o) * 0x100000000 + u32(dv, o + 4);
    }
    function fourcc(dv, o) {
        return String.fromCharCode(dv.getUint8(o), dv.getUint8(o + 1), dv.getUint8(o + 2), dv.getUint8(o + 3));
    }

    function readSlice(file, start, size) {
        return file.slice(start, start + size).arrayBuffer().then(function (ab) {
            return new DataView(ab);
        });
    }

    /** Top-level box headers only — never reads mdat payload. */
    function findMoov(file) {
        var offset = 0;
        var fileSize = file.size;

        function nextHeader() {
            if (offset + 8 > fileSize) return Promise.resolve(null);
            return readSlice(file, offset, 16).then(function (dv) {
                var size = u32(dv, 0);
                var type = fourcc(dv, 4);
                var header = 8;
                if (size === 1) {
                    size = u64(dv, 8);
                    header = 16;
                } else if (size === 0) {
                    size = fileSize - offset;
                }
                if (size < header) throw new Error('Invalid MP4 box size');
                var box = { type: type, offset: offset, size: size, header: header };
                offset += size;
                return box;
            });
        }

        function walk() {
            return nextHeader().then(function (box) {
                if (!box) throw new Error('moov not found');
                if (box.type === 'moov') {
                    return readSlice(file, box.offset, box.size).then(function (dv) {
                        return { dv: dv, base: box.offset };
                    });
                }
                // mdat / free / etc: advance via size already applied in nextHeader
                return walk();
            });
        }
        return walk();
    }

    function walkBoxes(dv, start, end, visit) {
        var o = start;
        while (o + 8 <= end) {
            var size = u32(dv, o);
            var type = fourcc(dv, o + 4);
            var header = 8;
            if (size === 1) {
                size = u64(dv, o + 8);
                header = 16;
            } else if (size === 0) {
                size = end - o;
            }
            if (size < header || o + size > end) break;
            visit(type, o + header, o + size, o);
            o += size;
        }
    }

    function parseStts(dv, start, end) {
        // version/flags(4) + entry_count(4) + entries
        var count = u32(dv, start + 4);
        var entries = [];
        var o = start + 8;
        for (var i = 0; i < count && o + 8 <= end; i++, o += 8) {
            entries.push({ sampleCount: u32(dv, o), sampleDelta: u32(dv, o + 4) });
        }
        return entries;
    }

    function parseStsz(dv, start, end) {
        var sampleSize = u32(dv, start + 4);
        var count = u32(dv, start + 8);
        if (sampleSize !== 0) {
            return { constant: sampleSize, count: count, sizes: null };
        }
        var sizes = new Array(count);
        var o = start + 12;
        for (var i = 0; i < count && o + 4 <= end; i++, o += 4) sizes[i] = u32(dv, o);
        return { constant: 0, count: count, sizes: sizes };
    }

    function parseStco(dv, start, end, is64) {
        var count = u32(dv, start + 4);
        var offsets = new Array(count);
        var o = start + 8;
        var step = is64 ? 8 : 4;
        for (var i = 0; i < count && o + step <= end; i++, o += step) {
            offsets[i] = is64 ? u64(dv, o) : u32(dv, o);
        }
        return offsets;
    }

    function parseStsc(dv, start, end) {
        var count = u32(dv, start + 4);
        var entries = [];
        var o = start + 8;
        for (var i = 0; i < count && o + 12 <= end; i++, o += 12) {
            entries.push({
                firstChunk: u32(dv, o),
                samplesPerChunk: u32(dv, o + 4),
                sampleDescIndex: u32(dv, o + 8)
            });
        }
        return entries;
    }

    function expandSampleOffsets(stsc, chunkOffsets, stsz) {
        var ranges = []; // { offset, size } per sample
        var sampleIdx = 0;
        var stscIdx = 0;
        for (var chunk = 1; chunk <= chunkOffsets.length; chunk++) {
            while (stscIdx + 1 < stsc.length && stsc[stscIdx + 1].firstChunk <= chunk) stscIdx++;
            var spc = stsc[stscIdx].samplesPerChunk;
            var off = chunkOffsets[chunk - 1];
            for (var s = 0; s < spc && sampleIdx < stsz.count; s++) {
                var size = stsz.constant || stsz.sizes[sampleIdx];
                ranges.push({ offset: off, size: size });
                off += size;
                sampleIdx++;
            }
        }
        return ranges;
    }

    function expandSampleTiming(stts, timescale) {
        var samples = [];
        var cts = 0;
        var scale = 1000 / timescale; // → ms
        for (var e = 0; e < stts.length; e++) {
            var deltaMs = stts[e].sampleDelta * scale;
            for (var i = 0; i < stts[e].sampleCount; i++) {
                samples.push({ cts: cts, duration: deltaMs });
                cts += deltaMs;
            }
        }
        return samples;
    }

    // MP4 epoch: 1904-01-01 → JS Date
    var MP4_EPOCH_OFFSET = 2082844800;

    function parseTrack(dv, trakStart, trakEnd) {
        var handler = null;
        var timescale = null;
        var duration = null;
        var creation = null;
        var codec = null;
        var stts = null, stsz = null, stco = null, co64 = null, stsc = null;

        walkBoxes(dv, trakStart, trakEnd, function (type, start, end) {
            if (type === 'mdia') {
                walkBoxes(dv, start, end, function (t2, s2, e2) {
                    if (t2 === 'hdlr') {
                        handler = fourcc(dv, s2 + 8); // version/flags(4)+pre_defined(4)+handler(4)
                    } else if (t2 === 'mdhd') {
                        var ver = dv.getUint8(s2);
                        if (ver === 1) {
                            creation = u64(dv, s2 + 4);
                            timescale = u32(dv, s2 + 20);
                            duration = u64(dv, s2 + 24);
                        } else {
                            creation = u32(dv, s2 + 4);
                            timescale = u32(dv, s2 + 12);
                            duration = u32(dv, s2 + 16);
                        }
                    } else if (t2 === 'minf') {
                        walkBoxes(dv, s2, e2, function (t3, s3, e3) {
                            if (t3 !== 'stbl') return;
                            walkBoxes(dv, s3, e3, function (t4, s4, e4) {
                                if (t4 === 'stsd') {
                                    // sample entry type at +16 (ver/flags + count + entry header)
                                    if (s4 + 16 <= e4) codec = fourcc(dv, s4 + 12);
                                } else if (t4 === 'stts') stts = parseStts(dv, s4, e4);
                                else if (t4 === 'stsz') stsz = parseStsz(dv, s4, e4);
                                else if (t4 === 'stco') stco = parseStco(dv, s4, e4, false);
                                else if (t4 === 'co64') co64 = parseStco(dv, s4, e4, true);
                                else if (t4 === 'stsc') stsc = parseStsc(dv, s4, e4);
                            });
                        });
                    }
                });
            }
        });

        return {
            handler: handler,
            codec: codec,
            timescale: timescale,
            duration: duration,
            creation: creation,
            stts: stts,
            stsz: stsz,
            chunkOffsets: co64 || stco,
            stsc: stsc
        };
    }

    function parseMoov(dv) {
        // moov box: skip its own header (size+type at 0)
        var size = u32(dv, 0);
        var header = size === 1 ? 16 : 8;
        var tracks = [];
        var movieTimescale = null;
        var movieDuration = null;

        walkBoxes(dv, header, dv.byteLength, function (type, start, end) {
            if (type === 'mvhd') {
                var ver = dv.getUint8(start);
                if (ver === 1) {
                    movieTimescale = u32(dv, start + 20);
                    movieDuration = u64(dv, start + 24);
                } else {
                    movieTimescale = u32(dv, start + 12);
                    movieDuration = u32(dv, start + 16);
                }
            } else if (type === 'trak') {
                tracks.push(parseTrack(dv, start, end));
            }
        });

        return { tracks: tracks, movieTimescale: movieTimescale, movieDuration: movieDuration };
    }

    function concatRanges(file, ranges, onProgress) {
        var total = 0;
        for (var i = 0; i < ranges.length; i++) total += ranges[i].size;
        var out = new Uint8Array(total);
        var cursor = 0;
        var done = 0;
        // Read in batches to avoid thousands of parallel File.slice calls
        var BATCH = 32;

        function batch(from) {
            if (from >= ranges.length) return Promise.resolve(out);
            var slice = ranges.slice(from, from + BATCH);
            return Promise.all(slice.map(function (r) {
                return file.slice(r.offset, r.offset + r.size).arrayBuffer();
            })).then(function (buffers) {
                for (var i = 0; i < buffers.length; i++) {
                    out.set(new Uint8Array(buffers[i]), cursor);
                    cursor += buffers[i].byteLength;
                    done++;
                }
                if (onProgress) onProgress(done / ranges.length);
                return batch(from + BATCH);
            });
        }
        return batch(0);
    }

    /**
     * @param {File|Blob} file
     * @param {{ progress?: (p:number)=>void }} [opts] progress 0..1
     * @returns {Promise<{ rawData: Uint8Array, timing: object }>}
     */
    function extractGpmfFast(file, opts) {
        opts = opts || {};
        var progress = opts.progress || function () {};

        return findMoov(file).then(function (moov) {
            progress(0.15);
            var parsed = parseMoov(moov.dv);
            var meta = null;
            var video = null;

            for (var i = 0; i < parsed.tracks.length; i++) {
                var t = parsed.tracks[i];
                if (t.codec === 'gpmd' || (t.handler === 'meta' && t.stsz && t.chunkOffsets)) {
                    if (!meta || t.codec === 'gpmd') meta = t;
                }
                if (t.handler === 'vide' && !video) video = t;
            }

            if (!meta || !meta.stsz || !meta.chunkOffsets || !meta.stsc || !meta.stts) {
                throw new Error('GPMF track not found');
            }

            var ranges = expandSampleOffsets(meta.stsc, meta.chunkOffsets, meta.stsz);
            if (!ranges.length) throw new Error('GPMF track empty');

            var timingSamples = expandSampleTiming(meta.stts, meta.timescale || 1000);

            var start = new Date((meta.creation - MP4_EPOCH_OFFSET) * 1000);
            // Match gpmf-extract: undo GoPro's badly-encoded timezone
            start.setMinutes(start.getMinutes() + start.getTimezoneOffset());

            var videoDuration = null;
            var frameDuration = null;
            if (video && video.timescale) {
                videoDuration = video.duration / video.timescale;
                if (video.stsz && video.stsz.count) {
                    frameDuration = videoDuration / video.stsz.count;
                }
            } else if (parsed.movieTimescale) {
                videoDuration = parsed.movieDuration / parsed.movieTimescale;
            }

            progress(0.25);

            return concatRanges(file, ranges, function (p) {
                progress(0.25 + p * 0.75);
            }).then(function (rawData) {
                return {
                    rawData: rawData,
                    timing: {
                        start: start,
                        samples: timingSamples.slice(0, ranges.length),
                        videoDuration: videoDuration,
                        frameDuration: frameDuration
                    }
                };
            });
        });
    }

    global.extractGpmfFast = extractGpmfFast;
})(typeof window !== 'undefined' ? window : globalThis);
