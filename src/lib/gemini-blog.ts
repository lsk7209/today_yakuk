import { GoogleGenerativeAI } from "@google/generative-ai";

const geminiApiKey = process.env.GEMINI_API_KEY;
const geminiModel = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";

if (!geminiApiKey) {
    console.warn("GEMINI_API_KEY가 설정되지 않았습니다. 블로그 생성이 불가능합니다.");
}

const genAI = new GoogleGenerativeAI(geminiApiKey || "");
const model = genAI.getGenerativeModel({ model: geminiModel });

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

        const result = await model.generateContent(prompt);
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
        "summary": "Meta description (max 150 chars). Hook the reader instantly.",
        "content_html": "Semantic HTML content. MUST use <h2> for main sections, <h3> for subsections. use <ul><li> for all lists. Split long text into short paragraphs. Use <strong> for emphasis. NO <html>/<body> tags. DO NOT use Markdown symbols (** or ##).",
        "faq": [
          {"question": "Real user question 1", "answer": "Clear, concise answer"},
          {"question": "Real user question 2", "answer": "Clear, concise answer"},
          {"question": "Real user question 3", "answer": "Clear, concise answer"}
        ]
      }

      **Content Guidelines**:
      1.  **Tone**: Empathetic, Authoritative, yet Accessible (Grade 8 reading level).
      2.  **Structure**:
          - **Hook**: Start with a relatable problem.
          - **Body**: Practical advice, over-the-counter (OTC) solutions options (generic names preferred over brands).
          - **CTA**: Strongly advise checking "TodayYakuk" to find open pharmacies nearby (24/7, weekends).
      3.  **Formatting**: 
          - **Strictly use HTML tags**: <h2>, <h3>, <ul>, <li>, <strong>, <table>.
          - **Short Paragraphs**: No chunk of text should exceed 3 lines. Break them up.
      4.  **Rich Content Requirements** (MUST include at least 2 of these):
          - **Tables**: Use <table> for comparisons (e.g., Supplement vs Drug, Product A vs B).
          - **Info Box**: Use <div class="info-box"><h3>Title</h3><p>Content</p></div> for key facts.
          - **Warning Box**: Use <div class="warning-box"><h3>주의사항</h3><p>Content</p></div> for side effects/warnings.
          - **Tip Box**: Use <div class="tip-box"><h3>약사 팁</h3><p>Content</p></div> for actionable advice.
          - **Pros/Cons**: Use the following structure:
            <div class="pros-cons-grid">
              <div class="pros-box"><h3>장점</h3><ul><li>...</li></ul></div>
              <div class="cons-box"><h3>단점</h3><ul><li>...</li></ul></div>
            </div>
      5.  **SEO**: Naturally weave related keywords (e.g., "weekend pharmacy", "night pharmacy", "emergency medicine").
      6.  **Conclusion**: Must include a "Pharmacist's Note" or "When to visit a doctor" disclaimer defined in a <div class="tip-box">.
    `;

        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
        });

        const response = result.response;
        const text = response.text();

        return JSON.parse(text) as BlogPost;
    } catch (error) {
        console.error("Blog post generation failed:", error);
        return null;
    }
}
