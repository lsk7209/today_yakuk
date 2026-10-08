export type JosaPair = "은/는" | "이/가" | "을/를" | "과/와" | "와/과" | "으로/로";

const HANGUL_BASE = 0xac00;
const HANGUL_END = 0xd7a3;
const JONGSEONG_COUNT = 28;
const RIEUL_JONGSEONG = 8;

const DIGIT_BATCHIM: Record<string, { hasBatchim: boolean; isRieul: boolean }> = {
  "0": { hasBatchim: true, isRieul: false }, // 영
  "1": { hasBatchim: true, isRieul: true }, // 일
  "2": { hasBatchim: false, isRieul: false }, // 이
  "3": { hasBatchim: true, isRieul: false }, // 삼
  "4": { hasBatchim: false, isRieul: false }, // 사
  "5": { hasBatchim: false, isRieul: false }, // 오
  "6": { hasBatchim: true, isRieul: false }, // 육
  "7": { hasBatchim: true, isRieul: true }, // 칠
  "8": { hasBatchim: true, isRieul: true }, // 팔
  "9": { hasBatchim: false, isRieul: false }, // 구
};

const LATIN_BATCHIM: Record<string, { hasBatchim: boolean; isRieul: boolean }> = {
  L: { hasBatchim: true, isRieul: true },
  M: { hasBatchim: true, isRieul: false },
  N: { hasBatchim: true, isRieul: false },
  R: { hasBatchim: true, isRieul: true },
};

function stripTrailingParentheticalAndPunctuation(word: string): string {
  const trimmed = word.trim();
  const withoutParen = trimmed
    .replace(/\s*\([^)]*\)\s*$/g, "")
    .replace(/\s*\[[^\]]*\]\s*$/g, "")
    .replace(/['"”’〉》」』)\]\s]+$/g, "")
    .trim();
  return withoutParen || trimmed.replace(/['"”’〉》」』)\]\s]+$/g, "").trim();
}

export function analyzeBatchim(word: string): { hasBatchim: boolean; isRieul: boolean } {
  const target = stripTrailingParentheticalAndPunctuation(word);
  if (!target) {
    return { hasBatchim: false, isRieul: false };
  }

  const lastChar = target[target.length - 1]!;
  const code = lastChar.charCodeAt(0);

  if (code >= HANGUL_BASE && code <= HANGUL_END) {
    const jongseong = (code - HANGUL_BASE) % JONGSEONG_COUNT;
    return {
      hasBatchim: jongseong !== 0,
      isRieul: jongseong === RIEUL_JONGSEONG,
    };
  }

  if (lastChar in DIGIT_BATCHIM) {
    return DIGIT_BATCHIM[lastChar]!;
  }

  const upper = lastChar.toUpperCase();
  if (upper in LATIN_BATCHIM) {
    return LATIN_BATCHIM[upper]!;
  }

  return { hasBatchim: false, isRieul: false };
}

export function hasFinalConsonant(word: string): boolean {
  return analyzeBatchim(word).hasBatchim;
}

export function pickJosa(word: string, pair: JosaPair): string {
  const { hasBatchim, isRieul } = analyzeBatchim(word);

  switch (pair) {
    case "은/는":
      return hasBatchim ? "은" : "는";
    case "이/가":
      return hasBatchim ? "이" : "가";
    case "을/를":
      return hasBatchim ? "을" : "를";
    case "과/와":
    case "와/과":
      return hasBatchim ? "과" : "와";
    case "으로/로":
      return !hasBatchim || isRieul ? "로" : "으로";
  }
}

export function withJosa(word: string, pair: JosaPair): string {
  const trimmed = word.trim();
  if (!trimmed) return "";
  return `${trimmed}${pickJosa(trimmed, pair)}`;
}
