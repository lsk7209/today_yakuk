import { GoogleGenerativeAI, GenerativeModel, SchemaType } from "@google/generative-ai";

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
 * 콘텐츠 내 문맥을 파악하여 내부 링크를 자동으로 연결합니다.
 * 주요 키워드에 대해 최초 1회만 링크를 적용하여 SEO를 개선합니다.
 */
function applyInternalLinks(html: string): string {
  // 키워드 매핑 정의
  const linkMapping: Array<{ keywords: string[]; url: string }> = [
    { keywords: ["약국오늘", "TodayYakuk"], url: "/" },
    { keywords: ["근처 약국", "주말 약국", "야간 약국", "휴일지킴이약국", "당번 약국"], url: "/nearby" },
    { keywords: ["건강 정보", "약국 꿀팁", "약국 이용 팁"], url: "/blog" }
  ];

  let newHtml = html;

  for (const { keywords, url } of linkMapping) {
    for (const keyword of keywords) {
      // 이미 링크가 걸린 텍스트 내부는 건너뛰고, 태그 밖의 텍스트만 매칭
      // 정규식 설명:
      // (?<!<[^>]*) : 태그 내부가 아님 (Lookbehind) - 간단한 체크
      // (<a\s[^>]*>.*?<\/a>) : 이미 링크된 태그 덩어리는 스킵하기 위해 매칭 그룹으로 처리? -> 복잡함.
      // 대신, 가장 안전하고 단순한 방법: " <키워드> " 처럼 앞뒤 공백이 있거나, 문장의 시작/끝에 있는 경우를 찾음.

      // Node.js 환경에서 Lookbehind 지원되므로 사용.
      // 단, HTML 태그 속성값 내부(예: alt="약국오늘 로고")를 건드리지 않도록 주의해야 함.
      // 가장 안전한 전략: > 와 < 사이의 텍스트에서만 치환.

      const regex = new RegExp(`(>)([^<]*?)(${keyword})([^<]*?)(<)`, 'i'); // 태그 사이의 텍스트에서 키워드 찾기

      // 첫 번째 매칭만 치환 (Lazy matching으로 인해 여러번 루프 돌 필요 없음, replace는 문자열일 경우 첫번째만, 정규식에 g 없으면 첫번째만)
      // 그러나 위 정규식은 구조적 매칭이라 replace로 한 번에 처리하기 어려움.

      // 대안: 단순 치환하되, 이미 링크된 것은 피하는 정교한 regex 사용
      // 링크 태그 내부가 아님을 보장하기 어려우므로, "생성된 콘텐츠 규칙"에 의존.
      // Gemini는 보통 텍스트로만 줌.

      // 키워드 앞뒤로 태그가 아닌 문자가 오거나 문장의 끝/시작.
      // HTML 태그 내부가 아닌 것을 확인하는 Lookbehind/Lookahead 사용
      // (?![^<]*?>) : 뒤에 닫는 태그 > 가 오기 전에 여는 태그 < 가 오지 않음? -> 태그 내부 아님 판별 난해.

      // 타협안: 단순 replace를 하되, href="..." 속성값 내부가 아님을 확인.
      // (?!<a.*?>) 와 같은 부정형 lookaround는 가변 길이 지원 안 될 수 있음.

      // 가장 현실적인 방법: 키워드가 "텍스트"로 등장하는 첫 번째 위치만 변경.
      // "약국오늘" -> "<a href='/' class='text-emerald-600 font-medium hover:underline'>약국오늘</a>"

      // 링크가 이미 걸려있을 수 있으므로 체크
      if (newHtml.includes(`>${keyword}</a>`)) continue;

      // 태그 닫힘(>) 뒤, 태그 열림(<) 앞의 텍스트 영역에서 매칭
      newHtml = newHtml.replace(
        new RegExp(`(>)([^<]*?)(${keyword})([^<]*?)(<)`, 'i'),
        `$1$2<a href="${url}" class="text-emerald-600 font-medium hover:underline">$3</a>$4$5`
      );
    }
  }

  return newHtml;
}

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
      
      3. **MANDATORY SECTIONS** (You MUST create at least 4-6 H2 sections):
         The article must follow this structural template. Adapt section titles to fit the topic, but you MUST have at least 4 main H2 sections:
         
         Example structure (adapt titles as needed):
         
         <h2>1. [Main Topic] 이해하기: 왜 중요한가?</h2>
           <h3>원인과 메커니즘</h3>
           <h3>증상 및 신호</h3>
           <h3>방치할 경우의 위험</h3>
         
         <h2>2. 약국에서 구할 수 있는 솔루션</h2>
           <h3>일반의약품 추천</h3>
           <h3>건강기능식품 옵션</h3>
           <h3>복용 시 주의사항</h3>
         
         <h2>3. 전문가가 알려주는 실천 가이드</h2>
           <h3>일상 관리법</h3>
           <h3>식습관 및 생활습관 팁</h3>
           <h3>효과적인 타이밍</h3>
         
         <h2>4. 약사에게 꼭 물어봐야 할 것들</h2>
           <h3>상담이 필요한 경우</h3>
           <h3>병원 방문 vs 약국 이용</h3>
           <h3>예방 및 사후 관리</h3>
         
         **CRITICAL**: Each H2 section must have 2-4 H3 subsections with substantial content (150-250 words per subsection).
      
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

      **Content Length Requirements** (CRITICAL for SEO):
      1. **Minimum Total Length**: 1,500 words in English (approximately 2,500-3,000 Korean characters including spaces).
      2. **Main Sections (H2)**: MANDATORY 4-6 major sections (see structure template above).
      3. **Subsections (H3)**: Each H2 MUST have 2-4 H3 subsections for depth.
      4. **Paragraph Depth**: While keeping readability, each subsection should be 150-250 words. Provide thorough explanations, not just bullet points.

      **Content Guidelines**:
      1. **Tone**: Empathetic, Authoritative, yet Accessible (Grade 8 reading level).
      2. **Short Paragraphs**: No chunk of text should exceed 3 lines, but ensure DEPTH through multiple paragraphs per subsection.
      3. **SEO Keywords**: Naturally include "주말 약국", "야간 약국", "근처 약국", "영양제 추천" where relevant.
      4. **E-E-A-T**: Include phrases like "약사 추천", "전문가 조언", "임상 연구에 따르면".
      5. **Internal Links**: Mention "약국오늘에서 근처 약국 찾기" (will be auto-linked).
      6. **Conclusion**: End with <div class="tip-box"> containing pharmacist's final note.

      **Depth & Authority Guidelines** (REQUIRED for Google Ranking):
      1. **Answer "Why" and "How"**: For every claim or recommendation, explain WHY it's true and HOW it works.
      2. **Specific Statistics**: Include at least 3-5 concrete numbers or percentages (e.g., "85%의 환자가 개선", "하루 1,000mg 권장").
      3. **Authoritative References**: Use phrases like:
         - "식품의약품안전처에 따르면"
         - "대한약사회 권장사항"
         - "2024년 연구에서 밝혀진 바에 따르면"
      4. **Real-World Examples**: Include 1-2 anonymized case scenarios or use cases (e.g., "30대 직장인 A씨의 경우...").
      5. **Step-by-Step Details**: When recommending actions, provide specific steps with expected outcomes.

      **GEO (Generative Engine Optimization) for AI Search**:
      - Write clear, factual statements that AI can directly quote.
      - Structure answers in Q&A format where appropriate.
      - Include specific numbers, statistics, and measurable claims.
      - Use authoritative language: "연구에 따르면", "전문가들은 권장합니다".
      - Provide step-by-step instructions that AI assistants can relay.
      - Target Featured Snippets: Start main sections with clear, quotable answers.
    `;

    const schema = {
      type: SchemaType.OBJECT,
      properties: {
        title: { type: SchemaType.STRING, description: "Click-magnet title, exactly 1 line" },
        slug_suggestion: { type: SchemaType.STRING, description: "SEO friendly slug" },
        summary: { type: SchemaType.STRING, description: "Meta description 120-155 chars" },
        content_html: { type: SchemaType.STRING, description: "Semantic HTML content with rich elements" },
        faq: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              question: { type: SchemaType.STRING },
              answer: { type: SchemaType.STRING },
            },
            required: ["question", "answer"],
          },
        },
      },
      required: ["title", "slug_suggestion", "summary", "content_html", "faq"],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any; // Cast to any to avoid strict typing issues with the SDK version

    const result = await getModel().generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema,
      }
    });

    const response = result.response;
    const text = response.text();

    try {
      const parsed = JSON.parse(text) as BlogPost;
      parsed.content_html = applyInternalLinks(parsed.content_html);
      return parsed;
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
