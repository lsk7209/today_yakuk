
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function DELETE() {
    try {
        const supabase = getSupabaseServerClient();

        // status가 'failed'인 항목들 삭제
        const { data, error, count } = await supabase
            .from("content_queue")
            .delete({ count: 'exact' })
            .eq("status", "failed");

        if (error) {
            console.error("Cleanup failed:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: `${count ?? 0}개의 실패한 항목이 삭제되었습니다.`
        });
    } catch (error) {
        console.error("Cleanup error:", error);
        return NextResponse.json({ error: "Cleanup failed" }, { status: 500 });
    }
}
