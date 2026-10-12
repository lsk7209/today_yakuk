"""Create synthetic staging SQLite only; never connects to Turso or runs jobs."""
import json
from pathlib import Path
import re
import sqlite3

ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / '.migration-data' / 'todaypharm.sqlite'


def create_fixture(target=TARGET):
    if target.resolve() != TARGET.resolve():
        raise ValueError('Fixture target must be the dedicated staging path')
    if target.exists():
        raise FileExistsError('Existing fixture preserved; inspect before rebuilding')
    target.parent.mkdir(parents=True, exist_ok=True)
    source = (ROOT / 'scripts' / 'init-turso-schema.mjs').read_text(encoding='utf-8')
    uuid = re.search(r'const UUID_DEFAULT = `([^`]+)`;', source).group(1)
    block = source.split('const STATEMENTS = [', 1)[1].split('];', 1)[0]
    statements = re.findall(r'`([^`]+)`', block)
    with sqlite3.connect(target) as db:
        for statement in statements:
            statement = statement.replace('${UUID_DEFAULT}', uuid)
            if not statement.strip().startswith(('CREATE TABLE ', 'CREATE INDEX ')):
                raise ValueError('Only existing CREATE schema statements are allowed')
            db.execute(statement)
        hours = json.dumps({day: {'open': '0000', 'close': '2359'}
                            for day in ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun', 'holiday']})
        for i, (lat, lon) in enumerate([(37.5665,126.9780), (37.5690,126.9790),
                                       (37.5720,126.9810), (37.6010,126.9850),
                                       (37.6200,126.9900), (37.6500,127.0010)], 1):
            db.execute('''INSERT INTO pharmacies
                (id,hpid,name,address,tel,latitude,longitude,operating_hours,
                 province,city,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)''',
                (f'fixture-pharmacy-{i}', f'STAGING{i:04d}', f'예시 약국 {i}',
                 f'서울특별시 중구 시험 주소 {i}', '02-1234-5678', lat, lon,
                 hours, '서울특별시', '중구', '2026-01-01 00:00:00'))
        db.execute('''INSERT INTO supplements
            (id,product_report_no,name,manufacturer,nutrition_facts,tags,created_at)
            VALUES (?,?,?,?,?,?,?)''', ('10000000-0000-4000-8000-000000000001','FIXTURE0001',
            '시험용 비타민 정보', '시험 환경', '[]', '["vitamin-c"]', '2026-01-01 00:00:00'))
        db.execute('''INSERT INTO medicines
            (id,item_seq,name,manufacturer,efficacy,use_method,created_at,updated_at)
            VALUES (?,?,?,?,?,?,?,?)''', ('20000000-0000-4000-8000-000000000001','FIXTURE0001',
            '시험용 의약품 정보', '시험 환경', '시험용 데이터이며 실제 의약품이 아닙니다.',
            '시험 환경·예시 데이터', '2026-01-01 00:00:00', '2026-01-01 00:00:00'))
        db.execute('''INSERT INTO ingredients (id,name,slug,summary,tags,created_at)
            VALUES (?,?,?,?,?,?)''', ('30000000-0000-4000-8000-000000000001','시험용 성분',
            'fixture-ingredient', '시험 환경·예시 데이터', '[]', '2026-01-01 00:00:00'))
        db.execute('''INSERT INTO content_queue
            (id,title,slug,theme,content_html,ai_summary,status,publish_at,published_at,updated_at)
            VALUES (?,?,?,?,?,?,?,?,?,?)''', ('fixture-blog-1','비공개 시험 페이지',
            'migration-fixture','blog','<p>시험 환경·예시 데이터. 실제 게시물이 아닙니다.</p>',
            '비공개 시험용 글', 'published', '2026-01-01 00:00:00',
            '2026-01-01 00:00:00', '2026-01-01 00:00:00'))
        db.commit()
        assert db.execute('PRAGMA integrity_check').fetchone()[0] == 'ok'
        counts = {table: db.execute(f'SELECT COUNT(*) FROM {table}').fetchone()[0]
                  for table in ['pharmacies','supplements','medicines','ingredients','content_queue']}
    print(json.dumps({'fixture_only': True, 'counts': counts}))


if __name__ == '__main__':
    create_fixture()
