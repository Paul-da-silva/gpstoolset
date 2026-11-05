<!-- Source of truth: this file in-repo under docs/. -->

# Roadmap

**Site:** gpstoolset.com · **Repo:** this repo · **Docroot:** `public/`  
**Structure:** thin map in `docs/architecture.md`. Shared musts: `.cursor/rules/00–07` + `10-gpstoolset.mdc`.  
**Keywords:** `docs/seo-keywords.md`. **Guides brief:** `docs/guides-brief.md`.

## The plan

- Free GPS file tools: client-side parse only (no uploads), Leaflet + OSM street tiles, PHP shell + shared layout.
- Three generic modules — `viewer/` · `editor/` · `converter/` — plus per-format SEO landings that parse and hand off a shared track model.
- Menu: Viewers (GPX, KML, KMZ, FIT, More → GoPro) · Tools (Coordinate converter, Measure distance, Antipodes, Converter).
- Format registry (`config/formats.php`): adding a format or convert pair = config + content only (no new JS).
- Brand: Clear · Private · Practical. Tokens teal `#115e59` · orange `#c2410c`. Map tools = full-screen map + slim top bar; graphs dock under the map (`gpstoolset.ui.v1`).
- Hard site rules (also in `00–07` / `10-gpstoolset`): no email/mailto · no contact · Privacy/About footer only · thin borders OK, no heavy one-sided accent borders · OSM © on the map only · never git commit (Paul) · ads off until traffic.
- URL / brand: no brand names in URLs except `/gopro-gps-extract`. GoPro/DJI = compatibility copy only. Never name FlySight → “GNSS logger CSV exports”. “Telemetry extractor” / “GoPro telemetry” OK as keywords.
- Sibling products keep their viewers; **no inbound 301s** from them. Some keyword overlap is fine. `/gopro-gps-extract` copy must stay clearly different from competing extractors.
- OSM tiles: central module only (`https://tile.openstreetmap.org/{z}/{x}/{y}.png`); no prefetch/bulk; watch traffic.

## To do

- `/my-coordinates` (planned; primary KW `my coordinates`).
- Guides Wave B (educational): `/guides/how-gps-works`, `/guides/gnss-vs-gps`, `/guides/gps-accuracy`, optional `/guides/gps-history`.
- More convert pairs / NMEA·CSV when formats land in the registry.
- Later product ideas already recorded: GPS video overlay (social bait, watermark free tier), DJI telemetry viewer, 3D view option for viewers (see 3D track viewer below), live GNSS satellite globe (CelesTrak TLEs in-browser), time zone tools (converter, world clock / day-night map, zone from coordinates, UTC/GPS-time helpers), geotag-photos.
- 3D track viewer (like FlySync's 3D view): drop a GPX → track drawn as a 3D tube over a flat OSM street-tile ground (Web Mercator, same as Leaflet), drop-lines to the ground, orbit camera; Three.js (FlySync uses three@0.160.1); no terrain at first (FlySync has none either), optional free DEM later (e.g. AWS Terrarium terrain tiles, unverified); street tiles only, no satellite; targets `3d gpx viewer` / `gpx 3d viewer online` / `gpx 3d visualizer`
- Guide keyword paste: most guide head terms stay unverified until Paul pastes the Keyword Planner list.

## Done

- Phase A: PHP shell · tokens/design · tile module · ads off · privacy/about · OSM rules · Paul-only commits.
- Phase B: `/gopro-gps-extract` (map+video) + first `/gpx-viewer` drafts.
- **P7 / B2 (2026-11-03):** generic `viewer/` · `editor/` · `converter/` + SEO landings · 301s · format registry.
- Guides Wave A published: hub + format/compare guides linked to landings + `/convert/...`.
- `/antipodes` landed.
- Inbound links from a sibling product’s GPX and FIT viewers (guide + viewer, 2026-11-04).
- Old `/kml-to-gpx` etc. 301 → `/convert/...`; `/gopro` → `/gopro-gps-extract`.

## Not doing

- what3words.
- Sample / demo track files or a Sample button on empty states.
- 301s from sibling product viewers onto this site.

## Ideas in progress

*(none recorded beyond the To do list)*

## Open questions

1. **Ads on viewer pages** — none at all, or only off-map (e.g. inside a closed dock / never over the map)? For Monetization later (site-wide ads still on hold until traffic).

---

*GPS Toolset Manager · Europe/Tallinn · remapped from former plan doc 2026-11-05 · 3D track viewer added*
