"use client";

interface NutrientData {
    name: string;
    amount: number;
    unit: string;
    percentDV: number; // Daily Value percentage
}

interface NutrientChartProps {
    nutrients: NutrientData[];
}

export function NutrientChart({ nutrients }: NutrientChartProps) {
    return (
        <div className="space-y-4">
            {nutrients.map((nutrient, index) => {
                // Clamp percentage for visual representation (max 200% for chart)
                const visualPercent = Math.min(nutrient.percentDV, 200);

                return (
                    <div key={index} className="space-y-2">
                        <div className="flex items-baseline justify-between text-sm">
                            <span className="font-medium">{nutrient.name}</span>
                            <span className="text-[var(--muted)]">
                                {nutrient.amount}
                                {nutrient.unit}
                            </span>
                        </div>

                        {/* Bar Chart */}
                        <div className="relative h-8 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-500 flex items-center justify-end pr-3 text-xs font-semibold text-white ${nutrient.percentDV >= 100
                                        ? "bg-gradient-to-r from-brand-500 to-brand-600"
                                        : "bg-gradient-to-r from-blue-400 to-blue-500"
                                    }`}
                                style={{ width: `${visualPercent}%` }}
                            >
                                {nutrient.percentDV >= 20 && `${nutrient.percentDV}%`}
                            </div>
                            {nutrient.percentDV < 20 && (
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-600">
                                    {nutrient.percentDV}%
                                </span>
                            )}
                        </div>

                        <div className="text-xs text-[var(--muted)]">
                            일일 권장량 대비 {nutrient.percentDV}%
                            {nutrient.percentDV > 100 && (
                                <span className="ml-2 text-brand-600 font-medium">충분</span>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
