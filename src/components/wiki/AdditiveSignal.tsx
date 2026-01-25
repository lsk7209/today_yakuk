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
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-900">
                    <p className="font-semibold mb-1">첨가물 상세:</p>
                    <ul className="list-disc list-inside space-y-1">
                        {additives.details.map((detail, idx) => (
                            <li key={idx}>{detail}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
