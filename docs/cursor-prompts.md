<!-- Source of truth: this file in /var/www/gpstoolset/docs/ (repo). Older /workspace copies may lag. -->

# GPS Toolset · Cursor prompts
**Repo:** `/var/www/gpstoolset` · **Local:** http://gpstoolset.lan/ → `public/`  
**Server:** Apache 2.4.58 · PHP 8.4

Run **one prompt at a time**. Commit after each.

### Hard rules (Paul — apply to every prompt)
- **No email address and no `mailto:`** anywhere on the site.
- **No contact page** and no links to one.
- **Borders:** normal thin borders / box-shadows are fine. **No heavy coloured one-sided borders** (accent stripes like a thick coloured `border-left`). Drag-over = background tint (and/or normal border), not a thick accent stripe.
- **Privacy / About links:** footer only (not topbar, not homepage mid-links).
- **OSM:** attribution **on the map only** (Leaflet control via central tile module). **No** “© OpenStreetMap contributors” in the footer. **No** “Report a map issue” anywhere (Paul).
- Brand-in-URL exception: **`/gopro-gps-extract`** only (not bare `/gopro`).

---

## P1 — Foundation ✅ done
## P1b — Cleanup ✅ done (env-aware base_url, initial commit, border correction)
## P2 — Map shell ✅ done
## P3 — /gopro port ✅ done (URL superseded by P4 → `/gopro-gps-extract`)

---

## P4 — Chrome cleanup + /gopro-gps-extract + video overlay view

```
Continue in /var/www/gpstoolset. Keep .cursor/rules (no email/mailto, no contact page, thin borders OK, no heavy coloured one-sided accent borders, central tile module only, ads only via partial and never on map/viewer pages). Do not edit /var/www/skylog. Commit when done.

Real files today (use/extend these):
- public/index.php — home has Privacy/About in .home-links (REMOVE those links)
- includes/layout/topbar.php — Privacy + About nav links; on map pages also "Report a map issue" + privacy note
- includes/layout/footer.php — Privacy/About + "© OpenStreetMap contributors" + "Report a map issue"
- includes/layout/map-shell.php, public/assets/js/{map-shell,file-drop,graph-dock,ui-state,gopro-app}.js, public/assets/css/map-shell.css
- public/gopro.php + public/.htaccess routes for /gopro
- config/tiles.php + includes/partials/tile-config.php + public/assets/js/tiles.js (Leaflet attribution source of truth)
- public/sitemap.xml (does not list /gopro yet)

### 1) Homepage chrome — Privacy/About only in the footer
- Remove Privacy and About from includes/layout/topbar.php (site-wide).
- Remove the .home-links Privacy/About block from public/index.php.
- Keep Privacy + About ONLY in includes/layout/footer.php.
- Keep the homepage privacy sentence ("Your file never leaves your device.") — that is copy, not a duplicate nav link.

### 2) Drop "Report a map issue" everywhere
- Remove from topbar (map-page branch), footer, about copy if present, and any other chrome.
- Do not add it back. OSM attribution stays on the map only (see §5).

### 3) Rename tool URL to /gopro-gps-extract
- Canonical path: /gopro-gps-extract (replace /gopro everywhere: .htaccess, nav/tools links, sitemap, canonical, internal links, empty-state copy, docs).
- Prefer renaming public/gopro.php → public/gopro-gps-extract.php (or keep filename but rewrite cleanly — pick one approach and be consistent).
- .htaccess: serve /gopro-gps-extract; optional cheap 301 from /gopro and /gopro.php → /gopro-gps-extract (not launched yet, but fine).
- Sitemap: add https://gpstoolset.com/gopro-gps-extract
- Brand-in-URL exception is now /gopro-gps-extract (not bare /gopro). Update docs/.cursor/rules mentions.

### 4) Pre-upload content on /gopro-gps-extract (SEO + UX)
Drop zone / empty card stays FIRST (above the fold). BELOW it, add a substantial original content block (NOT FlySync copy; never "Telemetry Extractor"; never FlySight; GoPro only as compatibility wording).
Include:
- Intro aimed at primary "gopro gps extractor" (+ secondaries from docs/seo-keywords.md: gopro gps data, extract gps from gopro video, gopro gpx)
- How it works (short numbered steps: choose video → browser reads GPMF → track on map → export)
- What you get: track on map, speed + altitude graphs, export GPX / CSV / KML, and play your video with a live map + speed overlay (link/mention the Video view)
- Supported cameras: compatibility wording for GoPro HERO models that embed GPS (GPMF) — not a product endorsement
- Privacy: file never leaves your device / no upload
- FAQ (3–6 short Qs)
- Links toward future /gpx-viewer and /guides/ (can be "coming soon" anchors if pages missing)
Title/meta stay original (current direction OK: "GoPro GPS Extractor — Free, No Upload") with meta matching the new URL.
When a video loads successfully: HIDE this whole pre-upload content block (and the empty-state card); map/video UI takes the full viewport under the slim top bar.

### 5) Footer vs map OSM attribution
- Footer must NOT say "© OpenStreetMap contributors" (makes the site look like an OSM project).
- Attribution is REQUIRED only ON THE MAP via Leaflet attribution control, driven from config/tiles.php → tiles.js. Keep that. Nowhere else in chrome.

### 6) After a video is loaded — header chrome
- Do NOT show "Report a map issue" (already gone site-wide).
- Do NOT show "Your file never leaves your device" in the header/topbar once a file is loaded.
- Empty-state privacy chip before load is fine; remove/hide header privacy note on load (topbar map-page privacy span should go entirely).

### 7) Two views after load + clear entry to Video view
Add a view toggle (top bar and/or chip bar) once a video is loaded:
(A) Map view — keep current full-screen map + under-map graph dock + export (fine for now).
(B) Video view — user's video full-screen via object URL (no upload) with overlays:
    - Mini map (Leaflet via central tiles.js): track + current-position marker
    - Metrics: speed, altitude, distance, time; optionally G-force / vertical speed if present in telemetry — each metric toggleable on/off
    - Persist toggles + which view in localStorage key exactly gpstoolset.ui.v1 (extend schema, e.g. view: "map"|"video", videoOverlay: { miniMap, speed, altitude, distance, time, gForce, verticalSpeed })
Sync overlays to video.currentTime using GPMF sample timestamps relative to video start (cts / timing from extractGpmfFast + GoProTelemetry) — NOT the GPS wall clock.
GPS fix often starts after video start:
- Before first valid fix (GPSF/fix 0, or invalid/dropped samples): show "Waiting for GPS fix", hide the position marker
- Skip invalid lat/lon samples; interpolate between valid samples for smooth marker motion
- Handle seek, pause, play, playbackRate; rAF or timeupdate; clean up on replace/unload
- Mobile-friendly overlays; Fullscreen API button for the video stage
Pre-upload copy must mention this Video view ("play your video with a live map and speed overlay"). Toggle must be obvious after load.

### 8) Docs
Update docs/plan.md, docs/cursor-prompts.md, docs/design-direction.md, docs/seo-keywords.md, docs/README.md, and .cursor/rules/*.mdc for: /gopro-gps-extract, no Report-a-map-issue, map-only OSM attribution, footer without © OSM, video overlay view + gpstoolset.ui.v1 fields, Privacy/About footer-only.

When done, tell me what to check at http://gpstoolset.lan/gopro-gps-extract :
- Privacy/About only in footer on home; not in topbar or home mid-links
- No "Report a map issue" anywhere; footer has no "© OpenStreetMap contributors"; map still shows OSM attribution bottom-right
- Pre-upload: drop zone first, rich content below; content hides after load
- After load: Map | Video toggle; Video view syncs mini-map + metrics to currentTime (waiting-for-fix before first good sample; seek works); fullscreen works; toggles survive refresh via gpstoolset.ui.v1
- /gopro 301s (or redirects) to /gopro-gps-extract; sitemap/canonical use new URL; no email/contact; no thick coloured border-left stripes
```


*GPS Toolset Manager · Cursor prompts · updated 2026-11-02 Europe/Tallinn · next: P4*
