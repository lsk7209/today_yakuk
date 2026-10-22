# 작업 상태

| 작업 | 상태 | 근거/다음 단계 |
|---|---|---|
| 저장소/스택/자동화 감사 | 완료 | `AUDIT.md`, 실제 package/workflow/schema 확인 |
| URL 전수 인벤토리 | 완료 | 80,335행(동적 80,295 + 정적 40) `URL_INVENTORY.csv` |
| 신규 API 데이터 델타 | 완료 (2026-09-18) | 기준 79,507건 / 현재 79,686건; 후보 281건 분류 완료; 검증된 신규 약국 19개소 content_queue 등록 완료 (pending 12->31건) |
| 블로그 결정표 | 부분 완료 | 동적 788 + 정적 22 = 810행 자동 후보; 사람 판정 필요 |
| 위험 주장 탐지 | 부분 완료 | 1,729 후보; 원출처/전문 검토 대기 |
| 독립 공개/index/ads/review resolver | 완료 | `src/lib/content-policy.ts` + unit tests |
| 광고 serving/affiliate 분리 | 완료(로컬) | fail-closed flags, 공통 제외 경로, meta 보존 |
| pending 공개 경로 차단 | 완료(로컬) | Hpid 조회/목록/API/sitemap data resolver |
| 자동 발행 검수 gate | 완료(로컬) | schema preflight + verified/source/hash gate |
| 운영시간 경계 계산 | 완료(로컬) | KST/overnight/invalid/holiday-unknown tests; 하드코딩 지역 제거 및 텍스트 하이라이트 안전화 |
| 위키 허위 검수/검출 표현 | 완료(로컬) | 건강기능식품 및 의약품 상세 템플릿 문구 수정 완료 (구매 단정/허위 보증 제거, 안내·상담 중심 개선) |
| sitemap 대량 정책 | 승인 대기 | 운영 영향 분석 후 manifest 필요 |
| 핵심 30편 | 부분 완료 | 30개 매핑, 완료 0/부분 15/초안 5/보류 10 |
| 브라우저/빌드 검증 | 진행 중 | 최종 `VERIFICATION.md`에 기록 |
| 운영 배포/DB/계정 변경 | 승인 대기 | 이번 작업에서 실행 금지 |

다음 우선순위: 운영자 승인 후 깨끗한 최신 원격 checkout에 변경을 이식하고, 운영 스키마 적용 전 사본 검증을 반복한다. 정적 위험 글은 원출처와 전문 검토가 확보된 항목부터 재작성한다.
