import "dotenv/config";
import * as fs from "fs";
import * as path from "path";
import { assertExpectedRowsAffected, getRequiredTursoClient } from "../src/lib/turso";

const db = getRequiredTursoClient();

type OperatingHours = Record<string, { open: number | string | null; close: number | string | null }>;

type PharmacyJsonRecord = {
  id?: string;
  hpid: string;
  name: string;
  address: string;
  tel?: string | null;
  latitude: number;
  longitude: number;
  operating_hours: string;
  description_raw?: string | null;
  province: string;
  city: string;
  updated_at: string;
};

function formatTimeValue(value: number | string | null | undefined): string | null {
  if (value === null || value === undefined) return null;
  const num = typeof value === "string" ? parseInt(value, 10) : value;
  if (isNaN(num)) return null;
  return num.toString().padStart(4, "0");
}

function parseOperatingHours(jsonString: string | null | undefined): string | null {
  if (!jsonString || typeof jsonString !== "string") return null;
  try {
    const parsed = JSON.parse(jsonString) as Record<string, { open: number | string | null; close: number | string | null }>;
    const result: OperatingHours = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (value && typeof value === "object") {
        result[key] = {
          open: formatTimeValue(value.open),
          close: formatTimeValue(value.close),
        };
      }
    }
    return Object.keys(result).length > 0 ? JSON.stringify(result) : null;
  } catch {
    return null;
  }
}

async function syncFromJson(jsonFilePath: string) {
  console.log(`📖 Reading JSON file: ${jsonFilePath}`);
  const fileContent = fs.readFileSync(jsonFilePath, "utf-8");
  const jsonData: PharmacyJsonRecord[] = JSON.parse(fileContent);
  console.log(`📊 Found ${jsonData.length} pharmacy records`);

  const BATCH_SIZE = 50;
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < jsonData.length; i += BATCH_SIZE) {
    const batch = jsonData.slice(i, i + BATCH_SIZE);

    console.log(`\n📦 Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(jsonData.length / BATCH_SIZE)} (${i + 1}-${Math.min(i + BATCH_SIZE, jsonData.length)})`);

    try {
      const statements = batch.map(item => ({
        sql: `INSERT OR REPLACE INTO pharmacies
              (hpid, name, address, tel, latitude, longitude, operating_hours, description_raw, province, city, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          item.hpid, item.name, item.address || null, item.tel || null,
          item.latitude ?? null, item.longitude ?? null,
          parseOperatingHours(item.operating_hours),
          item.description_raw || null,
          item.province || null, item.city || null,
          new Date().toISOString(),
        ],
      }));

      const results = await db.batch(statements, "write");
      assertExpectedRowsAffected(results, statements.length, "sync-pharmacies-from-json batch");
      successCount += batch.length;
      console.log(`✅ Upserted ${batch.length} records`);
    } catch (error) {
      console.error(`❌ Batch error:`, error);
      errorCount += batch.length;
    }

    if (i + BATCH_SIZE < jsonData.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  console.log(`\n✨ Sync completed!`);
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log(`   📊 Total: ${jsonData.length}`);
}

async function main() {
  const jsonFilePath = process.argv[2] || path.join(process.cwd(), "pharmacies_rows.json");
  if (!fs.existsSync(jsonFilePath)) {
    console.error(`❌ File not found: ${jsonFilePath}`);
    console.error(`Usage: npm run sync:json [path/to/pharmacies_rows.json]`);
    process.exit(1);
  }

  try {
    await syncFromJson(jsonFilePath);
  } catch (error) {
    console.error("❌ Sync failed:", error);
    process.exit(1);
  }
}

main();
