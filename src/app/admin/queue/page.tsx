import { listContentQueue } from "@/lib/data/content";
import QueueActions from "@/components/admin/queue-actions";
import { ContentQueueItem } from "@/types/content";
import CleanupFailedButton from "@/components/admin/cleanup-failed-button";

export const dynamic = "force-dynamic";

export default async function QueueManagementPage() {
    const items = await listContentQueue(50);
    const queue = items as ContentQueueItem[];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">컨텐츠 큐 관리</h1>
                <CleanupFailedButton />
            </div>
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">발행 예정일</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">제목/약국명</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">타입</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {queue?.map((item) => (
                            <tr key={item.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                ${item.status === 'published' ? 'bg-green-100 text-green-800' :
                                            item.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                                                'bg-red-100 text-red-800'}`}>
                                        {item.status.toUpperCase()}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(item.publish_at).toLocaleString('ko-KR')}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                    <div className="font-medium">{item.title}</div>
                                    <div className="text-gray-500 text-xs">{item.slug}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {item.theme === 'blog' ? '📝 블로그' : '🏥 약국'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <QueueActions id={item.id} status={item.status} />
                                </td>
                            </tr>
                        ))}
                        {!queue?.length && (
                            <tr>
                                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                                    데이터가 없습니다.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
