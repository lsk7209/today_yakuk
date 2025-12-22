import { Pharmacy } from "@/types/pharmacy";
import { formatHHMM, getOperatingStatus, DAY_KEYS, getSeoulNow } from "@/lib/hours";
import {
  searchPharmacyOnGoogleMaps,
  formatGoogleMapsInfoForPrompt,
  type GoogleMapsPlaceInfo,
} from "@/lib/google-maps";

const geminiApiKey = process.env.GEMINI_API_KEY;
const geminiModel = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function isRetryableStatus(status: number) {
  return status === 429 || status === 500 || status === 502 || status === 503 || status === 504;
}

async function fetchGeminiWithRetry(url: string, init: RequestInit) {
  // 과부하/레이트리밋 상황에서 자동 재시도 (지수 백오프 + 지터)
  const maxAttempts = 5; // 1회 + 재시도 4회
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const response = await fetch(url, init);
    if (response.ok) return response;

    if (!isRetryableStatus(response.status) || attempt === maxAttempts) {
      return response;
    }

    // Retry-After(초)를 존중하되, 너무 길면 상한을 둠
    const retryAfterHeader = response.headers.get("retry-after");
    const retryAfterSec = retryAfterHeader ? Number(retryAfterHeader) : NaN;
    const retryAfterMs = Number.isFinite(retryAfterSec) ? Math.max(0, retryAfterSec) * 1000 : 0;

    const base = 800 * Math.pow(2, attempt - 1); // 800ms, 1600ms, 3200ms...
    const jitter = Math.floor(Math.random() * 250);
    const waitMs = Math.min(15_000, Math.max(base + jitter, retryAfterMs));

    console.warn(
      `[Gemini] 일시 오류(${response.status})로 재시도합니다. (${attempt}/${maxAttempts}, 대기 ${waitMs}ms)`,
    );
    await sleep(waitMs);
  }

  // 이 경로는 사실상 도달하지 않지만 타입 안정성을 위해 남김
  return fetch(url, init);
}

export type GeminiContentResponse = {
  summary?: string;
  bullets?: string[];
  faq?: Array<{ question: string; answer: string }>;
  cta?: string;
  extra_sections?: Array<{ title: string; body: string }>;
  detailed_description?: string;
  local_tips?: string[];
  nearby_landmarks?: string[];
};

export type GeneratePharmacyContentOptions = {
  /**
   * 사이트 내부 중복(문장 패턴 반복)을 줄이기 위해,
   * 이미 존재하는 요약/문장 일부를 전달하면 "이 문장 패턴을 피하라"는 제약을 추가합니다.
   */
  avoidSummaries?: string[];
};

/**
 * 약국 정보를 기반으로 Gemini API를 호출하여 고유한 컨텐츠를 생성합니다.
 */
export async function generatePharmacyContent(
  pharmacy: Pharmacy,
  nearbyPharmacies: Pharmacy[] = [],
  options?: GeneratePharmacyContentOptions,
): Promise<GeminiContentResponse | null> {
  if (!geminiApiKey) {
    console.warn("GEMINI_API_KEY가 설정되지 않았습니다.");
    return null;
  }

  try {
    // Google Maps에서 약국 정보 검색 (선택적)
    let googleMapsInfo: GoogleMapsPlaceInfo | null = null;
    if (pharmacy.name && pharmacy.address) {
      try {
        console.info("Google Maps에서 약국 정보 검색 중...");
        googleMapsInfo = await searchPharmacyOnGoogleMaps(pharmacy.name, pharmacy.address);
        if (googleMapsInfo) {
          console.info("✅ Google Maps 정보 수집 완료");
        }
      } catch (error) {
        console.warn("⚠️ Google Maps 검색 실패 (무시하고 계속):", error);
      }
    }

    const prompt = buildPharmacyPrompt(pharmacy, nearbyPharmacies, options, googleMapsInfo);

    // Google AI Studio API 엔드포인트 사용
    // 참고: https://ai.google.dev/gemini-api/docs/api-key
    // v1beta 엔드포인트와 최신 모델 사용
    // 헤더에 x-goog-api-key로 API 키 전달
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent`;
    const response = await fetchGeminiWithRetry(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": geminiApiKey,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        safetySettings: [
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_LOW_AND_ABOVE" },
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_LOW_AND_ABOVE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_LOW_AND_ABOVE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_LOW_AND_ABOVE" },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192, // JSON 응답이 충분히 생성되도록 증가
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Gemini API error: ${response.status}`, errorText);
      return null;
    }

    const data = (await response.json()) as {
      candidates?: Array<{
        finishReason?: string;
        content?: { parts?: Array<{ text?: string }> };
      }>;
    };
    
    // finishReason 확인 (응답이 완전한지 확인)
    const finishReason = data?.candidates?.[0]?.finishReason;
    if (finishReason && finishReason !== "STOP") {
      console.warn(`Gemini response finish reason: ${finishReason}`);
      if (finishReason === "MAX_TOKENS") {
        console.warn("응답이 토큰 제한으로 인해 잘렸습니다. maxOutputTokens를 늘려주세요.");
      }
    }
    
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      console.error("Gemini response empty");
      console.error("Full response:", JSON.stringify(data, null, 2));
      return null;
    }

    // 디버깅: 전체 응답 확인 (개발 환경에서만)
    if (process.env.NODE_ENV === "development") {
      console.info("Gemini response length:", text.length);
      console.info("Gemini response preview:", text.substring(0, 500));
    }

    // JSON 추출 (마크다운 코드 블록 제거)
    let jsonText = text.trim();
    
    // 마크다운 코드 블록 제거 (```json ... ``` 또는 ``` ... ```)
    const codeBlockRegex = /^```(?:json)?\s*\n([\s\S]*?)\n```$/;
    const match = jsonText.match(codeBlockRegex);
    if (match) {
      jsonText = match[1].trim();
    } else {
      // 코드 블록이 여러 줄에 걸쳐 있을 수 있음
      if (jsonText.startsWith("```")) {
        const lines = jsonText.split("\n");
        const startIdx = 0;
        let endIdx = -1;
        for (let i = lines.length - 1; i > 0; i--) {
          if (lines[i].trim().startsWith("```")) {
            endIdx = i;
            break;
          }
        }
        if (endIdx > startIdx) {
          jsonText = lines.slice(startIdx + 1, endIdx).join("\n").trim();
        }
      }
    }
    
    // JSON 객체 찾기
    const jsonStart = jsonText.indexOf("{");
    let jsonEnd = jsonText.lastIndexOf("}");
    
    // JSON이 잘린 경우, 중괄호 매칭으로 올바른 끝 찾기
    if (jsonStart === -1) {
      console.error("Gemini response parse error: JSON not found");
      console.error("Response text:", text.substring(0, 500));
      return null;
    }
    
    // 중괄호 매칭으로 올바른 JSON 끝 찾기
    if (jsonEnd === -1 || jsonEnd <= jsonStart) {
      let braceCount = 0;
      jsonEnd = -1;
      for (let i = jsonStart; i < jsonText.length; i++) {
        if (jsonText[i] === "{") braceCount++;
        if (jsonText[i] === "}") {
          braceCount--;
          if (braceCount === 0) {
            jsonEnd = i;
            break;
          }
        }
      }
    }
    
    if (jsonEnd === -1 || jsonEnd <= jsonStart) {
      console.error("Gemini response parse error: Invalid JSON structure");
      console.error("Response text:", text.substring(0, 500));
      return null;
    }

    try {
      const jsonString = jsonText.slice(jsonStart, jsonEnd + 1);
      const parsed = JSON.parse(jsonString);
      return parsed as GeminiContentResponse;
    } catch (parseError) {
      console.error("Gemini response JSON parse error:", parseError);
      console.error("Attempted to parse:", jsonText.substring(jsonStart, Math.min(jsonStart + 200, jsonText.length)));
      return null;
    }
  } catch (error) {
    console.error("Gemini API 호출 중 오류:", error);
    return null;
  }
}

/**
 * 약국 정보를 기반으로 상세한 프롬프트를 생성합니다.
 */
function buildPharmacyPrompt(
  pharmacy: Pharmacy,
  nearbyPharmacies: Pharmacy[],
  options?: GeneratePharmacyContentOptions,
  googleMapsInfo?: GoogleMapsPlaceInfo | null,
): string {
  const status = getOperatingStatus(pharmacy.operating_hours);
  const now = getSeoulNow();
  const todayKey = DAY_KEYS[now.getDay()];
  const todayHours = pharmacy.operating_hours?.[todayKey];

  // 영업시간 정보 포맷팅
  const hoursInfo = formatOperatingHours(pharmacy.operating_hours);

  // 주변 약국 정보
  const nearbyInfo = nearbyPharmacies
    .slice(0, 5)
    .map((p) => `- ${p.name} (${p.address})`)
    .join("\n");

  // 지역 키워드 추출 (SEO/AEO 최소 요건용)
  const regionKeywords: string[] = [];
  if (pharmacy.province) regionKeywords.push(pharmacy.province);
  if (pharmacy.city) regionKeywords.push(pharmacy.city);
  const addressParts = pharmacy.address?.split(" ") || [];
  const dong = addressParts.find((part) => part.endsWith("동") || part.endsWith("가"));
  if (dong) regionKeywords.push(dong);

  const regionKeywordString = regionKeywords.join(" ");
  const fullAddress = pharmacy.address || `${pharmacy.province || ""} ${pharmacy.city || ""}`.trim();

  // 영업시간 패턴 분석 (고유 특성 추출)
  const hoursPattern = analyzeHoursPattern(pharmacy.operating_hours);

  const avoidSamples =
    options?.avoidSummaries
      ?.map((s) => s.replace(/\s+/g, " ").trim())
      .filter(Boolean)
      .slice(0, 3) ?? [];

  const avoidBlock = avoidSamples.length
    ? `\n## 사이트 내부 중복 방지(필수)\n아래 문장/패턴과 유사한 표현(어휘/문장구조)을 재사용하지 마세요. 같은 의미라도 다른 문장 구조로 작성하세요.\n${avoidSamples
        .map((s, i) => `- 예시 ${i + 1}: ${s.slice(0, 140)}`)
        .join("\n")}\n`
    : "";

  return `당신은 한국 약국 상세페이지용 **정보성 안내문**을 작성하는 편집자입니다.
아래 제공된 사실(이름/주소/전화/영업시간/현재 상태)만으로, 과장·홍보 없이 **중립적이고 구체적인 고유 콘텐츠**를 작성하세요.
중요: 사용자는 이미 화면 상단에서 주소/전화/영업시간 표를 다시 확인할 수 있습니다. 따라서 생성 텍스트는 **재진술(복붙)보다 실용 정보/해석/방문 판단에 도움이 되는 내용**을 우선해야 합니다.

## 약국 기본 정보
- 이름: ${pharmacy.name}
- 주소: ${fullAddress}
- 전화번호: ${pharmacy.tel || "정보 없음"}
- 지역: ${regionKeywordString}
- 현재 상태: ${status.label}
${pharmacy.latitude && pharmacy.longitude ? `- 좌표: ${pharmacy.latitude}, ${pharmacy.longitude}` : ""}

## 영업시간 정보
${hoursInfo}

## 오늘 영업시간
${todayHours?.open && todayHours?.close
  ? `오픈: ${formatHHMM(todayHours.open)}, 마감: ${formatHHMM(todayHours.close)}`
  : "오늘 영업시간 정보 없음"}

## 영업시간 패턴 분석
${hoursPattern}

## 약국 설명
${pharmacy.description_raw || "추가 설명 정보 없음"}

${googleMapsInfo
  ? `## Google Maps에서 수집한 추가 정보
${formatGoogleMapsInfoForPrompt(googleMapsInfo)}

**중요**: Google Maps 정보는 참고용입니다. 제공된 기본 정보와 충돌하면 기본 정보를 우선하세요.
Google Maps의 리뷰나 평점은 사용자 경험을 보완하는 용도로만 활용하세요.`
  : ""}

## 주변 약국 (참고용 - 중복 방지)
${nearbyInfo || "주변 약국 정보 없음"}

${avoidBlock}

## 작성 톤 & 금칙(엄수)
1. **톤**: 정보 안내(중립) / 존대 / 과장·홍보 금지
2. **금칙어/금칙표현**: "추천", "제안", "최고", "신뢰할 수 있는", "건강 지킴이", "책임지는", "목표로", "편리한", "친절한" 같은 홍보성 상투어 금지
3. **추론 금지**: 주차/교통/주변시설/재고/전문 의약품 등은 제공된 데이터로 확정할 수 없으면 반드시 "확인 필요/정보 없음"으로 처리
4. **재진술 금지 규칙**: 아래 항목은 **summary/detailed_description에서 각각 최대 1회만** 언급하세요.
   - 전체 주소 문자열(예: '...로 9, 1층 103호'): 0~1회
   - 전화번호: 0~1회
   - "오늘 09:00~18:00" 같은 시간표 문장: 0~1회
   (대신 ‘해석/주의/방문 전 확인 포인트’로 문장을 구성)
5. **고유성 규칙**: summary 첫 문장에 **(a) 지역(시/군/구 또는 동/가)** + **(b) 오늘 영업시간(있으면)** + **(c) 현재 상태(${status.label})**를 자연스럽게 포함

## SEO/AEO 최소 요건(과장 없이 사실 중심)
1. 약국명/지역 키워드는 **자연스럽게** 포함(과도한 반복 금지)
2. 주소/전화/영업시간은 **명확히** 표기
3. FAQ는 단정 대신 **사실+확인 필요** 구조(필요 시)

## JSON 스키마
아래 JSON 스키마를 정확히 따르는 JSON만 출력하세요. 다른 텍스트는 포함하지 마세요.

{
  "summary": "2-3문장. 첫 문장에 '${pharmacy.name}' + 지역('${regionKeywordString}') + 현재 상태('${status.label}') + 오늘 영업시간(${todayHours?.open && todayHours?.close ? `${formatHHMM(todayHours.open)}~${formatHHMM(todayHours.close)}` : "정보 없음"})를 자연스럽게 포함. 전체 주소/전화번호/시간표 재진술은 최소화.",
  "detailed_description": "3-4문장. 요일별/주말/공휴일 운영의 핵심 패턴을 '해석' 중심으로 설명(예: 주말 운영 여부, 공휴일 휴무 등). 전체 주소/전화번호는 필요 시 1회만. 추론 금지(모르면 '확인 필요').",
  "bullets": [
    "영업시간(평일/주말/공휴일) 핵심 패턴을 1문장으로(시간은 대표 1회만)",
    "현재 상태('${status.label}')를 기준으로 방문 전 확인 포인트 1문장",
    "전화 문의가 필요한 경우에 대비한 질문 예시 1문장(의료행위/진단 금지)",
    "지도/길찾기 사용 시 검색어 팁 1문장(주소 상세 호수는 제외하는 등 중립적)"
  ],
  "local_tips": [
    "방문 전 확인 포인트 1개(영업 종료/곧 종료 등 상태에 따른 행동 팁) - '권장/추천' 금지",
    "영업시간 변동 가능성 안내 1개(사실 기반)",
    "지도 검색/길찾기 활용 팁 1개(중립적, 주소 상세는 제외 등)"
  ],
  "nearby_landmarks": [
    "주소 문자열에 포함된 건물명/시설명 등이 있으면 그것만 사용, 없으면 '정보 없음'",
    "위와 동일 규칙(추론 금지)"
  ],
  "faq": [
    {
      "question": "${pharmacy.name}은 지금 영업 중인가요?",
      "answer": "현재 상태는 '${status.label}'입니다. ${todayHours?.open && todayHours?.close ? `오늘은 ${formatHHMM(todayHours.open)}~${formatHHMM(todayHours.close)} 기준으로 표시됩니다.` : "오늘 영업시간 정보가 없습니다."} 변동 가능성이 있으니 방문 전 확인이 필요할 수 있습니다."
    },
    {
      "question": "${pharmacy.name} ${regionKeywordString} 주소는 어디인가요?",
      "answer": "${fullAddress}에 위치해 있습니다. ${pharmacy.tel ? `전화번호는 ${pharmacy.tel}입니다.` : "전화번호는 등록되어 있지 않습니다."}"
    },
    {
      "question": "${pharmacy.name} 야간에도 이용 가능한가요?",
      "answer": "${analyzeNightHours(pharmacy.operating_hours)}"
    },
    {
      "question": "${pharmacy.name} 주말에도 영업하나요?",
      "answer": "${analyzeWeekendHours(pharmacy.operating_hours)}"
    },
    {
      "question": "${pharmacy.name} ${regionKeywordString} 주차는 가능한가요?",
      "answer": "주차 가능 여부는 제공된 데이터만으로 확정할 수 없습니다. 방문 전 전화로 확인해 주세요."
    },
    {
      "question": "${pharmacy.name} 전화 상담이 가능한가요?",
      "answer": "${pharmacy.tel ? `${pharmacy.tel}로 전화 상담이 가능합니다.` : "전화번호가 등록되어 있지 않아 방문을 통해 문의하시기 바랍니다."}"
    }
  ],
  "cta": "이용 안내: ${pharmacy.name}의 주소·전화·영업시간 정보를 확인한 뒤 방문해 주세요. ${pharmacy.tel ? `문의가 필요하면 ${pharmacy.tel}로 확인할 수 있습니다.` : "전화번호 정보가 없으면 지도에서 확인해 주세요."}",
  "extra_sections": [
    {
      "title": "${regionKeywordString} 약국 이용 안내",
      "body": "영업시간 변동 가능성, 전화 문의 필요 시점 등 '정보성' 안내만 작성(홍보/추천 금지)."
    },
    {
      "title": "${pharmacy.name} 접근성 정보",
      "body": "교통/주차는 추론하지 말고, 제공 정보가 없으면 '정보 없음/확인 필요'로 작성."
    }
  ]
}

## 작성 규칙 (엄수 필수)
1. **정확성 최우선**: 제공된 정보만 사용. 모르면 '정보 없음/확인 필요'
2. **고유성 최우선**: 주소의 고유 요소(도로명/번지/건물명/층·호) + 시간(09:00 등)을 문장에 포함
3. **홍보 금지**: 추천/신뢰/목표/책임지는 등 금칙
4. **의료행위 금지**: 진단·처방·치료 관련 내용 금지
5. **JSON만 출력**: 마크다운/설명문/코드블록 금지

JSON만 반환하세요:`;
}

/**
 * 영업시간 정보를 포맷팅합니다.
 */
function formatOperatingHours(
  hours: Pharmacy["operating_hours"],
): string {
  if (!hours) return "영업시간 정보 없음";

  const dayLabels: Record<string, string> = {
    mon: "월요일",
    tue: "화요일",
    wed: "수요일",
    thu: "목요일",
    fri: "금요일",
    sat: "토요일",
    sun: "일요일",
    holiday: "공휴일",
  };

  const lines: string[] = [];
  for (const [key, label] of Object.entries(dayLabels)) {
    const slot = hours[key];
    if (slot?.open && slot?.close) {
      lines.push(`${label}: ${formatHHMM(slot.open)} - ${formatHHMM(slot.close)}`);
    } else {
      lines.push(`${label}: 휴무 또는 정보 없음`);
    }
  }

  return lines.join("\n");
}

/**
 * 영업시간 패턴을 분석하여 고유 특성을 추출합니다.
 */
function analyzeHoursPattern(
  hours: Pharmacy["operating_hours"],
): string {
  if (!hours) return "영업시간 정보가 없어 패턴 분석이 불가능합니다.";

  const patterns: string[] = [];
  
  // 평일 패턴
  const weekdays = ["mon", "tue", "wed", "thu", "fri"];
  const weekdayHours = weekdays
    .map(day => hours[day])
    .filter(h => h?.open && h?.close);
  
  if (weekdayHours.length > 0) {
    const firstOpen = weekdayHours[0]?.open;
    const firstClose = weekdayHours[0]?.close;
    const allSame = weekdayHours.every(h => h?.open === firstOpen && h?.close === firstClose);
    
    if (allSame && firstOpen && firstClose) {
      patterns.push(`평일(월-금) ${formatHHMM(firstOpen)}-${formatHHMM(firstClose)}`);
    } else {
      patterns.push("평일 영업시간이 요일별로 상이합니다.");
    }
  }

  // 주말 패턴
  const satHours = hours.sat;
  const sunHours = hours.sun;
  
  if (satHours?.open && satHours?.close) {
    patterns.push(`토요일 ${formatHHMM(satHours.open)}-${formatHHMM(satHours.close)}`);
  } else {
    patterns.push("토요일 휴무");
  }
  
  if (sunHours?.open && sunHours?.close) {
    patterns.push(`일요일 ${formatHHMM(sunHours.open)}-${formatHHMM(sunHours.close)}`);
  } else {
    patterns.push("일요일 휴무");
  }

  // 심야 영업 여부 (오후 10시 이후)
  const hasLateNight = weekdayHours.some(h => {
    if (!h?.close || typeof h.close !== "string") return false;
    const closeHour = parseInt(h.close.substring(0, 2));
    return closeHour >= 22;
  });
  
  if (hasLateNight) {
    patterns.push("평일 심야 영업 가능 (오후 10시 이후)");
  }

  // 공휴일 영업 여부
  if (hours.holiday?.open && hours.holiday?.close) {
    patterns.push(`공휴일 ${formatHHMM(hours.holiday.open)}-${formatHHMM(hours.holiday.close)} 영업`);
  } else {
    patterns.push("공휴일 휴무");
  }

  return patterns.join(". ");
}

/**
 * 야간 영업 여부를 분석합니다.
 */
function analyzeNightHours(
  hours: Pharmacy["operating_hours"],
): string {
  if (!hours) return "영업시간 정보가 없어 야간 영업 여부를 확인할 수 없습니다.";

  const weekdays = ["mon", "tue", "wed", "thu", "fri"];
  const weekdayHours = weekdays
    .map(day => hours[day])
    .filter(h => h?.open && h?.close);
  
  const hasLateNight = weekdayHours.some(h => {
    if (!h?.close || typeof h.close !== "string") return false;
    const closeHour = parseInt(h.close.substring(0, 2));
    return closeHour >= 22;
  });

  if (hasLateNight) {
    const latestClose = weekdayHours
      .map(h => h?.close)
      .filter(Boolean)
      .sort()
      .reverse()[0];
    return `평일 야간 영업이 가능합니다. ${latestClose ? `가장 늦게는 ${formatHHMM(latestClose)}까지 영업합니다.` : ""}`;
  }

  const latestClose = weekdayHours
    .map(h => h?.close)
    .filter(Boolean)
    .sort()
    .reverse()[0];
  
  if (latestClose && typeof latestClose === "string") {
    const closeHour = parseInt(latestClose.substring(0, 2));
    if (closeHour < 22) {
      return `평일은 ${formatHHMM(latestClose)}까지 영업하며, 야간(오후 10시 이후) 영업은 하지 않습니다.`;
    }
  }

  return "야간 영업 여부는 영업시간 정보를 확인해주세요.";
}

/**
 * 주말 영업 여부를 분석합니다.
 */
function analyzeWeekendHours(
  hours: Pharmacy["operating_hours"],
): string {
  if (!hours) return "영업시간 정보가 없어 주말 영업 여부를 확인할 수 없습니다.";

  const satHours = hours.sat;
  const sunHours = hours.sun;
  
  const satOpen = satHours?.open && satHours?.close;
  const sunOpen = sunHours?.open && sunHours?.close;

  if (satOpen && sunOpen) {
    return `주말에도 영업합니다. 토요일 ${formatHHMM(satHours.open)}-${formatHHMM(satHours.close)}, 일요일 ${formatHHMM(sunHours.open)}-${formatHHMM(sunHours.close)}까지 운영합니다.`;
  } else if (satOpen) {
    return `토요일 ${formatHHMM(satHours.open)}-${formatHHMM(satHours.close)}까지 영업하지만, 일요일은 휴무입니다.`;
  } else if (sunOpen) {
    return `일요일 ${formatHHMM(sunHours.open)}-${formatHHMM(sunHours.close)}까지 영업하지만, 토요일은 휴무입니다.`;
  }

  return "주말(토요일, 일요일)은 휴무입니다.";
}

