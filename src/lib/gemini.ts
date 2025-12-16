import { Pharmacy } from "@/types/pharmacy";
import { formatHHMM, getOperatingStatus, DAY_KEYS, getSeoulNow } from "@/lib/hours";

const geminiApiKey = process.env.GEMINI_API_KEY;

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

/**
 * 약국 정보를 기반으로 Gemini API를 호출하여 고유한 컨텐츠를 생성합니다.
 */
export async function generatePharmacyContent(
  pharmacy: Pharmacy,
  nearbyPharmacies: Pharmacy[] = [],
): Promise<GeminiContentResponse | null> {
  if (!geminiApiKey) {
    console.warn("GEMINI_API_KEY가 설정되지 않았습니다.");
    return null;
  }

  try {
    const prompt = buildPharmacyPrompt(pharmacy, nearbyPharmacies);

    // Google AI Studio API 엔드포인트 사용
    // 참고: https://ai.google.dev/gemini-api/docs/api-key
    // v1beta 엔드포인트와 최신 모델 사용
    // 헤더에 x-goog-api-key로 API 키 전달
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
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
      },
    );

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
      console.log("Gemini response length:", text.length);
      console.log("Gemini response preview:", text.substring(0, 500));
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
function buildPharmacyPrompt(pharmacy: Pharmacy, nearbyPharmacies: Pharmacy[]): string {
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

  // 지역 키워드 추출 (SEO/GEO 최적화)
  const regionKeywords = [];
  if (pharmacy.province) regionKeywords.push(pharmacy.province);
  if (pharmacy.city) regionKeywords.push(pharmacy.city);
  const addressParts = pharmacy.address?.split(" ") || [];
  const dong = addressParts.find(part => part.endsWith("동") || part.endsWith("가"));
  if (dong) regionKeywords.push(dong);
  
  const regionKeywordString = regionKeywords.join(" ");
  const fullAddress = pharmacy.address || `${pharmacy.province || ""} ${pharmacy.city || ""}`.trim();

  // 영업시간 패턴 분석 (고유 특성 추출)
  const hoursPattern = analyzeHoursPattern(pharmacy.operating_hours);
  
  return `당신은 SEO/GEO/AEO에 최적화된 약국 안내 콘텐츠를 작성하는 전문 작가입니다. 
아래 약국 정보를 바탕으로 구글 검색에 최적화되고, 중복되지 않는 고유한 컨텐츠를 생성하세요.

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

## 주변 약국 (참고용 - 중복 방지)
${nearbyInfo || "주변 약국 정보 없음"}

## SEO/GEO/AEO 최적화 요구사항

### SEO (Search Engine Optimization)
1. **지역 키워드 자연스럽게 포함**: "${regionKeywordString} 약국", "${pharmacy.name} ${regionKeywordString}", "${dong || pharmacy.city || ""} 약국" 등
2. **약국명과 주소 반복**: 자연스럽게 2-3회 언급
3. **검색 의도 키워드**: "영업시간", "야간 약국", "주말 약국", "24시간 약국" 등 상황에 맞게 사용
4. **구체적 정보**: 영업시간, 전화번호, 주소를 명확히 언급

### GEO (Geographic Optimization)
1. **지역 특성 강조**: ${pharmacy.city || pharmacy.province || "지역"}의 특성을 반영
2. **접근성 정보**: 주소 기반으로 교통편, 주차 가능 여부 추론 (확실하지 않으면 "문의 필요")
3. **주변 환경**: 주소에서 추론 가능한 주변 환경 언급 (예: "상가 1층", "주거 단지 근처")
4. **지역 랜드마크**: 주소 기반으로 추론 가능한 랜드마크나 시설 언급

### AEO (Answer Engine Optimization)
1. **구조화된 FAQ**: 검색자가 자주 묻는 질문에 대한 명확한 답변
2. **구체적 답변**: "예/아니오"가 아닌 구체적 정보 제공
3. **실시간 정보**: 현재 상태, 오늘 영업시간 등 실시간 정보 포함

### 중복 방지
1. **고유 특성 강조**: 이 약국만의 특징 (영업시간 패턴, 위치 특성) 강조
2. **템플릿 문구 금지**: "친절한 상담", "편리한 이용" 등 일반적 표현 최소화
3. **구체적 정보 우선**: 추상적 설명보다 구체적 사실 정보 제공

## JSON 스키마
아래 JSON 스키마를 정확히 따르는 JSON만 출력하세요. 다른 텍스트는 포함하지 마세요.

{
  "summary": "${pharmacy.name}에 대한 2-3문장 요약. 반드시 '${pharmacy.name}'과 '${regionKeywordString}' 키워드를 자연스럽게 포함. 영업시간 특징과 지역 특성을 구체적으로 언급.",
  "detailed_description": "${pharmacy.name}에 대한 3-4문장 상세 설명. 주소(${fullAddress})를 명확히 언급하고, ${regionKeywordString} 지역 특성, 주변 환경, 접근성을 구체적으로 설명. 약국명과 지역명을 자연스럽게 2-3회 반복.",
  "bullets": [
    "${hoursPattern}에 기반한 영업시간 특징을 1문장으로",
    "${fullAddress} 위치 특성(상가/주거단지/교통편 등)을 1문장으로",
    "이 약국만의 고유 특징을 1문장으로",
    "${regionKeywordString} 지역 주민을 위한 특징을 1문장으로"
  ],
  "local_tips": [
    "${regionKeywordString} 지역 특성에 맞는 이용 팁 1 (구체적)",
    "${pharmacy.city || pharmacy.province || ""} 지역 약국 이용 시 주의사항 1 (구체적)",
    "접근성 관련 팁 1 (주소 기반 추론)"
  ],
  "nearby_landmarks": [
    "${fullAddress} 주변에서 추론 가능한 랜드마크나 시설 1",
    "${fullAddress} 주변에서 추론 가능한 랜드마크나 시설 2"
  ],
  "faq": [
    {
      "question": "${pharmacy.name}은 지금 영업 중인가요?",
      "answer": "현재 상태는 '${status.label}'입니다. ${todayHours?.open && todayHours?.close ? `오늘은 ${formatHHMM(todayHours.open)}부터 ${formatHHMM(todayHours.close)}까지 영업합니다.` : "오늘 영업시간 정보를 확인해주세요."} ${hoursPattern}에 따라 운영됩니다."
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
      "answer": "${fullAddress} 위치 특성을 고려하여 주차 가능 여부를 추론하되, 확실하지 않으면 '방문 전 전화 문의를 권장합니다'로 답변"
    },
    {
      "question": "${pharmacy.name} 전화 상담이 가능한가요?",
      "answer": "${pharmacy.tel ? `${pharmacy.tel}로 전화 상담이 가능합니다.` : "전화번호가 등록되어 있지 않아 방문을 통해 문의하시기 바랍니다."}"
    }
  ],
  "cta": "${pharmacy.name} ${regionKeywordString} 방문 또는 ${pharmacy.tel ? `전화(${pharmacy.tel})` : "방문"} 문의를 통해 필요한 의약품과 건강 상담을 받으실 수 있습니다.",
  "extra_sections": [
    {
      "title": "${regionKeywordString} 약국 이용 안내",
      "body": "${pharmacy.city || pharmacy.province || ""} 지역 약국 이용 시 주의사항과 팁을 ${fullAddress} 위치 특성을 반영하여 구체적으로 작성"
    },
    {
      "title": "${pharmacy.name} 접근성 정보",
      "body": "${fullAddress}로의 접근 방법, 주변 교통편, 주차 정보 등을 주소 기반으로 추론하여 작성 (확실하지 않으면 '문의 필요' 명시)"
    }
  ]
}

## 작성 규칙 (엄수 필수)
1. **SEO**: "${pharmacy.name}", "${regionKeywordString}" 키워드를 자연스럽게 3-5회 포함
2. **GEO**: "${fullAddress}" 주소를 구체적으로 언급하고, ${pharmacy.city || pharmacy.province || ""} 지역 특성 반영
3. **AEO**: FAQ 답변은 구체적이고 명확하게 (예: "예/아니오" 대신 "평일 오후 8시까지", "토요일 오후 4시까지" 등)
4. **중복 방지**: 템플릿 문구 금지, 이 약국만의 고유 정보 강조
5. **정확성**: 제공된 정보만 사용, 추측 최소화 (확실하지 않으면 "문의 필요" 명시)
6. **의료행위 금지**: 진단, 처방, 치료 관련 내용 절대 금지
7. **JSON만 출력**: 마크다운, 설명문, 코드 블록 등 추가 텍스트 절대 금지

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

