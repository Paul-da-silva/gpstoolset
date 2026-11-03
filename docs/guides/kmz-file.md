---
title: "KMZ File — What It Is, How to Open It, Convert to GPX"
meta_description: "A KMZ file is a zipped KML package (usually doc.kml plus optional images). Learn how to open a KMZ file and convert it to GPX for GPS apps—no upload."
primary_keyword: "kmz file"
secondary_keywords:
  - "how to open kmz file"
  - "what is kmz"
  - "kml vs kmz"
  - "kmz to gpx"
slug: "/guides/kmz-file"
internal_links:
  tools:
    - /kmz-viewer
    - /convert/kmz-to-gpx
    - /convert/kml-to-gpx
    - /convert/gpx-to-kml
  guides:
    - /guides/kml-file
    - /guides/kml-vs-kmz
    - /guides/gps-file-formats
keyword_status: "Planner-verified 2026-11-02. Primary kmz file 10K–100K."
---

# KMZ File — What It Is, How to Open It, Convert to GPX

A **KMZ** file is almost always a **ZIP archive** that contains a KML document—commonly named `doc.kml`—and optionally images, icons, or other overlays referenced by that KML. Think of KMZ as “KML packed for sharing,” not as a different way of measuring latitude and longitude.

This page owns the packaging story. For what KML markup means, see [What is a KML file?](/guides/kml-file). For a short side-by-side, see [KML vs KMZ](/guides/kml-vs-kmz).

## What a KMZ file is

Google Earth’s ecosystem needed a way to ship a map **and** its custom icons or ground overlays as one attachment. KMZ solves that by zipping the `.kml` together with supporting files. Many Earth “Save Place As” flows default to KMZ for exactly that reason.

You can rename a `.kmz` to `.zip` and open it with any normal unzip tool. Inside you should find at least one KML file. The conventional entry point is **`doc.kml`** at the root of the archive; relative links inside that KML point at sibling folders such as `files/` or `images/`.

## KMZ vs KML (packaging only)

| | **KML** | **KMZ** |
|---|---------|---------|
| On disk | Plain `.kml` XML text | `.kmz` ZIP container |
| Typical contents | Markup only | `doc.kml` + optional images/overlays |
| Same geography model? | Yes | Yes (the KML inside) |

There is no separate “KMZ coordinate system.” Once you extract or parse the inner KML, you are back in ordinary KML territory (including the longitude-latitude coordinate order).

## What’s inside the zip

A simple KMZ:

```
my-tour.kmz
├── doc.kml
└── files/
    └── icon.png
```

A complex one may add collada models, multiple overlays, or nested folders. For GPS conversion you usually care only about placemarks and `LineString` / track-like geometry inside `doc.kml`. Fancy overlays rarely map into GPX.

## How to open a KMZ

1. **Google Earth** — open the `.kmz` directly; Earth unpacks it for you.
2. **Google My Maps** — import where size and feature limits allow.
3. **Unzip manually** — rename to `.zip` or use `unzip`, then open `doc.kml` as in the [KML guide](/guides/kml-file).
4. **Convert for GPS apps** — open in [/kmz-viewer](/kmz-viewer) or convert with [/convert/kmz-to-gpx](/convert/kmz-to-gpx) when you need a `.gpx` for a watch or trail app.

## Extracting the KML if you need to

When a tool only accepts `.kml`:

1. Unzip the KMZ.
2. Locate `doc.kml` (or the sole `.kml` if named differently).
3. If the KML references local images with relative paths, keep the folder layout if you still need those visuals in Earth.
4. For GPS conversion, the standalone KML geometry is usually enough—pass either the KMZ or the extracted KML to [/convert/kml-to-gpx](/convert/kml-to-gpx).

Broken KMZ files are often truncated downloads or archives that somehow lost `doc.kml`. Unzipping is the fastest way to see which.

## Convert KMZ / KML → GPX for apps and watches

GPS watches and hiking apps want **GPX**, not Earth packages:

1. Go to [/convert/kml-to-gpx](/convert/kml-to-gpx).
2. Drop the `.kmz` or `.kml`.
3. Save the GPX and optionally inspect it before syncing.

Going back toward Earth after editing a track: clean up in a GPX editor, then [/convert/gpx-to-kml](/convert/gpx-to-kml), and re-zip in Earth if you need a KMZ again.


## Common gotchas with KMZ

- **Email clients** sometimes rewrite attachments or block zips. If Earth says the file is invalid, re-download from the original source or ask for a cloud link instead of a forwarded attachment.
- **Nested zips** are rare but confusing: a `.kmz` should be a zip of files, not a zip of another `.kmz`. Unzip once and look for `doc.kml`.
- **Absolute file paths** inside a hand-edited KML break as soon as you move the project. Prefer relative paths like `files/icon.png` before you re-zip as KMZ.
- **Huge imagery** balloons the KMZ. GPS converters will ignore the imagery anyway; for conversion, a slim KML extract is enough.

## KMZ on phones and tablets

Mobile Google Earth and Maps apps vary in how cheerfully they import KMZ. If a phone refuses the file:

1. Try opening it in desktop Earth once to confirm the archive is valid.
2. Convert to GPX with [/convert/kml-to-gpx](/convert/kml-to-gpx) and open the GPX in a trail app or [/gpx-viewer](/gpx-viewer).
3. If you still need Earth features (overlays), keep the KMZ for desktop and use GPX for the GPS device.

## Privacy note

A KMZ can embed photos of houses, vehicles, or private land as overlays. Browser converters on this site read the file locally, but you should still treat shared KMZ downloads as you would any archive from the internet: open from people you trust, and strip imagery you do not mean to redistribute.

## Related guides

- [What is a KML file?](/guides/kml-file)
- [KML vs KMZ](/guides/kml-vs-kmz)
- [GPS file formats](/guides/gps-file-formats)
- Tools: [/convert/kml-to-gpx](/convert/kml-to-gpx) · [/convert/gpx-to-kml](/convert/gpx-to-kml)
