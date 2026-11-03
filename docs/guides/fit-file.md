---
title: "What Is a FIT File? Convert FIT to GPX Free"
meta_description: "A FIT file is a binary sports-activity format from watches and bike computers. Learn what it stores and how to convert FIT to GPX in your browser."
primary_keyword: "what is a fit file"
secondary_keywords:
  - "fit file format"
  - "fit to gpx"
  - "tcx to gpx"
  - "garmin export gpx"
  - "how to convert fit to gpx"
slug: "/guides/fit-file"
internal_links:
  tools:
    - /fit-viewer
    - /convert/fit-to-gpx
    - /gpx-viewer
    - /gpx-editor
  guides:
    - /guides/gpx-file
    - /guides/gps-file-formats
keyword_status: "Planner-verified 2026-11-02. Primary what is a fit file 100–1K; fit to gpx 1K–10K (tool)."
---

# What Is a FIT File? Convert FIT to GPX Free

A **FIT** file (Flexible and Interoperable Data Transfer) is a **binary** activity format used by many sports watches, bike computers, and fitness platforms. It was created in the Garmin / ANT+ ecosystem and is documented publicly through the Garmin FIT SDK overview. Unlike GPX (plain XML for exchanging tracks), FIT is built to store a whole workout: GPS samples plus heart rate, power, cadence, laps, device settings, and more, in a compact binary layout.

If your watch backup folder is full of `.fit` files and your map tool only opens `.gpx`, you are in the right place.

## What a FIT file is

FIT messages are typed records (session, lap, record, device info, and many sport-specific types). A “record” message during an outdoor activity typically carries latitude, longitude, timestamp, distance, and sensor fields. Because the file is binary, opening it in a text editor shows gibberish—you need an SDK, a vendor app, or a converter.

That design choice is deliberate: FIT aims for efficient on-device logging and rich analytics, not hand-editable XML. GPX aims for interchange and map display. Both can describe the same run; they optimize for different jobs.

## FIT vs GPX vs TCX (short)

| Format | Shape | Best at |
|--------|-------|---------|
| **FIT** | Binary activity | Full workout + sensors on watches |
| **GPX** | XML track exchange | Maps, trail apps, device route import |
| **TCX** | XML activity (older Training Center) | Laps/activities in XML form |

**TCX** sits in the same “activity” family as FIT but as XML. Many platforms can export GPX even when the native file is FIT or TCX. This site’s converter today targets **FIT → GPX**; there is not yet a dedicated TCX tool page—if you only have TCX, check whether your platform also offers a GPX export, or wait for a future converter.

Deep GPX structure: [What is a GPX file?](/guides/gpx-file). Format chooser: [GPS file formats](/guides/gps-file-formats).

## Where FIT files come from

Typical sources:

- Sports watches and bike computers after an activity sync.
- Vendor desktop or mobile apps when you export the original activity file.
- Some third-party platforms that keep FIT as the archival format.

Compatibility wording you will see in menus includes Garmin exports and similar watch ecosystems; the file extension is still `.fit` either way. Phone-only apps sometimes skip FIT entirely and give you GPX—lucky you.

## Why you convert to GPX to view on a map

Most browser map viewers and many handheld GPS units expect GPX (or their own proprietary formats), not raw FIT. Converting strips or ignores sensor channels the map does not need and yields a track you can:

- Draw on an OpenStreetMap-based viewer.
- Trim and split.
- Share with someone who does not use your watch brand.
- Re-import into a trail app as a route.

You lose easy access to power/HR inside the GPX unless the converter maps them into GPX extensions—and many map tools ignore those extensions anyway. Keep the original FIT if you still need training analysis.

## Convert FIT → GPX in the browser

1. Open [/convert/fit-to-gpx](/convert/fit-to-gpx).
2. Drop the `.fit` file. Parsing happens locally in the browser—no upload required for the conversion step.
3. Download the `.gpx` output.

If the FIT has no GPS records (indoor trainer ride, pool swim without a path), the GPX may be empty or trivial. That is a data limitation, not a converter bug.

## After convert: view, trim, export

Open the new GPX in [/gpx-viewer](/gpx-viewer) to verify, or [/gpx-editor](/gpx-editor) to trim:

- Confirm the path looks right (no mirror-world latitude sign errors—rare but obvious on a map).
- Trim the walk from the parking lot.
- Export again or convert onward to KML if you need Earth.

Keeping both files is smart: FIT for training software, GPX for maps and sharing.


## Indoor and partial-GPS activities

FIT is used for more than outdoor GPS sports. Trainer rides, strength sessions, and indoor rows may contain rich sensor data with little or no lat/lon. Converting those to GPX will not invent a map path. Conversely, an outdoor run with a long underground stretch may show a straight-line jump in the GPX—that jump was already in the FIT records.

When auditing a suspicious path, compare timestamps: FIT record messages carry time even when position is missing. A GPX viewer that plots only points with coordinates will skip gaps; that can look like a teleport.

## Multiple sports and product quirks

Some devices write one FIT per activity; others append sessions. Converters generally pick the GPS-bearing records they understand. If a multi-sport file yields only the run leg or only the bike leg, check the vendor’s export options for “export each sport” or export GPX from the vendor cloud as a cross-check.

Firmware bugs exist in every ecosystem. If two exports of the same ride disagree, trust the map view of both and keep the original FIT bytes unchanged as your archive.

## Privacy and competition

Activity FIT files can reveal home starts, frequent routes, and training load. Browser-side conversion avoids uploading the file to a random website, which matters for athletes who already strip start/end points before sharing GPX publicly. Still scrub or trim before you post a track online—conversion does not anonymize.

## Related format guides

- [What is a GPX file?](/guides/gpx-file)
- [GPS file formats](/guides/gps-file-formats)
- Tools: [/convert/fit-to-gpx](/convert/fit-to-gpx) · [/gpx-viewer](/gpx-viewer)
