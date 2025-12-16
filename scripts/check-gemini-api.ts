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

// process.exit(1) 이후에는 실행되지 않지만, 클로저/함수 스코프에서 타입이 다시 넓어지는 것을 방지
const apiKey: string = geminiApiKey;

console.info("API 키 확인:", apiKey.substring(0, 10) + "...");
console.info("\n사용 가능한 모델 목록 조회 중...\n");

async function checkModels() {
  try {
    const listUrl = `https://generativelanguage.googleapis.com/v1/models?key=${encodeURIComponent(apiKey)}`;
    const listResponse = await fetch(listUrl);
    
    if (listResponse.ok) {
      const data = await listResponse.json();
      console.info("✅ 사용 가능한 모델 목록:");
      if (data.models) {
        const supportedModels = data.models.filter((model: any) => 
          model.supportedGenerationMethods?.includes("generateContent")
        );
        supportedModels.forEach((model: any) => {
          console.info(`  - ${model.name}`);
          console.info(`    이름: ${model.displayName || "N/A"}`);
          console.info(`    설명: ${model.description || "N/A"}\n`);
        });
        
        if (supportedModels.length > 0) {
          console.info(`\n추천 모델: ${supportedModels[0].name}`);
          return supportedModels[0].name;
        }
      }
    } else {
      const errorText = await listResponse.text();
      console.error(`❌ 모델 목록 조회 실패: ${listResponse.status}`);
      console.error(errorText);
    }
  } catch (error) {
    console.error("오류:", error);
  }
  return null;
}

checkModels().then((modelName) => {
  if (modelName) {
    console.info(`\n사용할 모델 이름: ${modelName}`);
    console.info(`\n엔드포인트 예시:`);
    console.info(`https://generativelanguage.googleapis.com/v1/${modelName}:generateContent?key=YOUR_API_KEY`);
  }
});

