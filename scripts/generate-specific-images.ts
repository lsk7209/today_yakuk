/**
 * 특정 슬러그에 대한 이미지 생성 — 로컬 public/blog-images/ 에 저장
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { getTursoClient } from "../src/lib/turso";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const db = getTursoClient();

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

const PUBLIC_DIR = path.join(process.cwd(), "public", "blog-images");
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 대상 슬러그 목록
const TARGET_SLUGS = [
    "pharmacy-A2115402",
    "pharmacy-A2402186",
    "pharmacy-A2602368"
];

async function generateImage(slug: string, title: string): Promise<string | null> {
    const fileName = `${slug}.png`;
    const filePath = path.join(PUBLIC_DIR, fileName);

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

        if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR, { recursive: true });

        const buffer = Buffer.from(imagePart.data, "base64");
        fs.writeFileSync(filePath, buffer);
        return `/blog-images/${fileName}`;

    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`   ❌ 오류:`, message);
        return null;
    }
}

async function main() {
    console.log("🖼️ 특정 슬러그 이미지 생성 시작...\n");

    for (let i = 0; i < TARGET_SLUGS.length; i++) {
        const slug = TARGET_SLUGS[i];
        console.log(`[${i + 1}/${TARGET_SLUGS.length}] ${slug}`);

        const result = await db.execute({
            sql: "SELECT id, title, image_url FROM content_queue WHERE slug = ? LIMIT 1",
            args: [slug],
        });

        if (!result.rows.length) {
            console.log(`   ⚠️ 글을 찾을 수 없음`);
            continue;
        }

        const post = result.rows[0];

        if (post.image_url) {
            console.log(`   ⏭️ 이미 이미지 있음: ${post.image_url}`);
            continue;
        }

        console.log(`   📝 "${post.title}"`);
        const imageUrl = await generateImage(slug, post.title as string);

        if (imageUrl) {
            await db.execute({
                sql: "UPDATE content_queue SET image_url = ? WHERE id = ?",
                args: [imageUrl, post.id as string],
            });
            console.log(`   ✅ 완료: ${imageUrl}`);
        }

        if (i < TARGET_SLUGS.length - 1) {
            console.log("   ⏳ 대기 (5초)...\n");
            await delay(5000);
        }
    }

    console.log("\n🎉 완료!");
}

main().catch(console.error);
