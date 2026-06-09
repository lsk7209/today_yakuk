import { deleteFailedContent } from "@/lib/data/content";
import { NextResponse } from "next/server";

export async function DELETE() {
  try {
    const count = await deleteFailedContent();
    return NextResponse.json({
      success: true,
      message: `${count}개의 실패한 항목이 삭제되었습니다.`,
    });
  } catch (error) {
    console.error("Cleanup error:", error);
    return NextResponse.json({ error: "Cleanup failed" }, { status: 500 });
  }
}
