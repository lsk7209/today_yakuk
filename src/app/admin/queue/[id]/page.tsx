import { getContentItemById } from "@/lib/data/content";
import { notFound } from "next/navigation";
import QueueEditorForm from "@/components/admin/queue-editor-form";

export const dynamic = "force-dynamic";

export default async function QueueEditPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const item = await getContentItemById(id);

    if (!item) {
        notFound();
    }

    return (
        <div className="max-w-4xl mx-auto py-8">
            <header className="mb-8 flex items-center justify-between">
                <h1 className="text-2xl font-bold">컨텐츠 수정</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-bold
                    ${item.status === 'published' ? 'bg-green-100 text-green-700' :
                        item.status === 'pending' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100'}`}>
                    {item.status.toUpperCase()}
                </span>
            </header>

            <QueueEditorForm initialData={{ ...item, content_html: item.content_html ?? "" }} />
        </div>
    );
}
