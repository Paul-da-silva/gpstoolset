# GPS Toolset docs

**Source of truth:** this folder (`/var/www/gpstoolset/docs/`) is the project source of truth going forward. Older copies under `/workspace/gpstoolset/` or `/workspace/core/` are working scratch and may lag.

Local site: http://gpstoolset.lan/ → `public/`  
Prod: https://gpstoolset.com

## Index

| File | Purpose |
|------|---------|
| [plan.md](plan.md) | Site plan: stack, tools, guides, rollout, hard rules |
| [cursor-prompts.md](cursor-prompts.md) | Copy-paste Cursor prompts (P1 done · P1b · P2 · P3) |
| [design-direction.md](design-direction.md) | Design & UX handoff (full-screen map, dock, tokens) |
| [seo-keywords.md](seo-keywords.md) | Guides + tool page keyword notes |

## Hard rules (quick)

- No email / `mailto:` anywhere; no contact page
- Thin neutral borders OK; **no heavy coloured one-sided accent borders**
- Client-side parse only — never upload user files
- OSM tiles only via the central tile module; keep “Report a map issue”
- Never mention FlySight; never “Telemetry Extractor”; GoPro/DJI = compatibility wording only (`/gopro` URL is the one brand-in-URL exception)
- Cursor project rules: `.cursor/rules/`
