import path from "path";
import dotenv from "dotenv";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
import "tsconfig-paths/register";
import { getSitemapIds } from "../src/lib/sitemap";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://todaypharm.kr";

async function main() {
    console.log(`\n🔍 Generating Sitemap URLs for ${SITE_URL}...\n`);

    const sitemaps = (await getSitemapIds()).map((id) => `${SITE_URL}/sitemap/${id}.xml`);

    console.log("✅ 아래 주소들을 복사하여 웹마스터 도구에 제출하세요 (또는 확인하세요):\n");
    console.log("==================================================");
    sitemaps.forEach(url => console.log(url));
    console.log("==================================================");
    console.log(`\n📊 통계: Total Sitemaps=${sitemaps.length}`);
}

main().catch(console.error);
