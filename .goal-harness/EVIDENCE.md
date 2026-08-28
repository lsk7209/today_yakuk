# EVIDENCE

## 2026-08-27 repository review

Validation level: Level 3 (production build passed). Level 4 not reached because 5 of 22 E2E tests failed.

| Command | Result | Evidence |
|---|---|---|
| `git clone https://github.com/lsk7209/today_yakuk.git .` | PASS | local `main` at `82f4e44` |
| `git ls-remote origin refs/heads/main` | PASS | remote SHA `82f4e4468bf8553e919fe653825381c1d65289e0` equals local HEAD |
| `npm ci` | PASS | dependencies installed; deprecation warnings present |
| `npm run lint` | PASS | no warnings or errors |
| `npx tsc --noEmit` | PASS | exit 0 |
| `npm run build` | PASS | Next.js compiled and generated 58 static pages; Turso env absent so dummy client used |
| `npx playwright test --list` | PASS | 22 tests discovered |
| first `npx playwright test` | ENV FAILURE | Chromium binary absent; installed with `npx playwright install chromium` |
| second `npx playwright test --reporter=line` | FAIL | 17 passed, 5 failed: desktop header navigation 3, ambiguous wiki locator 2 |
| `npm audit --omit=dev --json` | FAIL | 6 production findings: critical 1, high 4, moderate 1 |
| tracked-secret and credential-pattern scan | PASS WITH NOTES | only `.env.example` tracked; no concrete private key/API token pattern found |

### Failure notes

- `fast-xml-parser@5.3.4` is a direct runtime dependency and the audit reports critical/high XML entity issues; it parses public API XML in `scripts/sync-pharmacies.ts`.
- Playwright navigation assertions for `/about`, `/blog`, `/wiki` remain on `/` in desktop Chromium. The wiki category locator `/전체/` matches two links in both desktop and mobile.
- Unit-test runner is not configured in `package.json`; business/data logic therefore lacks focused unit proof.

## Validation Level

Level: 0

## Commands Run

| Command | Result | Notes |
|---|---|---|
| harness-init.py | PASS | size=large, domain=general, created=2026-08-27T20:36:28+09:00 |

## Test Results

| Test | Result | Notes |
|---|---|---|

## Failed Checks

## Fixes Applied

## Completion Evidence

## 2026-08-27 remediation run (in progress)

| Command | Result | Notes |
|---|---|---|
| `npm run test:unit` | PASS | 9 regression checks: public status, update allowlist, safe highlighting, geo bounds, HFF ownership, XML compatibility, workflows |
| `npm run lint` | PASS | no warnings or errors |
| `npx tsc --noEmit` | PASS | exit 0 |
| `npx playwright test --reporter=line` on port 3100 | PASS | 22/22 desktop and mobile tests |
| `npm audit --omit=dev --json` after parser/transitive updates | PASS | 0 vulnerabilities |
| full `npm audit --json` | OPEN | 6 high: Next 14 toolchain/runtime and no-fix `xlsx`; migration analysis underway |

Fix history: initial E2E baseline was 17/22; navigation wait races and ambiguous category locators were repaired, followed by a 22/22 pass.

## 2026-08-27 remediation completion

Validation level: Level 4 (clean install, production build, focused regressions, isolated desktop/mobile E2E, independent role reviews).

| Command / review | Result | Evidence |
|---|---|---|
| `npm ci` | PASS | 518 packages installed from lock; audit reported 0 vulnerabilities |
| `npm run lint` | PASS | ESLint flat config, no warnings or errors |
| `npx tsc --noEmit` | PASS | Next.js application and generated route contracts |
| `npx tsc --noEmit --project tsconfig.sync.json` | PASS | ingestion/generation scripts compile |
| `npm run test:unit` | PASS | 11 focused checks including route 400s, stored XSS, JSON-LD breakout, data ownership and workflow failure contracts |
| `npm audit --json` | PASS | critical/high/moderate/low total 0 |
| workflow YAML parse | PASS | every `.github/workflows/*.yml` parsed with PyYAML |
| `git diff --check` | PASS | no whitespace errors; Windows line-ending notices only |
| `npm run build` | PASS | Next.js 16.3.3 compiled and generated 56 routes/static outputs without the deprecated Edge warning |
| `npx playwright test --reporter=line` on port 3105 | PASS | 22/22 desktop and mobile; Turso credentials blanked and all non-local browser requests blocked |
| Terra test review | PASS WITH MEDIUM NOTES | BLOCKER/HIGH 0; requested route tests and E2E isolation were implemented |
| Sol reliability/security review | PASS WITH MEDIUM RESIDUALS | BLOCKER/HIGH 0 after stored-XSS, JSON-LD, Actions injection, HTTPS and failure-propagation repairs |
| `git rev-parse HEAD` and `git ls-remote origin refs/heads/main` | PASS | both `82f4e4468bf8553e919fe653825381c1d65289e0`; no commit/push/deploy |

### Repair notes

- Next.js/ESLint/fast-xml-parser and transitive dependencies were upgraded; the unused vulnerable `xlsx` dependency and its machine-specific orphan script were removed.
- ESLint 10.9.1 was tested but rejected because Next 16.3.3's bundled React plugins still require ESLint 9 APIs; compatible ESLint 9.39.5 remains with audit 0.
- An initial full E2E rerun exposed a real affiliate-script hydration mismatch (21/22). `next/script` after-interactive loading fixed it, and the final isolated suite passed 22/22.
- No production DB write, content publication, GitHub Actions dispatch, Vercel operation, commit, push, or deployment was performed.

## 2026-08-27 data-to-content pass

Validation level: Level 4 for local code/content and public read-only evidence. Direct current production DB values remain out of scope because no credential was available.

| Command / review | Result | Evidence |
|---|---|---|
| Goal Harness reset for data-to-content objective | PASS | active goal and five-step plan created |
| Risk boundary | PASS | `.env.local` values suppressed; DB limited to PRAGMA/SELECT; no external writes authorized |
| local/process credential presence check | BOUNDARY | no `.env.local` and no usable Turso/Supabase DB variables; no secret value printed and no DB connection attempted |
| `gh run view 32662024573 --log` | PASS | 2026-08-23 run: pre-sync counts content_queue 781, medicines 4,931, pharmacies 25,959, supplements 47,029; HFF source/processed 45,720; medicine source/processed 4,765 |
| `gh run view 33016179844 --log` and `32889652029` | PASS | pharmacy source totals 25,295 and 25,291; +4 is a source-response delta, not proof of four openings |
| `gh run view 33027321710 --log` | FINDING RECORDED | missing-nutrition selection attempted 15 supplements; success 0, no-data 0, errors 15 due port-80 connect timeout; local code already changes HTTPS and nonzero failure but is unpushed |
| `npm run audit:data-content -- --since=2026-08-23T19:00:00Z --types=supplements,medicines --candidate-limit=3 --json` | PASS | same-origin public sitemap: 989 supplement and 25 medicine routes since cutoff; six sample loc/lastmod values frozen in manifest |
| `npm run audit:content-duplicates -- --slug=data-update-2026-08 --title=... --delay-ms=100` | PASS | target match 0 across 22 other static routes, 306 campaign rows, 712 public blog sitemap entries and 60 rendered listing pages |
| audit fetch boundary | PASS | manual redirects, same-origin HTTPS, XML/HTML content-type, 2-5 MB body caps and required XML roots; redirect/HTML/oversize/bad-lastmod tests added |
| content artifact | PASS | `/blog/data-update-2026-08` reads versioned manifest, includes six verified sample links and claim boundaries, is `noindex,nofollow`, and is excluded from blog registry/sitemap until a real publication time exists |
| data page claim repair | PASS | unsupported pharmacist verification, MFDS certification, additive absence/safety and purchase-availability implications removed |
| broken static links | PASS | `skin-trouble-first-aid-kit` now points to existing `/blog/pharmacy-visit-checklist-3` and `/guide/call-scripts` routes |
| `npm run lint` | PASS | no warnings or errors after final review fixes |
| `npx tsc --noEmit` | PASS | application and JSON manifest imports compile |
| `npx tsc --noEmit --project tsconfig.sync.json` | PASS | audit scripts compile |
| `npm run test:unit` | PASS | 13/13 focused checks, including manifest evidence and malformed sitemap/fetch boundaries |
| `npm run build` | PASS | Next.js 16.3.3 compiled; 57 routes/static outputs including the noindex draft route |
| `npx playwright test tests/e2e/data-update.spec.ts --reporter=line` on 3112 | PASS | 2/2 desktop/mobile; counts, caveat, robots metadata and all six manifest links |
| final `npx playwright test --reporter=line` on 3113 | PASS | 24/24 desktop/mobile with blank Turso variables and blocked non-local browser requests |
| Terra test review | REPAIRED | manifest evidence, complete duplicate coverage, XML root failures and six sample-link assertions added |
| Sol reliability review | REPAIRED | draft publication semantics, causal wording, redirect/content-type/body/root boundaries corrected; BLOCKER/HIGH 0 |
| external mutation boundary | PASS | no DB/API write, workflow dispatch, content publication, commit, push, deployment or Vercel operation |

## 2026-08-28 Search acquisition and conversion pass

| Check | Result | Evidence |
|---|---|---|
| live baseline | PASS WITH BOUNDARIES | home/robots/sitemap responses captured; live region RSC failure reproduced; PageSpeed API returned 429 and no score was inferred |
| runtime sitemap architecture | PASS | request-time dates removed; index and child routes are dynamic; static sitemap 200, invalid id 404, no-DB data child 404 |
| search identity/schema | PASS | canonical/site organization preserved; retired/nonfunctional SearchAction removed from rendered layout and helper contract |
| indexability/canonicals | PASS | pharmacy detail/sitemap share required public fields; region aliases/pagination and invalid wiki states use canonical/noindex/404 controls |
| conversion path | PASS | search, results, detail, contact, directions and content-to-nearby events use typed low-cardinality fields; direct phone CTA added where valid |
| analytics intake | PASS | exact same-origin, strict schema, normalized path/referrer and rate limit; malformed/cross-origin/unknown payload regressions covered |
| YMYL content | PASS | procedural HowTo and unsafe self-medication/alternation guidance removed from reviewed fever/hangover pages; official reference boundaries retained |
| responsive UX | PASS | 390/768/1366 no overflow or console errors; mobile CTAs meet 44px target contract |
| lint/typechecks/unit | PASS | lint; both typechecks; unit 20/20 |
| production build | PASS | Next.js 16.3.3, 55 static outputs, dynamic runtime sitemaps |
| browser suite | PASS | Playwright 28/28 desktop/mobile |
| independent review | PASS | final technical SEO and test/CRO reviewers report BLOCKER/HIGH 0; prior sitemap-freeze HIGH is resolved |
| external mutation boundary | PASS | no production write, commit, Git push, deployment or Vercel action |

## 2026-08-28 API delta/content follow-up

Validation level: Level 4 for local implementation and public read-only evidence. Production DB values and live government API responses were not queried because local credentials were absent.

| Command / review | Result | Evidence |
|---|---|---|
| baseline and public sitemap audit | PASS | cutoff `2026-08-27T12:43:45.502Z`; 82 child sitemaps; pharmacies 25,971, supplements 48,016, medicines 4,952, blog 712; all entries-since-baseline 0 |
| GitHub Actions inspection | PASS WITH FINDING | auto-enrichment run `33079730318` attempted 15 existing rows and logged zero structured nutrients for all; meaningful enrichments/new rows 0; no workflow dispatch |
| durable manifest | PASS | `content/data-audits/2026-08-28.json` records observation time, counts, date semantics, duplicate scope, content decision and mutation boundary |
| duplicate audit | PASS | target match 0 across 23 static routes plus registry, 306 campaigns, 712 public entries and 60 rendered listing pages |
| content artifacts | PASS | monthly noindex draft updated without a false new-data claim; one original noindex label-reading guide with official sources, three sample links, wiki and nearby paths |
| public nutrition trust boundary | PASS | only positive C003-source-marked facts reach product detail, comparison and indexability signals; legacy unmarked facts and `ai_summary` are not public evidence |
| ingestion integrity | PASS | zero facts execute zero DB writes; name-only enrichment jobs fail closed; sync validates HTTP/API/count/identity/facts and returns nonzero on partial results; rotating offset avoids first-page starvation |
| `npm run lint`; both typechecks | PASS | application, scripts and generated route contracts compile |
| `npm run test:unit` | PASS | 22/22 focused tests |
| `npm run build` | PASS | Next.js 16.3.3; 56 generated pages; draft route rendered; sitemap routes dynamic |
| full Playwright | PASS | 30/30 desktop/mobile after repairing analytics readiness race; real guide CTA payload asserted |
| responsive visual check | PASS | desktop/mobile full screenshots; mobile width 375/375; browser console errors/warnings 0 |
| dependency/diff checks | PASS | `npm audit --json` vulnerabilities 0; `git diff --check` whitespace errors 0 |
| independent review | PASS | test-review MEDIUM gaps repaired; reliability reviewer re-review reports no material finding and BLOCKER/HIGH 0 |
| external mutation boundary | PASS | no production DB/API write, publication, workflow dispatch, commit, push, deployment or Vercel action |

## 2026-08-28 Scheduled-content follow-up

Validation level: Level 4 for local behavior and point-in-time public/Actions evidence. The production queue row was not directly selected because no Turso credential was available.

| Command / review | Result | Evidence |
|---|---|---|
| last scheduled evidence | PASS WITH BOUNDARY | Generate Blog run `33111937934` logged the exact title and `2026-09-21T12:00:00.000Z`; current DB status remains unverified |
| scheduler interpretation | REPAIRED/PASS | actual `getNextSlot()` tests prove the observed next slot plus 00/06/12 boundaries; previous +1 minute logic skipped slots immediately after 05:59:59.999 and 23:59:59.999 and was replaced with strict candidate comparison |
| durable schedule manifest | PASS | `content/schedule-audits/2026-08-28.json` records run, UTC/KST, insertion/current-state split, duplicate scope, brief and mutation boundary |
| generation automation | PASS LOCALLY | twice-daily `generate-blog.yml` schedule removed; `workflow_dispatch` retained; existing publish workflow/pending queue unchanged; no remote effect before push |
| duplicate audit | PASS | target match 0 across 24 local static routes plus registry, 306 campaign entries, 712 sitemap entries and 713 rendered entries |
| content artifact | PASS | direct-Codex noindex additives-label guide with three official sources, signal limitations, internal routes and nearby CTA; absent from blog registry/sitemap |
| product-detail explanation | PASS | `AdditiveSignal` links keyword signals to the interpretation guide and rejects absence/safety inference |
| JSON/YAML/lint/typechecks | PASS | both structured files parse; lint and application/script typechecks pass |
| `npm run test:unit` | PASS | 25/25 focused tests, including scheduler boundaries and AdditiveSignal three-state server rendering |
| `npm run build` | PASS | Next.js 16.3.3; 57 generated pages |
| full Playwright | PASS | 32/32 desktop/mobile; draft indexing, sources, links, schema and measured CTA verified |
| independent review | REPAIRED/PASS | initial MEDIUM 2 repaired with actual scheduler calls and AdditiveSignal server renders; re-review reports no residual BLOCKER/HIGH/MEDIUM |
| Git boundary | PASS | `git diff --check` exit 0; local HEAD and `origin/main` both `82f4e4468bf8553e919fe653825381c1d65289e0`; no commit or push |
| external mutation boundary | PASS | no production DB/API write, workflow dispatch, reservation/publication, commit, push, deployment or Vercel operation |

## 2026-08-28 GitHub publication preflight

| Check | Result | Evidence |
|---|---|---|
| base and target | PASS | branch `main`; local HEAD and `origin/main` both `82f4e4468bf8553e919fe653825381c1d65289e0`; ahead/behind 0/0 |
| explicit scope audit | PASS | 122 paths: modified 80, deleted 4, new 38; independent Luna/max review found no unrelated, secret, runtime or large-binary artifact and BLOCKER/HIGH/MEDIUM 0 |
| deletion rationale | PASS | legacy ESLint config, machine-local xlsx enrichment, build-time sitemap and Next middleware are replaced by flat config, safe scripts/runtime sitemap and proxy respectively |
| forbidden path scan | PASS | no `.env*`, credential file, DB, log, report, cache, archive or key path in the release set |
| high-confidence secret scan | PASS | no private-key block or high-confidence GitHub/OpenAI/Slack token pattern in changed files; values were not printed |
| fresh unit/lint | PASS | `npm run test:unit` 25/25; `npm run lint` exit 0 |
| dependency audit | PASS | `npm audit --omit=dev --json`: vulnerabilities 0 |
| workflow syntax | PASS | all `.github/workflows/*.yml` parse successfully with `js-yaml` |
| previously completed runtime proof | PASS | both TypeScript checks, Next.js build 57 routes and Playwright 32/32 desktop/mobile passed on the same source revision before documentation-only release updates |
| deployment boundary | PASS | GitHub commit/push authorized; Vercel, DB writes, workflow dispatch and live content publication remain prohibited |
