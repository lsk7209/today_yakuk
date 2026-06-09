import { getTursoClient } from "@/lib/turso";
import {
    Activity,
    Database,
    FileText,
    CheckCircle,
    AlertCircle,
    Clock,
    Zap,
    Server
} from "lucide-react";
import Link from "next/link";
import QuickActions from "@/components/admin/quick-actions";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
    const db = getTursoClient();

    const today = new Date().toISOString().split('T')[0];
    let todayVisitors = 0;

    try {
        const visitResult = await db.execute({
            sql: "SELECT COUNT(*) as cnt FROM analytics_logs WHERE created_at >= ?",
            args: [today],
        });
        todayVisitors = Number(visitResult.rows[0]?.cnt ?? 0);
    } catch {
        // analytics_logs 테이블 없을 수 있음
    }

    let totalPharmacies = 0, pendingCount = 0, publishedCount = 0, failedCount = 0, totalSupplements = 0, enrichedSupplements = 0;

    try {
        const [p, pend, pub, fail, supp, enriched] = await Promise.all([
            db.execute("SELECT COUNT(*) as cnt FROM pharmacies"),
            db.execute("SELECT COUNT(*) as cnt FROM content_queue WHERE status = 'pending'"),
            db.execute("SELECT COUNT(*) as cnt FROM content_queue WHERE status = 'published'"),
            db.execute("SELECT COUNT(*) as cnt FROM content_queue WHERE status = 'failed'"),
            db.execute("SELECT COUNT(*) as cnt FROM supplements"),
            db.execute("SELECT COUNT(*) as cnt FROM supplements WHERE ai_summary IS NOT NULL"),
        ]);
        totalPharmacies = Number(p.rows[0]?.cnt ?? 0);
        pendingCount = Number(pend.rows[0]?.cnt ?? 0);
        publishedCount = Number(pub.rows[0]?.cnt ?? 0);
        failedCount = Number(fail.rows[0]?.cnt ?? 0);
        totalSupplements = Number(supp.rows[0]?.cnt ?? 0);
        enrichedSupplements = Number(enriched.rows[0]?.cnt ?? 0);
    } catch (e) {
        console.error("Admin stats error", e);
    }

    const enrichmentRate = totalSupplements ? Math.round((enrichedSupplements / totalSupplements) * 100) : 0;

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Dashboard</h1>
                    <p className="text-slate-500 font-medium">1-Person Unicorn Factory Control Center</p>
                </div>
                <div className="flex gap-2">
                    <Link
                        href="/admin/queue"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                        <FileText className="w-4 h-4" />
                        컨텐츠 큐 관리
                    </Link>
                </div>
            </header>

            <QuickActions />

            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 rounded-2xl">
                        <Activity className="w-8 h-8 text-indigo-600" />
                    </div>
                    <div>
                        <div className="text-sm font-medium text-slate-500">오늘 방문자</div>
                        <div className="text-3xl font-black text-slate-900">
                            {todayVisitors.toLocaleString()}
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-pink-50 rounded-2xl">
                        <Server className="w-8 h-8 text-pink-600" />
                    </div>
                    <div>
                        <div className="text-sm font-medium text-slate-500">서버 상태</div>
                        <div className="text-xl font-black text-green-500 flex items-center gap-1">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                            </span>
                            Normal
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Zap className="w-48 h-48" />
                </div>

                <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2 relative z-10">
                    <Zap className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                    영양제 AI 데이터 생성 현황
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                    <div className="space-y-2">
                        <div className="text-slate-500 font-medium text-sm">전체 데이터베이스</div>
                        <div className="text-3xl font-black text-slate-900">
                            {totalSupplements.toLocaleString()}
                            <span className="text-base font-bold text-slate-400 ml-1">건</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="text-slate-500 font-medium text-sm flex items-center gap-2">
                            AI 분석 완료
                            <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-bold">New</span>
                        </div>
                        <div className="text-3xl font-black text-green-600">
                            {enrichedSupplements.toLocaleString()}
                            <span className="text-base font-bold text-slate-400 ml-1">건</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-end">
                            <div className="text-slate-500 font-medium text-sm">진행률</div>
                            <div className="text-2xl font-black text-slate-900">{enrichmentRate}%</div>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                            <div
                                className="bg-gradient-to-r from-green-400 to-emerald-600 h-full rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${enrichmentRate}%` }}
                            />
                        </div>
                        <p className="text-xs text-slate-400">* 매일 약 800개씩 자동으로 채워집니다.</p>
                    </div>
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
                    <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                        <Activity className="w-6 h-6 text-blue-500" />
                        컨텐츠 발행 현황
                    </h2>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-orange-50 p-5 rounded-2xl border border-orange-100">
                            <div className="flex items-center gap-2 text-orange-700 font-bold mb-2">
                                <Clock className="w-4 h-4" /> 대기 중
                            </div>
                            <div className="text-2xl font-black text-slate-900">{pendingCount.toLocaleString()}</div>
                        </div>

                        <div className="bg-green-50 p-5 rounded-2xl border border-green-100">
                            <div className="flex items-center gap-2 text-green-700 font-bold mb-2">
                                <CheckCircle className="w-4 h-4" /> 발행 완료
                            </div>
                            <div className="text-2xl font-black text-slate-900">{publishedCount.toLocaleString()}</div>
                        </div>

                        <div className="col-span-2 bg-red-50 p-5 rounded-2xl border border-red-100 flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-2 text-red-700 font-bold mb-1">
                                    <AlertCircle className="w-4 h-4" /> 실패 / 오류
                                </div>
                                <div className="text-xs text-red-600/80">컨텐츠 생성 실패 건수</div>
                            </div>
                            <div className="text-2xl font-black text-slate-900">{failedCount.toLocaleString()}</div>
                        </div>
                    </div>
                </section>

                <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
                    <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                        <Server className="w-6 h-6 text-slate-500" />
                        인프라 데이터
                    </h2>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white rounded-xl shadow-sm">
                                    <Database className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <div className="font-bold text-slate-900">전국 약국 데이터</div>
                                    <div className="text-xs text-slate-500">Live Database Code</div>
                                </div>
                            </div>
                            <div className="text-xl font-black text-slate-900">{totalPharmacies.toLocaleString()}</div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                            <div className="flex items-center gap-4">
                                <Link href="/sitemap.xml" target="_blank" className="p-3 bg-white rounded-xl shadow-sm hover:bg-slate-100 transition-colors">
                                    <FileText className="w-6 h-6 text-green-600" />
                                </Link>
                                <div>
                                    <div className="font-bold text-slate-900">사이트맵 (SEO)</div>
                                    <Link href="/sitemap.xml" target="_blank" className="text-xs text-blue-500 hover:underline flex items-center gap-1">
                                        새창으로 열기
                                    </Link>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-slate-400">제출 주소</div>
                                <div className="font-mono text-sm font-bold text-slate-700">/sitemap.xml</div>
                            </div>
                        </div>

                        <div className="bg-slate-900 rounded-2xl p-6 text-white relative overflow-hidden">
                            <div className="relative z-10">
                                <h3 className="font-bold mb-4 flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-slate-400" />
                                    자동화 스케줄
                                </h3>
                                <div className="space-y-3 text-sm text-slate-300">
                                    <div className="flex justify-between border-b border-slate-800 pb-2">
                                        <span>AI 컨텐츠 생성</span>
                                        <span className="font-mono text-white">07, 08, 14, 20시</span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-800 pb-2">
                                        <span>블로그 발행</span>
                                        <span className="font-mono text-white">09, 15, 21시</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>영양제 분석 (New)</span>
                                        <span className="font-mono text-emerald-400">3시간 간격 (일 8회)</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
