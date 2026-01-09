export type ContentQueueStatus = "pending" | "review" | "published" | "failed";

export interface ContentQueueItem {
    id: string;
    hpid: string | null;
    title: string;
    slug: string;
    region: string | null;
    theme: string | null;
    content_html: string | null;
    ai_summary: string | null;
    ai_bullets: { text: string }[] | null;
    ai_faq: { question: string; answer: string }[] | null;
    ai_cta: string | null;
    extra_sections: { title: string; body: string }[] | null;
    status: ContentQueueStatus;
    publish_at: string;
    created_at?: string;
    updated_at?: string;
}
