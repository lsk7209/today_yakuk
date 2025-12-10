-- 콘텐츠 발행 큐 테이블
create table if not exists content_queue (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  region text,
  theme text,
  content_html text,
  status text not null default 'pending', -- pending | published | failed
  publish_at timestamp with time zone not null default now(),
  published_at timestamp with time zone,
  updated_at timestamp with time zone not null default now()
);

comment on table content_queue is '발행 대기/완료 콘텐츠 큐';
comment on column content_queue.slug is '고유 슬러그';
comment on column content_queue.status is 'pending/published/failed';

create index if not exists content_queue_status_publish_idx
  on content_queue (status, publish_at);

create index if not exists content_queue_slug_idx
  on content_queue (slug);


