import path from "path";
import dotenv from "dotenv";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
import "tsconfig-paths/register";
import { getRequiredTursoClient } from "../src/lib/turso";
import { generateBlogTopic, generateBlogPost } from "../src/lib/gemini-blog";
import { getNextSlot } from "../src/lib/scheduler";

if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
  console.error("Turso 환경 변수가 없습니다. (TURSO_DATABASE_URL, TURSO_AUTH_TOKEN)");
  process.exit(1);
}

async function main() {
  console.info("===== 블로그 자동 생성 시작 =====");
  const db = getRequiredTursoClient();

  // 1. 주제 선정
  console.info("주제 선정 중...");
  const topic = await generateBlogTopic();
  if (!topic) {
    console.error("주제 생성 실패");
    return;
  }
  console.info(`📌 선정된 주제: ${topic}`);

  // 2. 글 작성
  console.info("블로그 글 작성 중...");
  const post = await generateBlogPost(topic);
  if (!post) {
    console.error("글 작성 실패");
    return;
  }
  console.info(`✅ 글 작성 완료: ${post.title}`);

  // 3. 스케줄링 (마지막 예약 시간 + 다음 슬롯)
  const lastResult = await db.execute(
    `SELECT publish_at FROM content_queue WHERE status = 'pending' ORDER BY publish_at DESC LIMIT 1`
  );
  let lastScheduledTime = lastResult.rows[0]?.publish_at
    ? new Date(lastResult.rows[0].publish_at as string)
    : new Date();

  if (lastScheduledTime.getTime() < Date.now()) {
    lastScheduledTime = new Date();
  }

  const nextSlot = getNextSlot(lastScheduledTime);
  console.info(`📅 발행 예약: ${nextSlot.toISOString()}`);

  // 4. 슬러그 중복 체크
  let finalSlug = post.slug_suggestion || `blog-${Date.now()}`;
  for (let i = 1; i <= 5; i++) {
    const checkSlug = i === 1 ? finalSlug : `${finalSlug}-${i}`;
    const existing = await db.execute({
      sql: `SELECT id FROM content_queue WHERE slug = ? LIMIT 1`,
      args: [checkSlug],
    });
    if (!existing.rows.length) {
      finalSlug = checkSlug;
      break;
    }
  }

  // 5. DB 저장
  await db.execute({
    sql: `INSERT INTO content_queue (hpid, title, slug, region, theme, content_html, ai_summary, ai_faq, status, publish_at, updated_at)
          VALUES (NULL, ?, ?, NULL, 'blog', ?, ?, ?, 'pending', ?, datetime('now'))`,
    args: [
      post.title,
      finalSlug,
      post.content_html,
      post.summary,
      post.faq ? JSON.stringify(post.faq) : null,
      nextSlot.toISOString(),
    ],
  });

  console.info("✨ 블로그 포스트가 성공적으로 예약되었습니다.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
