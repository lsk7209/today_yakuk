import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { getTursoClient } from "../src/lib/turso";

dotenv.config({ path: ".env.local" });

const db = getTursoClient();

const publicDir = path.join(process.cwd(), "public", "blog-images");

function renameImages() {
    console.log("📂 이미지 파일명 정리 시작...");
    if (!fs.existsSync(publicDir)) {
        console.log("❌ public/blog-images 폴더가 없습니다.");
        return;
    }

    const files = fs.readdirSync(publicDir);
    let renameCount = 0;

    files.forEach(file => {
        if (file.match(/_\d{13}\.png$/)) {
            const newName = file.replace(/_\d{13}\.png$/, ".png");
            try {
                if (fs.existsSync(path.join(publicDir, newName))) {
                    fs.unlinkSync(path.join(publicDir, newName));
                }
                fs.renameSync(path.join(publicDir, file), path.join(publicDir, newName));
                renameCount++;
            } catch (e) {
                console.error(`Error renaming ${file}:`, e);
            }
        }
    });
    console.log(`✅ ${renameCount}개 파일 이름 변경 완료.`);
}

async function applyPharmacyImages() {
    console.log("🏥 약국 이미지 일괄 적용 시작...");

    const sourcePath = path.join(publicDir, "pharmacy_common_default.png");
    if (!fs.existsSync(sourcePath)) {
        console.error("❌ pharmacy_common_default.png 파일을 찾을 수 없습니다.");
        return;
    }

    const result = await db.execute({
        sql: "SELECT slug FROM content_queue WHERE slug LIKE 'pharmacy-%' AND status = 'published'",
        args: [],
    });

    if (!result.rows.length) {
        console.log("대상 약국 글이 없습니다.");
        return;
    }

    let copyCount = 0;
    for (const row of result.rows) {
        const targetPath = path.join(publicDir, `${row.slug}.png`);
        if (!fs.existsSync(targetPath)) {
            fs.copyFileSync(sourcePath, targetPath);
            copyCount++;
        }
    }
    console.log(`🎉 총 ${copyCount}개의 약국 이미지 생성 완료.`);
}

function applyFallbackImages() {
    console.log("🔄 미생성 글 대체 이미지 적용...");

    const fallbacks = [
        {
            target: "winter-health-pharmacy-tips-dryness-immunity.png",
            source: "january_winter_dryness_relief_pharmacy_tips.png"
        },
        {
            target: "winter-immunity-boost-cold-prevention-pharmacy-solutions.png",
            source: "winter_immunity_boost_cold_flu_dry_skin_care_supplements.png"
        },
        {
            target: "winter-dry-skin-care-pharmacy-essentials.png",
            source: "january_winter_dryness_relief_pharmacy_tips.png"
        }
    ];

    let count = 0;
    fallbacks.forEach(item => {
        const sourcePath = path.join(publicDir, item.source);
        const targetPath = path.join(publicDir, item.target);

        if (fs.existsSync(sourcePath) && !fs.existsSync(targetPath)) {
            fs.copyFileSync(sourcePath, targetPath);
            console.log(`COPY: ${item.source} -> ${item.target}`);
            count++;
        } else if (!fs.existsSync(sourcePath)) {
            console.warn(`WARNING: 대체 소스 이미지 없음 (${item.source})`);
        }
    });

    console.log(`✅ ${count}개 대체 이미지 적용 완료.`);
}

async function main() {
    try {
        renameImages();
        await applyPharmacyImages();
        applyFallbackImages();
        console.log("\n✨ 모든 이미지 작업 완료!");
    } catch (e) {
        console.error("Critical Error:", e);
    }
}

main();
