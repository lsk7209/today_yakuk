
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// 환경 변수 로드
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const geminiApiKey = process.env.GEMINI_API_KEY;
if (!geminiApiKey) {
    console.error("❌ GEMINI_API_KEY가 없습니다. .env.local을 확인해주세요.");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(geminiApiKey);
const modelName = "gemini-2.5-flash-image";
const model = genAI.getGenerativeModel({ model: modelName });

// 파일명 생성 로직
function getFileName(slug: string): string {
    const shortSlug = slug.length > 50 ? slug.substring(0, 50) : slug;
    return `${shortSlug}.png`;
}

// 딜레이 함수
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
    console.log(`🔍 미생성 블로그 이미지 생성 작업 시작 (Model: ${modelName} - Image Gen)...`);

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

    // 2. 로컬 이미지 폴더 확인
    const publicDir = path.join(process.cwd(), "public", "blog-images");
    if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
    }

    // 3. 미생성 글 찾기
    const missingPosts = [];
    for (const post of posts) {
        const fileName = getFileName(post.slug);
        const filePath = path.join(publicDir, fileName);
        if (!fs.existsSync(filePath)) {
            missingPosts.push(post);
        }
    }

    console.log(`\n⚠️  **이미지 생성 대상: ${missingPosts.length}개**`);

    if (missingPosts.length === 0) {
        console.log("🎉 모든 글에 이미지가 존재합니다.");
        return;
    }

    // 4. 순차적으로 이미지 생성
    for (let i = 0; i < missingPosts.length; i++) {
        const post = missingPosts[i];
        const fileName = getFileName(post.slug);
        const filePath = path.join(publicDir, fileName);

        console.log(`\n[${i + 1}/${missingPosts.length}] 생성 중... "${post.title}"`);

        try {
            const prompt = `Generate a photorealistic, professional, and warm illustration suitable for a blog post about: "${post.title}". The style should be modern and inviting. NO TEXT.`;

            const result = await model.generateContent(prompt);
            const response = result.response;

            // 이미지 데이터 추출 (inlineData or executable code logic if applicable, but usually inlineData for native img gen)
            // Note: Standard Gemini API for image generation usually involves a separate method or retrieving 'candidates[0].content.parts[0].inlineData'

            // Check for images in candidates
            // @ts-ignore
            const candidates = response.candidates || [];
            let imagePart = null;

            for (const candidate of candidates) {
                // @ts-ignore
                const parts = candidate.content?.parts || [];
                for (const part of parts) {
                    // @ts-ignore
                    if (part.inlineData && part.inlineData.mimeType.startsWith("image/")) {
                        imagePart = part.inlineData;
                        break;
                    }
                }
                if (imagePart) break;
            }

            if (imagePart) {
                // Base64 decoding
                const buffer = Buffer.from(imagePart.data, 'base64');
                fs.writeFileSync(filePath, buffer);
                console.log(`   ✅ 저장 완료: ${fileName}`);
            } else {
                console.warn(`   ⚠️ 이미지 데이터가 없습니다. 응답: ${response.text()}`);
                // If the model refuses to generate text, it might just return text saying "I can't".
            }

        } catch (err: any) {
            console.error(`   ❌ 생성 실패 (${post.title}):`, err.message);
        }

        if (i < missingPosts.length - 1) {
            console.log("   ⏳ 대기 중 (5초)...");
            await delay(5000);
        }
    }
}

main();
