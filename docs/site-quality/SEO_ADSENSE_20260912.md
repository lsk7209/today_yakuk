# SEO / AdSense local improvement — 2026-09-12

Applied installed Claude SEO-family `seo`, `site-optimizer`, and `adsense-optimizer` guidance. Existing Next14 dirty checkout and prior editorial protections preserved.

## Implemented
- Explicit ad eligibility now defaults to false. Omitted eligibility no longer enables a global affiliate banner or reusable AdSense loader. Eligible AdSlot callers continue to pass the existing reviewed-content policy. No serving flags or publisher identities changed.
- Sitemap no longer invents per-page modification dates from regeneration time or fixed dates shared by unrelated static pages. Recorded editorial/data timestamps remain; missing DB timestamps stay omitted. URL inventory unchanged (45 static URLs).
- Ingredient detail pages now declare their own canonical; tag pagination declares its own page URL and normalizes invalid page numbers consistently. Admin pages declare noindex/nofollow and drop the inherited home canonical. Robots restrictions remain; directives are not proof of deindexing.
- Regression test demonstrated the default-allow defect before fixing it.

## Validation
- Quality tests: 15/15. Lint/typecheck: passed. Production build: 140/140.
- Runtime: contact/privacy/guide 200 with self canonical and no AdSense loader/affiliate banner; missing route and private draft 404 without ads; static sitemap 200, 45 URLs, no unverified lastmod or private draft references.
- Browser navigation check: 12/12 desktop/mobile tests passed before the final metadata-only additions.
- Public GET sample: robots/ads/sitemap 200; contact/privacy/guide self canonicals; live 404 includes one AdSense loader (actual ad serving unknown).

## Remaining boundaries
Local output differs from live. No push, deploy, DB write, publishing, AdSense submission, account/CMP change, or source-data sync. Existing draft/source-review backlog remains incomplete. GSC selected canonicals, crawler logs, account state, field CWV, actual ad fill and consent applicability unverified. No policy-pass, approval probability or minimum article-count claim.

Google references retrieved 2026-09-12:
- https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap (lastmod reflects significant page modification)
- https://support.google.com/publisherpolicies/answer/11112688 (empty/error screen ad restrictions; loader alone not ad-serving proof)

Artifacts and rollback: `.goal-harness/seo-adsense-20260912/`. Restore only scoped backups after checking subsequent edits. Next: integrate the scoped repairs and prior ad isolation into a clean current-remote checkout under the existing release procedure, then verify before any authorized push.

Final metadata validation: 9 fixture cases passed, final runtime 4/4; final production build140/140 passed after all edits. Missing ingredient omega3 has no DB record: streamed HTTP200 with explicit noindex/nofollow and no canonical. Valid ingredient canonical is fixture-proven only. Spark quota failed; one Luna max retry completed independent review.
