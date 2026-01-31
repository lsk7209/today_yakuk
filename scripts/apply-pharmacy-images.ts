
import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function applyPharmacyImages() {
    console.log("🏥 약국 이미지 일괄 적용 시작...");

    const sourceImageName = "pharmacy_common_default.png"; // 오늘 날짜 타임스탬프가 붙은 파일명을 찾아야 함
    const publicDir = path.join(process.cwd(), "public", "blog-images");

    // 가장 최근 생성된 pharmacy_common_default 파일 찾기
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

    // DB에서 약국 글 목록 가져오기
    const { data: posts } = await supabase
        .from("content_queue")
        .select("slug")
        .like("slug", "pharmacy-%")
        .eq("status", "published");

    if (!posts || posts.length === 0) {
        console.log("대상 약국 글이 없습니다.");
        return;
    }

    console.log(`📝 대상 게시글: ${posts.length}개`);

    let copyCount = 0;
    for (const post of posts) {
        const targetFileName = `${post.slug}.png`;
        const targetPath = path.join(publicDir, targetFileName);

        // 이미 있으면 스킵
        if (!fs.existsSync(targetPath)) {
            fs.copyFileSync(sourcePath, targetPath);
            // console.log(`✅ 생성: ${targetFileName}`);
            copyCount++;
        }
    }

    console.log(`🎉 총 ${copyCount}개의 약국 이미지가 생성되었습니다.`);
}

applyPharmacyImages();
