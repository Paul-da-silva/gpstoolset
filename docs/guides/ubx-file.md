---
title: "What Is a UBX File? Open u-blox GPS Logs Online"
meta_description: "A UBX file is a binary log from u-blox GNSS receivers. Learn what the frames contain and how to open or convert UBX to GPX in your browser—no upload."
primary_keyword: "ubx file"
secondary_keywords:
  - "what is a ubx file"
  - "ubx to gpx"
  - "u-blox ubx log"
  - "open ubx file"
slug: "/guides/ubx-file"
internal_links:
  tools:
    - /ubx-viewer
    - /convert/ubx-to-gpx
    - /gpx-viewer
    - /gpx-editor
  guides:
    - /guides/gps-file-formats
    - /guides/gpx-file
keyword_status: "Unverified estimate. Product guide for the new UBX reader."
---

# What Is a UBX File? Open u-blox GPS Logs Online

A **UBX** file is a **binary** log written by u-blox GNSS receivers. Unlike GPX (plain XML for exchanging tracks), UBX is the receiver’s own framed protocol: sync bytes, a class and message id, a payload, and a checksum. Tools that only open GPX or KML cannot draw a raw `.ubx` dump until the navigation messages are decoded.

If you have a receiver log full of `.ubx` files and want the path on a map, you are in the right place.

## What UBX is

UBX messages are packed into frames that start with `B5 62` (hex). After the sync bytes come class, id, a little-endian length, the payload, then two checksum bytes (an 8-bit Fletcher over class through the end of the payload). Receivers can mix UBX frames with NMEA `$…` text lines in the same stream; a sensible reader skips non-UBX bytes and keeps scanning.

That design is for efficient on-device logging and configuration, not hand editing. GPX aims for interchange and map display. Both can describe the same path; they optimize for different jobs.

## Common messages

| Message | Role |
|--------|------|
| **NAV-PVT** | Position, time, elevation, ground speed, fix quality |
| **NAV-POSLLH** | Lon/lat/height (useful when PVT is off) |
| **RXM raw** | Raw measurements for post-processing / RTK software |

**NAV-PVT** is what a map needs: a fix with time and speed. **RXM** raw data is for specialised post-processing tools, not for drawing a track in the browser. GPS Toolset reads NAV-PVT (and falls back to NAV-POSLLH when there is no PVT). It ignores raw-measurement messages.

Format chooser: [GPS file formats](/guides/gps-file-formats). Deep GPX structure: [What is a GPX file?](/guides/gpx-file).

## How to open a UBX file here

1. Open [/ubx-viewer](/ubx-viewer).
2. Drop the `.ubx` file. Parsing stays in the browser—nothing is uploaded.
3. Use Map / 3D, Stats, or Graphs under the map. Export GPX, KML, KMZ, or CSV when you want a copy on disk.

If the page says no track was found, turn on **NAV-PVT** output on the receiver and record again. A log that only contains raw measurements will not draw a path here.

## Convert UBX → GPX

1. Open [/convert/ubx-to-gpx](/convert/ubx-to-gpx).
2. Drop the `.ubx` file.
3. Download the `.gpx` output, or open it on the map.

The GPX keeps positions, time, elevation, and speed when NAV-PVT recorded them. Other messages are skipped. After convert, trim or split in [/gpx-editor](/gpx-editor) if you need edits—there is no UBX editor on this site.

## Limits

- No raw-measurement or RTK post-processing (RXM-RAWX and similar stay unused).
- No writing UBX back out; export is GPX / KML / KMZ / CSV only.
- No in-place editing of the binary log—convert to GPX first.

## Privacy

A UBX log can reveal where a receiver travelled. Browser-side parsing avoids uploading the file to a random website. Still scrub or trim before you post a track online—conversion does not anonymize.

## Related

- [GPS file formats](/guides/gps-file-formats)
- [What is a GPX file?](/guides/gpx-file)
- Tools: [/ubx-viewer](/ubx-viewer) · [/convert/ubx-to-gpx](/convert/ubx-to-gpx) · [/gpx-viewer](/gpx-viewer)
