/**
 * 블로그 이미지 생성 및 Supabase Storage 업로드
 * GitHub Actions에서 실행되어 발행 대기 중인 컨텐츠의 이미지를 자동 생성
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

// 환경 변수 로드
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
const modelName = "gemini-2.0-flash-exp"; // 이미지 생성 지원 모델
const model = genAI.getGenerativeModel({ model: modelName });

const BUCKET_NAME = "blog-images";
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface ContentItem {
    id: string;
    slug: string;
    title: string;
    image_url: string | null;
}

async function ensureBucketExists() {
    const { data: buckets } = await supabase.storage.listBuckets();
    const exists = buckets?.some(b => b.name === BUCKET_NAME);

    if (!exists) {
        const { error } = await supabase.storage.createBucket(BUCKET_NAME, {
            public: true,
            fileSizeLimit: 5242880, // 5MB
        });
        if (error) {
            console.error("❌ 버킷 생성 실패:", error.message);
            return false;
        }
        console.log(`✅ '${BUCKET_NAME}' 버킷 생성 완료`);
    }
    return true;
}

async function generateAndUploadImage(item: ContentItem): Promise<string | null> {
    const fileName = `${item.slug}.png`;

    // 이미 Storage에 있는지 확인
    const { data: existing } = await supabase.storage
        .from(BUCKET_NAME)
        .list("", { search: fileName });

    if (existing && existing.length > 0) {
        const existingFile = existing.find(f => f.name === fileName);
        if (existingFile) {
            console.log(`   ⏭️ 이미 존재: ${fileName}`);
            const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);
            return urlData.publicUrl;
        }
    }

    try {
        // 이미지 생성 프롬프트
        const prompt = `Create a warm, professional illustration for a Korean pharmacy/health blog post titled: "${item.title}". 
Style: Modern, clean, friendly, suitable for healthcare content. 
Include: Pharmacy-related imagery like medicine bottles, healthy lifestyle elements, or Korean traditional wellness motifs.
Colors: Soft, welcoming palette with greens, blues, or warm tones.
NO TEXT in the image.`;

        const result = await model.generateContent(prompt);
        const response = result.response;

        // 이미지 데이터 추출
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

        // Base64 디코딩 및 업로드
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
        console.log(`   ✅ 생성 및 업로드 완료`);
        return urlData.publicUrl;

    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`   ❌ 오류:`, message);
        return null;
    }
}

async function main() {
    console.log("🖼️ 블로그 이미지 자동 생성 시작...\n");

    // 버킷 확인/생성
    const bucketReady = await ensureBucketExists();
    if (!bucketReady) {
        console.error("버킷 준비 실패. 종료합니다.");
        return;
    }

    // 발행 대기 중이거나 발행된 컨텐츠 중 이미지가 없는 것 조회
    const { data: items, error } = await supabase
        .from("content_queue")
        .select("id, slug, title, image_url")
        .in("status", ["pending", "published"])
        .is("image_url", null)
        .order("created_at", { ascending: false })
        .limit(10); // Rate limit 고려

    if (error) {
        console.error("❌ DB 조회 실패:", error.message);
        return;
    }

    if (!items || items.length === 0) {
        console.log("✅ 이미지 생성이 필요한 컨텐츠가 없습니다.");
        return;
    }

    console.log(`📝 이미지 생성 대상: ${items.length}개\n`);

    let successCount = 0;

    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        console.log(`[${i + 1}/${items.length}] "${item.title}"`);

        const imageUrl = await generateAndUploadImage(item);

        if (imageUrl) {
            // DB에 이미지 URL 업데이트
            const { error: updateError } = await supabase
                .from("content_queue")
                .update({ image_url: imageUrl })
                .eq("id", item.id);

            if (updateError) {
                console.error(`   ⚠️ DB 업데이트 실패:`, updateError.message);
            } else {
                successCount++;
            }
        }

        // Rate limit 대기 (마지막 아이템 제외)
        if (i < items.length - 1) {
            console.log("   ⏳ 대기 (5초)...\n");
            await delay(5000);
        }
    }

    console.log(`\n🎉 완료: ${successCount}/${items.length}개 이미지 생성됨`);
}

main().catch(console.error);
