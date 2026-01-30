"use client";

import { Info } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface NutrientData {
    name: string;
    amount: number | null;
    unit: string | null;
    percentDV: number | null;
}

interface NutrientDisplayProps {
    nutrients: NutrientData[];
}

export function NutrientDisplay({ nutrients }: NutrientDisplayProps) {
    const [isVisible, setIsVisible] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.1 }
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, []);

    if (!nutrients || nutrients.length === 0) {
        return (
            <div className="text-center py-12 text-slate-400 font-medium">
                영양 성분 정보가 없습니다.
            </div>
        );
    }

    // Category sorting logic
    const vitaminKeywords = ['비타민', '판토텐산', '나이아신', '엽산', '비오틴', '아연', '셀렌', '구리', '마그네슘', '칼슘', '철', '요오드'];

    const vitamins = nutrients.filter(n =>
        n.percentDV !== null || vitaminKeywords.some(key => n.name.includes(key))
    );
    const activeIngredients = nutrients.filter(n =>
        n.percentDV === null && !vitaminKeywords.some(key => n.name.includes(key))
    );

    const renderNutrientCard = (nutrient: NutrientData, index: number, totalInGroup: number, offset: number) => {
        const hasDV = nutrient.percentDV !== null && nutrient.percentDV !== undefined;
        const percent = hasDV ? nutrient.percentDV! : 0;

        const barWidth = Math.min(percent, 100);
        let barColor = "bg-brand-500";
        if (percent >= 100) barColor = "bg-emerald-600 shadow-[0_0_15px_rgba(5,150,105,0.4)]";
        if (percent > 0 && percent < 30) barColor = "bg-amber-400";

        // Active ingredient special badges
        const isActiveComp = !hasDV;

        return (
            <div
                key={`${nutrient.name}-${index}`}
                className={`nutrient-card group bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 hover:border-brand-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-500 ${isVisible ? 'animate' : ''}`}
                style={{ animationDelay: `${(index + offset) * 0.1}s` }}
            >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-slate-900 truncate group-hover:text-brand-600 transition-colors uppercase tracking-tight">{nutrient.name}</h3>
                            {isActiveComp && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-black border border-blue-100">
                                    핵심 활성 성분
                                </span>
                            )}
                        </div>
                        <p className={`text-sm font-black ${isActiveComp ? 'text-brand-700 text-lg' : 'text-slate-500'}`}>
                            {nutrient.amount !== null ? `${nutrient.amount.toLocaleString()}${nutrient.unit || ''}` : '데이터 수집 중'}
                        </p>
                    </div>

                    <div className="w-full sm:w-64 flex items-center gap-4">
                        <div className="flex-1">
                            {hasDV ? (
                                <div className="space-y-1.5">
                                    <div className="flex justify-between items-end">
                                        <span className={`text-xs font-black ${percent >= 100 ? 'text-emerald-700' : 'text-slate-400'}`}>
                                            {percent === 0 ? '극소량' : `${percent.toLocaleString()}% 권장량`}
                                        </span>
                                        {percent > 100 && (
                                            <span className="text-[10px] text-emerald-500 font-bold animate-pulse">최적 함량</span>
                                        )}
                                    </div>
                                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner border border-slate-200/50">
                                        <div
                                            className={`progress-fill h-full rounded-full ${barColor}`}
                                            style={{ width: isVisible ? `${barWidth}%` : '0%' }}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="h-10 flex items-center justify-end">
                                    <div className="text-right">
                                        <span className="block text-[10px] text-slate-400 font-bold leading-none mb-1">고함량 원료</span>
                                        <span className="text-xs text-brand-500 font-black italic">전문가 검증 품질</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-10" ref={containerRef}>
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes slideInUp {
                    from { opacity: 0; transform: translateY(30px) scale(0.98); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .nutrient-card {
                    opacity: 0;
                    backface-visibility: hidden;
                }
                .nutrient-card.animate {
                    animation: slideInUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
                }
                .progress-fill {
                    width: 0% !important;
                    transition: width 1.5s cubic-bezier(0.65, 0, 0.35, 1);
                }
            `}} />

            {/* Vitamins & Minerals Section */}
            {vitamins.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-4 px-2">
                        <div className="w-1 h-5 bg-emerald-500 rounded-full" />
                        <h2 className="text-lg font-black text-slate-800 tracking-tight">비타민 & 미네랄</h2>
                        <span className="text-xs text-slate-400 font-bold ml-auto flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-full border border-slate-100">
                            <Info className="w-3 h-3" /> 일일 권장량 기준
                        </span>
                    </div>
                    <div className="grid gap-4">
                        {vitamins.map((n, i) => renderNutrientCard(n, i, vitamins.length, 0))}
                    </div>
                </div>
            )}

            {/* Active Ingredients Section */}
            {activeIngredients.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-4 px-2">
                        <div className="w-1 h-5 bg-brand-500 rounded-full" />
                        <h2 className="text-lg font-black text-slate-800 tracking-tight">핵심 기능성 원료</h2>
                    </div>
                    <div className="grid gap-4">
                        {activeIngredients.map((n, i) => renderNutrientCard(n, i, activeIngredients.length, vitamins.length))}
                    </div>
                </div>
            )}
        </div>
    );
}
