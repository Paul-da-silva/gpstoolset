<!-- Source of truth: this file in /var/www/gpstoolset/docs/ (repo). Older /workspace copies may lag. -->

# GPS Toolset · Site plan (planning only)
**Site:** gpstoolset.com · **Repo:** `/var/www/gpstoolset` · **Docroot:** `public/`  
**This doc:** features, content, SEO, design gist, rollout.
**Structure:** see `docs/architecture.md` (structure on disk + how to add a tool).

---

## 1. Site basics
- **Stack:** **PHP** · shared layout/templates (header, footer, nav, per-page head/meta) · tools **parse client-side** (no uploads) · Leaflet + **OSM** street tiles (free).
- **Folder:** `public/` = vhost docroot · includes/templates/config **outside** `public/` · agent notes: box `/workspace/gpstoolset/` only.
- **Cursor — tiles:** ONE shared config/module (see § OSM tile rules). No hardcoded tile URLs in pages.
- **Cursor — ads:** ONE shared partial/config. **Off now**; on later with monetization. **Viewer/map pages:** ads must **never** eat the map (home/guides/converters only, or none on viewers — open for Monetization). Elsewhere: never on drop zone; max 2/page when on.
- **Hard site rules (Paul):** no email / `mailto:` · no contact page · Privacy/About **footer only** · **no heavy coloured one-sided borders** (thin borders OK) · OSM attribution **on the map only** (no © OSM in footer; no “Report a map issue” anywhere) · **never git commit/push/amend** (Paul alone commits; leave changes uncommitted).
- **URL / brand rules:** no brand names in URLs **except `/gopro-gps-extract`**. GoPro/DJI = **compatibility wording in copy only**. Never “Telemetry Extractor”. **Never name FlySight** → say **GNSS logger CSV exports**.
- **FlySync:** keeps its viewers; **no 301s**. Links to gpstoolset from its GPX and FIT viewers (guide + viewer, done 2026-11-04). Some keyword overlap is fine.
- **`/gopro-gps-extract` copy:** must be **clearly different** from FlySync’s page (angle + wording) — not a copy. Rich pre-upload content below the drop zone; hides after load. SEO note.

### OSM tile rules (for Cursor)
Source: [OSMF Tile Usage Policy](https://operations.osmfoundation.org/policies/tiles/)
- Exact URL: `https://tile.openstreetmap.org/{z}/{x}/{y}.png`
- Visible attribution **on the map only** (Leaflet control via central tile module): **© OpenStreetMap contributors**
- Don’t block Referer (no restrictive `Referrer-Policy` stripping tiles)
- No `Cache-Control: no-cache` / `Pragma: no-cache` by default
- No prefetch / offline / bulk download
- **No** “Report a map issue” link (Paul). **No** © OSM credit in the site footer
- Policy forbids heavy use — watch traffic

---

## 2. Design (gist)
Tokens/brand still from Design & UX: [Design Page](https://cursor.com/canvas/store-b5fa6ea4-c23f-4f9d-abc1-5e8c72bd3e8d/5dd8a5d1-9dc2-494c-bc31-c702d4042038) · md `/workspace/core/design-ux/gpstoolset/design-direction.md`  
**Paul override (layout):** their “map + 360px side panel / mobile bottom sheet” is **out** for viewers.
- Brand teal **`#115e59`** · orange accent **`#c2410c`** · Clear · Private · Practical
- Home = **big drop zone** auto-detects format (extension + magic bytes) → IndexedDB handoff → the matching **format landing** (`/gpx-viewer`, `/kml-viewer`, `/kmz-viewer`, `/fit-viewer`) which share one viewer app after drop → tool cards + guides
- **Viewer/tool pages (maps):** **full-screen map** minus one **slim top bar** (logo + menu only) — Google Maps / adsbexchange-globe style. Track must dominate.
- Graphs / stats / export: open via **buttons**; panels **dock under the map**, **resizable** (drag handle); open/closed + sizes saved in **localStorage**. **No permanent side panel.** Edit ops live on **`/gpx-editor`**, not on the view-only format landings.
- Privacy badge: “Your file never leaves your device” (empty state / pre-upload; **not** in the header after a file is loaded). Privacy/About **nav links only in the footer**.
- **Hard visual rules (Paul):** normal thin borders OK; **no heavy coloured one-sided borders** (accent stripes / thick coloured `border-left`). Drag-over = background tint (and/or normal border). No contact page; no email/mailto anywhere.
- **GoPro after load:** two views — **Map** = the **generic viewer module** (same as format landings: map shell, track layer, chart dock, controls; not tied to GPX) and **Video** (full-screen object-URL video + toggleable mini-map + metrics, synced to `video.currentTime` via GPMF relative timestamps; wait for GPS fix). Landings only parse (GPMF) then hand a track to the viewer; GoPro-only extras: video view. Prefs in `gpstoolset.ui.v1`.
- **Ads on viewers:** never eat the map — prefer home/guides/converters, or none on viewers (**open for Monetization**). Elsewhere max 2; never on drop zone; ads partial off at launch.

---

## 3. Tool pages (meta tools + landings)

Planner ranges = **CHECKED** (SEO TSVs). Full SEO: `/workspace/core/seo/gpstoolset-guides-keywords-2026-11-01.md` · [SEO Page](https://cursor.com/canvas/store-b5fa6ea4-c23f-4f9d-abc1-5e8c72bd3e8d/f3623ab4-032e-46d7-b33e-879c928bc738).  
**Structure decision (2026-11-03):** three shared meta tools + per-format SEO landings. Implemented by **P7** (`docs/cursor-prompts.md`). Guide/converter links use `/convert/<pair>` and format viewers use `/gpx-viewer` etc.

### Menu
- **Viewers:** GPX · KML · KMZ · FIT (SEO landings → **generic viewer module** after parse)
- **More:** GoPro (`/gopro-gps-extract` — SEO landing + video view; map via **generic viewer module**)
- **Tools:** Coordinate converter · Measure distance · Converter (`/convert`)

### A. Format landings + generic viewer / editor / converter modules
One **SEO landing** per format (own H1, intro, how-to, FAQ) above a drop zone. Landings are **not** the viewer: they run the matching parser, then hand the shared **track model** to **one generic viewer module** (`assets/js/viewer/` — map shell, track layer, chart dock, controls; format-agnostic). Home drop auto-detects and routes via IndexedDB handoff. `/gpx-viewer` landing stays **view-only** (edit tools on `/gpx-editor`). GoPro landing uses the same viewer (P7 §1b); only GPMF + video are extra.

**Generic editor & converter (same split as viewer):** ONE `assets/js/editor/` and ONE `assets/js/converter/`, both track-model only. `/gpx-editor` and every `/convert/...` URL are **SEO landings** (content + drop zone → parse → hand to the module). Editor and viewer **share the same map/chart components**.


| URL | Role | Primary KW (Planner) | Title (≤60) |
|-----|------|----------------------|-------------|
| `/gpx-viewer` | GPX SEO landing → **generic viewer** | `gpx viewer` **10K–100K** | Free Online GPX Viewer |
| `/kml-viewer` | KML SEO landing → **generic viewer** | (viewer cluster; see SEO) | Free Online KML Viewer |
| `/kmz-viewer` | KMZ SEO landing → **generic viewer** | (viewer cluster) | Free Online KMZ Viewer |
| `/fit-viewer` | FIT SEO landing → **generic viewer** | (viewer cluster) | Free Online FIT Viewer |

### B. Editor meta tool
| URL | Purpose | Primary KW | Title |
|-----|---------|------------|-------|
| `/gpx-editor` | One or more files (any supported format) · live editable map/chart preview · **merge, split, trim, simplify, reverse, elevation fix** · export to any writable format | `gpx editor online` **1K–10K** | Free Online GPX / Track Editor |

### C. Converter meta tool
| URL | Purpose |
|-----|---------|
| `/convert` | Any supported format → any other; from/to selectable; preselect via GET `?from=kml&to=gpx` |
| `/convert/kml-to-gpx` | SEO pair page (same app, preselected) · `kml to gpx` **10K–100K** |
| `/convert/gpx-to-kml` | · `gpx to kml` **1K–10K** |
| `/convert/fit-to-gpx` | · `fit to gpx` **1K–10K** |
| `/convert/kmz-to-gpx` | · `kmz to gpx` **10K–100K** |
| `/convert/gpx-to-kmz` | GPX → KMZ |
| `/convert/kmz-to-kml` | KMZ → KML |

Each pair page: short unique intro + FAQ, **self-canonical**. Keyword traffic also from guides + footer links for the main pairs.  
**301:** old `/kml-to-gpx`, `/gpx-to-kml`, `/fit-to-gpx` → `/convert/...` equivalents.

### D. Other tools
| URL | Purpose | Primary KW | Title |
|-----|---------|------------|-------|
| `/gopro-gps-extract` | SEO landing → **generic viewer** for map + own Video view · GPMF parser only · rich pre-upload (Menu → More) | `gopro gps extractor` **10–100** | GoPro GPS Extractor — Free, No Upload |
| `/measure-distance` | Full-screen map measure | `measure distance on map` **10K–100K** | Measure Distance on a Map — Free Tool |
| `/coordinate-converter` | Decimal ↔ DMS/DDM · UTM · MGRS | `coordinate converter` **10K–100K** | Coordinate Converter — DMS, UTM & MGRS |
| `/antipodes` | Split map. Pick a point, see the other side | `antipodes calculator` *(unverified — not in the Planner paste)* | Antipodes Calculator — Other Side of Earth |
| `/my-coordinates` | Find lat/long on a map *(still planned)* | `my coordinates` **10K–100K** | My Coordinates — Find Lat & Long on a Map |

**Also:** `/privacy` · `/about`. **No `/contact`**.  
**Architecture rule:** one **format registry** (parser, exporter, detection, landing meta). Adding a format or a converter pair = **config + content only** (no new JS).

**Secondaries (short):**  
- `/gopro-gps-extract`: `gopro gps data` **100–1K** · extract / gopro gpx **10–100** · avoid telemetry-extractor phrasing  
- Viewers: `gpx viewer online` **1K–10K** · `gpx to csv` **100–1K**  
- `/gpx-editor`: `gpx editor online` **1K–10K**  
- `/coordinate-converter`: `lat long converter` **10K–100K** · dms/utm/mgrs **1K–10K**  
- `/measure-distance`: `distance calculator map` **10K–100K**

**GSC first-pass (FlySync, still live):** GoPro page ~449 clk / 5.6K · GPX 63/825 · FIT 8/279.

### Later — after the launch set
- **GPS video overlay (social bait):** overlay speed/alt/map-track on video (or transparent export); free = **gpstoolset.com watermark**; prefer browser-side (WebCodecs/canvas) if feasible; reuses `/gopro-gps-extract` GPMF parsing; premium later: watermark-free
- **DJI telemetry viewer:** SRT and/or DJI's other flight-log format → map track (same privacy rules)
- **3D view option for all viewers** (map tools that show a track)
- **Live GNSS satellite globe:** real-scale 3D globe of GPS / GLONASS / Galileo / BeiDou, colour-coded, using free CelesTrak orbit data (TLEs) computed in the browser
- **Time zone tools:** time zone converter (one zone to another, with DST), world clock / live day-night map of the planet (current time anywhere, click a point to get its zone and local time), time zone from coordinates, and UTC/GPS-time helpers for track timestamps (GPS time vs UTC leap seconds). All browser-side with the built-in Intl API; zone lookup from boundary data loaded on demand
- **Also later:** geotag-photos. **Skip:** what3words.

---

## 4. Guides (`/guides/`)
Full brief: **`docs/guides-brief.md`**. Prefer how-to / compare over pure “what is”. Never name FlySight. Distinct angles; cross-link, don’t repeat definitions.  
**Link targets (2026-11-03):** converters → `/convert/<pair>` (e.g. `/convert/kml-to-gpx`); format open/view → `/gpx-viewer` · `/kml-viewer` · `/kmz-viewer` · `/fit-viewer`; edit ops → `/gpx-editor`.

**Wave A — practical (write first)**  
1. `/guides/gps-file-formats` (hub)  
2. `/guides/gpx-file`  
3. `/guides/gpx-vs-kml`  
4. `/guides/kml-file`  
5. `/guides/kmz-file`  
6. `/guides/kml-vs-kmz`  
7. `/guides/fit-file`  
8. `/guides/coordinate-formats`

**Wave B — educational (short; after tools exist)**  
9. `/guides/how-gps-works`  
10. `/guides/gnss-vs-gps`  
11. `/guides/gps-accuracy`  
12. `/guides/gps-history` *(optional last)*

**Backlog (with matching tools):** `/guides/dji-srt` · `/guides/gpmf` · `/guides/nmea` · `/guides/gnss-csv`

**Keyword status:** only `fit to gpx` and `coordinate converter` (plus other tool convert terms already in §3) are Planner-verified on the guide brief; most guide head terms stay **unverified** until Paul pastes `tmp/gpstoolset-guides-kw-list.txt` into Keyword Planner.

---

## 5. Keywords (source rules)
- Tools: Planner **CHECKED** from SEO guides md + extract/toolset TSVs. Guides mostly **FIRST-PASS** AC until Paul pastes the list.
- Never invent volumes. Brand hygiene as in §1.
- Crowded SERPs → quality no-upload UX + guides↔tools links.

---

## 6. Rollout (for Cursor later)

| Phase | Scope | Done |
|------:|-------|------|
| **A** | PHP shell · tokens/design · tile module · ads off · privacy/about · OSM rules · Paul-only commits | Done |
| **B** | `/gopro-gps-extract` (map+video) + first `/gpx-viewer` draft | Usable drafts |
| **B2 / P7** | Meta tools: generic `viewer/` · `editor/` · `converter/` modules + SEO landings · 301s · format registry | **Done (2026-11-03, uncommitted)** |
| **C** | Guides Wave A (format + compare) linked to landings + `/convert/...` | Drafts exist |
| **D** | `/my-coordinates` + Wave B educational guides | Planned |
| **E** | More convert pairs / NMEA·CSV when formats land in registry | Planned |
| **F** | geotag · DJI · 3D viewers · satellite globe · time zone tools · video overlay · antipodes landed at `/antipodes` | Later |

---

## 7. Open questions
1. **Ads on viewer pages** — none at all, or only off-map (e.g. inside a closed dock / never over the map)? For Monetization later.

---

*GPS Toolset Manager · Europe/Tallinn · updated 2026-11-04: time zone tools on roadmap · FlySync links done*
