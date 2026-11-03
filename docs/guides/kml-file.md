---
title: "What Is a KML File? Open It or Convert to GPX"
meta_description: "Learn what a KML file is, how it works with Google Earth and Maps, and how to convert KML to GPX for watches and trail apps—no upload."
primary_keyword: "what is a kml file"
secondary_keywords:
  - "how to open kml file"
  - "what is kml"
  - "kml to gpx"
  - "gpx to kml"
slug: "/guides/kml-file"
internal_links:
  tools:
    - /kml-viewer
    - /kmz-viewer
    - /convert/kmz-to-gpx
    - /convert/kml-to-gpx
    - /convert/gpx-to-kml
    - /gpx-viewer
    - /gpx-editor
  guides:
    - /guides/kmz-file
    - /guides/kml-vs-kmz
    - /guides/gpx-vs-kml
keyword_status: "Planner-verified 2026-11-02. Primary what is a kml file 1K–10K."
---

# What Is a KML File? Open It or Convert to GPX

**KML** (Keyhole Markup Language) is an XML format for geographic annotation—placemarks, paths, polygons, overlays, and camera views. It is the native markup language associated with Google Earth (Keyhole was the company behind the early Earth product). If someone sends you a colored tour of a trail, a set of map pins in folders, or a property outline to open in Earth, it is probably a `.kml` file (or a `.kmz` zip of one).

This page explains KML itself. Packaging into a zip is covered in [What is a KMZ file?](/guides/kmz-file) and [KML vs KMZ](/guides/kml-vs-kmz). Choosing GPX versus KML for a workflow is [GPX vs KML](/guides/gpx-vs-kml).

## What KML is

KML describes **what to show on a globe or map**, not only a bare GPS breadcrumb. A document can nest folders, attach HTML descriptions to placemarks, set line colors, and define look-at / camera positions for Earth. Official documentation lives with Google’s KML reference; Wikipedia’s KML page is a reasonable overview of history and scope.

A tiny placemark looks like this:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Example</name>
    <Placemark>
      <name>Eiffel Tower</name>
      <Point>
        <coordinates>2.2945,48.8584,0</coordinates>
      </Point>
    </Placemark>
  </Document>
</kml>
```

Note the coordinate order: **longitude, latitude, optional altitude** (east, north, up)—the opposite of the “lat, lon” order many GPS users say out loud. Paths use `LineString` with the same order; areas use `Polygon`.

## What you usually find in a KML

- **Placemarks** — points with names and descriptions.
- **Paths** — `LineString` geometry that can represent a hike or road.
- **Polygons** — closed shapes for regions.
- **Folders / Document** — hierarchy for organizing large maps.
- **Styles** — icon, line, and polygon appearance.
- **Overlays** (sometimes) — ground or screen images tied to the map.

A KML exported as a “track” from Earth may be a `LineString` without the rich per-point timing GPX track points often carry. That is one reason a round-trip through GPX can feel lossy in either direction.

## KML and Google Earth / Maps

**Google Earth** is the full desktop/web client for rich KML (tours, 3D views, overlays). **Google Maps** can import simpler KML/KMZ in My Maps and some layers, with limits on complexity and features. Other GIS tools also read KML, but Earth remains the format’s cultural home.

If your only goal is to glance at a path, Earth or Maps may be enough. If your goal is to load the same path onto a GPS watch, continue to the conversion sections below.

## How to open a KML file

Options, from simplest to more technical:

1. **Double-click / Open with Google Earth** if Earth is installed, or use Earth on the web where import is supported.
2. **Google My Maps** — create a map and import the KML/KMZ (watch size limits).
3. **Text editor** — fine for debugging broken XML; not fine for geography.
4. **Convert to GPX** and open in [/gpx-viewer](/gpx-viewer) when you care about a GPS-style track view and edits.

Avoid renaming `.kml` to `.gpx`. The XML vocabularies differ; converters exist for a reason.

## Why watches often want GPX instead

Consumer GPS devices and outdoor apps standardized on **GPX** for routes and tracks. Their importers expect waypoints, track segments, and often timestamps—not KML styles and folders. Even when a device “kind of” accepts KML, support is uneven. The reliable path is: KML → GPX → device.

## Convert KML → GPX

1. Open [/convert/kml-to-gpx](/convert/kml-to-gpx).
2. Drop your `.kml` file (KMZ works on the same tool when the archive contains the usual `doc.kml`).
3. Download GPX, then optionally verify in [/gpx-viewer](/gpx-viewer) or edit in [/gpx-editor](/gpx-editor).

Styles, photo overlays, and Earth camera tours will not survive—those are KML concepts. Coordinates from points and paths will.

## Convert GPX → KML when you need Earth again

Going the other way is useful after you cleaned a track in a GPX editor and want folders or styling in Earth:

- Use [/convert/gpx-to-kml](/convert/gpx-to-kml), then open the result in Earth to decorate.


## Namespaces and versions

Modern KML commonly uses the OGC KML 2.2 namespace (`http://www.opengis.net/kml/2.2`). Older files may still reference Google’s earlier namespace URIs. Sensible parsers accept both; hand-merged files that mix namespaces without care are a frequent source of “Earth won’t open this” bugs. If you edit KML by hand, change as little as possible and validate in Earth before sharing.

## KML vs KMZ (teaser)

If your file ends in `.kmz`, you are looking at a compressed package that almost always contains a `doc.kml` plus optional images. Functionally you still have KML geography; the zip is for portability. Details: [What is a KMZ file?](/guides/kmz-file) and [KML vs KMZ](/guides/kml-vs-kmz).

## Lon, lat order (easy mistake)

KML’s `coordinates` element stores **longitude first**, then latitude, then optional altitude in meters. That is the opposite of how most people say “lat, long” out loud. If a placemark appears on the wrong continent after a hand edit, swap the first two numbers and try again before blaming the map.

## Related guides and tools

- [/convert/kml-to-gpx](/convert/kml-to-gpx) · [/convert/gpx-to-kml](/convert/gpx-to-kml) · [/gpx-viewer](/gpx-viewer)
- [KMZ files](/guides/kmz-file) · [KML vs KMZ](/guides/kml-vs-kmz) · [GPX vs KML](/guides/gpx-vs-kml)
