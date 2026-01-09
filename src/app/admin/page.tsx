import { getSupabaseServerClient } from "@/lib/supabase-server";

// SSR force dynamic
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
    const supabase = getSupabaseServerClient();

    // 통계 쿼리 (병렬 실행)
    const [
        { count: totalPharmacies },
        { count: pendingCount },
        { count: publishedCount },
        { count: failedCount },
    ] = await Promise.all([
        supabase.from("pharmacies").select("*", { count: "exact", head: true }),
        supabase.from("content_queue").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("content_queue").select("*", { count: "exact", head: true }).eq("status", "published"),
        supabase.from("content_queue").select("*", { count: "exact", head: true }).eq("status", "failed"),
    ]);

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">시스템 현황</h1>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {/* 전체 약국 수 */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 truncate">전체 약국 데이터</dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">{totalPharmacies?.toLocaleString() ?? 0}</dd>
                    </div>
                </div>

                {/* 발행 대기 */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 truncate">발행 예약 (Pending)</dt>
                        <dd className="mt-1 text-3xl font-semibold text-orange-600">{pendingCount?.toLocaleString() ?? 0}</dd>
                    </div>
                </div>

                {/* 발행 완료 */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 truncate">발행 완료 (Published)</dt>
                        <dd className="mt-1 text-3xl font-semibold text-green-600">{publishedCount?.toLocaleString() ?? 0}</dd>
                    </div>
                </div>

                {/* 실패 */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 truncate">생성 실패 (Failed)</dt>
                        <dd className="mt-1 text-3xl font-semibold text-red-600">{failedCount?.toLocaleString() ?? 0}</dd>
                    </div>
                </div>
            </div>

            <div className="mt-8 bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium mb-4">운영 가이드</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                    <li><strong>컨텐츠 큐:</strong> AI가 생성한 컨텐츠를 확인하고 수동으로 발행하거나 삭제할 수 있습니다.</li>
                    <li><strong>자동화 스케줄:</strong> 매일 07, 08, 14, 20시에 컨텐츠가 생성되고, 09, 15, 21시에 발행됩니다.</li>
                    <li><strong>로그인 정보:</strong> 비밀번호는 <code>1234</code> 입니다.</li>
                </ul>
            </div>
        </div>
    );
}
