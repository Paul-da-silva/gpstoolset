<!-- Source of truth: this file in-repo under docs/. -->

# GPS Toolset docs

**Source of truth:** this repo’s `docs/`.

Local: http://gpstoolset.lan/ · Prod: https://gpstoolset.com

## Index

| File | Purpose |
|------|---------|
| [architecture.md](architecture.md) | Thin product map (modules + registries + shared `core/` shell) |
| [migration/README.md](migration/README.md) | Core migration baselines, env/`BASE_URL`, Phase 6 prod checklist |
| [roadmap.md](roadmap.md) | The plan / to do / done / not doing / ideas / open questions |
| [cursor-prompts.md](cursor-prompts.md) | Cursor prompts (P5–P6 done · P7 landed) |
| [guides-brief.md](guides-brief.md) | SEO first-guides brief (Wave A/B) |
| [design-direction.md](design-direction.md) | UX / tokens / `gpstoolset.ui.v1` |
| [seo-keywords.md](seo-keywords.md) | SEO keywords (Planner data + page map + guides) |

## Hard rules (quick)

Shared baseline: `.cursor/rules/00-*.mdc` … `07-*.mdc`. Product: `10-gpstoolset.mdc`.

- No email / `mailto:` · no contact · Privacy/About footer only
- Thin borders OK · no heavy coloured one-sided accent borders
- Client-side parse only · central tile module · map-only OSM ©
- Brand URL: `/gopro-gps-extract`
- Ads off until traffic
- **Git:** never commit/push/amend — leave uncommitted; Paul commits
- `seo-keywords.md`: Planner runs + raw tables + page map + guides plan (single file).
