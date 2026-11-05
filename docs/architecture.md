<!-- Source of truth: this file in-repo under docs/. -->

# GPS Toolset · Architecture

**Status:** thin product map (trimmed 2026-11-05). Must/never live in `.cursor/rules/00–07` and `10-gpstoolset.mdc`.  
**Local:** http://gpstoolset.lan/ · **Prod:** https://gpstoolset.com · **Repo:** this repo

## What it is

Browser-side GPS file tools (no uploads). Three **generic modules** plus SEO landings that parse a file and hand a shared **track model** to the module:

| Module | Path | SEO landings hand off from |
|---|---|---|
| Viewer | `public/assets/js/viewer/` | `/gpx-viewer`, `/kml-viewer`, `/kmz-viewer`, `/fit-viewer`, `/gopro-gps-extract` (map); GoPro also has a Video view |
| Editor | `public/assets/js/editor/` | `/gpx-editor` |
| Converter | `public/assets/js/converter/` | `/convert`, `/convert/<pair>` |

**Menu:** Viewers (GPX · KML · KMZ · FIT · More → GoPro) · Tools (Coordinate converter · Measure distance · Antipodes · Converter).

**Registries (one place each):**

- `config/formats.php` — parser, exporter, detection, landing meta
- `config/tools.php` — HTML routes / meta
- `config/convert.php` — SEO convert pairs
- `config/guides.php` — `/guides/<slug>`

Adding a **format** or convert pair = **config + content only** (no new viewer/editor/converter JS). Details and non-negotiables: `10-gpstoolset.mdc`.

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
| Roadmap | `docs/roadmap.md` |
| Keywords | `docs/seo-keywords.md` |
| Guides brief | `docs/guides-brief.md` |
| Design notes | `docs/design-direction.md` |

## Request sketch

`public/` files served as files → else `public/index.php` → bootstrap → `includes/router.php` matches registries → layout/partials. Legacy convert URLs and `/gopro` 301 in `.htaccess`.

---

*Trimmed 2026-11-05 · former long layout dump removed; see git history if needed*
