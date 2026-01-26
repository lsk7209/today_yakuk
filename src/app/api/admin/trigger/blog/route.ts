
import { generateBlogTopic, generateBlogPost } from "@/lib/gemini-blog";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";
import { getNextSlot } from "@/lib/scheduler";

export async function POST() {
    try {
        const supabase = getSupabaseServerClient();

        // 1. Generate Topic
        const topic = await generateBlogTopic();
        if (!topic) {
            return NextResponse.json({ error: "Failed to generate topic" }, { status: 500 });
        }

        // 2. Generate Content
        const post = await generateBlogPost(topic);
        if (!post) {
            return NextResponse.json({ error: "Failed to generate blog post" }, { status: 500 });
        }

        // 3. Scheduling logic (simplified from script)
        const { data: lastPending } = await supabase
            .from("content_queue")
            .select("publish_at")
            .eq("status", "pending")
            .order("publish_at", { ascending: false })
            .limit(1)
            .maybeSingle();

        let lastScheduledTime = lastPending?.publish_at
            ? new Date(lastPending.publish_at)
            : new Date();

        if (lastScheduledTime.getTime() < Date.now()) {
            lastScheduledTime = new Date();
        }

        const nextSlot = getNextSlot(lastScheduledTime);

        // 4. Save to DB
        let finalSlug = post.slug_suggestion || `blog-${Date.now()}`;

        // Simple duplicate check
        const { data: existing } = await supabase
            .from("content_queue")
            .select("id")
            .eq("slug", finalSlug)
            .maybeSingle();

        if (existing) {
            finalSlug = `${finalSlug}-${Date.now()}`;
        }

        const queueItem = {
            hpid: null,
            title: post.title,
            slug: finalSlug,
            theme: "blog",
            content_html: post.content_html,
            ai_summary: post.summary,
            ai_faq: post.faq,
            status: "pending",
            publish_at: nextSlot.toISOString(),
        };

        const { error } = await supabase.from("content_queue").insert(queueItem);

        if (error) {
            throw error;
        }

        return NextResponse.json({ success: true, title: post.title, publish_at: nextSlot });

    } catch (error) {
        console.error("Manual blog trigger error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
