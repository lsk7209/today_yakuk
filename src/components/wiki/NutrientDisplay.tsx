"use client";

import { Info } from "lucide-react";

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
    if (!nutrients || nutrients.length === 0) {
        return (
            <div className="text-center py-12 text-slate-400 font-medium">
                영양 성분 정보가 없습니다.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Legend / Info */}
            <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100 mb-6">
                <Info className="w-4 h-4 text-brand-500" />
                <span>% 영양성분 기준치: 1일 영양성분 기준치에 대한 비율입니다. (성인 남녀 평균 기준)</span>
            </div>

            <div className="grid gap-4">
                {nutrients.map((nutrient, index) => {
                    const hasDV = nutrient.percentDV !== null && nutrient.percentDV !== undefined;
                    const percent = hasDV ? nutrient.percentDV! : 0;

                    // Progress bar color and width
                    // Capping visual bar at 100% but showing real percentage in text
                    const barWidth = Math.min(percent, 100);
                    let barColor = "bg-brand-500";
                    if (percent >= 100) barColor = "bg-emerald-600 shadow-[0_0_10px_rgba(5,150,105,0.3)]";
                    if (percent > 0 && percent < 30) barColor = "bg-amber-400";

                    return (
                        <div
                            key={`${nutrient.name}-${index}`}
                            className="group bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 hover:border-brand-200 hover:shadow-md transition-all duration-300"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                {/* Name and Amount */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-slate-900 truncate">{nutrient.name}</h3>
                                        {!hasDV && (
                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-bold uppercase tracking-tight">
                                                기능 성분
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm font-medium text-slate-500">
                                        {nutrient.amount !== null ? `${nutrient.amount.toLocaleString()}${nutrient.unit || ''}` : '함량 정보 없음'}
                                    </p>
                                </div>

                                {/* Percentage Visualization */}
                                <div className="w-full sm:w-64 flex items-center gap-4">
                                    <div className="flex-1">
                                        {hasDV ? (
                                            <div className="space-y-1.5">
                                                <div className="flex justify-between items-end">
                                                    <span className={`text-xs font-black ${percent >= 100 ? 'text-emerald-700' : 'text-slate-400'}`}>
                                                        {percent === 0 ? '적음' : `${percent}%`}
                                                    </span>
                                                    {percent > 100 && (
                                                        <span className="text-[10px] text-emerald-500 font-bold animate-pulse">고함량</span>
                                                    )}
                                                </div>
                                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-1000 ease-out ${barColor}`}
                                                        style={{ width: `${barWidth}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="h-8 flex items-center justify-end">
                                                <span className="text-xs text-slate-300 font-medium italic">권장량 기준 없음</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
