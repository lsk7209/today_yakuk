import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { getTursoClient } from "../src/lib/turso";

dotenv.config({ path: ".env.local" });

const db = getTursoClient();

const geminiApiKey = process.env.GEMINI_API_KEY;
if (!geminiApiKey) {
    console.error("❌ GEMINI_API_KEY가 없습니다. .env.local을 확인해주세요.");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(geminiApiKey);
const modelName = "gemini-2.5-flash-image";
const model = genAI.getGenerativeModel({ model: modelName });

function getFileName(slug: string): string {
    return `${slug}.png`;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
    console.log(`🔍 미생성 블로그 이미지 생성 작업 시작 (Model: ${modelName})...`);

    const result = await db.execute({
        sql: "SELECT slug, title, published_at FROM content_queue WHERE status = 'published' ORDER BY published_at DESC",
        args: [],
    });

    console.log(`📝 총 발행된 글 수: ${result.rows.length}개`);

    const publicDir = path.join(process.cwd(), "public", "blog-images");
    if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
    }

    const missingPosts = result.rows.filter(row => {
        const filePath = path.join(publicDir, getFileName(row.slug as string));
        return !fs.existsSync(filePath);
    });

    console.log(`\n⚠️  **이미지 생성 대상: ${missingPosts.length}개**`);

    if (missingPosts.length === 0) {
        console.log("🎉 모든 글에 이미지가 존재합니다.");
        return;
    }

    for (let i = 0; i < missingPosts.length; i++) {
        const post = missingPosts[i];
        const fileName = getFileName(post.slug as string);
        const filePath = path.join(publicDir, fileName);

        console.log(`\n[${i + 1}/${missingPosts.length}] 생성 중... "${post.title}"`);

        try {
            const prompt = `Generate a photorealistic, professional, and warm illustration suitable for a blog post about: "${post.title}". The style should be modern and inviting. NO TEXT.`;

            const result = await model.generateContent(prompt);
            const response = result.response;

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
                const buffer = Buffer.from(imagePart.data, 'base64');
                fs.writeFileSync(filePath, buffer);
                console.log(`   ✅ 저장 완료: ${fileName}`);
            } else {
                console.warn(`   ⚠️ 이미지 데이터가 없습니다.`);
            }

        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            console.error(`   ❌ 생성 실패 (${post.title}):`, message);
        }

        if (i < missingPosts.length - 1) {
            console.log("   ⏳ 대기 중 (5초)...");
            await delay(5000);
        }
    }
}

main();
