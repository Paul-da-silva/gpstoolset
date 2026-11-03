<!-- Source of truth: this file in /var/www/gpstoolset/docs/ (repo). -->

# GPS Toolset · Architecture
**Status:** P5–P7 done. Three generic modules (`viewer/`, `editor/`, `converter/`) plus SEO landings. Format registry is `config/formats.php`.  
**Stack:** PHP 8.4 · Apache · no framework · no build · native ES modules · vendored libs  
**Local:** http://gpstoolset.lan/ · **Git:** leave changes uncommitted; Paul commits

If you change the structure, change this file and `.cursor/rules/gps-toolset.mdc` in the same step.

---

## Product shape (2026-11-03)

Three **generic modules** (viewer / editor / converter) + SEO landings that parse and hand off a track:

| Meta tool | URL(s) | Behaviour |
|-----------|--------|-----------|
| **Viewer module** | `assets/js/viewer/` (not a URL) | Generic: map shell, track layer, chart dock, controls. Accepts **only** the shared track model. No format-specific code. |
| **Editor module** | `assets/js/editor/` (not a URL) | Generic: editable preview on shared map/chart components; merge / split / trim / simplify / reverse / elevation fix; export any writable format. Track model only. `/gpx-editor` is the SEO landing. |
| **Converter module** | `assets/js/converter/` (not a URL) | Generic: any → any on the track model. `/convert` + `/convert/<pair>` are SEO landings (parse then hand off). Old `/kml-to-gpx` etc. **301** here. |
| **Landings** | `/gpx-viewer`, `/kml-viewer`, `/kmz-viewer`, `/fit-viewer`, `/gopro-gps-extract` | SEO pages: content + drop zone → matching parser → hand track to **viewer module**. View-only (except GoPro adds **video view**). Edit → `/gpx-editor`. |

**Menu:** Viewers (GPX, KML, KMZ, FIT, then a More section for GoPro) · Tools (Coordinate converter, Measure distance, Converter).

**Format registry (one place):** parser · exporter · extension/magic detection · landing meta. Adding a format or a convert pair = **config + content only** (no new JS).

---

## Layout (after P7)

```
gpstoolset/
  config/
    site.php  ads.php  tiles.php
    tools.php            ← HTML route registry (landings, meta tools, utilities)
    formats.php          ← format registry: id, extensions, magic, parser, exporter, landing slug…
    guides.php           ← optional; sitemap picks it up if present
  includes/
    bootstrap.php  router.php  seo.php
    layout/              ← head, topbar, footer, close, map-app
    pages/               ← home, privacy, about, not-found
    partials/            ← ads, tile-config, scripts-map, scripts-module, converter-card…
  tools/                 ← .htaccess Require all denied
    gopro-gps-extract/   ← SEO landing + GPMF + video; map → viewer module
    gpx-viewer/ kml-viewer/ kmz-viewer/ fit-viewer/  ← SEO landings only
    gpx-editor/          ← editor meta tool
    convert/             ← converter meta + optional pair content partials
    measure-distance/
    coordinate-converter/
  public/
    index.php  .htaccess  robots.txt  favicon.ico
    assets/
      css/   tokens · base · components · tool-landing · map-shell · (editor/convert as needed)
      js/
        core/     track · format · coords · exporters · ui-state · file-drop · file-handoff · edit · detect…
        map/      tiles · map-shell · graph-dock · track-layer · track-charts · panels
        parsers/  gpmf · gpx · kml · fit · zip
        video/    overlay · sync
        viewer/   app.js (track model only) · landing.js (format pages parse, then hand off)
        editor/   app.js · edit-tools.js · landing.js
        converter/ app.js · landing.js
        tools/    gopro-gps-extract.js · measure-distance.js · coordinate-converter.js
        dropzone.js   home drop → detect → handoff
      vendor/     leaflet · chartjs · gopro/
  docs/
```

**Only `public/` is the document root.**

---

## Request flow

1. Real files under `public/` served as files; missing `assets/…` → plain 404.
2. Else → `public/index.php` → `bootstrap` → `route_dispatch()`.
3. Match `config/tools.php` (and format/convert pair entries):
   - `/sitemap.xml` → generated from registry
   - pair SEO URLs → same convert entry with preselected from/to + pair content
   - no match → 404 (`noindex`)
4. **301s in `.htaccess`:** `/gopro` → `/gopro-gps-extract`; old `/kml-to-gpx`, `/gpx-to-kml`, `/fit-to-gpx` → `/convert/...`; trailing slash; `/index.php` → `/`.

### `config/tools.php` entry

`slug` · `path` · `title` · `description` · `inSitemap` · `entry` · `meta` · `styles` · `flags` (`map`, `video`, `ads`) · optional `module`, `vendorScripts`, `faq`, convert `from`/`to`.

### Format registry

One row per format: id, label, extensions, magic-byte hints, parser module, exporter id(s), landing path, whether writable. Home dropzone + handoff + convert/editor/viewer all read this — no per-format forks in tool apps.

---

## Shared JS

- **Track** (`core/track.js`) — single shape from every parser; `core/edit.js` for editor ops.
- **Detect** — extension + magic → format id (home + handoff).
- **Parsers / exporters** — wired only through the format registry.
- **Generic viewer** (`assets/js/viewer/`) — format-agnostic; track model in → map/charts/controls. Landings parse then hand off. GPX specifics live in `parsers/gpx.js`. GoPro landing uses the same viewer + GPMF + video only.
- **Generic editor** (`assets/js/editor/`) and **converter** (`assets/js/converter/`) — same split: SEO landings (`/gpx-editor`, `/convert/...`) parse then hand the track model to the module. Editor **shares map/chart components** with the viewer. **No duplicated map/chart code anywhere.**
- **Editor** — multi-file import → live preview → edit ops → export any writable format.
- **Convert** — `assets/js/converter/` takes a document and a target format. `/convert` and `/convert/<pair>` parse, then hand the document over.
- **Map / video / ui-state** — unchanged roles; tiles only via `config/tiles.php` + `map/tiles.js`.
- **Persistence:** `gpstoolset.ui.v1`.

### Script loading

Map pages: `scripts-map.php` (tiles → Leaflet → Chart.js → vendorScripts → tool module).  
Document tools (convert, some converters): `scripts-module.php`.

### SEO

`includes/seo.php` — head tags, JSON-LD, FAQ, sitemap from registry (all landings, `/gpx-editor`, `/convert`, each `/convert/<pair>`, utilities). Pair pages are **self-canonical**.

### Hard rules

No email/mailto · no contact · Privacy/About footer only · central tiles · ads none on map tools at launch · no Report-a-map · map-only OSM © · `/gopro-gps-extract` brand-URL exception · never edit FlySync · **never git commit** (Paul).

---

## Add a format (config + content)

1. Register in **format registry** (`config/formats.php`: parser, exporter, detection, landing slug, title, FAQ). `config/tools.php` adds the viewer route from that row.
2. Add `tools/<slug>/content.php` and a short `page.php` that includes the shared format landing. Same viewer module. No new viewer JS.
3. If it needs a convert pair SEO page: add a row in `config/convert.php` and `tools/convert/pairs/<slug>.php`. No new JS.
4. Sitemap picks it up from the registry. Check on `.lan`. Leave uncommitted for Paul.

## Add a non-format tool

Same as before: register → `tools/<slug>/` → optional parser → thin `tools/<slug>.js` → check → Paul commits.

---

## Checklist

- [x] P5a–P5i structure refactor
- [x] P6 small fixes
- [x] **P7** meta tools (generic `viewer/` · `editor/` · `converter/` modules · SEO landings · format registry · 301s)
- Landed: home handoff · format viewers · `/gpx-editor` · `/convert` + pairs · measure · coordinate-converter · GoPro on the shared viewer
- Still open after P7: `/my-coordinates` · `/guides/` + `config/guides.php` · later roadmap in `docs/plan.md`

---

*GPS Toolset Manager · architecture · updated 2026-11-03 Europe/Tallinn · P7 landed*
