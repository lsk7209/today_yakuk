/**
 * Turso 스키마 초기화 스크립트
 * 실행: node scripts/init-turso-schema.mjs
 */
import { createClient } from "@libsql/client";

const TURSO_URL = process.env.TURSO_DATABASE_URL || "libsql://todaypharmkr-lsk7209.aws-ap-northeast-1.turso.io";
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN || "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODEwMTY5NDQsImlkIjoiMDE5ZWFjZTEtY2UwMS03Yjk0LWI2YjMtYzRmODhjOTc2ODI3IiwicmlkIjoiMmQ5YjUyYjYtMTFhMy00NzMyLTk4NDAtZjgxOTUyZGI5YTE0In0.uFplGEXW4aaNsn34ODhPI_lfPG7skPLrwSxlTy9qL3euFt-Gxkni4_Xg5xUtDog2_17IcjV73hF1x0IEOwWuDw";

const db = createClient({ url: TURSO_URL, authToken: TURSO_TOKEN });

const UUID_DEFAULT = `lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))`;

const STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS pharmacies (
    id TEXT PRIMARY KEY DEFAULT (${UUID_DEFAULT}),
    hpid TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    address TEXT,
    tel TEXT,
    latitude REAL,
    longitude REAL,
    operating_hours TEXT,
    description_raw TEXT,
    gemini_summary TEXT,
    province TEXT,
    city TEXT,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  `CREATE TABLE IF NOT EXISTS supplements (
    id TEXT PRIMARY KEY DEFAULT (${UUID_DEFAULT}),
    product_report_no TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    manufacturer TEXT,
    image_url TEXT,
    nutrition_facts TEXT,
    additives TEXT,
    ai_summary TEXT,
    tags TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )`,

  `CREATE TABLE IF NOT EXISTS ingredients (
    id TEXT PRIMARY KEY DEFAULT (${UUID_DEFAULT}),
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    summary TEXT,
    deficiency_symptoms TEXT,
    excess_symptoms TEXT,
    daily_value_guideline TEXT,
    tags TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )`,

  `CREATE TABLE IF NOT EXISTS content_queue (
    id TEXT PRIMARY KEY DEFAULT (${UUID_DEFAULT}),
    hpid TEXT,
    title TEXT NOT NULL,
    slug TEXT UNIQUE,
    region TEXT,
    theme TEXT,
    content_html TEXT,
    ai_summary TEXT,
    ai_bullets TEXT,
    ai_faq TEXT,
    ai_cta TEXT,
    extra_sections TEXT,
    image_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    publish_at TEXT NOT NULL,
    published_at TEXT,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  `CREATE TABLE IF NOT EXISTS medicines (
    id TEXT PRIMARY KEY DEFAULT (${UUID_DEFAULT}),
    item_seq TEXT UNIQUE,
    name TEXT NOT NULL,
    manufacturer TEXT,
    efficacy TEXT,
    use_method TEXT,
    warning_general TEXT,
    warning_usage TEXT,
    interactions TEXT,
    side_effects TEXT,
    storage_method TEXT,
    image_url TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )`,

  `CREATE TABLE IF NOT EXISTS analytics_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    page TEXT NOT NULL,
    referrer TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )`,

  // Indexes
  `CREATE INDEX IF NOT EXISTS idx_pharmacies_province ON pharmacies(province)`,
  `CREATE INDEX IF NOT EXISTS idx_pharmacies_province_city ON pharmacies(province, city)`,
  `CREATE INDEX IF NOT EXISTS idx_pharmacies_lat_lon ON pharmacies(latitude, longitude)`,
  `CREATE INDEX IF NOT EXISTS idx_supplements_created_at ON supplements(created_at)`,
  `CREATE INDEX IF NOT EXISTS idx_content_queue_status ON content_queue(status)`,
  `CREATE INDEX IF NOT EXISTS idx_content_queue_published_at ON content_queue(published_at)`,
  `CREATE INDEX IF NOT EXISTS idx_content_queue_slug ON content_queue(slug)`,
  `CREATE INDEX IF NOT EXISTS idx_content_queue_hpid ON content_queue(hpid)`,
  `CREATE INDEX IF NOT EXISTS idx_analytics_logs_created_at ON analytics_logs(created_at)`,
];

async function main() {
  console.log("🚀 Turso 스키마 초기화 시작...");
  console.log(`  URL: ${TURSO_URL}\n`);

  for (const sql of STATEMENTS) {
    const name = sql.slice(0, 60).replace(/\n/g, " ").trim() + "...";
    try {
      await db.execute(sql);
      console.log(`✅ ${name}`);
    } catch (e) {
      console.error(`❌ 실패: ${name}\n   ${e.message}`);
    }
  }

  // 테이블 목록 확인
  const tables = await db.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
  console.log("\n📊 생성된 테이블:");
  for (const row of tables.rows) {
    const cnt = await db.execute(`SELECT COUNT(*) as cnt FROM ${row.name}`);
    console.log(`  - ${row.name}: ${cnt.rows[0].cnt}행`);
  }

  console.log("\n🎉 스키마 초기화 완료!");
  db.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
