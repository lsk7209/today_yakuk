import { generateBlogTopic, generateBlogPost } from "@/lib/gemini-blog";
import { getLastPendingPublishAt, getContentBySlug, insertContentItem } from "@/lib/data/content";
import { NextResponse } from "next/server";
import { getNextSlot } from "@/lib/scheduler";

export async function POST() {
  try {
    const topic = await generateBlogTopic();
    if (!topic) return NextResponse.json({ error: "Failed to generate topic" }, { status: 500 });

    const post = await generateBlogPost(topic);
    if (!post) return NextResponse.json({ error: "Failed to generate blog post" }, { status: 500 });

    const lastPublishAt = await getLastPendingPublishAt();
    let lastScheduledTime = lastPublishAt ? new Date(lastPublishAt) : new Date();
    if (lastScheduledTime.getTime() < Date.now()) lastScheduledTime = new Date();

    const nextSlot = getNextSlot(lastScheduledTime);

    let finalSlug = post.slug_suggestion || `blog-${Date.now()}`;
    const existing = await getContentBySlug(finalSlug);
    if (existing) finalSlug = `${finalSlug}-${Date.now()}`;

    await insertContentItem({
      hpid: null,
      title: post.title,
      slug: finalSlug,
      theme: "blog",
      content_html: post.content_html,
      ai_summary: post.summary,
      ai_faq: post.faq,
      status: "pending",
      publish_at: nextSlot.toISOString(),
    });

    return NextResponse.json({ success: true, title: post.title, publish_at: nextSlot });
  } catch (error) {
    console.error("Manual blog trigger error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
