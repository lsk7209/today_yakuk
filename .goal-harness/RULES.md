# RULES

1. Do not declare completion without tests or equivalent validation.
2. Do not break existing working behavior.
3. Do not make unrequested broad rewrites.
4. Do not leave temporary code, dummy logic, or TODO-only work as final.
5. Do not expose `.env`, API keys, tokens, credentials, or secrets.
6. Do not change production DBs, live servers, or deploy targets without explicit approval.
7. Record the reason before adding a production dependency.
8. Record risky deletion, migration, permission, or data-changing operations.
9. Do not hide failed tests.
10. Record changes in `CHANGELOG.md` when present.

## Task-Specific Rules

- API delta/content 글은 활성 Codex 세션에서 직접 작성하며 외부 LLM/API로 본문을 생성하지 않는다.
- 공개 sitemap과 Actions 로그는 읽기 전용 증거로만 사용하고, DB/API 쓰기·workflow dispatch·발행을 하지 않는다.
- 데이터 변화가 없거나 날짜 의미가 불충분하면 새 글을 억지로 만들지 않고 기존 초안 보강 또는 조사 결과 기록으로 종료한다.
- 미승인 콘텐츠 산출물은 `noindex,nofollow`이며 blog registry와 sitemap에 포함하지 않는다.
