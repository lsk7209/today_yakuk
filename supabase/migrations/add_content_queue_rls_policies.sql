-- 콘텐츠 큐 테이블에 RLS 정책 추가
-- 문제: content_queue 테이블에 RLS 정책이 없어 DELETE 작업이 차단됨

-- 1. RLS 활성화 (이미 활성화되어 있을 수 있으므로 IF NOT EXISTS 분기는 없지만 safe함)
alter table content_queue enable row level security;

-- 2. 익명 사용자: published 콘텐츠만 조회 가능
create policy "Public can view published content"
  on content_queue for select
  to anon
  using (status = 'published');

-- 3. 인증된 사용자: 모든 작업 가능 (SELECT, INSERT, UPDATE, DELETE)
create policy "Authenticated users can manage all content"
  on content_queue for all
  to authenticated
  using (true)
  with check (true);

-- [선택사항] 더 엄격한 관리자 정책으로 변경하려면:
-- create policy "Admin users can manage all content"
--   on content_queue for all
--   to authenticated
--   using (
--     auth.jwt() ->> 'email' = 'YOUR_ADMIN_EMAIL@example.com'
--   )
--   with check (
--     auth.jwt() ->> 'email' = 'YOUR_ADMIN_EMAIL@example.com'
--   );
