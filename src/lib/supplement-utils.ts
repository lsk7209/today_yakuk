import { getTursoClient } from "@/lib/turso";

export const TAG_MAP: Record<string, string[]> = {
  "vitamin-c": ["비타민C", "비타민 C", "Vitamin C", "Ascorbic Acid", "아스코르브산"],
  "fatigue": ["피로", "활력", "에너지", "만성피로", "Fatigue", "Energy"],
  "immune": ["면역", "아연", "Immune", "Zinc"],
  "eye": ["눈", "루테인", "지아잔틴", "시력", "Eye", "Lutein"],
  "liver": ["간", "밀크씨슬", "실리마린", "Liver", "Milk Thistle"],
  "probiotics": ["유산균", "프로바이오틱스", "장건강", "Probiotics"],
  "omega3": ["오메가3", "rTG", "DHA", "EPA", "Omega-3"],
  "multivitamin": ["멀티비타민", "종합비타민", "Multivitamin"],
  "skin": ["피부", "콜라겐", "히알루론산", "Skin", "Collagen"],
  "bone": ["뼈", "칼슘", "마그네슘", "비타민D", "Bone", "Calcium", "Magnesium"],
};

export interface FixTagsResult {
  processedCount: number;
  updatedCount: number;
  errors: unknown[];
}

export async function fixSupplementTags(
  batchSize = 50,
  onProgress?: (processed: number, total: number) => void,
): Promise<FixTagsResult> {
  const db = getTursoClient();
  const result: FixTagsResult = { processedCount: 0, updatedCount: 0, errors: [] };

  const countResult = await db.execute("SELECT COUNT(*) as cnt FROM supplements");
  const total = Number(countResult.rows[0]?.cnt ?? 0);

  let offset = 0;
  while (offset < total) {
    const batch = await db.execute({
      sql: "SELECT id, name, ai_summary, nutrition_facts, tags FROM supplements LIMIT ? OFFSET ?",
      args: [batchSize, offset],
    });

    for (const row of batch.rows) {
      try {
        const id = row.id as string;
        const name = (row.name as string) ?? "";
        const aiSummary = (row.ai_summary as string) ?? "";
        const existingTags: string[] = JSON.parse((row.tags as string) ?? "[]") ?? [];

        const newTags = new Set(existingTags);

        for (const [tagKey, keywords] of Object.entries(TAG_MAP)) {
          const combined = `${name} ${aiSummary}`.toLowerCase();
          if (keywords.some((kw) => combined.includes(kw.toLowerCase()))) {
            newTags.add(tagKey);
          }
        }

        const updatedTags = Array.from(newTags);
        if (updatedTags.length !== existingTags.length || !existingTags.every((t) => newTags.has(t))) {
          await db.execute({
            sql: "UPDATE supplements SET tags = ? WHERE id = ?",
            args: [JSON.stringify(updatedTags), id],
          });
          result.updatedCount++;
        }

        result.processedCount++;
        if (onProgress) onProgress(result.processedCount, total);
      } catch (e) {
        result.errors.push(e);
      }
    }

    offset += batchSize;
  }

  return result;
}
