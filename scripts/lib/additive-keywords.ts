/**
 * Centralized Additive Detection Keywords
 * Used by sync-supplements.ts and auto-enrich-supplements.ts
 */

export const ADDITIVE_KEYWORDS = {
    preservatives: [
        "보존료",
        "안식향산",
        "벤조산나트륨",
        "소르브산",
        "소르빈산",
        "아황산",
        "프로피온산"
    ],
    coloring: [
        "착색료",
        "이산화티타늄",
        "카라멜색소",
        "적색2호",
        "적색40호",
        "황색4호",
        "황색5호",
        "청색1호",
        "녹색3호"
    ],
    sweeteners: [
        "아스파탐",
        "수크랄로스",
        "사카린",
        "아세설팜K",
        "아세설팜칼륨",
        "스테비오사이드",
        "자일리톨",
        "에리스리톨"
    ]
};

/**
 * Detect additives from raw materials string
 */
export function detectAdditives(rawMaterials: string): {
    has_preservatives: boolean;
    has_coloring: boolean;
    has_artificial_sweeteners: boolean;
    details: string[];
} {
    const lowerMaterials = rawMaterials.toLowerCase();
    const details: string[] = [];

    const has_preservatives = ADDITIVE_KEYWORDS.preservatives.some(kw => {
        if (rawMaterials.includes(kw)) {
            details.push(kw);
            return true;
        }
        return false;
    });

    const has_coloring = ADDITIVE_KEYWORDS.coloring.some(kw => {
        if (rawMaterials.includes(kw)) {
            details.push(kw);
            return true;
        }
        return false;
    });

    const has_artificial_sweeteners = ADDITIVE_KEYWORDS.sweeteners.some(kw => {
        if (rawMaterials.includes(kw)) {
            details.push(kw);
            return true;
        }
        return false;
    });

    return {
        has_preservatives,
        has_coloring,
        has_artificial_sweeteners,
        details: [...new Set(details)] // Remove duplicates
    };
}
