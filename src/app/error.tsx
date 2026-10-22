"use client";

import Link from "next/link";
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="city-page min-h-[70vh] flex flex-col items-center justify-center py-20 px-6">
            <div className="border-2 border-[var(--ink)] bg-[var(--fog)] p-6 mb-8">
                <AlertCircle className="h-16 w-16 text-[var(--coral-text)]" />
            </div>

            <h1 className="city-display-medium mb-4 text-center">
                앗! 정보를 불러오지 못했습니다.
            </h1>

            <p className="text-lg text-slate-600 mb-10 text-center max-w-md">
                데이터 처리 중에 일시적인 오류가 발생했습니다. <br />
                잠시 후 다시 시도해 주시겠어요?
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
                <button
                    onClick={() => reset()}
                    className="city-button flex-1"
                >
                    <RefreshCw className="h-4 w-4" />
                    다시 시도하기
                </button>
                <Link
                    href="/"
                    className="city-button city-button-secondary flex-1"
                >
                    <ArrowLeft className="h-4 w-4" />
                    홈으로 가기
                </Link>
            </div>

            {process.env.NODE_ENV === "development" && (
                <div className="mt-12 p-4 bg-slate-50 rounded-none border border-slate-200 w-full max-w-2xl overflow-auto">
                    <p className="text-xs font-mono text-slate-500 whitespace-pre">
                        {error.message}
                    </p>
                </div>
            )}
        </div>
    );
}
