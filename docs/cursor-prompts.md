<!-- Source of truth: this file in /var/www/gpstoolset/docs/ (repo). Older /workspace copies may lag. -->

# GPS Toolset · Cursor prompts
**Repo:** `/var/www/gpstoolset` · **Local:** http://gpstoolset.lan/ → `public/`  
**Server:** Apache 2.4.58 · PHP 8.4 · remote `git@github.com:Paul-da-silva/gpstoolset.git`

Run **one prompt at a time**. Commit after each.

### Hard rules (Paul — apply to every prompt)
- **No email address and no `mailto:`** anywhere on the site.
- **No contact page** and no links to one.
- **Borders:** normal thin borders / box-shadows are fine. **No heavy coloured one-sided borders** (accent stripes like a thick coloured `border-left`). Drag-over = background tint (and/or normal border), not a thick accent stripe.
- Keep OSM **“Report a map issue”** → https://www.openstreetmap.org/fixthemap

---

## P1 — Foundation ✅ done

Paul already ran this. Left for history only — do not re-run. (Had contact page + email placeholders; cleaned by P1b.)

---

## P1b — Cleanup (done/sent)

```
Cleanup pass on gpstoolset: 1. Remove every email address and mailto: link from the whole site. 2. Delete the contact page and all links to it. 3. Borders: keep normal thin borders / box-shadows if useful; remove any heavy coloured one-sided borders (accent stripes like a thick coloured border-left) on drop zones, cards, panels, buttons. Drag-over = background colour change (and/or normal border), not a thick accent stripe. 4. Keep the OSM 'Report a map issue' link. 5. Make base_url env-aware: use http://gpstoolset.lan locally and https://gpstoolset.com in production (detect via host / env — no hardcoded prod URL for local). 6. Make the initial git commit for the foundation + this cleanup.

When done, tell me what to check at http://gpstoolset.lan/ :
- no mailto / email strings in view-source
- /contact gone (404 or redirect); no Contact links in nav/footer
- no heavy coloured one-sided accent borders; drag-over is tint (normal borders OK)
- "Report a map issue" still present
- base_url resolves to gpstoolset.lan on this host
- git log shows an initial commit
```

---

## P2 — Map shell

```
Continue in /var/www/gpstoolset (Apache docroot = public/). Foundation from P1 + P1b cleanup already exists — reuse layout, tokens, config/tiles.php, tiles.js, ads rules. Do not rewrite the whole site.

Hard rules (Paul):
- No email address and no mailto: anywhere. No contact page / links.
- Borders: normal thin borders / box-shadows OK. No heavy coloured one-sided borders (accent stripes / thick coloured border-left) on drop zones, cards, panels, chips, buttons, empty-state UI. Drag-over / active drop = background tint (and/or normal border), not a thick accent stripe.
- Keep OSM "Report a map issue" → https://www.openstreetmap.org/fixthemap

Goal of THIS prompt only: reusable FULL-SCREEN map page shell (no GoPro parsing yet).

UX (mandatory — Paul):
- Full-screen map fills the viewport MINUS the slim top bar (logo + menu only). Like Google Maps / ADS-B Exchange globe.
- NO permanent side panel. NO mobile bottom sheet for tools.
- Floating chips/buttons ON the map for: Open/Replace file, Stats (placeholder), graph toggles (Speed, Altitude), Export (placeholder). Normal thin borders OK; no heavy coloured one-sided accent stripes.
- Graph dock docks UNDER the map (map shrinks). Charts never overlay tiles. Drag handle (≥24px) resizes height. Dock chrome: normal borders OK; no heavy coloured one-sided accent stripes.
- Dock min 120px, default 180px, max 45vh desktop / 40vh mobile.
- Persist UI in localStorage key exactly: gpstoolset.ui.v1
  Suggested schema:
  {
    "units": "metric",
    "graphs": {
      "speed":    { "open": false, "height": 180 },
      "altitude": { "open": false, "height": 180 }
    },
    "dock": { "height": 180, "tab": "speed" },
    "chips": { "statsOpen": false, "toolsOpen": false }
  }
- File drop: whole-map overlay on dragenter (background tint; normal border OK — no heavy coloured accent stripe); empty state = centered card over map ("Drop a file or choose one. Nothing is uploaded.") + Choose file + Sample button (Sample can no-op or draw a fake polyline). Empty-state card: normal borders OK; no thick coloured border-left stripes.
- Mobile: top bar ~48px + safe-area; thumb-reachable controls; dock max ~40vh.
- Privacy: empty-state chip + menu item: "Your file never leaves your device."
- Menu/footer links: Privacy, About, Tools, Guides — never Contact. No email in chrome.

Create:
- includes/layout/map-shell.php — layout for map tools (topbar + #map + #graph-dock + chip mounts). No footer on map pages.
- public/assets/css/map-shell.css — no heavy coloured one-sided accent borders (normal borders OK)
- public/assets/js/ui-state.js — load/save gpstoolset.ui.v1
- public/assets/js/graph-dock.js — open/close tabs, resize handle, apply heights from ui-state
- public/assets/js/file-drop.js — drag overlay + picker hooks (callback when File chosen); drag-over = bg tint only
- public/assets/js/map-shell.js — init Leaflet map using tiles.js ONLY; fitBounds helper; resize map when dock opens
- public/map-demo.php — temporary page to verify shell with a hardcoded demo polyline. Clean URL /map-demo OK for now.
- Ensure Leaflet 1.9.4 is vendored locally (from P1 or finish that here).

OSM rules: attribution visible; no restrictive Referrer-Policy; no tile prefetch; menu/footer link "Report a map issue" (no contact email).

Ads: isMapPage=true → zero ads.

When done, tell me what to check at http://gpstoolset.lan/ :
- open /map-demo: map is full-screen under slim bar
- toggle Speed/Altitude → dock appears under map, map shrinks; drag handle resizes; refresh restores gpstoolset.ui.v1
- drag a file over the map → tint overlay (no thick accent stripe); picker works
- no side panel; no ads; OSM attribution visible; no email/mailto; no Contact link
```

---

## P3 — /gopro (port FlySync client extractor)

```
Continue in /var/www/gpstoolset. Reuse the map shell from P2 (full-screen map, under-map graph dock, gpstoolset.ui.v1, file-drop). Do NOT edit any FlySync/skylog files — COPY only.

Hard rules (Paul):
- No email address and no mailto: anywhere. No contact page / links.
- Borders: normal thin borders / box-shadows OK. No heavy coloured one-sided borders (accent stripes / thick coloured border-left) on drop zones, cards, panels, chips, buttons, empty states, export UI. Drag-over = background tint (and/or normal border), not a thick accent stripe.
- Keep OSM "Report a map issue" link.

Goal: ship http://gpstoolset.lan/gopro — client-side GoPro GPMF → track on map + graphs + export. 100% in-browser. No uploads. No server parse.

COPY these files FROM paul-desktop into gpstoolset (read-only sources — never modify originals):

  /var/www/skylog/webroot/js/gpmf-fast.js
    → public/assets/vendor/gopro/gpmf-fast.js
    Global: window.extractGpmfFast(file, opts) → { rawData, timing } (same shape as gpmf-extract)

  /var/www/skylog/webroot/js/gopro-telemetry-bundle.min.js
    → public/assets/vendor/gopro/gopro-telemetry-bundle.min.js
    Globals: window.GPMFExtract, window.GoProTelemetry
    (bundle of Juan Irache gpmf-extract + gopro-telemetry)

Reference-only (do NOT copy PHP into production blindly; rewrite UI in our shell):
  /var/www/skylog/views/publicviewer/goprogps.php
    — extract flow: extractGpmfFast first, fallback GPMFExtract; then GoProTelemetry({...}); builds track; Leaflet polyline; Highcharts charts; GPX export
  /var/www/skylog/controllers/PublicViewer.php → goproGPS() sets pageJs = [gpmf-fast, gopro-telemetry-bundle]

FlySync Leaflet is CDN 1.9.4 — we already vendor locally. FlySync charts use Highcharts (commercial). Do NOT copy Highcharts. Use Chart.js (MIT) vendored locally, or lightweight canvas charts, for Speed + Altitude in the graph dock. Match UX idea (combined time series, hover scrub on track) without Highcharts.

Implement:
- public/gopro.php + clean URL /gopro via .htaccess
- public/assets/js/gopro-app.js — wire file-drop → extract → GoProTelemetry → lat/lon/alt/speed series → draw polyline via map-shell (route color #0369a1 + white halo) → graphs in dock → Export popover: GPX, CSV, KML (client-side download)
- Accept .mp4 / .lrv (and video/*). Progress UI for large files. Cancel if feasible.
- Empty state + errors in plain language ("No GPS track in this file" etc.) — normal borders OK; no heavy coloured one-sided accent stripes
- Units metric/imperial from gpstoolset.ui.v1

Copy / SEO constraints (hard):
- Page title/meta must be NEW and DIFFERENT from FlySync (FlySync title is like "GoPro GPS Extractor: Extract GPS data from GoPro videos - FlySync"). Suggested direction: "GoPro GPS Extractor — Free, No Upload" + body angle: privacy / multi-tool hub / gpstoolset — not a paste of FlySync FAQ.
- GoPro only as compatibility ("works with GoPro Hero video GPS / GPMF"). Never brand the product as GoPro.
- NEVER use the words "Telemetry Extractor" / "telemetry extractor" as product naming.
- NEVER mention FlySight (or other FlySync-only brands).
- No server upload endpoint for the video.
- No email / mailto / contact page in copy or chrome.

When done, tell me what to check at http://gpstoolset.lan/gopro :
- drop a GoPro MP4 with GPS → track on full-screen map, no network upload of the file (DevTools)
- Speed/Altitude docks work; refresh keeps dock prefs (gpstoolset.ui.v1)
- Export GPX/CSV/KML downloads locally
- copy/title clearly not a FlySync clone; no "Telemetry Extractor"; OSM attribution visible; no ads
- no email/mailto; no Contact; no heavy coloured one-sided accent borders
```

---

*GPS Toolset Manager · Cursor prompts · updated 2026-11-02 Europe/Tallinn · P1 done · P1b cleanup · hard rules: no email/contact · no heavy coloured one-sided borders*
