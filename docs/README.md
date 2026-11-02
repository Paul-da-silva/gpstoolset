<!-- Source of truth: this file in /var/www/gpstoolset/docs/ (repo). -->

# GPS Toolset docs

**Source of truth:** this folder (`/var/www/gpstoolset/docs/`). Older `/workspace` copies may lag unless mirrored.

Local: http://gpstoolset.lan/ → `public/` · Prod: https://gpstoolset.com

## Index

| File | Purpose |
|------|---------|
| [plan.md](plan.md) | Site plan: stack, tools, guides, rollout, hard rules |
| [cursor-prompts.md](cursor-prompts.md) | Copy-paste Cursor prompts (next: **P4**) |
| [design-direction.md](design-direction.md) | Design & UX (map shell, video overlay view, tokens) |
| [seo-keywords.md](seo-keywords.md) | Guides + tool page keyword notes |

## Hard rules (quick)

- No email / `mailto:`; no contact page
- Privacy/About links **footer only**
- Thin neutral borders OK; **no heavy coloured one-sided accent borders**
- Client-side parse only — never upload user files
- OSM tiles only via the central tile module; **attribution on the map only** (no © OSM in footer; no “Report a map issue”)
- Never mention FlySight; never “Telemetry Extractor”; GoPro/DJI = compatibility wording only
- Brand-in-URL exception: **`/gopro-gps-extract`**
- **Git:** never commit/push/amend — leave changes uncommitted; Paul commits
- Cursor rules: `.cursor/rules/`
