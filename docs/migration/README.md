# GPS Toolset · Migration baselines

Local-only migration onto shared `core/` (core-ref **1.1.3-draft**).  
**Phases 0–5** run against `http://gpstoolset.lan/` only.  
**Phase 6** (production deploy + curl suite) is separate and must not start until Phase 5 local match.

Paul commits between phases. Agents never commit, push, or deploy.

## Artefacts

| File | Role |
|---|---|
| `crawl-baseline.php` | Reusable crawler (registry paths + sitemap + robots + 404 + required 301s) |
| `baseline-gpstoolset.tsv` | Phase 0 golden HTML/XML/txt fingerprints |
| `baseline-gpstoolset-redirects.tsv` | Required legacy 301s |
| `baseline-gpstoolset-meta.txt` | Sitemap loc count, robots Sitemap line, norm notes |
| `recheck-phaseN.tsv` | Full re-run after each later local phase — diff vs baseline |

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

## Phase 0 snapshot (2026-11-05)

- **27** registry HTML paths, all HTTP 200; canonical host `http://gpstoolset.lan`.
- `/sitemap.xml` — 200, `application/xml; charset=UTF-8`, **27** `<loc>`.
- `/robots.txt` — 200, `text/plain`; Sitemap line is **`https://gpstoolset.com/sitemap.xml`** (static file under `public/`; pre-existing, not invented).
- Fake `/__kuiper_baseline_missing__` — 404, `noindex`, title `Page not found · GPS Toolset`.
- Legacy 301s: `/gopro`, `/kml-to-gpx`, `/gpx-to-kml`, `/fit-to-gpx`, trailing-slash `/privacy/` `/about/`, `/index.php` → `/`.
- No `ads.txt` — do not invent one.

## Env / BASE_URL (Phases 3 + 6)

- Local (Phase 3): `config/env.php` (gitignored) sets `APP_ENV=dev`, `BASE_URL=http://gpstoolset.lan`, `STRICT_ERRORS=0`.
- App code reads `Env::get('BASE_URL')`. Core keeps a temporary alias: if `BASE_URL` is unset, `GPS_BASE_URL` is returned.
- Production (Phase 6, pre-deploy): set `BASE_URL=https://gpstoolset.com` and `APP_ENV=prod`. Optionally keep `GPS_BASE_URL` as belt-and-suspenders until confirmed. Do not rely on `.lan` values on prod.

## Gates

1. Nothing deploys until Phase 5 local baseline matches Phase 0.
2. Phase 6 records `prod-check-YYYYMMDD.tsv` against `https://gpstoolset.com`.
3. Rollback: previous git tag / revert pilot commits; DocumentRoot stays `public/`.
