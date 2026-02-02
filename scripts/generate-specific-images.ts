/**
 * 특정 슬러그에 대한 이미지 생성
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Supabase 환경 변수가 없습니다.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const geminiApiKey = process.env.GEMINI_API_KEY;
if (!geminiApiKey) {
    console.error("❌ GEMINI_API_KEY가 없습니다.");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(geminiApiKey);
const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-exp-image-generation",
    generationConfig: {
        // @ts-expect-error - Gemini image generation config
        responseModalities: ["Text", "Image"],
    }
});

const BUCKET_NAME = "blog-images";
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 대상 슬러그 목록
const TARGET_SLUGS = [
    "pharmacy-A2115402",
    "pharmacy-A2402186",
    "pharmacy-A2602368"
];

async function ensureBucketExists() {
    const { data: buckets } = await supabase.storage.listBuckets();
    const exists = buckets?.some(b => b.name === BUCKET_NAME);

    if (!exists) {
        const { error } = await supabase.storage.createBucket(BUCKET_NAME, {
            public: true,
            fileSizeLimit: 5242880,
        });
        if (error) {
            console.error("❌ 버킷 생성 실패:", error.message);
            return false;
        }
        console.log(`✅ '${BUCKET_NAME}' 버킷 생성 완료`);
    }
    return true;
}

async function generateImage(slug: string, title: string): Promise<string | null> {
    const fileName = `${slug}.png`;

    try {
        const prompt = `Create a warm, professional illustration for a Korean pharmacy blog post titled: "${title}". 
Style: Modern, clean, friendly healthcare imagery.
Include: Pharmacy elements, medicine, healthy lifestyle.
Colors: Soft welcoming palette with greens and blues.
NO TEXT in the image.`;

        console.log(`   🎨 Gemini API 호출 중...`);
        const result = await model.generateContent(prompt);
        const response = result.response;

        const candidates = response.candidates || [];
        let imagePart: { data: string; mimeType: string } | null = null;

        for (const candidate of candidates) {
            const parts = (candidate as { content?: { parts?: unknown[] } }).content?.parts || [];
            for (const part of parts) {
                const p = part as { inlineData?: { data: string; mimeType: string } };
                if (p.inlineData && p.inlineData.mimeType?.startsWith("image/")) {
                    imagePart = p.inlineData;
                    break;
                }
            }
            if (imagePart) break;
        }

        if (!imagePart) {
            console.warn(`   ⚠️ 이미지 생성 실패 (데이터 없음)`);
            return null;
        }

        const buffer = Buffer.from(imagePart.data, "base64");
        const { error: uploadError } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(fileName, buffer, {
                contentType: "image/png",
                upsert: true,
            });

        if (uploadError) {
            console.error(`   ❌ 업로드 실패:`, uploadError.message);
            return null;
        }

        const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);
        return urlData.publicUrl;

    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`   ❌ 오류:`, message);
        return null;
    }
}

async function main() {
    console.log("🖼️ 특정 슬러그 이미지 생성 시작...\n");

    const bucketReady = await ensureBucketExists();
    if (!bucketReady) return;

    for (let i = 0; i < TARGET_SLUGS.length; i++) {
        const slug = TARGET_SLUGS[i];
        console.log(`[${i + 1}/${TARGET_SLUGS.length}] ${slug}`);

        // DB에서 해당 글 조회
        const { data: post, error } = await supabase
            .from("content_queue")
            .select("id, title, image_url")
            .eq("slug", slug)
            .single();

        if (error || !post) {
            console.log(`   ⚠️ 글을 찾을 수 없음`);
            continue;
        }

        if (post.image_url) {
            console.log(`   ⏭️ 이미 이미지 있음: ${post.image_url}`);
            continue;
        }

        console.log(`   📝 "${post.title}"`);
        const imageUrl = await generateImage(slug, post.title);

        if (imageUrl) {
            const { error: updateError } = await supabase
                .from("content_queue")
                .update({ image_url: imageUrl })
                .eq("id", post.id);

            if (updateError) {
                console.error(`   ⚠️ DB 업데이트 실패:`, updateError.message);
            } else {
                console.log(`   ✅ 완료: ${imageUrl}`);
            }
        }

        if (i < TARGET_SLUGS.length - 1) {
            console.log("   ⏳ 대기 (5초)...\n");
            await delay(5000);
        }
    }

    console.log("\n🎉 완료!");
}

main().catch(console.error);
