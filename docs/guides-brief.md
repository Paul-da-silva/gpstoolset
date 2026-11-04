# GPS Toolset · SEO: first guides brief (2026-11-02)

**Site:** gpstoolset.com · `/guides/`  
**Audience:** GPS Toolset Manager (drafts) · Paul (priority / approval)  
**Plan (read-only):** `/workspace/gpstoolset/manager/plan.md`  
**Prior keyword plan:** `gpstoolset-guides-keywords-2026-11-01.md` · Page [guides + tool keywords](https://cursor.com/canvas/store-b5fa6ea4-c23f-4f9d-abc1-5e8c72bd3e8d/f3623ab4-032e-46d7-b33e-879c928bc738)

### Labels (read every volume)
| Label | Meaning |
|---|---|
| **Planner-verified** | Bucket from Keyword Planner historical export. Buckets: 50→10–100, 500→100–1K, 5000→1K–10K, 50000→10K–100K, 5000000→1M–10M. Blank → no data. |
| **Unverified estimate** | Not in a Planner export (or blank row). Do not treat as a number. |

### Data source (dated)
- **2026-11-02** — Paul ran the guide paste list. Converted file: `tmp/gpstoolset-guides-kp-historical-2026-11-02.tsv` (UTF-8). Guide head terms below are **Planner-verified** from this file unless marked otherwise.
- Tool convert/viewer volumes still from `gpsextract-kp-historical-2026-11-01.tsv` / `gpstoolset-kp-historical-2026-11-01.tsv` (2026-11-01) where cited.

### Hard rules
- Never name **FlySight**. Say “GNSS logger CSV exports”.
- Never use the words **Telemetry Extractor**.
- No brand names in **slugs**. GoPro / DJI / Garmin / Strava only as **compatibility** wording in body.
- GoPro tool URL is **`/gopro-gps-extract`** (plan), not `/gopro`.
- Don’t invent facts or volumes. Cite gps.gov, ESA/EUSPA, Wikipedia, Garmin FIT SDK, Google KML docs where a factual claim is sketched.
- **Thin / duplicate caution:** each page needs a unique angle. Format pages own definitions; comparisons own decisions; hub is **navigation only** (do not rank-target `gps file formats` — **10–100 Planner-verified**).
- **Volume ≠ difficulty:** `what is gps` / `how does gps work` are **10K–100K** but Wikipedia + gps.gov dominate — keep as Wave B with a niche + tool CTA angle.


### URL map (2026-11-03 — meta tools)
- **View / open a format:** `/gpx-viewer`, `/kml-viewer`, `/kmz-viewer`, `/fit-viewer` (shared viewer after drop; view-only).
- **Edit (trim/split/…):** `/gpx-editor` (not `/gpx-viewer`).
- **Convert:** `/convert/<pair>` e.g. `/convert/kml-to-gpx`, `/convert/gpx-to-kml`, `/convert/fit-to-gpx`, `/convert/kmz-to-gpx`, `/convert/gpx-to-kmz`, `/convert/kmz-to-kml`. Do **not** link the legacy bare paths `/kml-to-gpx`, `/gpx-to-kml`, `/fit-to-gpx` (they 301).
- **GoPro:** `/gopro-gps-extract` (map = shared viewer; video = GoPro-only).

### Tool URL cheat sheet (from plan)

> Landings (`/gpx-viewer`, `/gpx-editor`, `/convert/...`) are SEO pages that parse then hand a track to generic modules (`assets/js/viewer|editor|converter/`).
| Status | URL |
|---|---|
| Planned launch | `/gopro-gps-extract`, `/gpx-viewer`, `/kml-viewer`, `/kmz-viewer`, `/fit-viewer`, `/gpx-editor`, `/convert` (+ `/convert/<pair>`), `/measure-distance`, `/coordinate-converter`, `/antipodes`, `/my-coordinates` |
| Not in plan yet (future) | Satellite globe, DJI SRT→GPX, CSV→GPX, NMEA→GPX, geotag photos — link as “coming” or skip until live |

### Hub + cross-link pattern
- `/guides/` hub lists every guide + the format table.
- Each guide links **2–3 tools** and **1–2 sibling guides**.
- Format pages ↔ matching `/convert/<pair>` + format landings; comparisons ↔ both formats + converters; educational ↔ `/my-coordinates` / `/coordinate-converter` / format landings / `/gpx-editor` when edit is relevant.

---

## Priority order (write in this sequence) — re-ranked 2026-11-02 after Planner

**Wave A — practical / format (new-domain friendly)**  
1. `/guides/gpx-file` *(format)* — primary `gpx file format` **10K–100K**  
2. `/guides/kmz-file` *(format)* — primary `kmz file` **10K–100K**  
3. `/guides/kml-file` *(format)* — primary `what is a kml file` / `how to open kml file` **1K–10K**  
4. `/guides/kml-vs-kmz` — primary `kml vs kmz` **1K–10K**  
5. `/guides/coordinate-formats` — primary `coordinate formats` **1K–10K**  
6. `/guides/nmea-0183` *(new)* — primary `nmea 0183` **1K–10K**  
7. `/guides/gpx-vs-kml` — primary `gpx vs kml` **100–1K** (dropped; still useful internal link)  
8. `/guides/fit-file` *(format)* — primary `what is a fit file` **100–1K** (keeps feeding `/convert/fit-to-gpx` **1K–10K** from tool TSV)  
9. `/guides/gps-file-formats` — **hub / nav only**; do not target `gps file formats` (**10–100**)

**Wave B — educational (high volume, hard SERPs; short + tool CTAs)**  
10. `/guides/how-gps-works` — `how does gps work` / `what is gps` **10K–100K**  
11. `/guides/gnss-vs-gps` — `gnss vs gps` / `what is gnss` **1K–10K**  
12. `/guides/gps-history` — `history of gps` / `who invented gps` **1K–10K**  
13. `/guides/gps-accuracy` — `how accurate is gps` **100–1K**

---

## A) General guides

### 1. `/guides/gps-file-formats` — formats hub (NAV ONLY)

| | |
|---|---|
| **Suggested title** | GPS File Formats — GPX, KML, KMZ, FIT & More |
| **Primary** | **Do not rank-target** `gps file formats` (**10–100 Planner-verified**). Hub is for navigation + internal links. |
| **Secondary (on-page, not as head targets)** | Point users to format pages that own real volume: `gpx file format` **10K–100K**, `kmz file` **10K–100K**, `kml vs kmz` **1K–10K**, convert tools (`kml to gpx` / `kmz to gpx` **10K–100K**, `gpx to kml` / `fit to gpx` **1K–10K** — tool TSVs 2026-11-01). |
| **Intent** | Browse / choose → deep page or tool. |
| **Angle (unique)** | One **comparison table** + links. No deep dives. |
| **H2 outline** | 1. Pick a format 2. Quick table (GPX / KML / KMZ / FIT / TCX / NMEA / CSV / video GPS) 3. Hiking & watches 4. Google Earth / Maps 5. Sports watch files 6. Logger & video exports (no FlySight name) 7. Convert without uploading 8. All format guides |
| **Internal links** | Tools: `/gpx-viewer`, `/convert/kml-to-gpx`, `/convert/gpx-to-kml`, `/convert/fit-to-gpx`, `/gopro-gps-extract`. Guides: all format pages + comparisons. |

### 2. `/guides/gpx-vs-kml`

| | |
|---|---|
| **Suggested title** | GPX vs KML — Which Should You Use? |
| **Primary** | `gpx vs kml` **100–1K Planner-verified** |
| **Secondary** | `kml to gpx` **10K–100K Planner-verified** (tool TSV) · `gpx to kml` **1K–10K Planner-verified** (tool TSV) · `how to convert kml to gpx` / `how to convert gpx to kml` **10–100 Planner-verified** each |
| **Intent** | Decision + convert. |
| **Angle** | Use-cases only; link format pages for definitions. Volume is modest — write after format pages; still good internal glue. |
| **H2 outline** | 1. GPX vs KML in one minute 2. When GPX wins 3. When KML wins 4. Short contents bullets 5. KML → GPX 6. GPX → KML 7. KMZ note 8. Free converters |
| **Internal links** | Tools: `/convert/kml-to-gpx`, `/convert/gpx-to-kml`, `/gpx-viewer`. Guides: `/guides/gpx-file`, `/guides/kml-file`, `/guides/kml-vs-kmz`. |

### 3. `/guides/kml-vs-kmz`

| | |
|---|---|
| **Suggested title** | KML vs KMZ — What’s the Difference? |
| **Primary** | `kml vs kmz` **1K–10K Planner-verified** |
| **Secondary** | `how to open kmz file` **1K–10K Planner-verified** · `how to open kml file` **1K–10K Planner-verified** · `what is kmz` **100–1K Planner-verified** · `kmz to gpx` / `kml to gpx` **10K–100K Planner-verified** (tool TSV) |
| **Intent** | Understand zip vs plain; open or convert. |
| **Angle** | Packaging only; definitions on kml-file / kmz-file. |
| **H2 outline** | 1. KML vs KMZ in one sentence 2. What’s inside a KMZ 3. When Earth gives you KMZ 4. Opening either 5. Into GPX for apps/watches 6. Back to KML 7. Related guides |
| **Internal links** | Tools: `/convert/kml-to-gpx`, `/convert/gpx-to-kml`. Guides: `/guides/kml-file`, `/guides/kmz-file`, `/guides/gpx-vs-kml`. |

### 4. `/guides/coordinate-formats`

| | |
|---|---|
| **Suggested title** | Coordinate Formats Explained — Decimal, DMS, UTM & MGRS |
| **Primary** | `coordinate formats` **1K–10K Planner-verified** |
| **Secondary** | `latitude longitude format` **1K–10K Planner-verified** · `coordinate converter` / `lat long converter` **10K–100K Planner-verified** (tool TSV) · `dms to decimal` / `decimal to dms` / `utm converter` / `utm to lat long` / `mgrs converter` **1K–10K Planner-verified** (tool TSV) · `gps coordinates` **10K–100K Planner-verified** (tool TSV) |
| **Intent** | Learn formats → convert / find on map. |
| **Angle** | Notation examples of the same point; not “what is GPS”. |
| **H2 outline** | 1. Lat/long in plain language 2. Decimal vs DMS 3. DDM 4. UTM 5. MGRS 6. What your app wants 7. Convert (no upload) 8. Find your coordinates |
| **Internal links** | Tools: `/coordinate-converter`, `/my-coordinates`, `/measure-distance`. Guides: `/guides/how-gps-works`. Future: satellite globe. |

### 5. `/guides/nmea-0183` *(added after Planner)*

| | |
|---|---|
| **Suggested title** | NMEA 0183 Explained — GPS Sentences to a Track |
| **Primary** | `nmea 0183` **1K–10K Planner-verified** |
| **Secondary** | `what is nmea` **100–1K Planner-verified** · `nmea sentences` **100–1K Planner-verified** · `nmea to gpx` **10–100 Planner-verified** |
| **Intent** | Understand GPS text sentences; path to a viewable track. |
| **Angle** | Stay on **0183 GPS text** (NMEA 2000 is a different marine bus — mention only to disambiguate). Honest tool gap until NMEA→GPX ships. |
| **H2 outline** | 1. What NMEA 0183 is 2. Common sentences (GGA, RMC, etc.) at a high level 3. NMEA 0183 vs NMEA 2000 (one clarifying paragraph) 4. Log files vs live serial 5. Getting to GPX (tool coming / interim tips) 6. View a GPX on a map 7. Related formats |
| **Internal links** | Tools: `/gpx-viewer` (interim); future `/nmea-to-gpx` when built. Guides: `/guides/gpx-file`, `/guides/gps-file-formats`. |

### 6. `/guides/how-gps-works`

| | |
|---|---|
| **Suggested title** | How GPS Works (Simple) — And How to See Your Position |
| **Primary** | `how does gps work` **10K–100K Planner-verified** |
| **Secondary** | `what is gps` **10K–100K Planner-verified** · `gps meaning` **10K–100K Planner-verified** · `global positioning system` **1M–10M Planner-verified** (brand/nav giant — don’t chase as title target) |
| **Intent** | Informational. **Wikipedia / gps.gov own the SERP** — niche angle + tool CTAs only. |
| **Angle** | Short practical: satellites → phone → lat/long; then see position / open a track. |
| **H2 outline** | 1. GPS in one paragraph ([gps.gov](https://www.gps.gov/)) 2. Satellites, clocks, trilateration (simple) 3. Clear sky matters 4. GPS vs GNSS teaser 5. See your coordinates 6. Open a GPX track 7. Measure a path |
| **Internal links** | Tools: `/my-coordinates`, `/gpx-viewer`, `/measure-distance`. Guides: `/guides/gnss-vs-gps`, `/guides/gps-accuracy`, `/guides/gpx-file`. |

### 7. `/guides/gnss-vs-gps`

| | |
|---|---|
| **Suggested title** | GNSS vs GPS — What Your Phone Actually Uses |
| **Primary** | `gnss vs gps` **1K–10K Planner-verified** |
| **Secondary** | `what is gnss` **1K–10K Planner-verified** · `gps glonass galileo beidou` **100–1K Planner-verified** · `what is glonass` / `what is beidou` / `what is navic` **100–1K Planner-verified** · `what is galileo satellite` / `what is qzss` **10–100 Planner-verified** |
| **Intent** | Clarify multi-constellation; light educational. |
| **Angle** | GPS ⊂ GNSS; multi-GNSS in phones. No deep constellation essays. |
| **H2 outline** | 1. GPS is a GNSS 2. Big four ([gps.gov](https://www.gps.gov/systems/gnss/), [EUSPA](https://www.euspa.europa.eu/)) 3. Regional systems briefly 4. Why multi-GNSS helps 5. Check your position 6. Coordinate formats apps disagree on |
| **Internal links** | Tools: `/my-coordinates`, `/coordinate-converter`. Guides: `/guides/how-gps-works`, `/guides/gps-accuracy`. |

### 8. `/guides/gps-history`

| | |
|---|---|
| **Suggested title** | A Short History of GPS — From Military Project to Your Phone |
| **Primary** | `history of gps` **1K–10K Planner-verified** |
| **Secondary** | `who invented gps` **1K–10K Planner-verified** · `what is gps` **10K–100K Planner-verified** |
| **Intent** | Curiosity / timeline. Still Wave B (not a tools-intent query). |
| **Angle** | Timeline only; end with today’s tools. Don’t duplicate how-gps-works physics. |
| **H2 outline** | 1. Before GPS 2. Early satnav 3. NAVSTAR milestones (cite gps.gov history) 4. Civilian phones 5. GNSS becomes plural 6. Record and view a track today |
| **Internal links** | Tools: `/my-coordinates`, `/gpx-viewer`. Guides: `/guides/how-gps-works`, `/guides/gnss-vs-gps`. |

### 9. `/guides/gps-accuracy`

| | |
|---|---|
| **Suggested title** | GPS Accuracy and Common Errors (And What You Can Do) |
| **Primary** | `how accurate is gps` **100–1K Planner-verified** |
| **Secondary** | Themes from how-gps-works; `elevation finder` **1K–10K Planner-verified** (tool TSV, adjacent only) |
| **Intent** | Troubleshoot bad fixes. |
| **Angle** | Error sources + user fixes; no invented metre claims — cite gps.gov accuracy pages. |
| **H2 outline** | 1. What “accuracy” means on a phone 2. Sky view, multipath, indoors 3. Cold vs warm start 4. Multi-GNSS / dual-frequency (high level) 5. Elevation quirks 6. Check a point 7. Inspect a track for jumps |
| **Internal links** | Tools: `/my-coordinates`, `/gpx-viewer`, `/measure-distance`. Guides: `/guides/how-gps-works`, `/guides/gnss-vs-gps`. |

---

## B) Dedicated format guides

### Overlap firewall
| Page | Owns | Leaves to others |
|---|---|---|
| `/guides/gpx-file` | GPX meaning, structure, open/edit; head term `gpx file format` | GPX vs KML → `/guides/gpx-vs-kml` |
| `/guides/kml-file` | KML meaning, Earth/Maps, open | KMZ → `/guides/kmz-file` + `/guides/kml-vs-kmz` |
| `/guides/kmz-file` | KMZ meaning (`kmz file`), zip, open/convert | Full KML → `/guides/kml-file` |
| `/guides/fit-file` | FIT meaning → convert | Hub table → `/guides/gps-file-formats` |

### B1. `/guides/gpx-file` — **priority #1**

| | |
|---|---|
| **Suggested title** | GPX File Format — What It Is and How to Open One |
| **Primary** | `gpx file format` **10K–100K Planner-verified** |
| **Secondary** | `what is a gpx file` **1K–10K Planner-verified** · `how to open gpx file` **1K–10K Planner-verified** · `what is gpx` **100–1K Planner-verified** · `how to open gpx file online` **10–100 Planner-verified** · `gpx viewer` **10K–100K** / `gpx viewer online` / `gpx editor online` **1K–10K** / `gpx to csv` **100–1K** (tool TSV) |
| **Intent** | Understand format + open/edit online. |
| **Angle** | Own the **format** query; practical open/edit CTA. Garmin/Strava as compatibility only. |
| **H2 outline** | 1. What the GPX file format is 2. Waypoints, tracks, routes 3. Where GPX files come from 4. How to open a GPX file 5. Edit online (trim/split/simplify/reverse) 6. Export / convert 7. GPX vs KML (short + link) 8. File stays on your device |
| **Internal links** | Tools: `/gpx-viewer`, `/convert/gpx-to-kml`, `/convert/kml-to-gpx`. Guides: `/guides/gpx-vs-kml`, `/guides/gps-file-formats`, `/guides/fit-file`. |

### B2. `/guides/kml-file`

| | |
|---|---|
| **Suggested title** | What Is a KML File? Open It or Convert to GPX |
| **Primary** | `what is a kml file` **1K–10K Planner-verified** |
| **Secondary** | `how to open kml file` **1K–10K Planner-verified** · `what is kml` **100–1K Planner-verified** · `kml to gpx` **10K–100K** / `gpx to kml` **1K–10K** (tool TSV) |
| **Intent** | Define KML; open or convert. |
| **Angle** | Earth/Maps markup; not the KMZ zip lesson. |
| **H2 outline** | 1. What KML is 2. What’s usually inside 3. Earth / Maps 4. How to open a KML 5. Why watches want GPX 6. KML → GPX 7. GPX → KML 8. KML vs KMZ teaser |
| **Internal links** | Tools: `/convert/kml-to-gpx`, `/convert/gpx-to-kml`, `/gpx-viewer`. Guides: `/guides/kmz-file`, `/guides/kml-vs-kmz`, `/guides/gpx-vs-kml`. |

### B3. `/guides/kmz-file` — **priority #2**

| | |
|---|---|
| **Suggested title** | KMZ File — What It Is, How to Open It, Convert to GPX |
| **Primary** | `kmz file` **10K–100K Planner-verified** |
| **Secondary** | `how to open kmz file` **1K–10K Planner-verified** · `what is kmz` **100–1K Planner-verified** · `kml vs kmz` **1K–10K Planner-verified** · `kmz to gpx` **10K–100K Planner-verified** (tool TSV) |
| **Intent** | Define/open KMZ; convert for GPS apps. |
| **Angle** | KMZ as everyday “file people download from Earth”; zip packaging. |
| **H2 outline** | 1. What a KMZ file is 2. KMZ vs KML (packaging) 3. Inside the zip 4. How to open a KMZ 5. Extracting KML if needed 6. Convert to GPX 7. Related guides |
| **Internal links** | Tools: `/convert/kml-to-gpx`, `/convert/gpx-to-kml`. Guides: `/guides/kml-file`, `/guides/kml-vs-kmz`, `/guides/gps-file-formats`. |

### B4. `/guides/fit-file`

| | |
|---|---|
| **Suggested title** | What Is a FIT File? Convert FIT to GPX Free |
| **Primary** | `what is a fit file` **100–1K Planner-verified** |
| **Secondary** | `fit file format` **100–1K Planner-verified** · `fit to gpx` **1K–10K Planner-verified** (tool TSV — real money term) · `tcx to gpx` / `garmin export gpx` **100–1K Planner-verified** (tool TSV) · `how to convert fit to gpx` **10–100 Planner-verified** · `what is tcx file` **10–100 Planner-verified** |
| **Intent** | Define FIT; convert to view on a map. |
| **Angle** | Lower definition volume; page still worth it to feed `/convert/fit-to-gpx`. Cite Garmin FIT SDK. |
| **H2 outline** | 1. What a FIT file is 2. FIT vs GPX vs TCX 3. Where FIT comes from 4. Why convert to GPX 5. Convert in the browser 6. View / trim after 7. Related guides |
| **Internal links** | Tools: `/convert/fit-to-gpx`, `/gpx-viewer`. Guides: `/guides/gpx-file`, `/guides/gps-file-formats`. |

---

## C) Later / backlog

| Slug | Planner note | Why wait |
|---|---|---|
| `/guides/gpmf` | `gopro gpmf` / `gopro metadata format` **10–100**; `what is gpmf` no data; `extract gps from gopro video` **10–100** | Support `/gopro-gps-extract` only — not a traffic play. Never “Telemetry Extractor”. |
| `/guides/dji-srt` | `dji srt file` **100–1K**; `what is dji srt file` **10–100**; caption SRT no data | Write when DJI converter is close. |
| `/guides/gnss-csv` | `gps logger csv` / `gnss logger csv` / `ublox gps csv` **no data**; `csv to gpx` **100–1K** | Never name FlySight; wait for CSV tool. |
| `/guides/geotagging` *(future)* | `what is geotagging` **1K–10K Planner-verified** | Tie to geotag-photos tool when built. |
| `/guides/gpx-vs-geojson` | `gpx vs geojson` **10–100** | Skip for now. |

---

## D) `/guides/` hub checklist

- Index Wave A format pages first; comparisons; coordinate + NMEA; hub table; Wave B below the fold.
- Formats table links each format page + tool (hub itself is not a keyword play).
- Every tool page links back to 1 relevant guide.
- Request indexing on each new guide after deploy.

---

## E) Snapshot — ordered list after 2026-11-02 Planner

| # | Slug | Primary | Range |
|---|---|---|---|
| 1 | `/guides/gpx-file` | `gpx file format` | **10K–100K** |
| 2 | `/guides/kmz-file` | `kmz file` | **10K–100K** |
| 3 | `/guides/kml-file` | `what is a kml file` | **1K–10K** |
| 4 | `/guides/kml-vs-kmz` | `kml vs kmz` | **1K–10K** |
| 5 | `/guides/coordinate-formats` | `coordinate formats` | **1K–10K** |
| 6 | `/guides/nmea-0183` | `nmea 0183` | **1K–10K** |
| 7 | `/guides/gpx-vs-kml` | `gpx vs kml` | **100–1K** |
| 8 | `/guides/fit-file` | `what is a fit file` | **100–1K** |
| 9 | `/guides/gps-file-formats` | hub/nav — not `gps file formats` | (**10–100** — do not target) |
| 10 | `/guides/how-gps-works` | `how does gps work` | **10K–100K** (hard SERP) |
| 11 | `/guides/gnss-vs-gps` | `gnss vs gps` | **1K–10K** (hard SERP) |
| 12 | `/guides/gps-history` | `history of gps` | **1K–10K** |
| 13 | `/guides/gps-accuracy` | `how accurate is gps` | **100–1K** |

---

*SEO bot · updated 2026-11-02 Europe/Tallinn (EET) after guides KP export · same Page edited in place*
