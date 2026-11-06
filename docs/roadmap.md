<!-- Source of truth: this file in-repo under docs/. -->

# Roadmap

**Site:** [gpstoolset.com](https://gpstoolset.com) · **Repo:** `/var/www/kuiper/gpstoolset` · **Docroot:** `public/`  
Runs on the shared Kuiper PHP shell. Follow `.cursor/rules/` `00`–`07` + `10-gpstoolset`. Never edit `core/*`.  
**Keywords:** `docs/seo-keywords.md`. **Architecture:** `docs/architecture.md`. **Guides:** `docs/guides-brief.md`.

## The plan

- Free GPS file tools in the browser: parse on the device (no uploads), Leaflet + OSM street tiles only (no satellite — cost).
- Three generic modules — `viewer/` · `editor/` · `converter/` — plus per-format SEO landings that parse a file and hand a shared track model to the module.
- Menu: Viewers (GPX, KML, KMZ, FIT, More → GoPro) · Tools (Coordinate converter, Measure distance, Antipodes, Converter).
- Format registry (`config/formats.php`): a new format or convert pair is config + content, not new JS.
- Brand: Clear · Private · Practical. Tokens teal `#115e59` · orange `#c2410c`. Map tools = full-screen map + slim top bar; graphs dock under the map (`gpstoolset.ui.v1`).
- Hard rules: no email / `mailto:` · no contact page · Privacy/About in the footer only · thin borders OK, no heavy one-sided accent borders · OSM credit on the map / 3D stage only · never git commit (Paul only) · ads off until traffic · no demo coordinates near Paul (use the Eiffel Tower `48.8584, 2.2945`) · never name competitor logger brands; say “GNSS logger CSV exports”.
- URLs: no brand names except `/gopro-gps-extract`. “Telemetry extractor” / “GoPro telemetry” are allowed keywords. HERO12 has no GPS — never list it as supported.
- FlySync: only `flysync.io/gopro-gps-viewer.html` 301s here (to `/gopro-gps-extract`, live 2026-11-05). FlySync’s GPX and FIT viewers stay there and link out.
- OSM tiles: central module only (`https://tile.openstreetmap.org/{z}/{x}/{y}.png`); no prefetch or bulk downloads; watch traffic (3D view caps mosaic tiles).

## Next

- **Consent banner (CMP)** for Google Analytics (`G-6M37SHK4H5` loads today with no consent UI).
- **Default `og:image`** on all pages (`05-seo` expects one; none exists yet).
- **`/my-coordinates`** (planned; primary keyword “my coordinates”).
- **Guides Wave B** (educational): `/guides/how-gps-works`, `/guides/gnss-vs-gps`, `/guides/gps-accuracy`, optional `/guides/gps-history`. Head terms stay unverified until a Keyword Planner paste is checked.
- **Time zone tools:** zone converter with DST, world clock / day-night map, time zone from coordinates, UTC vs GPS time helpers.
- **More convert pairs** / NMEA · CSV once those formats are in the registry.
- **3D polish** (not blocking): vertical exaggeration so heights don’t look flat on Web Mercator; hide the unused Map/3D switcher markup on `/gpx-editor`; lazy-import `track-3d.js` (Three.js itself is already lazy).
- **Elevation / profile view** as a real UI before chasing “gpx elevation viewer” / “gpx profile viewer” in copy.

## Later

- GPS video overlay (social bait; watermark on a free tier).
- DJI telemetry viewer (SRT and/or DJI flight logs). Insta360 is dropped.
- Live GNSS satellite globe (CelesTrak TLEs, computed in the browser).
- Geotag photos.
- Ads: one shared partial, still off. Never on the map, drop zone, or sticky controls. Whether viewer pages get any ads at all is still open (for Monetization).

## Done (recent)

- Kuiper shared-core move (repo is `/var/www/kuiper/gpstoolset`; site-specific code stays out of `core/*`).
- FlySync GoPro page 301 → `/gopro-gps-extract` (live 2026-11-05), after a parity check. GoPro FAQ names HERO5 and newer (including MAX) and excludes HERO12; stats include max vertical speed and a GPS coverage note.
- **3D track view (2026-11-06):** Map | 3D on format viewers; Map | Video | 3D on GoPro; `map/track-3d.js` + vendored three@0.160.1 (lazy); street tiles as a flat plane; track as a `#0369a1` tube; no 3D in the editor. Review fixes landed (WebGL `forceContextLoss`, tile cap 64, failed load returns to Map) — Code Reviewer signed off.
- **Reader + 3D copy** on `/gpx-viewer`, `/kml-viewer`, `/kmz-viewer`, and `/fit-viewer` (each format uses its own words; no separate `/gpx-reader` or 3D URLs). “gpx reader” is a close variant of “gpx viewer” (France Planner export); 3D terms target those same landings.
- Generic `viewer/` · `editor/` · `converter/` + SEO landings + format registry (2026-11-03).
- Guides Wave A: hub + format/compare guides, linked from landings and `/convert/...`.
- `/antipodes`. Old `/kml-to-gpx` etc. 301 → `/convert/...`; `/gopro` → `/gopro-gps-extract`.
- Inbound links from FlySync’s GPX and FIT viewers (not redirects).
- Phase A/B: PHP shell, tokens, tiles, ads off, privacy/about, `/gopro-gps-extract` (map + video), first GPX viewer.

## Not doing

- what3words.
- Sample / demo track files, or a Sample button on empty states.
- Extra 301s from sibling product viewers (only the FlySync GoPro page).
- Satellite / imagery tiles.
- Insta360 tools.
- Hosting the same tool on both FlySync and gpstoolset.

## Open questions

1. **Ads on viewer pages** — none at all, or only off-map (for example inside a closed dock)? Site-wide ads stay off until there is traffic.
