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
        regex,
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
      당신은 약국 방문 안내 초안 작성자입니다.
      ${month}월 한국의 계절적 특성, 유행하는 질병, 또는 건강 이슈(예: 미세먼지, 알레르기, 독감, 영양제 등)를 고려하여,
      사람들이 가장 검색할 만한 "실용적인 건강 정보 및 약국 이용 팁" 주제 1가지를 추천해 주세요.
      
      조건:
      1. 약국 방문을 유도하거나 일반의약품/건강기능식품 정보를 포함할 수 있는 주제여야 합니다.
      2. 전문적인 의학 진단보다는 "상담 준비"와 "약국 활용법"에 초점을 맞추세요.
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
      약국오늘은 헛걸음을 줄이는 약국 방문 정보 서비스입니다.
      주제: ${JSON.stringify(topic)}
      이 주제로 사람이 검수할 한국어 초안을 작성하세요. 이 출력은 검수 전 공개할 수 없습니다.
      - 독자가 약국 후보 찾기, 등록 시간표와 한계 확인, 전화 확인, 길찾기·대체 약국 확인을 할 수 있게 돕습니다.
      - 실제 복용약 목록·제품 포장·상담 기록 등 독자가 준비할 자료와 구체적인 상담 질문에 집중합니다.
      - 약국이나 개인의 실제 방문·리뷰·사례·전문가 신원·검수일·통계·기관 인용·출처 URL을 만들어내지 마세요.
      - 진단, 제품별 복용량·용법, 임신·수유·소아 안전성, 금기·상호작용, 자가요법을 추천하지 마세요.
      - 직접 검증할 수 있는 원문이 제공되지 않았다면 해당 의학적·제도적 주장을 생략하세요. 기관 홈페이지 링크는 개별 주장의 검증을 대신하지 않습니다.
      - 처방전 사용기간은 처방전에 적힌 기간과 발행 의료기관에 확인하도록 안내하세요. 일률적인 유효기간을 제시하지 마세요.
      - 자료가 부족하면 짧게 작성하세요. 글자 수·섹션 수·표·통계·SEO 점수를 맞추려고 일반론으로 늘리지 마세요.
      - 약사 검수 완료, 전문 약사 발언, 통계상 효과, 승인 확률, 구매 추천을 생성하지 마세요.
      - 표나 FAQ는 실제로 다른 질문을 해결할 때만 사용하고, 반복 답변을 만들지 마세요.
      - 본문은 의미에 맞는 h2/h3/p/ul/li/a HTML로 작성하고 스크립트·폼은 넣지 마세요.
      - 필요한 경우 /nearby의 약국 찾기와 방문 전 전화 확인으로 연결하세요. 제목·요약은 실제 본문 범위만 설명하세요.
    `;

    const schema = {
      type: SchemaType.OBJECT,
      properties: {
        title: { type: SchemaType.STRING, description: "Accurate Korean title describing the actual content" },
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
