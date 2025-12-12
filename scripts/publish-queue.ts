import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import fetch from "node-fetch";

type ContentQueue = {
  id: string;
  title: string;
  slug: string;
  region: string | null;
  theme: string | null;
  content_html: string | null;
  ai_summary: string | null;
  ai_bullets: string[] | null;
  ai_faq: { question: string; answer: string }[] | null;
  ai_cta: string | null;
  extra_sections: { title: string; body: string }[] | null;
  status: string;
  publish_at: string;
};

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const geminiApiKey = process.env.GEMINI_API_KEY;

const GeminiResponse = z.object({
  summary: z.string().optional(),
  bullets: z.array(z.string()).optional(),
  faq: z
    .array(
      z.object({
        question: z.string(),
        answer: z.string(),
      }),
    )
    .optional(),
  cta: z.string().optional(),
  extra_sections: z
    .array(
      z.object({
        title: z.string(),
        body: z.string(),
      }),
    )
    .optional(),
});

function ensureEnv() {
  if (!supabaseUrl) throw new Error("SUPABASE_URL 또는 NEXT_PUBLIC_SUPABASE_URL이 필요합니다.");
  if (!supabaseServiceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY가 필요합니다.");
  if (!geminiApiKey) {
    console.warn("GEMINI_API_KEY가 설정되지 않아 AI 생성 없이 게시만 수행합니다.");
  }
}

async function callGemini(prompt: string) {
  if (!geminiApiKey) return null;
  const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": geminiApiKey,
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.4,
        topK: 32,
        topP: 0.95,
        maxOutputTokens: 1536,
      },
    }),
  });
  if (!res.ok) {
    console.warn("Gemini request failed", res.status);
    return null;
  }
  const json = (await res.json()) as any;
  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) return null;
  try {
    const parsed = GeminiResponse.parse(JSON.parse(text));
    return parsed;
  } catch (e) {
    console.warn("Gemini parse failed", e);
    return null;
  }
}

async function publishPending(limit = 2) {
  const supabase = createClient(supabaseUrl as string, supabaseServiceKey as string);

  const now = new Date().toISOString();
  const { data: pending, error } = await supabase
    .from("content_queue")
    .select(
      "id, title, slug, region, theme, content_html, ai_summary, ai_bullets, ai_faq, ai_cta, extra_sections, status, publish_at",
    )
    .eq("status", "pending")
    .lte("publish_at", now)
    .order("publish_at", { ascending: true })
    .limit(limit);

  if (error) throw error;
  if (!pending || !pending.length) {
    console.info("No pending items to publish.");
    return;
  }

  const updates = [];

  for (const item of pending) {
    let ai = null;
    if (geminiApiKey) {
      const prompt = [
        "다음 약국 콘텐츠를 한국어로 생성하세요. 규칙:",
        "- 불필요한 광고성 문구 금지, 존댓말, 간결하고 사실 기반",
        "- summary 2~3문장",
        "- bullets 3~5개",
        "- faq 3~5개 (question/answer)",
        "- cta 1문장 (예: 내 주변 찾기/전화/길찾기 안내)",
        "- extra_sections 0~2개 (title, body)",
        "",
        `제목: ${item.title}`,
        item.region ? `지역: ${item.region}` : "",
        item.theme ? `주제: ${item.theme}` : "",
        item.content_html ? `원문(참고): ${item.content_html.slice(0, 1200)}` : "",
        "",
        "응답은 JSON 형식으로만 반환하세요. 키: summary, bullets, faq[{question,answer}], cta, extra_sections[{title,body}]",
      ]
        .filter(Boolean)
        .join("\n");
      ai = await callGemini(prompt);
    }

    updates.push({
      id: item.id,
      ai_summary: ai?.summary ?? item.ai_summary ?? null,
      ai_bullets: ai?.bullets ?? item.ai_bullets ?? null,
      ai_faq: ai?.faq ?? item.ai_faq ?? null,
      ai_cta: ai?.cta ?? item.ai_cta ?? null,
      extra_sections: ai?.extra_sections ?? item.extra_sections ?? null,
    });
  }

  const ids = pending.map((item) => item.id);
  const { error: updateError } = await supabase
    .from("content_queue")
    .update({
      status: "published",
      published_at: now,
      updated_at: now,
    })
    .in("id", ids);

  if (updateError) throw updateError;

  // Apply AI fields
  for (const up of updates) {
    const { error: detailErr } = await supabase
      .from("content_queue")
      .update({
        ai_summary: up.ai_summary,
        ai_bullets: up.ai_bullets,
        ai_faq: up.ai_faq,
        ai_cta: up.ai_cta,
        extra_sections: up.extra_sections,
      })
      .eq("id", up.id);
    if (detailErr) {
      console.warn("Failed to update AI fields for", up.id, detailErr);
    }
  }

  console.info(`Published ${ids.length} items:`, ids);
}

async function main() {
  ensureEnv();
  await publishPending();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

