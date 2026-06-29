/**
 * Turso 스키마 초기화 스크립트
 * 실행: node scripts/init-turso-schema.mjs
 */
import { createClient } from "@libsql/client";

// 보안: 자격증명 하드코딩 금지 — 환경변수로만 주입 (노출 시 외부 무단 read/write 위험)
const TURSO_URL = process.env.TURSO_DATABASE_URL;
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN;
if (!TURSO_URL || !TURSO_TOKEN) {
  console.error("TURSO_DATABASE_URL / TURSO_AUTH_TOKEN 환경변수가 필요합니다.");
  process.exit(1);
}

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
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
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
  `CREATE INDEX IF NOT EXISTS idx_medicines_created_at ON medicines(created_at)`,
  `CREATE INDEX IF NOT EXISTS idx_medicines_updated_at ON medicines(updated_at)`,
  `CREATE INDEX IF NOT EXISTS idx_content_queue_status ON content_queue(status)`,
  `CREATE INDEX IF NOT EXISTS idx_content_queue_published_at ON content_queue(published_at)`,
  `CREATE INDEX IF NOT EXISTS idx_content_queue_slug ON content_queue(slug)`,
  `CREATE INDEX IF NOT EXISTS idx_content_queue_hpid ON content_queue(hpid)`,
  `CREATE INDEX IF NOT EXISTS idx_analytics_logs_created_at ON analytics_logs(created_at)`,
];

const MIGRATIONS = [
  {
    name: "medicines.updated_at",
    sql: `ALTER TABLE medicines ADD COLUMN updated_at TEXT`,
    ignore: "duplicate column name",
  },
  {
    name: "medicines.updated_at backfill",
    sql: `UPDATE medicines SET updated_at = COALESCE(created_at, datetime('now')) WHERE updated_at IS NULL`,
  },
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

  for (const migration of MIGRATIONS) {
    try {
      await db.execute(migration.sql);
      console.log(`✅ migration: ${migration.name}`);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      if (migration.ignore && message.toLowerCase().includes(migration.ignore)) {
        console.log(`⏭️ migration skipped: ${migration.name}`);
      } else {
        console.error(`❌ 실패: migration ${migration.name}\n   ${message}`);
      }
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
