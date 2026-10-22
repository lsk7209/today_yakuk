# URL·공개·색인·광고·검수 정책

## 독립 상태

| 축 | 값 | 의미 |
|---|---|---|
| publication | published/draft/quarantined/retired/merged | 익명 사용자가 원문을 받을 수 있는가 |
| index | index/noindex | 공개 문서를 검색 색인 후보로 제시하는가 |
| ads | true/false | 페이지 수준 광고 적격 후보인가 |
| review | unreviewed/needs_review/verified | 사람 검수와 현재 content hash가 일치하는가 |

`noindex`는 접근 제어가 아니다. 비공개 원문은 직접 URL, 공개 API, RSS/feed, sitemap, 목록, 관련글에서 모두 제외한다. merged만 검증된 대체 URL로 영구 redirect하며, retired는 404/410을 사용한다.

## 호환 규칙

- 기존 `status=published` 레코드는 additive backfill 전에도 공개/index 상태를 유지한다.
- 레거시 공개 글은 `unreviewed`, 광고 OFF로 해석한다. 공개 보존과 광고 적격은 별개다.
- 신규 레코드는 draft/noindex/ads OFF/needs_review/source_count 0이 기본이다.
- 검수 뒤 본문 hash가 바뀌면 광고 적격을 잃고 재검수 대상으로 본다.
- 운영 상태 변경은 manifest의 원문 hash와 before-state가 모두 일치해야 한다.

## 광고

- `google-adsense-account` meta/publisher 식별은 보존한다.
- `NEXT_PUBLIC_ADSENSE_SERVING_ENABLED=true`일 때만 AdSense script/slot 요청을 만든다.
- `NEXT_PUBLIC_AFFILIATE_ADS_ENABLED=true`일 때만 제휴 배너/측정 script를 만든다.
- 두 플래그는 기본 false이며 서로 독립이다.
- admin, API, nearby, pharmacy, wiki, contact, privacy, terms는 공통 제외다.
- 블로그도 콘텐츠가 `verified + ads_eligible + current hash`인 경우에만 장기적으로 적격으로 올린다. 현재 정적 슬롯은 전체 serving flag가 false라 요청되지 않는다.
- Auto ads의 계정측 URL 제외는 코드로 검증할 수 없으므로 운영자 확인 항목이다. 광고를 직접 클릭하거나 가짜 트래픽을 만들지 않는다.

## sitemap/canonical/robots

- sitemap은 public + index + 정상 canonical만 포함한다.
- noindex 페이지를 robots로 동시에 차단하지 않는다.
- 검색/필터/관리/API/미리보기/오류/redirect URL은 sitemap에서 제외한다.
- lastmod는 의미 있는 원문/데이터 수정일만 사용한다.
- 현재 위키·약국 대량 정책은 dry-run inventory로만 제안됐고 운영 sitemap 전환은 승인 대기다.

