
import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const publicDir = path.join(process.cwd(), "public", "blog-images");

// 1. 타임스탬프 제거 (Rename)
function renameImages() {
    console.log("📂 이미지 파일명 정리 시작...");
    if (!fs.existsSync(publicDir)) {
        console.log("❌ public/blog-images 폴더가 없습니다.");
        return;
    }

    const files = fs.readdirSync(publicDir);
    let renameCount = 0;

    files.forEach(file => {
        // 패턴: name_1769... .png
        if (file.match(/_\d{13}\.png$/)) {
            const newName = file.replace(/_\d{13}\.png$/, ".png");
            try {
                // 이미 대상 파일이 있으면 (중복 생성시) 덮어쓰기 위해 기존 파일 삭제
                if (fs.existsSync(path.join(publicDir, newName))) {
                    fs.unlinkSync(path.join(publicDir, newName));
                }
                fs.renameSync(path.join(publicDir, file), path.join(publicDir, newName));
                // console.log(`RENAME: ${file} -> ${newName}`);
                renameCount++;
            } catch (e) {
                console.error(`Error renaming ${file}:`, e);
            }
        }
    });
    console.log(`✅ ${renameCount}개 파일 이름 변경 완료.`);
}

// 2. 약국 이미지 일괄 적용
async function applyPharmacyImages() {
    console.log("🏥 약국 이미지 일괄 적용 시작...");

    const sourcePath = path.join(publicDir, "pharmacy_common_default.png");
    if (!fs.existsSync(sourcePath)) {
        console.error("❌ pharmacy_common_default.png 파일을 찾을 수 없습니다.");
        // 혹시 타임스탬프가 아직 붙어있나 확인 (renameImages가 실패했을 경우)
        // 하지만 위에서 처리했으므로 여기선 없으면 에러.
        return;
    }

    const { data: posts } = await supabase
        .from("content_queue")
        .select("slug")
        .like("slug", "pharmacy-%")
        .eq("status", "published");

    if (!posts || posts.length === 0) {
        console.log("대상 약국 글이 없습니다.");
        return;
    }

    let copyCount = 0;
    for (const post of posts) {
        const targetFileName = `${post.slug}.png`;
        const targetPath = path.join(publicDir, targetFileName);

        if (!fs.existsSync(targetPath)) {
            fs.copyFileSync(sourcePath, targetPath);
            copyCount++;
        }
    }
    console.log(`🎉 총 ${copyCount}개의 약국 이미지 생성 완료.`);

    // 원본 default 이미지는 삭제하지 않고 유지 (나중을 위해)
}

// 3. 미생성 정보성 글 대체 이미지 적용 (Fallback)
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
