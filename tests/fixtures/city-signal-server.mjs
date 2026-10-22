// Isolated, synthetic UI fixtures. Never connect this server to a production DB.
import { mkdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createServer } from 'node:http';
import { createClient } from '@libsql/client';
import next from 'next';

const root = resolve('.');
const appRoot = process.env.CITY_SIGNAL_BASELINE_ROOT ? resolve(process.env.CITY_SIGNAL_BASELINE_ROOT) : root;
const port = Number(process.env.CITY_SIGNAL_PORT || 3256);
const artifacts = resolve(root, '.goal-harness/city-signal-20261012/runtime');
await mkdir(artifacts, { recursive: true });
const url = pathToFileURL(resolve(artifacts, 'fixture.sqlite')).href;
if (!url.startsWith('file:')) throw new Error('Local database required');
process.env.TURSO_DATABASE_URL = url;
process.env.TURSO_AUTH_TOKEN = 'local-fixture-only';
process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = '';
const db = createClient({ url });
await db.executeMultiple(await readFile(resolve(root, 'turso-schema.sql'), 'utf8'));
const hours = JSON.stringify(Object.fromEntries(['mon','tue','wed','thu','fri','sat','sun'].map(day => [day, { open: '0000', close: '2359' }])));
const productFixtures = [
  { id: 'd5e1a9f0-1c2d-4a3b-8c4d-00000000c1a1', reportNo: 'CITY-A' },
  { id: 'd5e1a9f0-1c2d-4a3b-8c4d-00000000c1b2', reportNo: 'CITY-B' },
];
const medicineId = 'd5e1a9f0-1c2d-4a3b-8c4d-00000000c1c3';
// Only remove the earlier fixture IDs from this script's local SQLite database.
for (const reportNo of ['CITY-A', 'CITY-B']) {
  await db.execute({ sql: 'DELETE FROM supplements WHERE id = ? AND product_report_no = ?', args: [reportNo, reportNo] });
}
await db.execute({ sql: 'DELETE FROM medicines WHERE id = ? AND item_seq = ?', args: ['CITY-M', 'CITY-M'] });
await db.execute({ sql: `INSERT OR REPLACE INTO pharmacies (hpid,name,address,tel,latitude,longitude,operating_hours,province,city,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)`, args: ['CITY-TEST', '화면검증약국 (테스트)', '서울특별시 강남구 테스트로 1', '02-555-1234', 37.5, 127, hours, '서울특별시', '강남구', '2026-10-12T00:00:00Z'] });
for (const { id, reportNo } of productFixtures) {
  await db.execute({ sql: `INSERT OR REPLACE INTO supplements (id,product_report_no,name,manufacturer,nutrition_facts,additives,tags) VALUES (?,?,?,?,?,?,?)`, args: [id, reportNo, `화면검증 비타민 ${reportNo} (테스트)`, '테스트 제조사', '[]', '{}', '["비타민"]'] });
}
await db.execute({ sql: 'INSERT OR REPLACE INTO medicines (id,item_seq,name,manufacturer,efficacy,use_method) VALUES (?,?,?,?,?,?)', args: [medicineId, 'CITY-M', '화면검증 의약품 (테스트)', '테스트 제조사', 'UI 검증용 데이터입니다.', 'UI 검증용 데이터입니다.'] });
await db.execute({ sql: 'INSERT OR REPLACE INTO ingredients (id,name,slug,summary,tags) VALUES (?,?,?,?,?)', args: ['CITY-I','화면검증성분','city-test','UI 검증용 데이터입니다.','[]'] });
await db.execute({ sql: 'INSERT OR REPLACE INTO content_queue (id,title,slug,content_html,status,publish_at,published_at,theme,region) VALUES (?,?,?,?,?,?,?,?,?)', args: ['CITY-H','화면검증 주제 모음 (테스트)','city-test','<h2>화면 검증 안내</h2><p>로컬 UI 검증용 데이터입니다.</p>','published','2026-10-12T00:00:00Z','2026-10-12T00:00:00Z','약국 이용','서울'] });
db.close();
const app = next({ dev: true, dir: appRoot, hostname: '127.0.0.1', port });
await app.prepare();
createServer(app.getRequestHandler()).listen(port, '127.0.0.1', () => console.log(`CITY SIGNAL local fixture http://127.0.0.1:${port}`));
