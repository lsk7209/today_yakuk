-- 오늘약국: 약국 상세 페이지 인덱싱(노출) 대상 점검 SQL
-- 목적:
-- - "얇은 데이터(주소 없음/전화·영업시간 모두 없음)" 페이지를 noindex+sitemap 제외하는 정책이
--   실제로 얼마나 적용되는지 수치로 확인합니다.
--
-- 인덱싱 기준(앱 코드와 동일한 룰):
-- 1) address가 사실상 비어있으면 제외
-- 2) address가 있어도 (tel 또는 운영시간 중 1개 이상) 없으면 제외
--
-- 참고:
-- - 운영시간은 operating_hours(jsonb)에서 요일별 open/close가 하나라도 있으면 "있음"으로 간주합니다.

-- 1) 전체/인덱싱 가능/제외 대상 집계
with base as (
  select
    hpid,
    name,
    address,
    tel,
    operating_hours,
    -- address 유효성(길이 기반)
    (address is not null and length(btrim(address)) >= 8) as has_address,
    -- 전화 유효성(숫자 8자리 이상)
    (tel is not null and length(regexp_replace(tel, '\D', '', 'g')) >= 8) as has_tel,
    -- 운영시간 유효성(jsonb에서 open/close 하나라도 존재)
    exists (
      select 1
      from jsonb_each(operating_hours) as kv(day, slot)
      where coalesce(slot->>'open', '') <> '' and coalesce(slot->>'close', '') <> ''
    ) as has_hours
  from pharmacies
)
select
  count(*) as total_pharmacies,
  count(*) filter (where has_address and (has_tel or has_hours)) as indexable_count,
  count(*) filter (where not (has_address and (has_tel or has_hours))) as noindex_count,
  round(
    100.0 * count(*) filter (where not (has_address and (has_tel or has_hours))) / nullif(count(*), 0),
    2
  ) as noindex_ratio_percent
from base;

-- 2) noindex 사유 분해 (주소 없음 vs 주소는 있으나 전화/영업시간 둘 다 없음)
with base as (
  select
    hpid,
    name,
    address,
    tel,
    operating_hours,
    (address is not null and length(btrim(address)) >= 8) as has_address,
    (tel is not null and length(regexp_replace(tel, '\D', '', 'g')) >= 8) as has_tel,
    exists (
      select 1
      from jsonb_each(operating_hours) as kv(day, slot)
      where coalesce(slot->>'open', '') <> '' and coalesce(slot->>'close', '') <> ''
    ) as has_hours
  from pharmacies
)
select
  count(*) filter (where not has_address) as reason_missing_address,
  count(*) filter (where has_address and not has_tel and not has_hours) as reason_missing_tel_and_hours
from base;

-- 3) noindex 대상 샘플 50개 (원인 라벨 포함)
with base as (
  select
    hpid,
    name,
    address,
    tel,
    operating_hours,
    (address is not null and length(btrim(address)) >= 8) as has_address,
    (tel is not null and length(regexp_replace(tel, '\D', '', 'g')) >= 8) as has_tel,
    exists (
      select 1
      from jsonb_each(operating_hours) as kv(day, slot)
      where coalesce(slot->>'open', '') <> '' and coalesce(slot->>'close', '') <> ''
    ) as has_hours
  from pharmacies
)
select
  hpid,
  name,
  address,
  tel,
  case
    when not has_address then '주소 없음/부실'
    when has_address and not has_tel and not has_hours then '전화·영업시간 모두 없음'
    else '기타'
  end as noindex_reason
from base
where not (has_address and (has_tel or has_hours))
order by hpid asc
limit 50;


