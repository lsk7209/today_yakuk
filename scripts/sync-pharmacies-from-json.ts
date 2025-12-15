import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

type OperatingHours = Record<
  string,
  {
    open: number | string | null;
    close: number | string | null;
  }
>;

type PharmacyJsonRecord = {
  id?: string;
  hpid: string;
  name: string;
  address: string;
  tel?: string | null;
  latitude: number;
  longitude: number;
  operating_hours: string; // JSON 문자열
  description_raw?: string | null;
  province: string;
  city: string;
  updated_at: string;
};

type PharmacyRecord = {
  hpid: string;
  name: string;
  address?: string;
  tel?: string;
  latitude: number | null;
  longitude: number | null;
  operating_hours: OperatingHours | null;
  description_raw?: string | null;
  province?: string | null;
  city?: string | null;
  updated_at: string;
};

/**
 * 숫자 시간을 문자열 형식으로 변환 (830 -> "0830", 1900 -> "1900")
 */
function formatTimeValue(value: number | string | null | undefined): string | null {
  if (value === null || value === undefined) return null;
  
  const num = typeof value === "string" ? parseInt(value, 10) : value;
  if (isNaN(num)) return null;
  
  // 4자리 숫자로 변환 (830 -> "0830", 1900 -> "1900")
  return num.toString().padStart(4, "0");
}

/**
 * JSON 문자열을 파싱하고 시간 값을 문자열로 변환
 */
function parseOperatingHours(jsonString: string | null | undefined): OperatingHours | null {
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
    
    return Object.keys(result).length > 0 ? result : null;
  } catch (error) {
    console.error("Failed to parse operating_hours:", error);
    return null;
  }
}

/**
 * JSON 레코드를 PharmacyRecord로 변환
 */
function mapJsonToRecord(item: PharmacyJsonRecord): PharmacyRecord {
  return {
    hpid: item.hpid,
    name: item.name,
    address: item.address || undefined,
    tel: item.tel || undefined,
    latitude: item.latitude ?? null,
    longitude: item.longitude ?? null,
    operating_hours: parseOperatingHours(item.operating_hours),
    description_raw: item.description_raw || undefined,
    province: item.province || null,
    city: item.city || null,
    updated_at: new Date().toISOString(),
  };
}

async function syncFromJson(jsonFilePath: string) {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  console.log(`📖 Reading JSON file: ${jsonFilePath}`);
  const fileContent = fs.readFileSync(jsonFilePath, "utf-8");
  const jsonData: PharmacyJsonRecord[] = JSON.parse(fileContent);

  console.log(`📊 Found ${jsonData.length} pharmacy records`);

  const BATCH_SIZE = 100;
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < jsonData.length; i += BATCH_SIZE) {
    const batch = jsonData.slice(i, i + BATCH_SIZE);
    const records = batch.map(mapJsonToRecord);

    console.log(`\n📦 Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(jsonData.length / BATCH_SIZE)} (${i + 1}-${Math.min(i + BATCH_SIZE, jsonData.length)})`);

    const { data, error } = await supabase
      .from("pharmacies")
      .upsert(records, {
        onConflict: "hpid",
        ignoreDuplicates: false,
      })
      .select("hpid");

    if (error) {
      console.error(`❌ Batch error:`, error);
      errorCount += batch.length;
    } else {
      successCount += data?.length || 0;
      console.log(`✅ Upserted ${data?.length || 0} records`);
    }

    // API rate limit 방지를 위한 짧은 지연
    if (i + BATCH_SIZE < jsonData.length) {
      await new Promise((resolve) => setTimeout(resolve, 100));
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

