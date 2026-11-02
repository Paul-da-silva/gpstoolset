<!-- Source of truth: this file in /var/www/gpstoolset/docs/ (repo). Older /workspace copies may lag. -->

# GPS Toolset · guides + tool page keywords (2026-11-01)

**Site:** gpstoolset.com (PHP, browser-side file parsing, OSM street tiles).  
**Plan:** `/workspace/gpstoolset/manager/plan.md` · [Plan Page](https://cursor.com/canvas/store-b5fa6ea4-c23f-4f9d-abc1-5e8c72bd3e8d/45607b8c-6d7a-4498-8085-a1f38e2c51ad).  
**Rules:** No 301 from FlySync (FlySync keeps viewers; both may compete). Never name FlySight. No brand names in URLs except `/gopro-gps-extract`. Never “Telemetry Extractor”. GoPro/DJI only as compatibility copy.  
**Labels:** Planner ranges = **CHECKED** (buckets from existing TSVs). Autocomplete / SERP judgment = **FIRST-PASS** / **GUESS**. No invented volumes.

Planner sources: `gpsextract-kp-historical-2026-11-01.tsv`, `gpstoolset-kp-historical-2026-11-01.tsv`.  
Guide AC snapshot: `gpstoolset-guides-autocomplete-2026-11-01.json`.  
Planner paste list: `gpstoolset-guides-kw-list.txt`.

---

## 1) Tool pages — primary / secondaries / titles (CHECKED Planner)

Titles ≤60 chars; no brand names in URL or title brand-stuffing beyond necessary GoPro compatibility on `/gopro-gps-extract`.

| Page | Primary (Planner) | Secondaries | Suggested title (≤60) |
|---|---|---|---|
| `/gopro-gps-extract` | `gopro gps extractor` **10–100** | `gopro gps data` **100–1K** · `extract gps from gopro video` **10–100** · `gopro gpx` **10–100** · (`video gps extractor` GSC only, not in Planner) | GoPro GPS Extractor — Free, No Upload |
| `/gpx-viewer` | `gpx viewer` **10K–100K** | `gpx viewer online` **1K–10K** · `gpx editor online` **1K–10K** · `gpx to csv` **100–1K** · (on-page: split/trim/simplify/reverse mostly **10–100**/blank) | Free Online GPX Viewer & Editor |
| `/my-coordinates` | `my coordinates` **10K–100K** | `gps coordinates` **10K–100K** · `lat long finder` **10K–100K** · `find coordinates on map` **1K–10K** | My Coordinates — Find Lat & Long on a Map |
| `/measure-distance` | `measure distance on map` **10K–100K** | `distance calculator map` **10K–100K** · `route distance calculator` **1K–10K** | Measure Distance on a Map — Free Tool |
| `/coordinate-converter` | `coordinate converter` **10K–100K** | `lat long converter` **10K–100K** · `dms to decimal` / `decimal to dms` **1K–10K** · `utm converter` / `utm to lat long` **1K–10K** · `mgrs converter` **1K–10K** | Coordinate Converter — DMS, UTM & MGRS |
| `/kml-to-gpx` | `kml to gpx` **10K–100K** | `kmz to gpx` **10K–100K** | KML / KMZ to GPX Converter — Free |
| `/gpx-to-kml` | `gpx to kml` **1K–10K** | (pair with kml↔gpx hub copy) | GPX to KML Converter — Free Online |
| `/fit-to-gpx` | `fit to gpx` **1K–10K** | `tcx to gpx` **100–1K** · `garmin export gpx` **100–1K** (how-to lean) | FIT to GPX Converter — Free, No Upload |

**Avoid on `/gopro-gps-extract`:** targeting `telemetry extractor` / `gopro telemetry extractor` as product phrasing (Planner has them; brand/product risk). Compatibility: say “reads GoPro video GPS (GPMF)” in body.

**Note:** `/gopro-gps-extract` primary is small in Planner but FlySync GSC still shows real clicks for that cluster — keep as anchor tool; don’t expect head-term volume.

---

## 2) Guides — keyword plan (FIRST-PASS AC + SERP)

Definitional “what is …” queries are usually owned by **Wikipedia / gov / ESA / vendor docs**. A new tools site rarely wins those pure definitions. Prefer **how-to / open / convert / compare** angles that naturally link to tools.

### `/guides/what-is-gps`
| | |
|---|---|
| **Primary (FIRST-PASS)** | `what is gps` / `how does gps work` |
| **Secondary** | `gps meaning` · `global positioning system` |
| **AC** | Strong (full suggest lists) — FIRST-PASS |
| **Who ranks (GUESS/SERP)** | Wikipedia, GPS.gov, textbooks, big explainers — **hard to outrank** for pure “what is GPS” |
| **Angle** | Short accurate overview → “see your position” CTA → `/my-coordinates`; “view a track” → `/gpx-viewer` |
| **Links to** | `/my-coordinates`, `/gpx-viewer` |

### `/guides/gnss-systems`
| | |
|---|---|
| **Primary (FIRST-PASS)** | `gnss vs gps` · `what is gnss` |
| **Secondary** | `what is glonass` · `what is galileo` / Galileo satellite · `what is beidou` · `what is qzss` · `what is navic` · `gps glonass galileo beidou` |
| **AC** | Strong for GNSS/GLONASS/BeiDou/QZSS; NavIC mixed with horse “navicular” noise — FIRST-PASS |
| **Who ranks** | [EUSPA What is GNSS](https://www.euspa.europa.eu/eu-space-programme/galileo/what-gnss), [GPS.gov other GNSS](https://www.gps.gov/other-global-navigation-satellite-systems-gnss), [Wikipedia Satellite navigation](https://en.wikipedia.org/wiki/Satellite_navigation) — **gov/wiki dominate** |
| **Angle** | Practical “what your phone/watch uses” + multi-GNSS accuracy; not constellation deep-dives. Link converters / my-coordinates |
| **Links to** | `/my-coordinates`, `/coordinate-converter` |

### `/guides/gps-file-formats` (hub)
| | |
|---|---|
| **Primary (FIRST-PASS)** | `gps file formats` · `gpx vs kml` |
| **Secondary** | format names as section anchors: GPX, KML/KMZ, FIT, TCX, NMEA, CSV, GPMF, DJI SRT, GNSS logger CSV |
| **AC** | Weak for exact `gps file formats` (few suggests); strong for pairwise compares — FIRST-PASS |
| **Who ranks** | Mix of Wikipedia format pages + converter/blog roundups — **reachable** with a clear comparison table + tool links |
| **Angle** | One table: format → typical source → open with / convert with |
| **Links to** | All converters + `/gopro-gps-extract` + `/gpx-viewer` |

### `/guides/gpx`
| | |
|---|---|
| **Primary (FIRST-PASS)** | `what is a gpx file` · **prefer** `how to open gpx file` / `how to open gpx file online` |
| **Secondary** | `gpx file format` · `gpx vs kml` |
| **AC** | Strong — FIRST-PASS |
| **Who ranks** | [Wikipedia GPX](https://en.wikipedia.org/wiki/GPS_Exchange_Format) owns “what is”; **tools/how-to** SERPs more open (gpx.studio, GPS Visualizer, Garmin help) — FIRST-PASS/GUESS |
| **Angle** | “What a GPX holds” briefly + **open online / edit / convert** — win the how-to cluster |
| **Links to** | `/gpx-viewer`, `/gpx-to-kml`, `/kml-to-gpx` |

### `/guides/kml-kmz`
| | |
|---|---|
| **Primary (FIRST-PASS)** | `what is a kml file` · `kml vs kmz` |
| **Secondary** | `what is kmz` · `how to open kml file` |
| **AC** | Strong — FIRST-PASS |
| **Who ranks** | Google Earth / Google docs + Wikipedia — hard on pure definition; **convert KML→GPX** is the money link |
| **Angle** | KML vs KMZ in one screen + convert to GPX for watches/apps |
| **Links to** | `/kml-to-gpx`, `/gpx-to-kml` |

### `/guides/fit`
| | |
|---|---|
| **Primary (FIRST-PASS)** | `what is a fit file` |
| **Secondary** | `fit file format` · `tcx file` · `gpx vs fit` (AC) · Planner `fit to gpx` **1K–10K**, `tcx to gpx` **100–1K** |
| **AC** | Strong — FIRST-PASS |
| **Who ranks** | [Garmin FIT SDK](https://developer.garmin.com/fit/overview/), blogs — definitional tough; **convert FIT→GPX** is the actionable win |
| **Angle** | FIT = watch activity binary → export/convert to GPX to view on a map |
| **Links to** | `/fit-to-gpx` (mention TCX as sibling) |

### `/guides/nmea`
| | |
|---|---|
| **Primary (FIRST-PASS)** | `what is nmea` · `nmea 0183` |
| **Secondary** | `nmea sentences` · `nmea to gpx` (AC only; no Planner row yet) |
| **AC** | Strong; NMEA 2000 often mixes in (marine bus) — stay on **0183 GPS text** — FIRST-PASS |
| **Who ranks** | Specs, marine blogs, GPSD docs — definitional competitive |
| **Angle** | “GPS talk sentences → track file”; note **tool gap** (no NMEA→GPX page yet) → link `/gpx-viewer` for after conversion; flag future tool |
| **Links to** | `/gpx-viewer` (interim); future `/nmea-to-gpx` if built |

### `/guides/gpmf`
| | |
|---|---|
| **Primary (FIRST-PASS)** | `gopro gpmf` (AC thin) · support with Planner/GSC extract cluster |
| **Secondary** | `extract gps from gopro video` **10–100** · `gopro gps data` **100–1K** · avoid “telemetry extractor” product phrasing |
| **AC** | `what is gpmf` empty; `gopro gpmf` few suggests — FIRST-PASS **weak head term** |
| **Who ranks** | [gopro.github.io/gpmf-parser](https://gopro.github.io/gpmf-parser/), GitHub — niche/dev |
| **Angle** | Plain-language “GPS inside GoPro video” → use `/gopro-gps-extract` tool (no upload). Don’t chase GPMF as a volume keyword |
| **Links to** | `/gopro-gps-extract` |

### `/guides/dji-srt`
| | |
|---|---|
| **Primary (CHECKED + FIRST-PASS)** | `dji srt file` **100–1K** |
| **Secondary** | `what is dji srt file` (AC) · `dji srt to gpx` **blank in Planner** |
| **AC** | Strong for `dji srt file` — FIRST-PASS |
| **Who ranks** | DJI help + SRT→GPX tool sites (Toola, FlightPlot, etc.) |
| **Angle** | Explain video captions / SRT beside MP4 → convert when DJI tool ships; until then honest “coming soon” + related `/gpx-viewer` |
| **Links to** | later DJI tool; `/gpx-viewer` |

### `/guides/gnss-csv`
| | |
|---|---|
| **Primary (FIRST-PASS)** | `gps logger csv` / `gnss logger csv` / `csv to gpx` (**100–1K** CHECKED for csv to gpx) |
| **Secondary** | `ublox csv` (AC empty) · generic “GPS CSV format” |
| **AC** | Very weak for logger-specific strings — FIRST-PASS |
| **Who ranks** | Sparse; converter pages for CSV→GPX |
| **Angle** | Describe **GNSS logger CSV exports** (columns: time, lat, lon, alt…) **without naming FlySight or other FlySync-only brands**. Link CSV→GPX when available; else `/gpx-viewer` after user converts |
| **Links to** | `/gpx-viewer`; future CSV tool; `csv to gpx` intent |

---

## 3) Top guide opportunities (honest)

1. **`how to open gpx file` / online** — tools can rank; feed `/gpx-viewer`.  
2. **`gpx vs kml` / format hub** — comparison content + converters.  
3. **`kml vs kmz` + convert** — feed `/kml-to-gpx`.  
4. **`what is a fit file` → convert** — feed `/fit-to-gpx` (Planner convert term is the volume).  
5. **`dji srt file`** — real Planner band; guide now, tool later.  
6. **`gopro-gps-extract` GPMF guide** — weak AC for “GPMF”; write as support content for `/gopro-gps-extract`, not a traffic play.  
7. **Pure `what is gps` / GNSS constellation pages** — **don’t expect to outrank** wiki/gov; keep short, link tools.

---

## 4) Keyword Planner list (guides)

Paste file: `/workspace/core/seo/tmp/gpstoolset-guides-kw-list.txt` (≤60 lines). Fill ranges when Paul runs Planner; then update this md + Page.

---

*SEO bot · 2026-11-01 Europe/Tallinn · FIRST-PASS except cited Planner CHECKED rows*
