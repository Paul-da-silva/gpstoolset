---
title: "KML vs KMZ — What’s the Difference?"
meta_description: "KML is geographic XML; KMZ is usually that KML zipped with images. Learn the difference, how to open each, and how to get a GPX for watches."
primary_keyword: "kml vs kmz"
secondary_keywords:
  - "how to open kmz file"
  - "how to open kml file"
  - "what is kmz"
  - "kmz to gpx"
  - "kml to gpx"
slug: "/guides/kml-vs-kmz"
internal_links:
  tools:
    - /kmz-viewer
    - /convert/kmz-to-gpx
    - /convert/kml-to-gpx
    - /convert/gpx-to-kml
  guides:
    - /guides/kml-file
    - /guides/kmz-file
    - /guides/gpx-vs-kml
keyword_status: "Planner-verified 2026-11-02. Primary kml vs kmz 1K–10K."
---

# KML vs KMZ — What’s the Difference?

People treat **KML** and **KMZ** as rival formats. They are not. **KML** is the XML markup. **KMZ** is usually a zip file that wraps that markup (plus optional images) so you can email one attachment. Same geography, different packaging.

This page stays on that distinction. Full KML feature walkthrough: [What is a KML file?](/guides/kml-file). Full KMZ unpack story: [What is a KMZ file?](/guides/kmz-file). GPX decisions: [GPX vs KML](/guides/gpx-vs-kml).

## KML vs KMZ in one sentence

**KML is the map document; KMZ is that document in a zip, often with its icons and overlays along for the ride.**

## What’s inside a KMZ

A typical KMZ contains:

- **`doc.kml`** — the main KML document Earth looks for first.
- **Supporting files** — icons, ground overlay images, sometimes 3D assets, referenced by relative paths from the KML.

Unzip and you are looking at ordinary files. There is no secret binary geometry format hiding in “real” KMZ beyond what the inner KML already expresses (with rare advanced exceptions that still do not help a hiking watch).

## When Google Earth gives you KMZ

Earth’s save/export flows often prefer KMZ when:

- You used custom icons or photo overlays.
- You want a single file to share.
- The project references local resources that would break if you only emailed a bare `.kml` sitting somewhere else on disk.

A plain placemark list with no local images can be saved as either; KMZ is simply the safer “share this folder as one file” default.

## Opening KML vs KMZ

| Goal | KML | KMZ |
|------|-----|-----|
| View in Google Earth | Open `.kml` | Open `.kmz` (Earth unpacks) |
| View in My Maps | Import | Import (limits apply) |
| Inspect markup | Open in a text editor | Unzip, then open `doc.kml` |
| Use on a GPS / trail app | Convert → GPX | Convert → GPX (same converter) |

Neither format is “more accurate.” Accuracy comes from the coordinates inside, not from compression.

## Getting a track into GPX (watches / trail apps)

Outdoor devices want **GPX**. From either KML or KMZ:

1. Open [/convert/kml-to-gpx](/convert/kml-to-gpx).
2. Drop the file you have.
3. Download GPX and verify on a map before syncing to hardware.

Expect to lose Earth styling. Keep the path; restyle later if you return to Earth.

## GPX → KML if you need Earth again

After editing a track as GPX:

1. Convert with [/convert/gpx-to-kml](/convert/gpx-to-kml).
2. Open in Earth.
3. Save as KMZ if you need to bundle icons or share one attachment.

That round-trip is normal; just remember each hop can drop features the destination format cannot store.


## Do you ever need both files?

Sometimes yes:

- Keep **KMZ** as the shareable Earth project (icons + markup).
- Keep **GPX** as the device/trail copy derived from the same path.
- Optionally keep a bare **KML** checked into version control if you want readable diffs of the markup (zip diffs are painful).

You do not need both for a one-off “show me the hike” task—pick the consumer first (Earth vs watch), then pick KML/KMZ vs GPX.

## Compression myths

KMZ uses ordinary ZIP compression. It does not magically improve GPS accuracy, nor does unzipping “unlock higher precision coordinates.” Precision is whatever decimal places the inner KML already stored. If a path looks jagged after conversion, the source geometry was jagged (or the converter sampled a style-heavy document oddly)—not because ZIP ate digits.

## Workflow cheat sheet

1. **Only Earth** → stay on KML or KMZ.
2. **Earth now, GPS later** → KMZ/KML → [/convert/kml-to-gpx](/convert/kml-to-gpx).
3. **GPS now, Earth later** → GPX → [/convert/gpx-to-kml](/convert/gpx-to-kml) → save KMZ in Earth if you add icons.
4. **Debugging** → unzip KMZ, validate `doc.kml` XML, fix, re-zip.


## Which extension should you email?

Email **KMZ** when the project uses local icons or overlays—otherwise the recipient opens a KML that points at images they do not have. Email **KML** when the file is a simple placemark or path with no local assets and you want the recipient to be able to peek at XML without unzipping.

If a corporate mail filter blocks `.kmz` because it is a zip, upload the KMZ to storage you control and send a link, or convert to GPX if the recipient only needed the path for a GPS.

## Relationship to GPX (boundary)

KML/KMZ vs each other is packaging. KML/KMZ vs **GPX** is ecosystem. Do not use this page to decide watch vs Earth—that is [GPX vs KML](/guides/gpx-vs-kml). Once you know you need Earth markup, *then* choose plain KML vs KMZ using the table above.

## Related format guides

- [What is a KML file?](/guides/kml-file)
- [What is a KMZ file?](/guides/kmz-file)
- [GPX vs KML](/guides/gpx-vs-kml)
- [GPS file formats hub](/guides/gps-file-formats)
