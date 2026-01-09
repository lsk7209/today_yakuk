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
      주제: "${topic}"
      
      위 주제로 한국 약국 찾기 서비스(TodayYakuk)의 블로그 포스트를 작성해 주세요.
      독자는 일반 대중이며, 전문적이면서도 이해하기 쉬운 톤으로 작성하세요.
      
      출력 형식 (JSON Only):
      {
        "title": "클릭을 유도하는 매력적인 제목",
        "slug_suggestion": "seo-friendly-english-slug (e.g., spring-allergy-tips)",
        "summary": "150자 내외의 메타 디스크립션용 요약",
        "content_html": "<section>...</section> 형태의 HTML 본문. <h2>, <h3>, <p>, <ul>, <li> 태그를 적절히 사용. *Markdown 사용 금지*",
        "faq": [
          {"question": "예상 질문 1", "answer": "답변 1"},
          {"question": "예상 질문 2", "answer": "답변 2"}
        ]
      }
      
      작성 가이드:
      1. 서론: 왜 이 시기에 이 주제가 중요한지 공감 유도
      2. 본론: 실용적인 관리법, 약국에서 찾을 수 있는 해결책(성분명 위주, 특정 브랜드 홍보 지양)
      3. 결론: 전문가(약사/의사) 상담의 중요성 강조
      4. HTML 내에 <html>, <body> 태그는 포함하지 마세요.
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
