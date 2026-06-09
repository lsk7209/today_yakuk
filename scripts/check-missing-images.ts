import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { getTursoClient } from "../src/lib/turso";

dotenv.config({ path: ".env.local" });

const db = getTursoClient();

function getStartFileName(slug: string): string {
    return slug.length > 50 ? slug.substring(0, 50) : slug;
}

async function checkMissingImages() {
    console.log("🔍 블로그 이미지 점검 시작...");

    const result = await db.execute({
        sql: "SELECT slug, title, published_at FROM content_queue WHERE status = 'published' ORDER BY published_at DESC",
        args: [],
    });

    console.log(`📝 총 발행된 글 수: ${result.rows.length}개`);

    const imagesDir = path.join(process.cwd(), "public", "blog-images");
    if (!fs.existsSync(imagesDir)) {
        console.log("❌ public/blog-images 폴더가 없습니다.");
        return;
    }

    const files = fs.readdirSync(imagesDir);
    console.log(`🖼️  보유 중인 이미지 파일 수: ${files.length}개`);

    const missingPosts = [];
    for (const row of result.rows) {
        const startName = getStartFileName(row.slug as string);
        const hasImage = files.some(file => file.startsWith(startName));
        if (!hasImage) missingPosts.push(row);
    }

    console.log(`\n⚠️  **이미지가 없는 글: ${missingPosts.length}개**`);
    missingPosts.forEach((post, i) => {
        console.log(`${i + 1}. [${post.title}] (Slug: ${post.slug})`);
    });

    console.log("\n✅ 점검 완료");
}

checkMissingImages();
