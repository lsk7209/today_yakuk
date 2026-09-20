// Local-only DB and Next output for the T01/T02 browser regressions.
import { mkdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createServer } from 'node:http';
import { createClient } from '@libsql/client';
import next from 'next';

const root = resolve('.');
const artifacts = resolve(root, '.goal-harness/reference-112-p0-20260920/runtime');
await mkdir(artifacts, { recursive: true });
const databaseUrl = pathToFileURL(resolve(artifacts, 'fixture.sqlite')).href;
if (!databaseUrl.startsWith('file:')) throw new Error('Fixture must use a local database');
process.env.TURSO_DATABASE_URL = databaseUrl;
process.env.TURSO_AUTH_TOKEN = 'local-fixture-only';
process.env.TZ = 'UTC';
process.env.TODAYPHARM_P0_FIXTURE = '1';
const db = createClient({ url: databaseUrl });
await db.executeMultiple(await readFile(resolve(root, 'turso-schema.sql'), 'utf8'));
const daily = (open, close) => Object.fromEntries(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map(day => [day, { open, close }]));
const fixtures = [
  ['T01-CLOSE', '검증약국', daily('1000', '2130')],
  ['T01-LATE', '늦은검증약국', daily('0900', '2300')],
  ['T01-OVERNIGHT', '심야검증약국', { ...daily('0900', '1800'), mon: { open: '2200', close: '0200' }, tue: { open: '2200', close: '0200' } }],
];
for (const [index, [id, name, hours]] of fixtures.entries()) {
  await db.execute({ sql: `INSERT INTO pharmacies (hpid, name, address, tel, latitude, longitude, operating_hours, province, city, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(hpid) DO UPDATE SET operating_hours=excluded.operating_hours`,
    args: [id, name, '테스트 서울 테스트구', '000-0000-0000', 37.5 + index * 0.001, 127, JSON.stringify(hours), '서울특별시', '테스트구', '2026-09-20T00:00:00Z'] });
}
db.close();
const app = next({ dev: true, dir: root, hostname: '127.0.0.1', port: 3249 });
await app.prepare();
createServer(app.getRequestHandler()).listen(3249, '127.0.0.1', () => console.log('Local P0 fixture ready on 3249 (UTC server)'));
