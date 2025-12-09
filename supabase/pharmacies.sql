-- Pharmacies table for 오늘약국
create extension if not exists "uuid-ossp";

create table if not exists pharmacies (
  id uuid primary key default gen_random_uuid(),
  hpid text unique not null,
  name text not null,
  address text,
  tel text,
  latitude double precision,
  longitude double precision,
  operating_hours jsonb,
  description_raw text,
  province text,
  city text,
  updated_at timestamp with time zone not null default now()
);

comment on table pharmacies is '전국 약국 기본 정보';
comment on column pharmacies.hpid is '국립중앙의료원 약국 고유 ID';
comment on column pharmacies.operating_hours is '요일별 운영 시간 JSON';
comment on column pharmacies.province is '시/도';
comment on column pharmacies.city is '시/군/구';

create index if not exists pharmacies_hpid_idx on pharmacies (hpid);
create index if not exists pharmacies_lat_lon_idx on pharmacies (latitude, longitude);
create index if not exists pharmacies_region_idx on pharmacies (province, city);

