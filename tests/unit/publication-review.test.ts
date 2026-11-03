import assert from 'node:assert/strict';
import { contentReviewDigest, hasPublicationReview } from '../../src/lib/publication-review';
const item = { id:'r1', slug:'test', title:'검증', content_html:'<p>검토한 본문</p>', ai_summary:'요약' };
const review = { slug:item.slug, digest:contentReviewDigest(item), reviewer:'실제 기록의 담당자 식별자', scope:'본문·FAQ·출처', reviewed_at:'2026-11-03T00:00:00Z', sources:['https://nedrug.mfds.go.kr/'] };
assert.equal(hasPublicationReview(item, []),false);
assert.equal(hasPublicationReview(item, [review]),true);
assert.equal(hasPublicationReview({...item,content_html:'변경된 본문'}, [review]),false);
assert.equal(hasPublicationReview(item, [{...review,reviewer:''}]),false);
assert.equal(hasPublicationReview(item, [{...review,reviewed_at:'2099-01-01T00:00:00Z'}]),false);
console.log('PASS publication review: absent, matching, changed content, missing reviewer and future date');

import { createClient } from '@libsql/client';
import { claimPendingContent } from '../../scripts/publish-queue';
async function raceRegression() {
 const db=createClient({url:'file::memory:'});
 await db.execute(`CREATE TABLE content_queue (id TEXT PRIMARY KEY,hpid TEXT,title TEXT,slug TEXT,content_html TEXT,ai_summary TEXT,ai_faq TEXT,ai_bullets TEXT,ai_cta TEXT,extra_sections TEXT,image_url TEXT,status TEXT,published_at TEXT,updated_at TEXT)`);
 await db.execute(`INSERT INTO content_queue(id,title,slug,content_html,status) VALUES ('race','확인한 제목','race','확인한 본문','pending')`);
 const before=(await db.execute(`SELECT * FROM content_queue WHERE id='race'`)).rows[0];
 await db.execute(`UPDATE content_queue SET content_html='검수 후 변경' WHERE id='race'`);
 assert.equal(await claimPendingContent(db,'race',new Date().toISOString(),before),false);
 assert.equal((await db.execute(`SELECT status FROM content_queue WHERE id='race'`)).rows[0].status,'pending');
 await db.execute(`UPDATE content_queue SET content_html='확인한 본문' WHERE id='race'`);
 assert.equal(await claimPendingContent(db,'race',new Date().toISOString(),before),true);
 db.close();
 console.log('PASS publication snapshot: concurrent content change cannot reuse prior review');
}
raceRegression().catch(error=>{ console.error(error); process.exitCode=1; });
