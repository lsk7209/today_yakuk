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
        <div className="container min-h-[70vh] flex flex-col items-center justify-center py-20 px-6">
            <div className="bg-red-50 p-6 rounded-full mb-8">
                <AlertCircle className="h-16 w-16 text-red-500" />
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4 text-center">
                앗! 정보를 불러오지 못했습니다.
            </h1>

            <p className="text-lg text-slate-600 mb-10 text-center max-w-md">
                데이터 처리 중에 일시적인 오류가 발생했습니다. <br />
                잠시 후 다시 시도해 주시겠어요?
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
                <button
                    onClick={() => reset()}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-700 text-white px-8 py-4 text-sm font-black hover:bg-brand-800 transition-all shadow-lg hover:shadow-brand-700/30"
                >
                    <RefreshCw className="h-4 w-4" />
                    다시 시도하기
                </button>
                <Link
                    href="/"
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-100 text-slate-900 px-8 py-4 text-sm font-black hover:bg-slate-200 transition-all"
                >
                    <ArrowLeft className="h-4 w-4" />
                    홈으로 가기
                </Link>
            </div>

            {process.env.NODE_ENV === "development" && (
                <div className="mt-12 p-4 bg-slate-50 rounded-xl border border-slate-200 w-full max-w-2xl overflow-auto">
                    <p className="text-xs font-mono text-slate-500 whitespace-pre">
                        {error.message}
                    </p>
                </div>
            )}
        </div>
    );
}
