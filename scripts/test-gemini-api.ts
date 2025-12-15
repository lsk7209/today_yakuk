import "dotenv/config";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config();

const geminiApiKey = process.env.GEMINI_API_KEY;

if (!geminiApiKey) {
  console.error("GEMINI_API_KEY가 설정되지 않았습니다.");
  process.exit(1);
}

async function testGeminiAPI() {
  console.info("사용 가능한 모델 목록 조회 중...\n");
  
  // 사용 가능한 모델 목록 조회
  const listUrl = `https://generativelanguage.googleapis.com/v1/models?key=${encodeURIComponent(geminiApiKey)}`;
  const listResponse = await fetch(listUrl);
  
  if (listResponse.ok) {
    const data = await listResponse.json();
    console.info("✅ 사용 가능한 모델 목록:");
    if (data.models) {
      data.models.forEach((model: any) => {
        if (model.supportedGenerationMethods?.includes("generateContent")) {
          console.info(`  - ${model.name} (${model.displayName || "N/A"})`);
        }
      });
    }
  } else {
    const errorText = await listResponse.text();
    console.error(`❌ 모델 목록 조회 실패: ${listResponse.status}`);
    console.error(errorText);
  }
  
  console.info("\n간단한 테스트 요청 시도...\n");
  
  // 간단한 테스트 요청
  const testModels = [
    "gemini-pro",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "models/gemini-pro",
    "models/gemini-1.5-flash",
  ];
  
  for (const model of testModels) {
    const testUrl = `https://generativelanguage.googleapis.com/v1/${model}:generateContent?key=${encodeURIComponent(geminiApiKey)}`;
    console.info(`테스트: ${model}...`);
    
    try {
      const testResponse = await fetch(testUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "안녕하세요" }] }],
        }),
      });
      
      if (testResponse.ok) {
        console.info(`  ✅ 성공! 모델 이름: ${model}\n`);
        break;
      } else {
        const errorText = await testResponse.text();
        console.info(`  ❌ 실패: ${testResponse.status}`);
      }
    } catch (error) {
      console.info(`  ❌ 오류: ${error}`);
    }
  }
}

testGeminiAPI().catch(console.error);

