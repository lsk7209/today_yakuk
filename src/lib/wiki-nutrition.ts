export const NUTRITION_NAMES = ["비타민A", "비타민B1", "비타민B2", "비타민B6", "비타민B12", "비타민C", "비타민D", "비타민E", "비타민K", "티아민", "리보플라빈", "나이아신", "엽산", "폴산", "비오틴", "판토텐산", "칼슘", "인", "마그네슘", "철", "철분", "아연", "구리", "셀레늄", "망간", "요오드", "크롬", "몰리브덴", "칼륨", "나트륨", "루테인", "지아잔틴", "아스타잔틴", "EPA", "DHA", "카테킨", "테아닌", "실리마린", "진세노사이드", "코엔자임Q10"];
export const FOOD_SAFETY_NUTRITION_SOURCE = "foodsafetykorea:C003" as const;
export interface VerifiedNutritionFact {
  name: string; amount: number; unit: string; percent_dv: number | null;
  source: typeof FOOD_SAFETY_NUTRITION_SOURCE; raw_text: string; basis: string;
}
export function isNutritionName(value: string): boolean {
  return NUTRITION_NAMES.includes(value.replace(/\s/g, ""));
}
// A narrow allowlist intentionally withholds unknown functional compounds.
export function extractSourceNutrition(raw: string): VerifiedNutritionFact[] {
  const basis = raw.match(/(?:1일\s*섭취량\s*당|일일\s*섭취량\s*중|1회\s*섭취량\s*당|100\s*(?:g|ml)\s*당)/i)?.[0] || "";
  const bases = new Set(Array.from(raw.matchAll(/(?:1일\s*섭취량\s*당|일일\s*섭취량\s*중|1회\s*섭취량\s*당|100\s*(?:g|ml)\s*당)/gi), match => match[0].replace(/\s/g, "")));
  if (bases.size > 1) return [];
  const names = [...NUTRITION_NAMES].sort((a,b)=>b.length-a.length).join("|");
  const pattern = new RegExp(`(?:^|[\\s,:;\\(])(${names})\\s*([0-9]+(?:,[0-9]{3})*(?:\\.[0-9]+)?)\\s*(mgα-TE|mgNE|mg|μg|mcg|ug|㎍|IU|g)(?![A-Za-z])(?:\\s*\\((?:[^)]*?)([0-9]+(?:\\.[0-9]+)?)\\s*%[^)]*\\))?`, "gi");
  const result: VerifiedNutritionFact[]=[];
  const seen=new Set<string>();
  for(const match of raw.matchAll(pattern)) {
    const name=NUTRITION_NAMES.find(n=>n.toLowerCase()===match[1].toLowerCase())!;
    const amount=Number(match[2].replace(/,/g,""));
    if(!Number.isFinite(amount)||amount<=0||seen.has(name)) continue;
    seen.add(name);
    result.push({name,amount,unit:match[3].replace(/mcg|ug|㎍/i,"μg"),percent_dv:match[4] ? Number(match[4]) : null,source:FOOD_SAFETY_NUTRITION_SOURCE,raw_text:raw,basis});
  }
  return result;
}
export function getVerifiedNutritionFacts(value: unknown): VerifiedNutritionFact[] {
  if(!Array.isArray(value)) return [];
  return value.filter((item): item is VerifiedNutritionFact => {
    if(!item || typeof item!=="object") return false;
    const fact=item as Record<string,unknown>;
    if(fact.source!==FOOD_SAFETY_NUTRITION_SOURCE || typeof fact.raw_text!=="string" || typeof fact.basis!=="string" || !fact.basis) return false;
    return extractSourceNutrition(fact.raw_text).some(parsed => parsed.name===fact.name && parsed.amount===fact.amount && parsed.unit===fact.unit && parsed.percent_dv===fact.percent_dv && parsed.basis===fact.basis);
  });
}
export function hasVerifiedNutritionFacts(value: unknown): boolean { return getVerifiedNutritionFacts(value).length>0; }
