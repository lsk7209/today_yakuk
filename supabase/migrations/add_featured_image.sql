-- 블로그 글에 대표 이미지 경로를 저장할 컬럼 추가
ALTER TABLE content_queue 
ADD COLUMN IF NOT EXISTS featured_image TEXT;

COMMENT ON COLUMN content_queue.featured_image IS 'AI 생성 대표 이미지 경로 (예: /blog-images/slug.png)';
