"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
// import MarkdownEditor from ... (For now, simple textarea or just content_html text)
// Since content is HTML, a WYSIWYG would be best, but for MVP we use a Textarea allowing HTML edit.

type QueueItem = {
    id: string;
    title: string;
    slug: string;
    content_html: string;
    ai_summary: string | null;
    publish_at: string;
    status: string;
};

export default function QueueEditorForm({ initialData }: { initialData: QueueItem }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState(initialData);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/queue/${initialData.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: formData.title,
                    slug: formData.slug,
                    content_html: formData.content_html,
                    ai_summary: formData.ai_summary,
                    publish_at: formData.publish_at,
                    status: formData.status
                }),
            });

            if (!res.ok) throw new Error("Update failed");

            alert("✅ 저장되었습니다.");
            router.refresh();
            router.push("/admin/queue");
        } catch {
            alert("❌ 저장 실패");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">제목</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Slug (URL)</label>
                    <input
                        type="text"
                        name="slug"
                        value={formData.slug}
                        onChange={handleChange}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm"
                        required
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">발행 예정일</label>
                <input
                    type="datetime-local"
                    name="publish_at"
                    value={formData.publish_at ? new Date(formData.publish_at).toISOString().slice(0, 16) : ""}
                    onChange={handleChange}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                />
            </div>

            <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">상태</label>
                <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                >
                    <option value="pending">대기 중 (Pending)</option>
                    <option value="published">발행됨 (Published)</option>
                    <option value="failed">실패 (Failed)</option>
                    <option value="review">검토 필요 (Review)</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">AI 요약 (Meta Description)</label>
                <textarea
                    name="ai_summary"
                    value={formData.ai_summary || ""}
                    onChange={handleChange}
                    rows={3}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                />
            </div>

            <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">본문 (HTML)</label>
                <textarea
                    name="content_html"
                    value={formData.content_html}
                    onChange={handleChange}
                    rows={20}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">HTML 태그를 직접 수정할 수 있습니다.</p>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                <Link href="/admin/queue" className="flex items-center text-slate-500 hover:text-slate-800 font-bold">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    취소하고 돌아가기
                </Link>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-8 py-4 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl transition-all shadow-lg active:scale-95 disabled:opacity-50"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    변경사항 저장
                </button>
            </div>
        </form>
    );
}
