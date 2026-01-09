import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";

// DELETE: 항목 삭제
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = getSupabaseServerClient();
        const { error } = await supabase
            .from("content_queue")
            .delete()
            .eq("id", params.id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Queue item delete failed:", error);
        return NextResponse.json(
            { success: false, message: "삭제 실패" },
            { status: 500 }
        );
    }
}

// POST: 상태 변경 (예: published로 즉시 발행)
export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();
        const { status } = body; // "published" 등

        const supabase = getSupabaseServerClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updateData: Record<string, any> = { status };

        if (status === "published") {
            updateData.published_at = new Date().toISOString();
        }

        const { error } = await supabase
            .from("content_queue")
            .update(updateData)
            .eq("id", params.id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json(
            { success: false, message: "업데이트 실패" },
            { status: 500 }
        );
    }
}
