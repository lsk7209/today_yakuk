import Link from "next/link";

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
    const checks = [
        { label: "보존료", value: additives.has_preservatives },
        { label: "착색료", value: additives.has_coloring },
        { label: "인공 감미료", value: additives.has_artificial_sweeteners },
    ];
    const hasKnownChecks = checks.some(({ value }) => typeof value === "boolean");
    const hasMatchedKeyword = checks.some(({ value }) => value === true);
    const signalColor = hasMatchedKeyword ? "yellow" : "slate";
    const signalText = hasMatchedKeyword
        ? "지정 키워드 확인"
        : hasKnownChecks
          ? "지정 키워드 미확인"
          : "분류 정보 없음";

    return (
        <div className="space-y-3">
            {/* Signal Header */}
            <div className="flex items-center gap-3">
                <div
                    className={`h-3 w-3 rounded-full ${signalColor === "yellow" ? "bg-yellow-500" : "bg-slate-400"
                        }`}
                    aria-label={signalText}
                ></div>
                <span className="font-medium">{signalText}</span>
            </div>

            {/* Detailed Breakdown */}
            <div className="space-y-2 text-sm">
                {checks.map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between gap-3">
                        <span>{label}</span>
                        <span className={value === true ? "text-yellow-700" : "text-slate-500"}>
                            {value === true
                                ? "관련 키워드 표시"
                                : value === false
                                  ? "지정 키워드 미확인"
                                  : "자료 없음"}
                        </span>
                    </div>
                ))}
            </div>

            {/* Additional Details */}
            {additives.details && additives.details.length > 0 && (
                <div className="mt-6 p-5 bg-slate-50 border border-slate-100 rounded-2xl">
                    <p className="font-black text-slate-900 mb-3 flex items-center gap-2">
                        <span className="w-1 h-4 bg-amber-400 rounded-full"></span>
                        공개 원재료 정보
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
                        ※ 공개 원재료명 텍스트를 옮긴 정보입니다. 표시 결과는 특정 성분의 부재나 제품 안전성을 보증하지 않습니다.
                    </p>
                </div>
            )}
            <p className="text-xs leading-relaxed text-slate-500">
                이 신호는 공개 원재료 텍스트의 키워드 확인 결과입니다. 성분의 부재나 안전성 판정이
                아닙니다.{" "}
                <Link
                    href="/blog/supplement-additives-label-guide"
                    className="font-bold text-brand-700 underline underline-offset-4"
                >
                    첨가물 표시 해석 가이드
                </Link>
            </p>
        </div>
    );
}
