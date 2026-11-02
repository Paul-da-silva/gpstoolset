<!-- Source of truth: this file in /var/www/gpstoolset/docs/ (repo). Older /workspace copies may lag. -->

# GPS Toolset · Cursor prompts
**Repo:** `/var/www/gpstoolset` · **Local:** http://gpstoolset.lan/ → `public/`  
**Server:** Apache 2.4 · PHP 8.4 · Spec: `docs/architecture.md`

Run **one prompt at a time**. Leave changes **uncommitted**; Paul commits.

### Hard rules (Paul — every prompt)
- **No email / `mailto:`** · **no contact page**
- **Privacy/About:** footer only
- **Borders:** thin OK · **no heavy coloured one-sided accent borders**
- **OSM:** attribution on the **map only** · no © OSM in footer · no “Report a map issue”
- Brand-in-URL exception: **`/gopro-gps-extract`**
- **Git:** never commit, push, amend, or stage-and-commit — **Paul commits**

---

## Done
- P1 Foundation · P1b Cleanup · P2 Map shell · P3 GoPro port · P4 chrome + `/gopro-gps-extract` + video view
- P5a–P5i Structure refactor (registry/router, SEO + sitemap, tools/ split, ES modules, video overlay, CSS split, scripts partial, docs)

---

## P5 — Structure refactor (keep GoPro working)

Goal: clean foundation for the other 7 tools + `/guides/`. Spec: `docs/architecture.md`.  
**Every step:** behaviour of http://gpstoolset.lan/gopro-gps-extract stays the same (landing → parse → map/video/export). **Leave changes uncommitted; Paul commits.** Do not edit `/var/www/skylog`. Keep all hard rules in `.cursor/rules`.

---

### P5a — Registry + front controller (no JS move yet)

```
Continue in /var/www/gpstoolset. Read docs/architecture.md. Leave changes uncommitted; Paul commits.

P5a only: introduce a page/tool registry and front controller WITHOUT moving gopro-app.js or changing GoPro UX.

1) Add config/tools.php — registry entries for at least: home, privacy, about, gopro-gps-extract, map-demo (if still needed). Each: slug, title, description, inSitemap, php entry path (can still point at existing public/*.php OR includes for now), flags.
2) Add includes/router.php + make public/index.php the front controller: resolve REQUEST_URI to a registry page and include it. Keep serving real files under public/assets/, robots.txt as files.
3) Update public/.htaccess so non-file routes go to index.php; keep 301 /gopro → /gopro-gps-extract; keep clean URLs. Existing public/gopro-gps-extract.php etc. can remain as the included bodies for this step (thin wrappers OK).
4) Do not rewrite gopro-app.js. Do not change Track/parse behaviour.

When done, tell me what to check at http://gpstoolset.lan/gopro-gps-extract :
- Landing, drop, parse, map, video, export still work
- /privacy /about / still work via router
- /gopro still 301s to /gopro-gps-extract
- Leave changes uncommitted; Paul commits
```

---

### P5b — SEO helper + sitemap from registry

```
Continue in /var/www/gpstoolset after P5a. Leave changes uncommitted; Paul commits.

P5b only: includes/seo.php (title, description, canonical via env-aware base_url, optional JSON-LD helper). Generate /sitemap.xml from config/tools.php (and guides later) instead of the hand-edited public/sitemap.xml. Wire head.php to use the helper. GoPro FAQ JSON-LD can call the helper. No JS behaviour changes.

When done, tell me what to check at http://gpstoolset.lan/gopro-gps-extract :
- View-source: title, meta description, canonical correct
- /sitemap.xml lists home, privacy, about, gopro-gps-extract
- Tool still works end-to-end
- Leave changes uncommitted; Paul commits
```

---

### P5c — Split GoPro into tools/gopro-gps-extract/

```
Continue in /var/www/gpstoolset after P5b. Leave changes uncommitted; Paul commits.

P5c only: move GoPro PHP/content into tools/gopro-gps-extract/:
- meta.php (title, description, flags, faq array)
- content.php (landing HTML only — hero, how-it-works, FAQ markup…)
- page.php (thin: head/topbar, content, map-app, script tags / module entry)
Update registry to load tools/gopro-gps-extract/page.php. Remove the fat public/gopro-gps-extract.php body (leave a stub redirect via router if needed). Do not split gopro-app.js yet.

When done, tell me what to check at http://gpstoolset.lan/gopro-gps-extract :
- Same landing copy and FAQ
- Parse / map / video / export unchanged
- Leave changes uncommitted; Paul commits
```

---

### P5d — Shared ES modules: track, format, exporters

```
Continue in /var/www/gpstoolset after P5c. Leave changes uncommitted; Paul commits.

P5d only: introduce public/assets/js/core/ as native ES modules:
- track.js — Point/Track helpers (validCoord, haversine, distance, thinIndices, fillMissingSpeed…) extracted from gopro-app.js
- format.js — units/speed/alt/distance/clock formatting (reads GpsUiState / ui-state)
- exporters.js — toGpx / toCsv / toKml / download()
Refactor gopro-app.js to import these (may temporarily be a module that still attaches listeners). Behaviour and UI must match. No video-overlay extract yet.

When done, tell me what to check at http://gpstoolset.lan/gopro-gps-extract :
- Open a GoPro MP4: track, stats, graphs match prior behaviour
- Export GPX/CSV/KML still download correct files
- Leave changes uncommitted; Paul commits
```

---

### P5e — parsers/gpmf.js + thin tools/gopro-gps-extract.js

```
Continue in /var/www/gpstoolset after P5d. Leave changes uncommitted; Paul commits.

P5e only: move GPMF extract + telemetry → Track into public/assets/js/parsers/gpmf.js (wraps vendored gpmf-fast + gopro-telemetry-bundle; never edit FlySync sources). Shrink tool entry to public/assets/js/tools/gopro-gps-extract.js (file pick → gpmf.parse → showTrack / charts wiring). Delete or gut the old monolithic gopro-app.js once imports work. Keep map-shell / file-drop / ui-state / graph-dock as shared (convert to modules if needed for imports).

When done, tell me what to check at http://gpstoolset.lan/gopro-gps-extract :
- Fast and slow extract paths still work; cancel works; errors still clear
- Map + graphs + export OK
- Leave changes uncommitted; Paul commits
```

---

### P5f — video/overlay.js

```
Continue in /var/www/gpstoolset after P5e. Leave changes uncommitted; Paul commits.

P5f only: extract Video view into public/assets/js/video/overlay.js (mini Leaflet map via tiles.js, metric toggles, gpstoolset.ui.v1, sync on video.currentTime with GPMF-relative timestamps, waiting-for-GPS-fix, seek/pause/rate, fullscreen). Tool app only calls overlay.attach(file, track) / detach. Behaviour unchanged.

When done, tell me what to check at http://gpstoolset.lan/gopro-gps-extract :
- Map | Video toggle; waiting-for-fix; seek sync; overlay toggles persist; fullscreen
- Leave changes uncommitted; Paul commits
```

---

### P5g — CSS split

```
Continue in /var/www/gpstoolset after P5f. Leave changes uncommitted; Paul commits.

P5g only: split CSS per docs/architecture.md — tokens.css, base.css, components.css (chips/cards/faq/buttons/footer), map-shell.css (map/dock/video only), tool-landing.css. Update head.php / page meta styles arrays. No visual redesign; no heavy coloured one-sided borders. Thin borders OK.

When done, tell me what to check at http://gpstoolset.lan/gopro-gps-extract :
- Landing + map + video look the same (spot-check mobile width too)
- Leave changes uncommitted; Paul commits
```

---

### P5h — Script loading cleanup + retire map-demo if unused

```
Continue in /var/www/gpstoolset after P5g. Leave changes uncommitted; Paul commits.

P5h only: one shared partial for map stack scripts (leaflet + core map modules + tile-config). Remove duplicated script lists between map-shell.php and GoPro page. Retire or clearly mark public/map-demo (and registry) if Paul does not need it — if kept, load via registry like other tools. Ensure home still works.

When done, tell me what to check at http://gpstoolset.lan/gopro-gps-extract :
- Network tab: no duplicate leaflet/ui-state loads; tool works
- / and /privacy /about OK
- Leave changes uncommitted; Paul commits
```

---

### P5i — Rules + docs pass (structure conventions live)

```
Continue in /var/www/gpstoolset after P5h. Leave changes uncommitted; Paul commits.

P5i only: update docs/architecture.md checklist (mark done steps), docs/README.md index, and confirm .cursor/rules/gps-toolset.mdc "Target structure" matches the tree on disk. Add a one-page "add a tool" snip already in architecture — ensure rules point to it. No product behaviour changes.

When done, tell me what to check at http://gpstoolset.lan/gopro-gps-extract :
- Still works (smoke)
- docs/architecture.md matches folders
- Leave changes uncommitted; Paul commits
```


*GPS Toolset Manager · Cursor prompts · updated 2026-11-02 Europe/Tallinn · P5 done · next: first new tool or home page*
