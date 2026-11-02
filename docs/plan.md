<!-- Source of truth: this file in /var/www/gpstoolset/docs/ (repo). Older /workspace copies may lag. -->

# GPS Toolset · Site plan (planning only)
**Site:** gpstoolset.com · **Repo:** `/var/www/gpstoolset` · **Docroot:** `public/`  
**This doc:** features, content, SEO, design gist, rollout — **Cursor builds later**.

---

## 1. Site basics
- **Stack:** **PHP** · shared layout/templates (header, footer, nav, per-page head/meta) · tools **parse client-side** (no uploads) · Leaflet + **OSM** street tiles (free).
- **Folder:** `public/` = vhost docroot · includes/templates/config **outside** `public/` · agent notes: box `/workspace/gpstoolset/` only.
- **Cursor — tiles:** ONE shared config/module (see § OSM tile rules). No hardcoded tile URLs in pages.
- **Cursor — ads:** ONE shared partial/config. **Off now**; on later with monetization. **Viewer/map pages:** ads must **never** eat the map (home/guides/converters only, or none on viewers — open for Monetization). Elsewhere: never on drop zone; max 2/page when on.
- **Hard site rules (Paul):** no email / `mailto:` · no contact page · Privacy/About **footer only** · **no heavy coloured one-sided borders** (thin borders OK) · OSM attribution **on the map only** (no © OSM in footer; no “Report a map issue” anywhere).
- **URL / brand rules:** no brand names in URLs **except `/gopro-gps-extract`**. GoPro/DJI = **compatibility wording in copy only**. Never “Telemetry Extractor”. **Never name FlySight** → say **GNSS logger CSV exports**.
- **FlySync:** keeps its viewers; **no 301s**. May link to gpstoolset for non-skydive users later. Some keyword overlap is fine.
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
- Home = **big drop zone** auto-routes by file type → tool cards + guides
- **Viewer/tool pages (maps):** **full-screen map** minus one **slim top bar** (logo + menu only) — Google Maps / adsbexchange-globe style. Track must dominate.
- Graphs / stats / edit / export: open via **buttons**; panels **dock under the map**, **resizable** (drag handle); open/closed + sizes saved in **localStorage**. **No permanent side panel.**
- Privacy badge: “Your file never leaves your device” (empty state / pre-upload; **not** in the header after a file is loaded). Privacy/About **nav links only in the footer**.
- **Hard visual rules (Paul):** normal thin borders OK; **no heavy coloured one-sided borders** (accent stripes / thick coloured `border-left`). Drag-over = background tint (and/or normal border). No contact page; no email/mailto anywhere.
- **GoPro after load:** two views — Map (current) and **Video** (full-screen object-URL video + toggleable mini-map + metrics, synced to `video.currentTime` via GPMF relative timestamps; wait for GPS fix). Prefs in `gpstoolset.ui.v1`.
- **Ads on viewers:** never eat the map — prefer home/guides/converters, or none on viewers (**open for Monetization**). Elsewhere max 2; never on drop zone; ads partial off at launch.

---

## 3. Tool pages (rollout order)
Planner ranges = **CHECKED** (SEO TSVs). GSC = first-pass. Full SEO: `/workspace/core/seo/gpstoolset-guides-keywords-2026-11-01.md` · [SEO Page](https://cursor.com/canvas/store-b5fa6ea4-c23f-4f9d-abc1-5e8c72bd3e8d/f3623ab4-032e-46d7-b33e-879c928bc738).

| # | URL | Purpose / launch must | Primary KW (Planner) | Title (≤60) |
|---|-----|----------------------|----------------------|-------------|
| 1 | `/gopro-gps-extract` | Map + Video views · GPMF → track + GPX/CSV/KML; under-map graphs; video overlay. Reuse FlySync client JS; **different copy** + rich pre-upload content | `gopro gps extractor` **10–100** | GoPro GPS Extractor — Free, No Upload |
| 2 | `/gpx-viewer` | Full-screen map · edit tools + graphs in under-map docks · **split/trim/simplify/reverse/elev fix** day one | `gpx viewer` **10K–100K** | Free Online GPX Viewer & Editor |
| 3 | `/my-coordinates` | Full-screen map · coords/copy in under-map dock (or compact overlay) | `my coordinates` **10K–100K** | My Coordinates — Find Lat & Long on a Map |
| 4 | `/measure-distance` | Full-screen map · measure tools/readout via under-map dock | `measure distance on map` **10K–100K** | Measure Distance on a Map — Free Tool |
| 5 | `/coordinate-converter` | Decimal ↔ DMS/DDM · UTM · MGRS | `coordinate converter` **10K–100K** | Coordinate Converter — DMS, UTM & MGRS |
| 6 | `/kml-to-gpx` | KML + KMZ → GPX | `kml to gpx` **10K–100K** | KML / KMZ to GPX Converter — Free |
| 7 | `/gpx-to-kml` | GPX → KML | `gpx to kml` **1K–10K** | GPX to KML Converter — Free Online |
| 8 | `/fit-to-gpx` | Client FIT → GPX | `fit to gpx` **1K–10K** | FIT to GPX Converter — Free, No Upload |

**Secondaries (short):**  
- `/gopro-gps-extract`: `gopro gps data` **100–1K** · `extract gps from gopro video` / `gopro gpx` **10–100** · avoid telemetry-extractor phrasing  
- `/gpx-viewer`: `gpx viewer online` / `gpx editor online` **1K–10K** · `gpx to csv` **100–1K**  
- `/my-coordinates`: `gps coordinates` · `lat long finder` **10K–100K**  
- `/measure-distance`: `distance calculator map` **10K–100K**  
- `/coordinate-converter`: `lat long converter` **10K–100K** · dms/utm/mgrs **1K–10K**  
- `/kml-to-gpx`: `kmz to gpx` **10K–100K**  
- `/fit-to-gpx`: `tcx to gpx` · `garmin export gpx` **100–1K**

**Also:** `/privacy` · `/about`. **No `/contact`**, no email/mailto anywhere (Paul).  
**GSC first-pass (FlySync, still live):** GoPro page ~449 clk / 5.6K · GPX 63/825 · FIT 8/279.

### Later — GPS video overlay (social bait)
- Overlay speed/alt/map-track on video (or transparent export); free = **gpstoolset.com watermark**
- Prefer browser-side (WebCodecs/canvas) if feasible
- Reuses `/gopro-gps-extract` GPMF parsing
- Premium later: watermark-free  
**Also later:** geotag-photos · DJI SRT tool. **Skip:** what3words.

---

## 4. Guides (`/guides/` — decided)
SEO recommends **how-to / compare** over pure “what is” (wiki/gov own definitions). Never name FlySight.

| Priority | URL | Angle | Primary KW | Links to |
|---------|-----|-------|------------|----------|
| 1 | `/guides/gpx` | How to **open** a GPX online/edit | `how to open gpx file` (FIRST-PASS AC) | `/gpx-viewer`, converters |
| 2 | `/guides/gps-file-formats` | Hub + **GPX vs KML** table | `gpx vs kml` / `gps file formats` (FIRST-PASS) | all tools |
| 3 | `/guides/kml-kmz` | **KML vs KMZ** + convert | `kml vs kmz` (FIRST-PASS) | `/kml-to-gpx`, `/gpx-to-kml` |
| 4 | `/guides/fit` | What FIT is → convert | `what is a fit file` (FIRST-PASS); feed `fit to gpx` **1K–10K** | `/fit-to-gpx` |
| 5 | `/guides/dji-srt` | Explain SRT; tool later | `dji srt file` **100–1K** CHECKED | later DJI · `/gpx-viewer` |
| 6 | `/guides/gpmf` | Support for `/gopro-gps-extract` (weak AC) | extract cluster; not a traffic play | `/gopro-gps-extract` |
| 7 | `/guides/what-is-gps` | **Short**; don’t expect to beat wiki | FIRST-PASS `what is gps` | `/my-coordinates`, `/gpx-viewer` |
| 8 | `/guides/gnss-systems` | Short multi-GNSS; link tools | FIRST-PASS `gnss vs gps` / `what is gnss` | coords / converter |
| — | `/guides/nmea` · `/guides/gnss-csv` | With converters / later CSV | AC / `csv to gpx` **100–1K** | `/gpx-viewer` |

**Planner paste for Paul:** `/workspace/core/seo/tmp/gpstoolset-guides-kw-list.txt` → Keyword Planner for real guide ranges; then update SEO md.

---

## 5. Keywords (source rules)
- Tools: Planner **CHECKED** from SEO guides md + extract/toolset TSVs. Guides mostly **FIRST-PASS** AC until Paul pastes the list.
- Never invent volumes. Brand hygiene as in §1.
- Crowded SERPs → quality no-upload UX + guides↔tools links.

---

## 6. Rollout (for Cursor later)

| Phase | Scope | Done |
|------:|-------|------|
| **A** | PHP shell · tokens/design · tile module · ads off · privacy/about (no contact) · OSM rules · no heavy coloured one-sided borders · env-aware base_url | Stub home + chrome |
| **B** | `/gopro-gps-extract` (map+video views) + `/gpx-viewer` (editor day one); **distinct** copy | Both usable; FlySync stays |
| **C** | Guides kickoff: formats hub · `/guides/gpx` · `/guides/gpmf` | Linked from tools |
| **D** | Utility tools + short what-is-GPS / GNSS guides | Usable + linked |
| **E** | Converters + kml/fit/nmea/gnss-csv guides | Same |
| **F** | geotag · DJI SRT · video overlay · FlySync link-out | After launch stable |

---

## 7. Open questions
1. **Ads on viewer pages** — none at all, or only off-map (e.g. inside a closed dock / never over the map)? For Monetization later.

---

*GPS Toolset Manager · 2026-11-01 Europe/Tallinn · updated 2026-11-02: /gopro-gps-extract · map-only OSM attr · no Report-a-map · video overlay view*
