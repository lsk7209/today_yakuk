
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

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

        const { error } = await supabase
            .from("content_queue")
            .update(body)
            .eq("id", id);

        if (error) throw error;

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

        const { error } = await supabase
            .from("content_queue")
            .delete()
            .eq("id", id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Queue delete error:", error);
        return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    }
}
