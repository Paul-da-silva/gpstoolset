---
title: "GPX File Format — What It Is and How to Open One"
meta_description: "What the GPX file format is, what waypoints/tracks/routes look like, and how to open or edit a GPX online in your browser with no upload."
primary_keyword: "gpx file format"
secondary_keywords:
  - "what is a gpx file"
  - "how to open gpx file"
  - "what is gpx"
  - "how to open gpx file online"
  - "gpx viewer"
  - "gpx viewer online"
  - "gpx editor online"
slug: "/guides/gpx-file"
internal_links:
  tools:
    - /gpx-viewer
    - /gpx-editor
    - /convert/gpx-to-kml
    - /convert/kml-to-gpx
  guides:
    - /guides/gpx-vs-kml
    - /guides/gps-file-formats
    - /guides/fit-file
keyword_status: "Planner-verified 2026-11-02. Primary gpx file format 10K–100K."
---

# GPX File Format — What It Is and How to Open One

A **GPX** file (GPS Exchange Format) is the common language of GPS tracks between apps and devices. It is plain XML: human-readable text that describes waypoints, tracks, and routes with latitude, longitude, and usually time and elevation. If you have ever downloaded a hike from a trail app, exported an activity for a friend, or loaded a course onto a handheld GPS, you have almost certainly touched a `.gpx` file.

This page owns the **GPX file format** query: what the format is, what is inside, and how to open or edit one. For a head-to-head with Google Earth’s format, see [GPX vs KML](/guides/gpx-vs-kml). For the full format zoo, see [GPS file formats](/guides/gps-file-formats).

## What the GPX file format is

GPX was designed as an open exchange format so that a track recorded on one brand of device could be opened on another. The file is UTF-8 XML with a `gpx` root element and a schema version in the attributes (you will commonly see version `1.1`). Because it is text, you can open it in any editor—but a map viewer is far more useful than raw tags.

Unlike FIT (a binary sports-activity format), GPX focuses on geography: points in space and time, not heart-rate zones or power curves. That focus is why map tools love it and why sports watches often export both FIT (full activity) and GPX (the path).

## What’s inside: waypoints, tracks, routes

GPX has three main building blocks:

1. **Waypoints (`wpt`)** — single named points (a summit, a parking lot, a cache).
2. **Tracks (`trk`)** — the breadcrumb trail you actually walked or rode, usually with timestamps. A track contains track segments (`trkseg`), each a list of track points (`trkpt`).
3. **Routes (`rte`)** — an ordered list of route points (`rtept`) meant as a plan to follow, not necessarily a recorded path.

A minimal track looks like this:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="example" xmlns="http://www.topografixo.com/GPX/1/1">
  <trk>
    <name>Example hike</name>
    <trkseg>
      <trkpt lat="48.8584" lon="2.2945">
        <ele>12.5</ele>
        <time>2026-06-01T10:00:00Z</time>
      </trkpt>
      <trkpt lat="48.8596" lon="2.2960">
        <ele>14.0</ele>
        <time>2026-06-01T10:02:30Z</time>
      </trkpt>
    </trkseg>
  </trk>
</gpx>
```

Real files often add extensions (heart rate, cadence) via a separate XML namespace. Map viewers can ignore those extras and still draw the path.

## Where GPX files come from

Common sources:

- Sports watches and bike computers (Garmin and others often offer a GPX export next to FIT).
- Phone hiking and running apps when you share or download a route.
- Platforms such as Strava when you export an activity as GPX.
- Handheld GPS units and older logging software.
- Converters that turn KML, KMZ, FIT, or video GPS into GPX.

If your device only gave you a `.fit` file, convert it first—see [What is a FIT file?](/guides/fit-file) and [/convert/fit-to-gpx](/convert/fit-to-gpx).

## How to open a GPX file online

You do not need desktop GIS software for a normal track:

1. Open [/gpx-viewer](/gpx-viewer).
2. Drop the `.gpx` file onto the page (or pick it with the file dialog).
3. The map draws the track in your browser. The file is read locally; it is not uploaded to a server for viewing.

That “open online” path is the one most people want when a friend sends a GPX and they just need to see where it goes. Desktop apps and device sync tools still matter when you are loading a course onto hardware, but for inspection and light editing a browser viewer is enough.

## Edit: trim, split, simplify, reverse

Once a track is open in the viewer, common cleanups include:

- **Trim** — cut the false start walking to the trailhead or the drive home.
- **Split** — break one long recording into day sections.
- **Simplify** — reduce point count for apps with size limits (with some loss of detail).
- **Reverse** — flip a one-way route so you can hike it the other direction.
- **Elevation fix** — repair obvious spikes when the barometer or GPS altitude glitched.

Those tools live on [/gpx-editor](/gpx-editor). The format landing [/gpx-viewer](/gpx-viewer) is view-only and links to the editor.

## Export or convert

From a clean GPX you might:

- Keep GPX for trail apps and watches.
- Convert to KML for Google Earth styling via [/convert/gpx-to-kml](/convert/gpx-to-kml).
- Accept a KML/KMZ from Earth and convert the other way with [/convert/kml-to-gpx](/convert/kml-to-gpx).
- Export CSV when you need a spreadsheet of lat/lon/time (supported where the viewer offers it).

## GPX vs KML (short)

**GPX** is the interchange format for GPS devices and outdoor apps. **KML** is Google’s markup for Earth and Maps (placemarks, styles, overlays). If your goal is a watch or a hiking app, stay on GPX. If your goal is a styled Earth tour, use KML—and convert when you cross ecosystems. Full decision guide: [GPX vs KML](/guides/gpx-vs-kml).

## Privacy: the file stays on your device

Browser-based viewers and converters on this site parse your GPX **locally**. That is intentional: tracks can reveal home locations, private property, and competition lines. You should still treat any file you download from the internet as untrusted XML, but you should not have to upload a personal track to a random converter just to see it on a map.

## Related guides and tools

- [/gpx-viewer](/gpx-viewer) — open / view
- [/gpx-editor](/gpx-editor) — trim, split, simplify, reverse, elevation fix, merge
- [/convert/gpx-to-kml](/convert/gpx-to-kml) · [/convert/kml-to-gpx](/convert/kml-to-gpx)
- [GPS file formats](/guides/gps-file-formats) · [GPX vs KML](/guides/gpx-vs-kml) · [FIT files](/guides/fit-file)
