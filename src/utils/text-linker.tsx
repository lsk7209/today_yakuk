import Link from "next/link";
import React from "react";

/**
 * 텍스트 내 성분명을 자동으로 링크로 변환하는 유틸리티 함수
 * 
 * @param text - 원본 텍스트
 * @param ingredients - 성분명 목록 (우선순위 높은 순서)
 * @returns React 노드 배열
 */
export function linkIngredients(
    text: string,
    ingredients: Array<{ name: string; slug: string }>
): React.ReactNode[] {
    if (!text || ingredients.length === 0) {
        return [text];
    }

    // 긴 성분명 우선 정렬 (예: "비타민C" > "비타민")
    const sortedIngredients = [...ingredients].sort((a, b) => b.name.length - a.name.length);

    // 정규식 패턴 생성
    const pattern = sortedIngredients
        .map((ing) => ing.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")) // Escape special chars
        .join("|");
    const regex = new RegExp(`(${pattern})`, "gi");

    // 텍스트 분할
    const parts = text.split(regex);

    // React 노드로 변환
    return parts.map((part, index) => {
        const ingredient = sortedIngredients.find(
            (ing) => ing.name.toLowerCase() === part.toLowerCase()
        );

        if (ingredient) {
            return (
                <Link
                    key={index}
                    href={`/wiki/ingredient/${ingredient.slug}`}
                    className="text-brand-600 hover:text-brand-700 underline decoration-dotted underline-offset-2 font-medium transition-colors"
                >
                    {part}
                </Link>
            );
        }

        return <React.Fragment key={index}>{part}</React.Fragment>;
    });
}

/**
 * 성분명 슬러그 생성 (한글 → 영문 변환)
 */
export function generateIngredientSlug(name: string): string {
    const koreanToEnglish: Record<string, string> = {
        비타민C: "vitamin-c",
        비타민D: "vitamin-d",
        비타민E: "vitamin-e",
        비타민B: "vitamin-b",
        아연: "zinc",
        철분: "iron",
        칼슘: "calcium",
        마그네슘: "magnesium",
        오메가3: "omega-3",
        유산균: "probiotics",
    };

    return koreanToEnglish[name] || name.toLowerCase().replace(/\s+/g, "-");
}
