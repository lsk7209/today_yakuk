# Project Operating Notes

## API Data Content Follow-Up

- At the start of a Codex work session in this project, ask whether to check for newly collected public API data and add content enrichment/generation work from that data.
- Before ending a Codex work session in this project, if API ingestion, DB sync, SEO, or content work was touched, ask whether to check for newly collected API data and add follow-up content enrichment/generation.
- Use this Korean prompt:
  - `신규 수집한 API 데이터가 있는지 확인하고, 새 데이터 기반으로 콘텐츠 보완/생성 작업을 추가할까요?`
- Intended workflow: public API data is collected on a schedule, stored in the DB, then transformed into user-facing SEO-friendly content.
- Do not run production DB writes or live content publishing solely from this reminder. Treat those as explicit execution steps that need clear user direction.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
