import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

type ContentQueue = {
  id: string;
  hpid: string | null;
  title: string;
  slug: string;
  region: string | null;
  theme: string | null;
  content_html: string | null;
  ai_summary: string | null;
  ai_bullets: { text: string }[] | null;
  ai_faq: { question: string; answer: string }[] | null;
  ai_cta: string | null;
  extra_sections: { title: string; body: string }[] | null;
  status: string;
  publish_at: string;
};

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const geminiApiKey = process.env.GEMINI_API_KEY;
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://todaypharm.kr").replace(/\/$/, "");
const geminiModel = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split(".");
  if (parts.length < 2) return null;
  const payload = parts[1] ?? "";
  try {
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const json = Buffer.from(padded, "base64").toString("utf8");
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

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
  if (!geminiApiKey) throw new Error("GEMINI_API_KEY가 필요합니다. (Gemini 생성)");

  // Supabase 키가 JWT인 경우 payload.role로 anon/service_role 오설정을 빠르게 감지
  const payload = decodeJwtPayload(supabaseServiceKey);
  const role = typeof payload?.role === "string" ? (payload.role as string) : null;
  if (role && role !== "service_role") {
    throw new Error(
      `SUPABASE_SERVICE_ROLE_KEY가 service_role 키가 아닙니다 (현재 role='${role}'). GitHub Secrets에 anon 키가 들어가 있지 않은지 확인하세요.`,
    );
  }
}

async function publishPending(limit = 2) {
  const supabase = createClient(supabaseUrl as string, supabaseServiceKey as string);

  const now = new Date().toISOString();
  const { data: pending, error } = await supabase
    .from("content_queue")
    .select(
      "id, hpid, title, slug, region, theme, content_html, ai_summary, ai_bullets, ai_faq, ai_cta, extra_sections, status, publish_at",
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

  const enriched: ContentQueue[] = [];

  for (const item of pending) {
    const needsGen =
      !item.content_html || !item.ai_summary || !item.ai_faq || !item.ai_bullets || !item.ai_cta;
    const generated = needsGen ? await generateContent(item) : null;
    enriched.push({
      ...item,
      ai_summary: generated?.summary ?? item.ai_summary,
      ai_bullets: generated?.bullets?.map((text) => ({ text })) ?? item.ai_bullets,
      ai_faq: generated?.faq ?? item.ai_faq,
      ai_cta: generated?.cta ?? item.ai_cta,
      extra_sections: generated?.extra_sections ?? item.extra_sections,
      content_html: item.content_html ?? buildHtml(item, generated),
    });
  }

  const rows = enriched.map((item) => ({
    id: item.id,
    status: "published",
    published_at: now,
    updated_at: now,
    content_html: item.content_html,
    ai_summary: item.ai_summary,
    ai_bullets: item.ai_bullets,
    ai_faq: item.ai_faq,
    ai_cta: item.ai_cta,
    extra_sections: item.extra_sections,
  }));

  const { error: updateError } = await supabase.from("content_queue").upsert(rows);

  if (updateError) throw updateError;

  console.info(`Published ${rows.length} items:`, rows.map((r) => r.id));
}

async function main() {
  ensureEnv();
  const limitRaw = process.env.PUBLISH_LIMIT ?? "2";
  const limit = Number.isFinite(Number(limitRaw)) ? Math.max(1, Math.min(10, Number(limitRaw))) : 2;
  await publishPending(limit);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

async function generateContent(item: ContentQueue) {
  const prompt = buildPrompt(item);

  // Google Gemini API 문서 참고: https://ai.google.dev/gemini-api/docs/api-key
  // v1beta 엔드포인트와 최신 모델 사용
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": geminiApiKey as string,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        safetySettings: [
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_LOW_AND_ABOVE" },
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_LOW_AND_ABOVE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_LOW_AND_ABOVE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_LOW_AND_ABOVE" },
        ],
      }),
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gemini API error: ${res.status} ${text}`);
  }

  const data = (await res.json()) as any;
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text as string | undefined;
  if (!text) throw new Error("Gemini response empty");

  const jsonStart = text.indexOf("{");
  const jsonEnd = text.lastIndexOf("}");
  if (jsonStart === -1 || jsonEnd === -1) throw new Error("Gemini response parse error");
  const parsed = GeminiResponse.safeParse(JSON.parse(text.slice(jsonStart, jsonEnd + 1)));
  if (!parsed.success) {
    throw new Error(`Gemini response validation failed: ${parsed.error.message}`);
  }
  return parsed.data;
}

function buildPrompt(item: ContentQueue): string {
  const targetUrl = `${siteUrl}/pharmacy/${item.hpid ?? item.slug}`;
  return `
당신은 한국어 약국 안내 콘텐츠를 작성하는 전문 작가입니다. 아래 스키마를 만족하는 JSON만 출력하세요.
스키마:
{
  "summary": "2~4문장",
  "bullets": ["불릿1", "불릿2", "불릿3"],
  "faq": [{"question": "Q", "answer": "A"}],
  "cta": "CTA 문구",
  "extra_sections": [{"title": "섹션 제목", "body": "짧은 본문"}]
}
규칙:
- 존댓말, 과장·광고성 금지, 의료행위/진단 금지
- 중복 최소화, 지역/영업정보 있으면 반영
- FAQ 3~5개, 불릿 3~5개, CTA 1문장
참고:
- 타겟 URL: ${targetUrl}
- 슬러그: ${item.slug}
- 제목: ${item.title}
- 지역: ${item.region ?? "정보 없음"}
- 테마: ${item.theme ?? "정보 없음"}
- 기존 본문 일부: ${(item.content_html ?? "").slice(0, 300)}
JSON만 반환하세요.`;
}

function buildHtml(
  item: ContentQueue,
  gen?: z.infer<typeof GeminiResponse> | null,
): string | null {
  if (!gen) return item.content_html ?? null;
  const bullets = gen.bullets?.map((b) => `<li>${b}</li>`).join("") ?? "";
  const faq =
    gen.faq
      ?.map((f) => `<div><h3>${f.question}</h3><p>${f.answer}</p></div>`)
      .join("") ?? "";
  const extras =
    gen.extra_sections
      ?.map((s) => `<section><h3>${s.title}</h3><p>${s.body}</p></section>`)
      .join("") ?? "";
  return `
<section>
  <p>${gen.summary ?? ""}</p>
  <ul>${bullets}</ul>
  ${extras}
  <section>
    <h2>자주 묻는 질문</h2>
    ${faq}
  </section>
  <p>${gen.cta ?? ""}</p>
</section>`;
}
