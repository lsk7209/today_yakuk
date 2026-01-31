import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

let _model: GenerativeModel | null = null;

function getModel(): GenerativeModel {
  if (!_model) {
    const geminiApiKey = process.env.GEMINI_API_KEY;
    const geminiModel = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";

    if (!geminiApiKey) {
      throw new Error("GEMINI_API_KEY가 설정되지 않았습니다.");
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    _model = genAI.getGenerativeModel({ model: geminiModel });
  }
  return _model;
}

export type BlogPost = {
  title: string;
  slug_suggestion: string;
  summary: string;
  content_html: string;
  faq: { question: string; answer: string }[];
};

/**
 * 현재 시즌에 맞는 건강/약국 관련 주제를 생성합니다.
 */
export async function generateBlogTopic(): Promise<string | null> {
  try {
    const now = new Date();
    const month = now.getMonth() + 1;

    const prompt = `
      당신은 한국의 건강/약학 전문 에디터입니다.
      ${month}월 한국의 계절적 특성, 유행하는 질병, 또는 건강 이슈(예: 미세먼지, 알레르기, 독감, 영양제 등)를 고려하여,
      사람들이 가장 검색할 만한 "실용적인 건강 정보 및 약국 이용 팁" 주제 1가지를 추천해 주세요.
      
      조건:
      1. 약국 방문을 유도하거나 일반의약품/건강기능식품 정보를 포함할 수 있는 주제여야 합니다.
      2. 전문적인 의학 진단보다는 "생활 속 관리법"과 "약국 활용법"에 초점을 맞추세요.
      3. 오직 주제 제목(Title)만 텍스트로 반환하세요. (따옴표나 설명 없이)
    `;

    const result = await getModel().generateContent(prompt);
    const response = result.response;
    return response.text().trim();
  } catch (error) {
    console.error("Blog topic generation failed:", error);
    return null;
  }
}

/**
 * 주제를 바탕으로 블로그 포스트 내용을 생성합니다.
 */
export async function generateBlogPost(topic: string): Promise<BlogPost | null> {
  try {
    const prompt = `
      **Role**: You are a professional health columnist and SEO specialist for "TodayYakuk" (Korean Pharmacy Finder Service).
      **Target Audience**: General public in Korea looking for quick, reliable health info and pharmacy access.
      **Topic**: "${topic}"

      **Objective**: Write a high-converting, SEO-optimized blog post that encourages users to visit a pharmacy or consult a pharmacist.

      **Output Format**: JSON ONLY (No Markdown, No extra text)
      {
        "title": "Create a 'Click-Magnet' title using psychological triggers (Urgency, Curiosity, Benefit). EXACTLY 1 line.",
        "slug_suggestion": "seo-friendly-korean-english-slug (e.g., spring-allergy-emergency-tips)",
        "summary": "Meta description (120-155 chars). Hook the reader instantly. Include primary keyword.",
        "content_html": "Semantic HTML content. See formatting rules below.",
        "faq": [
          {"question": "Real user question 1", "answer": "Clear, concise answer"},
          {"question": "Real user question 2", "answer": "Clear, concise answer"},
          {"question": "Real user question 3", "answer": "Clear, concise answer"}
        ]
      }

      **Content Structure (MUST follow this order)**:
      1. **Key Takeaways Box** (REQUIRED at the very start):
         <div class="key-takeaways">
           <h3>📌 핵심 정리</h3>
           <ul>
             <li>Key point 1</li>
             <li>Key point 2</li>
             <li>Key point 3</li>
           </ul>
         </div>
      
      2. **Introduction**: Hook with a relatable problem (2-3 short paragraphs).
      
      3. **Main Content**: Use <h2> for sections, <h3> for subsections.
      
      4. **Expert Quote** (REQUIRED, at least 1):
         <blockquote class="expert-quote">
           <p>"약사의 조언이나 권위 있는 정보"</p>
           <cite>— 약국오늘 전문 약사</cite>
         </blockquote>
      
      5. **CTA**: Recommend checking "TodayYakuk" for nearby pharmacies.

      **Rich Content Elements (MUST use at least 4 of these)**:
      
      - **Tables**: <table> for comparisons
        <table>
          <thead><tr><th>구분</th><th>특징</th><th>추천</th></tr></thead>
          <tbody><tr><td>...</td><td>...</td><td>...</td></tr></tbody>
        </table>
      
      - **Info Box**: <div class="info-box"><h3>💡 알아두세요</h3><p>...</p></div>
      
      - **Warning Box**: <div class="warning-box"><h3>⚠️ 주의사항</h3><p>...</p></div>
      
      - **Tip Box**: <div class="tip-box"><h3>💊 약사 팁</h3><p>...</p></div>
      
      - **Step Cards** (for procedures):
        <div class="step-cards">
          <div class="step-card"><span class="step-number">1</span><h4>Step Title</h4><p>Description</p></div>
          <div class="step-card"><span class="step-number">2</span><h4>Step Title</h4><p>Description</p></div>
        </div>
      
      - **Checklist**:
        <ul class="checklist">
          <li>✅ Item 1</li>
          <li>✅ Item 2</li>
        </ul>
      
      - **Stat Highlight** (for important numbers):
        <div class="stat-highlight">
          <span class="stat-number">85%</span>
          <span class="stat-label">of patients see improvement</span>
        </div>
      
      - **Pros/Cons Grid**:
        <div class="pros-cons-grid">
          <div class="pros-box"><h3>👍 장점</h3><ul><li>...</li></ul></div>
          <div class="cons-box"><h3>👎 단점</h3><ul><li>...</li></ul></div>
        </div>

      **Content Guidelines**:
      1. **Tone**: Empathetic, Authoritative, yet Accessible (Grade 8 reading level).
      2. **Short Paragraphs**: No chunk of text should exceed 3 lines.
      3. **SEO Keywords**: Naturally include "주말 약국", "야간 약국", "근처 약국", "영양제 추천" where relevant.
      4. **E-E-A-T**: Include phrases like "약사 추천", "전문가 조언", "임상 연구에 따르면".
      5. **Internal Links**: Mention "약국오늘에서 근처 약국 찾기" (will be auto-linked).
      6. **Conclusion**: End with <div class="tip-box"> containing pharmacist's final note.

      **GEO (Generative Engine Optimization) for AI Search**:
      - Write clear, factual statements that AI can directly quote.
      - Structure answers in Q&A format where appropriate.
      - Include specific numbers, statistics, and measurable claims.
      - Use authoritative language: "연구에 따르면", "전문가들은 권장합니다".
      - Provide step-by-step instructions that AI assistants can relay.
    `;

    const result = await getModel().generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    });

    const response = result.response;
    const text = response.text();

    try {
      return JSON.parse(text) as BlogPost;
    } catch (parseError) {
      console.error("JSON Parse Error. Response text (first 500 chars):", text.substring(0, 500));
      console.error("JSON Parse Error. Response text (last 500 chars):", text.substring(text.length - 500));
      throw parseError;
    }
  } catch (error) {
    console.error("Blog post generation failed:", error);
    return null;
  }
}
