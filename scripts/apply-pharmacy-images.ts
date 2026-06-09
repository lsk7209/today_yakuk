import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { getTursoClient } from "../src/lib/turso";

dotenv.config({ path: ".env.local" });

const db = getTursoClient();

async function applyPharmacyImages() {
    console.log("🏥 약국 이미지 일괄 적용 시작...");

    const publicDir = path.join(process.cwd(), "public", "blog-images");

    const files = fs.readdirSync(publicDir);
    const sourceFile = files
        .filter(f => f.startsWith("pharmacy_common_default"))
        .sort((a, b) => fs.statSync(path.join(publicDir, b)).mtimeMs - fs.statSync(path.join(publicDir, a)).mtimeMs)[0];

    if (!sourceFile) {
        console.error("❌ 공통 약국 이미지를 찾을 수 없습니다.");
        return;
    }

    const sourcePath = path.join(publicDir, sourceFile);
    console.log(`📂 원본 이미지: ${sourceFile}`);

    const result = await db.execute({
        sql: "SELECT slug FROM content_queue WHERE slug LIKE 'pharmacy-%' AND status = 'published'",
        args: [],
    });

    if (!result.rows.length) {
        console.log("대상 약국 글이 없습니다.");
        return;
    }

    console.log(`📝 대상 게시글: ${result.rows.length}개`);

    let copyCount = 0;
    for (const row of result.rows) {
        const targetFileName = `${row.slug}.png`;
        const targetPath = path.join(publicDir, targetFileName);

        if (!fs.existsSync(targetPath)) {
            fs.copyFileSync(sourcePath, targetPath);
            copyCount++;
        }
    }

    console.log(`🎉 총 ${copyCount}개의 약국 이미지가 생성되었습니다.`);
}

applyPharmacyImages();
