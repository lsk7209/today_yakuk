-- 콘텐츠 발행 큐 테이블
create table if not exists content_queue (
  id uuid primary key default gen_random_uuid(),
  hpid text, -- 약국 상세 페이지와 매핑할 경우 사용
  title text not null,
  slug text not null unique,
  region text,
  theme text,
  content_html text, -- 전체 HTML 또는 MD
  ai_summary text, -- 짧은 요약 (2~4문장)
  ai_bullets jsonb, -- 불릿 리스트 배열
  ai_faq jsonb, -- [{question, answer}]
  ai_cta text, -- CTA 문구
  extra_sections jsonb, -- 추가 섹션 배열 [{title, body}]
  status text not null default 'pending', -- pending | review | published | failed
  publish_at timestamp with time zone not null default now(),
  published_at timestamp with time zone,
  updated_at timestamp with time zone not null default now()
);

comment on table content_queue is '발행 대기/완료 콘텐츠 큐';
comment on column content_queue.slug is '고유 슬러그';
comment on column content_queue.status is 'pending/review/published/failed';

create index if not exists content_queue_status_publish_idx
  on content_queue (status, publish_at);

create index if not exists content_queue_slug_idx
  on content_queue (slug);

create index if not exists content_queue_hpid_idx
  on content_queue (hpid);


