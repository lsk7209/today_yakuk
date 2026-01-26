interface AdditiveData {
    has_preservatives?: boolean;
    has_coloring?: boolean;
    has_artificial_sweeteners?: boolean;
    details?: string[];
}

interface AdditiveSignalProps {
    additives: AdditiveData;
}

export function AdditiveSignal({ additives }: AdditiveSignalProps) {
    const hasAnyAdditives =
        additives.has_preservatives ||
        additives.has_coloring ||
        additives.has_artificial_sweeteners;

    const signalColor = hasAnyAdditives ? "yellow" : "green";
    const signalText = hasAnyAdditives ? "주의 성분 포함" : "양호";

    return (
        <div className="space-y-3">
            {/* Signal Header */}
            <div className="flex items-center gap-3">
                <div
                    className={`h-3 w-3 rounded-full ${signalColor === "green" ? "bg-green-500" : "bg-yellow-500"
                        }`}
                    aria-label={signalText}
                ></div>
                <span className="font-medium">{signalText}</span>
            </div>

            {/* Detailed Breakdown */}
            <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                    <span>보존료</span>
                    <span
                        className={
                            additives.has_preservatives ? "text-yellow-600" : "text-green-600"
                        }
                    >
                        {additives.has_preservatives ? "포함" : "없음"}
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <span>착색료</span>
                    <span
                        className={
                            additives.has_coloring ? "text-yellow-600" : "text-green-600"
                        }
                    >
                        {additives.has_coloring ? "포함" : "없음"}
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <span>인공 감미료</span>
                    <span
                        className={
                            additives.has_artificial_sweeteners
                                ? "text-yellow-600"
                                : "text-green-600"
                        }
                    >
                        {additives.has_artificial_sweeteners ? "포함" : "없음"}
                    </span>
                </div>
            </div>

            {/* Additional Details */}
            {additives.details && additives.details.length > 0 && (
                <div className="mt-6 p-5 bg-slate-50 border border-slate-100 rounded-2xl">
                    <p className="font-black text-slate-900 mb-3 flex items-center gap-2">
                        <span className="w-1 h-4 bg-amber-400 rounded-full"></span>
                        첨가물 상세
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                        {additives.details.map((detail, idx) => {
                            // If detail contains multiple ingredients separated by commas, split them
                            const items = detail.includes(',')
                                ? detail.split(',').map(s => s.trim()).filter(Boolean)
                                : [detail];

                            return items.map((item, i) => (
                                <span
                                    key={`${idx}-${i}`}
                                    className="px-2.5 py-1 bg-white border border-slate-200 text-slate-500 rounded-lg text-xs font-medium hover:border-brand-300 transition-colors"
                                >
                                    {item}
                                </span>
                            ));
                        })}
                    </div>
                    <p className="mt-3 text-[10px] text-slate-400 font-medium italic">
                        ※ 식약처 공시 기준 원재료 및 첨가물 정보입니다.
                    </p>
                </div>
            )}
        </div>
    );
}
