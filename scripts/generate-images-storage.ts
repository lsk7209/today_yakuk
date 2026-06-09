/**
 * 블로그 이미지 생성 — 로컬 public/blog-images/ 에 저장
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
const modelName = "gemini-2.0-flash-exp";
const model = genAI.getGenerativeModel({ model: modelName });

const PUBLIC_DIR = path.join(process.cwd(), "public", "blog-images");
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface ContentItem {
    id: string;
    slug: string;
    title: string;
    image_url: string | null;
}

async function generateAndSaveImage(item: ContentItem): Promise<string | null> {
    const fileName = `${item.slug}.png`;
    const filePath = path.join(PUBLIC_DIR, fileName);

    if (fs.existsSync(filePath)) {
        console.log(`   ⏭️ 이미 존재: ${fileName}`);
        return `/blog-images/${fileName}`;
    }

    try {
        const prompt = `Create a warm, professional illustration for a Korean pharmacy/health blog post titled: "${item.title}".
Style: Modern, clean, friendly, suitable for healthcare content.
Include: Pharmacy-related imagery like medicine bottles, healthy lifestyle elements, or Korean traditional wellness motifs.
Colors: Soft, welcoming palette with greens, blues, or warm tones.
NO TEXT in the image.`;

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
        console.log(`   ✅ 저장 완료: ${fileName}`);
        return `/blog-images/${fileName}`;

    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`   ❌ 오류:`, message);
        return null;
    }
}

async function main() {
    console.log("🖼️ 블로그 이미지 자동 생성 시작...\n");

    const result = await db.execute({
        sql: "SELECT id, slug, title, image_url FROM content_queue WHERE status IN ('pending', 'published') AND image_url IS NULL ORDER BY created_at DESC LIMIT 10",
        args: [],
    });

    if (!result.rows.length) {
        console.log("✅ 이미지 생성이 필요한 컨텐츠가 없습니다.");
        return;
    }

    const items = result.rows as unknown as ContentItem[];
    console.log(`📝 이미지 생성 대상: ${items.length}개\n`);

    let successCount = 0;

    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        console.log(`[${i + 1}/${items.length}] "${item.title}"`);

        const imageUrl = await generateAndSaveImage(item);

        if (imageUrl) {
            await db.execute({
                sql: "UPDATE content_queue SET image_url = ? WHERE id = ?",
                args: [imageUrl, item.id],
            });
            successCount++;
        }

        if (i < items.length - 1) {
            console.log("   ⏳ 대기 (5초)...\n");
            await delay(5000);
        }
    }

    console.log(`\n🎉 완료: ${successCount}/${items.length}개 이미지 생성됨`);
}

main().catch(console.error);
