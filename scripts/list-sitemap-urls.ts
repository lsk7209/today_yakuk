import path from "path";
import dotenv from "dotenv";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
import "tsconfig-paths/register";
import { createClient } from "@supabase/supabase-js";
import { getSiteUrl } from "../src/lib/site-url";

// Get Site URL or default
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.todaypharm.kr";
const CHUNK_SIZE = 1000;

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("❌ Supabase 환경 변수가 없습니다.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
    console.log(`\n🔍 Generating Sitemap URLs for ${SITE_URL}...\n`);

    // 1. Supplements Count
    const { count: supplementCount, error: supError } = await supabase
        .from("supplements")
        .select("id", { count: "exact", head: true });

    if (supError) {
        console.error("Failed to fetch supplements count:", supError);
        return;
    }

    // 2. Medicines Count
    const { count: medicineCount, error: medError } = await supabase
        .from("medicines")
        .select("id", { count: "exact", head: true });

    if (medError) {
        console.error("Failed to fetch medicines count:", medError);
        return;
    }

    const sitemaps: string[] = [];

    // Static
    // Note: The sitemap index points to children.
    // If using generateSitemaps, the URLs are typically `/sitemap/[id].xml`.

    // Static Sitemap (id: static)
    sitemaps.push(`${SITE_URL}/sitemap/static.xml`);

    // Supplements (id: supplements-i)
    const supplementChunks = Math.ceil((supplementCount || 0) / CHUNK_SIZE);
    for (let i = 0; i < supplementChunks; i++) {
        sitemaps.push(`${SITE_URL}/sitemap/supplements-${i}.xml`);
    }

    // Medicines (id: medicines-i)
    const medicineChunks = Math.ceil((medicineCount || 0) / CHUNK_SIZE);
    for (let i = 0; i < medicineChunks; i++) {
        sitemaps.push(`${SITE_URL}/sitemap/medicines-${i}.xml`);
    }

    console.log("✅ 아래 주소들을 복사하여 웹마스터 도구에 제출하세요 (또는 확인하세요):\n");
    console.log("==================================================");
    sitemaps.forEach(url => console.log(url));
    console.log("==================================================");
    console.log(`\n📊 통계: Supplements=${supplementCount}, Medicines=${medicineCount}, Total Sitemaps=${sitemaps.length}`);
}

main().catch(console.error);
