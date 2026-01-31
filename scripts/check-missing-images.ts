
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// 환경 변수 로드
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// 파일명 생성 로직 (src/lib/blog-image.ts와 동일하게)
function getStartFileName(slug: string): string {
    // slug가 너무 길면 잘라서 사용 (파일명 길이 제한 고려)
    const shortSlug = slug.length > 50 ? slug.substring(0, 50) : slug;
    return `${shortSlug}`;
}

async function checkMissingImages() {
    console.log("🔍 블로그 이미지 점검 시작...");

    // 1. DB에서 발행된 글 목록 가져오기
    const { data: posts, error } = await supabase
        .from("content_queue")
        .select("slug, title, published_at")
        .eq("status", "published")
        .order("published_at", { ascending: false });

    if (error) {
        console.error("❌ DB 조회 실패:", error);
        return;
    }

    console.log(`📝 총 발행된 글 수: ${posts.length}개`);

    // 2. 로컬 이미지 파일 목록 가져오기
    const imagesDir = path.join(process.cwd(), "public", "blog-images");
    if (!fs.existsSync(imagesDir)) {
        console.log("❌ public/blog-images 폴더가 없습니다.");
        return;
    }

    const files = fs.readdirSync(imagesDir);
    console.log(`🖼️  보유 중인 이미지 파일 수: ${files.length}개`);

    // 3. 미생성 글 찾기
    const missingPosts = [];

    for (const post of posts) {
        const startName = getStartFileName(post.slug);

        // 파일명이 해당 슬러그로 시작하는지 확인
        const hasImage = files.some(file => file.startsWith(startName));

        if (!hasImage) {
            missingPosts.push(post);
        }
    }

    console.log(`\n⚠️  **이미지가 없는 글: ${missingPosts.length}개**`);

    missingPosts.forEach((post, i) => {
        console.log(`${i + 1}. [${post.title}] (Slug: ${post.slug})`);
    });

    console.log("\n✅ 점검 완료");
}

checkMissingImages();
