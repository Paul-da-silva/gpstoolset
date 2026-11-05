# GPS Toolset · Migration baselines

Local-only migration onto shared `core/` (core-ref **1.1.3-draft**).  
**Phases 0–5** run against `http://gpstoolset.lan/` only.  
**Phase 6** (production deploy + curl suite) is separate and must not start until Phase 5 local match.

Paul commits between phases. Agents never commit, push, or deploy.

Hard rules: `.cursor/rules/00`–`07` (reinstall via standards `install-rules.sh`) and product `10-gpstoolset.mdc`.

## Artefacts

| File | Role |
|---|---|
| `crawl-baseline.php` | Reusable crawler (registry paths + sitemap + robots + 404 + required 301s) |
| `baseline-gpstoolset.tsv` | Phase 0 golden HTML/XML/txt fingerprints |
| `baseline-gpstoolset-redirects.tsv` | Required legacy 301s |
| `baseline-gpstoolset-meta.txt` | Sitemap loc count, robots Sitemap line, norm notes |
| `recheck-phaseN.tsv` | Full re-run after each later local phase — diff vs baseline |
| `prod-check-YYYYMMDD.tsv` | Phase 6 production curl suite results |

## Re-run (Phases 1–5)

```bash
php docs/migration/crawl-baseline.php docs/migration/recheck-phaseN.tsv
diff -u docs/migration/baseline-gpstoolset.tsv docs/migration/recheck-phaseN.tsv
diff -u docs/migration/baseline-gpstoolset-redirects.tsv docs/migration/recheck-phaseN-redirects.tsv
```

Expect empty diffs on recorded fields.

## Body normalisation (`body_sha256_norm`)

Applied before hashing HTML/XML/txt bodies:

1. Strip HTML comments (`<!-- … -->`) — guards against build/cache stamps.
2. CRLF → LF.
3. Trim trailing spaces/tabs on each line.

No CSRF tokens or per-request timestamps expected in this app today. If a later change injects dynamic bits, extend normalisation here **and** document it before re-baselining.

## Phase status

| Phase | Local baseline vs Phase 0 |
|---|---|
| 0 | Golden artefacts committed |
| 1 | `recheck-phase1.tsv` — **MATCH** (core + Composer + `plan()` fallthrough) |
| 2 | `recheck-phase2.tsv` — **MATCH** (registry routes + thin controllers) |
| 3 | `recheck-phase3.tsv` — **MATCH** (env.php / BASE_URL + GPS_BASE_URL alias) |
| 4 | `recheck-phase4.tsv` — **MATCH** (shared rules install + docs scrub) |
| 5 | `recheck-phase5.tsv` — **MATCH** (final local verify) |
| 6 | prod only — ready when Paul deploys |

## Phase 0 snapshot (2026-11-05)

- **27** registry HTML paths, all HTTP 200; canonical host `http://gpstoolset.lan`.
- `/sitemap.xml` — 200, `application/xml; charset=UTF-8`, **27** `<loc>`.
- `/robots.txt` — 200, `text/plain`; Sitemap line is **`https://gpstoolset.com/sitemap.xml`** (static file under `public/`; pre-existing, not invented).
- Fake `/__kuiper_baseline_missing__` — 404, `noindex`, title `Page not found · GPS Toolset` (probe path fixed in Phase 0 baseline; do not rename).
- Legacy 301s: `/gopro`, `/kml-to-gpx`, `/gpx-to-kml`, `/fit-to-gpx`, trailing-slash `/privacy/` `/about/`, `/index.php` → `/`.
- No `ads.txt` — do not invent one.

## Env / BASE_URL (Phases 3 + 6)

- **Committed:** `config/env.example.php` (same keys, fake/local sample values).
- **Local (gitignored):** `config/env.php` — `APP_ENV=dev`, `BASE_URL=http://gpstoolset.lan`, `STRICT_ERRORS=0`, `TRUST_CF_CONNECTING_IP=false`. www-data must be able to read it (`chmod 644` locally is fine with no secrets; prefer `chmod 640` + `chgrp www-data` when you can sudo).
- **App code:** `site_base_origin()` / `base_url()` read `Env::get('BASE_URL')` via `core/Env.php` only — no direct `getenv('GPS_BASE_URL')` / `$_SERVER['GPS_BASE_URL']` in app code.
- **Core alias (keep until Phase 6):** if `BASE_URL` is unset, `Env::get('BASE_URL')` returns `GPS_BASE_URL` from server env / getenv / env.php. Do not remove the alias in `core/Env.php`.
- **Production (Phase 6, pre-deploy — not committed env.php):** set `BASE_URL=https://gpstoolset.com`, `APP_ENV=prod`, `STRICT_ERRORS=0` (or omit). Optionally keep `GPS_BASE_URL=https://gpstoolset.com` as belt-and-suspenders. Do not rely on `.lan` values on prod.

## Phase 6 prod checklist (summary)

1. Pre-deploy on prod host: `BASE_URL=https://gpstoolset.com`, `APP_ENV=prod`, readable env source.
2. Deploy Phase 5-tagged tree; DocumentRoot stays `public/`.
3. Curl all 27 HTML URLs + sitemap (27 locs on prod host) + robots + legacy 301s + fake 404.
4. Record `docs/migration/prod-check-YYYYMMDD.tsv`. Rollback previous tag / revert if any check fails.

## Gates

1. Nothing deploys until Phase 5 local baseline matches Phase 0.
2. Phase 6 records `prod-check-YYYYMMDD.tsv` against `https://gpstoolset.com`.
3. Rollback: previous git tag / revert pilot commits; DocumentRoot stays `public/`.
