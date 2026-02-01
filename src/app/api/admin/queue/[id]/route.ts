
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";
import { submitToIndexNow } from "@/lib/naver-indexnow";
import { getSiteUrl } from "@/lib/site-url";

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = getSupabaseServerClient();
        const body = await request.json();
        const { id } = params;

        // Validate Status Update
        if (body.status && !['pending', 'review', 'published', 'failed'].includes(body.status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }

        const { data: updatedData, error } = await supabase
            .from("content_queue")
            .update(body)
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;

        // Trigger IndexNow if published
        if (updatedData && updatedData.status === 'published') {
            const siteUrl = getSiteUrl();
            let url = "";
            if (updatedData.hpid) {
                url = `${siteUrl}/pharmacy/${updatedData.hpid}`;
            } else if (updatedData.slug) {
                url = `${siteUrl}/blog/${updatedData.slug}`;
            }

            if (url) {
                // Fire and forget (don't await to keep UI responsive)
                submitToIndexNow([url]).catch(e => console.error("IndexNow Error:", e));
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Queue update error:", error);
        return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = getSupabaseServerClient();
        const { id } = params;

        // Delete and return the deleted row to get URL info
        const { data: deletedData, error } = await supabase
            .from("content_queue")
            .delete()
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;

        // Trigger IndexNow (notify deletion/update)
        if (deletedData && deletedData.status === 'published') {
            const siteUrl = getSiteUrl();
            let url = "";
            if (deletedData.hpid) {
                url = `${siteUrl}/pharmacy/${deletedData.hpid}`;
            } else if (deletedData.slug) {
                url = `${siteUrl}/blog/${deletedData.slug}`;
            }

            if (url) {
                // Fire and forget
                submitToIndexNow([url]).catch(e => console.error("IndexNow Error:", e));
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Queue delete error:", error);
        return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    }
}
