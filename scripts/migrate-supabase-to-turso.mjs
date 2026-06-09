/**
 * Supabase → Turso 데이터 마이그레이션 스크립트
 *
 * 사용법:
 *   1. .env.local 또는 환경변수 설정:
 *      SUPABASE_URL=https://xxx.supabase.co
 *      SUPABASE_SERVICE_ROLE_KEY=...
 *      TURSO_DATABASE_URL=libsql://...
 *      TURSO_AUTH_TOKEN=...
 *
 *   2. 실행:
 *      node scripts/migrate-supabase-to-turso.mjs
 *
 *   3. 특정 테이블만 마이그레이션:
 *      TABLE=pharmacies node scripts/migrate-supabase-to-turso.mjs
 *
 * 주의:
 *   - 실행 전 turso-schema.sql 로 Turso DB 스키마를 먼저 생성하세요
 *   - 대량 데이터(약국 23,000개+)는 시간이 걸릴 수 있습니다
 */

import { createClient as createLibsql } from "@libsql/client";

// 환경변수 로드 (.env.local 지원)
import { readFileSync, existsSync } from "fs";

function loadEnv() {
  for (const envFile of [".env.local", ".env"]) {
    if (existsSync(envFile)) {
      const lines = readFileSync(envFile, "utf8").split("\n");
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const idx = trimmed.indexOf("=");
        if (idx === -1) continue;
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
        if (!process.env[key]) process.env[key] = val;
      }
      console.log(`Loaded ${envFile}`);
    }
  }
}

loadEnv();

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const TURSO_URL = process.env.TURSO_DATABASE_URL;
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN;
const TARGET_TABLE = process.env.TABLE;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다.");
  process.exit(1);
}
if (!TURSO_URL || !TURSO_TOKEN) {
  console.error("❌ TURSO_DATABASE_URL 또는 TURSO_AUTH_TOKEN이 설정되지 않았습니다.");
  process.exit(1);
}

const turso = createLibsql({ url: TURSO_URL, authToken: TURSO_TOKEN });

const BATCH_SIZE = 50;

// Supabase REST API helper
async function supabaseFetch(table, offset = 0, limit = BATCH_SIZE, columns = "*") {
  const url = `${SUPABASE_URL}/rest/v1/${table}?select=${columns}&offset=${offset}&limit=${limit}&order=id`;
  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Range: `${offset}-${offset + limit - 1}`,
      Prefer: "count=exact",
    },
  });
  if (!res.ok) throw new Error(`Supabase fetch ${table} failed: ${res.status} ${await res.text()}`);
  const count = res.headers.get("content-range")?.split("/")[1] || "?";
  const data = await res.json();
  return { data, total: parseInt(count) || 0 };
}

function toJsonText(val) {
  if (val == null) return null;
  if (typeof val === "string") return val;
  return JSON.stringify(val);
}

// --- Table migrators ---

async function migratePharmacies() {
  console.log("\n📦 약국 테이블 마이그레이션...");
  let offset = 0;
  let total = 0;
  let migrated = 0;

  do {
    const { data, total: t } = await supabaseFetch("pharmacies", offset, BATCH_SIZE);
    total = t;
    if (!data.length) break;

    const statements = data.map((row) => ({
      sql: `INSERT OR REPLACE INTO pharmacies
            (id, hpid, name, address, tel, latitude, longitude, operating_hours, description_raw, gemini_summary, province, city, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        row.id, row.hpid, row.name, row.address, row.tel,
        row.latitude, row.longitude,
        toJsonText(row.operating_hours),
        row.description_raw, row.gemini_summary, row.province, row.city,
        row.updated_at,
      ],
    }));

    await turso.batch(statements, "write");
    migrated += data.length;
    offset += BATCH_SIZE;
    process.stdout.write(`\r  진행: ${migrated} / ${total}`);
  } while (offset < total);

  console.log(`\n✅ 약국 ${migrated}개 마이그레이션 완료`);
}

async function migrateSupplements() {
  console.log("\n📦 영양제 테이블 마이그레이션...");
  let offset = 0;
  let total = 0;
  let migrated = 0;

  do {
    const { data, total: t } = await supabaseFetch("supplements", offset, BATCH_SIZE);
    total = t;
    if (!data.length) break;

    const statements = data.map((row) => ({
      sql: `INSERT OR REPLACE INTO supplements
            (id, product_report_no, name, manufacturer, image_url, nutrition_facts, additives, ai_summary, tags, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        row.id, row.product_report_no, row.name, row.manufacturer, row.image_url,
        toJsonText(row.nutrition_facts),
        toJsonText(row.additives),
        row.ai_summary,
        toJsonText(row.tags),
        row.created_at,
      ],
    }));

    await turso.batch(statements, "write");
    migrated += data.length;
    offset += BATCH_SIZE;
    process.stdout.write(`\r  진행: ${migrated} / ${total}`);
  } while (offset < total);

  console.log(`\n✅ 영양제 ${migrated}개 마이그레이션 완료`);
}

async function migrateIngredients() {
  console.log("\n📦 성분 테이블 마이그레이션...");
  let offset = 0;
  let total = 0;
  let migrated = 0;

  do {
    const { data, total: t } = await supabaseFetch("ingredients", offset, BATCH_SIZE);
    total = t;
    if (!data.length) break;

    const statements = data.map((row) => ({
      sql: `INSERT OR REPLACE INTO ingredients
            (id, name, slug, summary, deficiency_symptoms, excess_symptoms, daily_value_guideline, tags, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        row.id, row.name, row.slug, row.summary,
        toJsonText(row.deficiency_symptoms),
        toJsonText(row.excess_symptoms),
        toJsonText(row.daily_value_guideline),
        toJsonText(row.tags),
        row.created_at,
      ],
    }));

    await turso.batch(statements, "write");
    migrated += data.length;
    offset += BATCH_SIZE;
    process.stdout.write(`\r  진행: ${migrated} / ${total}`);
  } while (offset < total);

  console.log(`\n✅ 성분 ${migrated}개 마이그레이션 완료`);
}

async function migrateContentQueue() {
  console.log("\n📦 컨텐츠 큐 마이그레이션...");
  let offset = 0;
  let total = 0;
  let migrated = 0;

  do {
    const { data, total: t } = await supabaseFetch("content_queue", offset, BATCH_SIZE);
    total = t;
    if (!data.length) break;

    const statements = data.map((row) => ({
      sql: `INSERT OR REPLACE INTO content_queue
            (id, hpid, title, slug, region, theme, content_html, ai_summary, ai_bullets, ai_faq, ai_cta, extra_sections, image_url, status, publish_at, published_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        row.id, row.hpid, row.title, row.slug, row.region, row.theme,
        row.content_html, row.ai_summary,
        toJsonText(row.ai_bullets),
        toJsonText(row.ai_faq),
        row.ai_cta,
        toJsonText(row.extra_sections),
        row.image_url, row.status, row.publish_at, row.published_at, row.updated_at,
      ],
    }));

    await turso.batch(statements, "write");
    migrated += data.length;
    offset += BATCH_SIZE;
    process.stdout.write(`\r  진행: ${migrated} / ${total}`);
  } while (offset < total);

  console.log(`\n✅ 컨텐츠 큐 ${migrated}개 마이그레이션 완료`);
}

async function migrateMedicines() {
  console.log("\n📦 의약품 테이블 마이그레이션...");
  let offset = 0;
  let total = 0;
  let migrated = 0;

  do {
    const { data, total: t } = await supabaseFetch("medicines", offset, BATCH_SIZE);
    total = t;
    if (!data.length) break;

    const statements = data.map((row) => ({
      sql: `INSERT OR REPLACE INTO medicines
            (id, item_seq, name, manufacturer, efficacy, use_method, warning_general, warning_usage, interactions, side_effects, storage_method, image_url, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        row.id, row.item_seq, row.name, row.manufacturer,
        row.efficacy, row.use_method, row.warning_general, row.warning_usage,
        row.interactions, row.side_effects, row.storage_method, row.image_url, row.created_at,
      ],
    }));

    await turso.batch(statements, "write");
    migrated += data.length;
    offset += BATCH_SIZE;
    process.stdout.write(`\r  진행: ${migrated} / ${total}`);
  } while (offset < total);

  console.log(`\n✅ 의약품 ${migrated}개 마이그레이션 완료`);
}

// --- Main ---
async function main() {
  console.log("🚀 Supabase → Turso 마이그레이션 시작");
  console.log(`  Supabase: ${SUPABASE_URL}`);
  console.log(`  Turso: ${TURSO_URL}`);

  try {
    if (!TARGET_TABLE || TARGET_TABLE === "pharmacies") await migratePharmacies();
    if (!TARGET_TABLE || TARGET_TABLE === "supplements") await migrateSupplements();
    if (!TARGET_TABLE || TARGET_TABLE === "ingredients") await migrateIngredients();
    if (!TARGET_TABLE || TARGET_TABLE === "content_queue") await migrateContentQueue();
    if (!TARGET_TABLE || TARGET_TABLE === "medicines") await migrateMedicines();

    console.log("\n🎉 전체 마이그레이션 완료!");
  } catch (err) {
    console.error("\n❌ 마이그레이션 오류:", err);
    process.exit(1);
  } finally {
    turso.close();
  }
}

main();
