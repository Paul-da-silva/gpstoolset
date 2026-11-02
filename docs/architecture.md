<!-- Source of truth: this file in /var/www/gpstoolset/docs/ (repo). -->

# GPS Toolset · Architecture
**Status:** P5 refactor done (P5a–P5i) · **Stack:** PHP 8.4 · Apache · no framework · no build step · native ES modules · vendored libs  
**Local:** http://gpstoolset.lan/ · **Git:** leave changes uncommitted; Paul commits

This file describes the tree **as it is on disk**. If you change the structure, change this file and `.cursor/rules/gps-toolset.mdc` in the same step.

---

## Layout

```
gpstoolset/
  config/
    site.php  ads.php  tiles.php
    tools.php            ← registry: one entry per HTML route (slug, entry, meta, inSitemap…)
    guides.php           ← optional (not created yet); sitemap picks it up if present
  includes/
    bootstrap.php        ← loads config, helpers, seo.php, router.php
    router.php           ← registry lookup, route_dispatch(), 404
    seo.php              ← title / description / canonical / og / JSON-LD / sitemap.xml
    layout/              ← head, topbar, footer, close, map-app
    pages/               ← bodies for plain pages: home, privacy, about, not-found
    partials/            ← ads, tile-config, scripts-map (the one map script stack)
  tools/
    gopro-gps-extract/   ← meta.php, content.php, page.php
    gpx-viewer/          ← same three files; edit tools on the shared map shell
    measure-distance/    ← same three files
  public/                ← the only document root
    index.php            ← front controller (all HTML routes + /sitemap.xml)
    .htaccess            ← real files as files; everything else → index.php
    robots.txt  favicon.ico
    assets/
      css/
        tokens.css       ← colours, type, sizes (light + dark)
        base.css         ← reset, body, top bar / nav, home and plain-page blocks
        components.css   ← footer, ad slot, buttons, cards, chips, progress bar, FAQ
        tool-landing.css ← landing page for a map tool (hero, drop card, steps, prose)
        map-shell.css    ← map, chips placement, popovers, graph dock, video view only
      js/
        core/            ← track.js  format.js  exporters.js  ui-state.js  file-drop.js  edit.js
        map/             ← tiles.js  map-shell.js  graph-dock.js  track-layer.js
                           track-charts.js  panels.js  edit-tools.js
        parsers/         ← gpmf.js  gpx.js   (kml.js · fit.js later)
        video/           ← overlay.js  sync.js
        tools/           ← gopro-gps-extract.js  gpx-viewer.js  measure-distance.js
        dropzone.js      ← home page placeholder (classic script, not a module)
      vendor/            ← leaflet 1.9.4 · chartjs 4.4.7 · gopro (gpmf-fast, telemetry bundle)
  docs/                  ← plan, architecture, prompts, SEO, design
```

**Only `public/` is the document root.** Config, includes, tools and docs live above it; the router includes them.

---

## Request flow

1. Apache serves a real file under `public/` (assets, `robots.txt`, `favicon.ico`) as is. Missing `assets/…` files are a plain 404.
2. Anything else goes to `public/index.php` → `includes/bootstrap.php` → `route_dispatch()` (`includes/router.php`).
3. `route_dispatch()` matches `current_path()` against `config/tools.php`:
   - `/sitemap.xml` → `seo_sitemap_xml()`
   - a registry entry → merge its `meta` file, build `$page`, `require` the `entry` file
   - no match → 404 page (`includes/pages/not-found.php`, `noindex`, no canonical)
4. The entry file prints the page: `layout/head.php` (SEO tags from `includes/seo.php`), `topbar.php`, body, `footer.php`.
5. 301s that stay in `.htaccess`: `/gopro` → `/gopro-gps-extract`, old `*.php` stubs, trailing slash, `/index.php` → `/`.

### Registry entry (`config/tools.php`)

`slug` · `path` (default `/<slug>`, `/` for `home`) · `title` · `description` · `inSitemap` · `entry` (PHP file, repo-relative) · `meta` (optional PHP file that returns an array merged over the entry) · `styles` (under `/assets/css/`) · `flags` (`map`, `video`, `ads`). A tool may also set `vendorScripts`, `module` (its ES module under `/assets/js/tools/`) and `faq` in its `meta.php`.

---

## Shared JS (native ES modules, no build)

- **Track** (`core/track.js`): `{ points: [{ lat, lon, ele?, speed?, t?, cts?, dist?, vspeed? }], acc: [{ cts, g }], smooth, idx, meta: { name, timed, hasVspeed, hasG } }`. A parser returns raw `{ points, acc }` (GPX also returns `segments` and `waypoints`); `buildTrack()` fills in the rest. Edits (`core/edit.js`) return a new point list: simplify, trim, split, reverse, elevation fix.
- **Parsers** (`parsers/*.js`): `parse(file, options)` → `{ points, acc }`. `gpmf.js` wraps the vendored FlySync-derived classic scripts (`extractGpmfFast`, `GPMFExtract`, `GoProTelemetry`). Never edit those.
- **Map** (`map/*.js`): `map-shell.js` owns the Leaflet map, popovers, drop stage; `tiles.js` is the **only** place that creates a tile layer (reads `window.GPS_TILE_CONFIG` from `config/tiles.php`); `track-layer.js` draws the line, markers and scrub dot; `track-charts.js` draws the dock graphs (Chart.js global); `panels.js` fills Stats/Export and the unit switch; `graph-dock.js` is the dock UI.
- **Video** (`video/overlay.js`): the whole Video view. Tool app calls `init()`, `attach(file, track?)`, `setTrack(track)`, `clearTrack()`, `detach()`, `refresh()`, `closeMenu()`. `video/sync.js` maps video time to a GPS sample (GPMF-relative `cts`).
- **Tool app** (`tools/<slug>.js`): file → parser → `buildTrack` → map shell / charts / panels / export / overlay. Glue only.
- **Persistence:** `core/ui-state.js`, localStorage key **`gpstoolset.ui.v1`**.
- **Globals that remain:** `L` (Leaflet), `Chart`, the GPMF vendor functions, and `window.GPS_TILE_CONFIG`. Everything else is imported.

### Script loading

`includes/partials/scripts-map.php` is the one stack for map pages: inline tile config → Leaflet → Chart.js → the tool's `vendorScripts` → `<script type="module">` for the tool. Printed once, after `layout/map-app.php`.

### CSS

`tokens` → `base` → `components` → page sheet (`tool-landing`) → `leaflet.css` → `map-shell` (map pages). Thin neutral borders only; no heavy coloured one-sided borders.

### SEO

`includes/seo.php`: `seo_head_tags()` (title, description, canonical, Open Graph), `seo_json_ld()`, `seo_faq_entities()`, `seo_sitemap_xml()`. Canonical and sitemap URLs use env-aware `base_url()`. `public/sitemap.xml` no longer exists; `/sitemap.xml` is generated from the registry.

### Hard rules (unchanged)

No email/mailto · no contact · Privacy/About footer only · central tiles · ads partial only / none on map tools · no Report-a-map · map-only OSM © · `/gopro-gps-extract` brand-URL exception · never edit FlySync · **never git commit** (Paul).

---

## Add a new tool (3–5 steps)

1. **Register** it in `config/tools.php`: `slug`, `inSitemap`, `entry` => `tools/<slug>/page.php`, `meta` => `tools/<slug>/meta.php`.
2. **Create** `tools/<slug>/{meta.php, content.php, page.php}` — copy GoPro as the template (title, description, flags, styles, `module`, `faq`; strip the GPMF vendor scripts).
3. **Parser** (if needed): `public/assets/js/parsers/<format>.js` exporting `parse(file, options)` → `{ points, acc }`.
4. **Tool app:** `public/assets/js/tools/<slug>.js` — file-drop → parser → `buildTrack` → map shell, charts, panels, exporters (+ `video/overlay.js` if it has a video). Reuse the shell; don't fork markup (`layout/map-app.php`).
5. **Check** http://gpstoolset.lan/<slug> and http://gpstoolset.lan/sitemap.xml — then leave uncommitted for Paul.

Guides: add `config/guides.php` (rows with `slug`, `inSitemap`) and an article layout when the first guide is written.

---

## Refactor checklist (P5 in `docs/cursor-prompts.md`)

- [x] **P5a** registry (`config/tools.php`) + router + front controller + `.htaccess`
- [x] **P5b** `includes/seo.php` + generated `/sitemap.xml`
- [x] **P5c** GoPro split into `tools/gopro-gps-extract/{meta,content,page}.php`
- [x] **P5d** `core/` modules: `track.js`, `format.js`, `exporters.js`
- [x] **P5e** `parsers/gpmf.js` + `tools/gopro-gps-extract.js`; `gopro-app.js` removed; map/file-drop/ui-state/graph-dock are modules
- [x] **P5f** `video/overlay.js` (+ `video/sync.js`)
- [x] **P5g** CSS split: tokens · base · components · tool-landing · map-shell
- [x] **P5h** one scripts partial; `map-demo` and `layout/map-shell.php` retired
- [x] **P5i** docs + rules pass

Still open (not part of P5): a real home page that routes dropped files to tools; the remaining tools; `/guides/`; `config/guides.php`.

---

## Audit that led here (2026-11-02, before P5)

`gopro-app.js` was a ~2629-line IIFE (parse, maths, map, charts, export, units, landing, video); `public/gopro-gps-extract.php` was a ~238-line page with 8 script tags; routing and the sitemap were hand-edited; CSS was three large files; two map boot paths (demo and GoPro) duplicated script lists. All of that is what P5 replaced.

---

*GPS Toolset Manager · architecture · 2026-11-02 Europe/Tallinn*
