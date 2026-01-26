"use client";

import { useState } from "react";
import { Zap, FileText, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function QuickActions() {
    const [loading, setLoading] = useState<string | null>(null);
    const router = useRouter();

    const triggerAction = async (action: "blog" | "enrich", label: string) => {
        try {
            setLoading(action);
            const res = await fetch(`/api/admin/trigger/${action}`, { method: "POST" });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Action failed");

            alert(`✅ ${label} 성공!\n${data.title ? `"${data.title}" 생성됨` : ""}`);
            router.refresh();
        } catch (e) {
            alert(`❌ 실패: ${e instanceof Error ? e.message : "Unknown error"}`);
        } finally {
            setLoading(null);
        }
    };

    return (
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
            <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                <Zap className="w-6 h-6 text-purple-500" />
                Quick Actions (수동 트리거)
            </h2>
            <div className="flex gap-4">
                <button
                    onClick={() => triggerAction("blog", "블로그 생성")}
                    disabled={!!loading}
                    className="flex items-center gap-2 px-6 py-4 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-2xl border border-slate-200 transition-all active:scale-95 disabled:opacity-50"
                >
                    {loading === "blog" ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5 text-blue-500" />}
                    블로그 포스트 생성 (즉시)
                </button>

                <button
                    onClick={() => triggerAction("enrich", "영양제 분석")}
                    disabled={!!loading}
                    className="flex items-center gap-2 px-6 py-4 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-2xl border border-slate-200 transition-all active:scale-95 disabled:opacity-50"
                >
                    {loading === "enrich" ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5 text-yellow-500" />}
                    영양제 AI 분석 (Mock)
                </button>
            </div>
        </section>
    );
}
