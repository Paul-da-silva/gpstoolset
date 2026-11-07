<!-- Source of truth: this file in-repo under docs/. -->

# GPS Toolset · Architecture

**Status:** thin product map (trimmed 2026-11-05). Must/never live in `.cursor/rules/00–07` and `10-gpstoolset.mdc`.  
**Local:** http://gpstoolset.lan/ · **Prod:** https://gpstoolset.com · **Repo:** this repo

## What it is

Browser-side GPS file tools (no uploads). Three **generic modules** plus SEO landings that parse a file and hand a shared **track model** to the module:

| Module | Path | SEO landings hand off from |
|---|---|---|
| Viewer | `public/assets/js/viewer/` | `/gpx-viewer`, `/kml-viewer`, `/kmz-viewer`, `/fit-viewer`, `/ubx-viewer`, `/gopro-gps-extract` (map); Map \| 3D via `map/track-3d.js` + `map/view-switch.js`; GoPro adds Video |
| Editor | `public/assets/js/editor/` | `/gpx-editor` |
| Converter | `public/assets/js/converter/` | `/convert`, `/convert/<pair>` |

**Menu:** Viewers (GPX · KML · KMZ · FIT · UBX · More → GoPro) · Tools (Coordinate converter · Measure distance · Antipodes · Converter).

**Formats:** GPX · KML · KMZ · FIT · UBX (read-only; `parsers/ubx.js` scans `B5 62` frames, NAV-PVT / NAV-POSLLH). Detection magic types in `detect.js`: `xml-root`, `zip`, `ascii`, `ubx-frame`.

**Registries (one place each):**

- `config/formats.php` — parser, exporter, detection, landing meta
- `config/tools.php` — HTML routes / meta
- `config/convert.php` — SEO convert pairs
- `config/guides.php` — `/guides/<slug>`

Adding a **format** or convert pair = **config + content only** (no new viewer/editor/converter JS). Details and non-negotiables: `10-gpstoolset.mdc`.

## Shared PHP shell (core-ref 1.1.3-draft)

| Piece | Role |
|---|---|
| `core/` | Shared Router, Controller, App, Env, ErrorHandler (copy-in) |
| `composer.json` | PSR-4 autoload for `core/` and `controllers/` (see file) |
| `config/routes.php` | Built from `tools_registry()`; `auto_route=false`; `404_override=errors/index` |
| `config/env.php` | Gitignored secrets / `BASE_URL` / `APP_ENV` (see `env.example.php`) |
| `controllers/` | Thin wrappers → existing `includes/pages/*` and `tools/*/page.php` |
| `docs/migration/` | Local baseline + rechecks; Phase 6 prod checklist |

`public/index.php` boots Env → ErrorHandler → App → `Router::plan()`; listed routes dispatch to controllers; unknown paths still fall through to legacy helpers where needed.

**Phase 6 (prod):** set `BASE_URL=https://gpstoolset.com` and `APP_ENV=prod` on the host before deploy; curl suite against production; rollback = previous tag / revert. Details: `docs/migration/README.md`.

## Pointers

| Need | Where |
|---|---|
| Folders, env, router target | `04-tree.mdc` |
| PHP / views | `03-php.mdc` |
| CSS tokens / borders | `02-design.mdc` |
| JS modules / analytics / motion | `01-frontend.mdc` |
| SEO / sitemap | `05-seo.mdc` |
| Ads hold | `06-ads-consent.mdc` |
| Product + map shell + brand | `10-gpstoolset.mdc` |
| Migration baselines / Phase 6 | `docs/migration/README.md` |
| Roadmap | `docs/roadmap.md` |
| Keywords | `docs/seo-keywords.md` |
| Guides brief | `docs/guides-brief.md` |
| Design notes | `docs/design-direction.md` |

## Request sketch

`public/` files served as files → else `public/index.php` → shared Router (registry routes) → thin controller → existing page/tool entry under `includes/` or `tools/`. Legacy convert URLs and `/gopro` 301 in `.htaccess`. Generated `/sitemap.xml` via `seo_sitemap_xml()`.

---

*Trimmed 2026-11-05 · shell rows added after core migration · former long layout dump in git history*
