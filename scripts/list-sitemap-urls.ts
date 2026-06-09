import path from "path";
import dotenv from "dotenv";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
import "tsconfig-paths/register";
import { getTursoClient } from "../src/lib/turso";
import { getSiteUrl } from "../src/lib/site-url";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.todaypharm.kr";
const CHUNK_SIZE = 1000;

const db = getTursoClient();

async function main() {
    console.log(`\n🔍 Generating Sitemap URLs for ${SITE_URL}...\n`);

    const [supResult, medResult] = await Promise.all([
        db.execute("SELECT COUNT(*) as count FROM supplements"),
        db.execute("SELECT COUNT(*) as count FROM medicines"),
    ]);

    const supplementCount = Number(supResult.rows[0]?.count ?? 0);
    const medicineCount = Number(medResult.rows[0]?.count ?? 0);

    const sitemaps: string[] = [];
    sitemaps.push(`${SITE_URL}/sitemap/static.xml`);

    const supplementChunks = Math.ceil(supplementCount / CHUNK_SIZE);
    for (let i = 0; i < supplementChunks; i++) {
        sitemaps.push(`${SITE_URL}/sitemap/supplements-${i}.xml`);
    }

    const medicineChunks = Math.ceil(medicineCount / CHUNK_SIZE);
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
