import { NextResponse } from "next/server";
import { fixSupplementTags } from "@/lib/supplement-utils";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const result = await fixSupplementTags();
    return NextResponse.json({
      success: true,
      data: result,
      message: `Enrichment complete. Processed ${result.processedCount}, Updated ${result.updatedCount}`,
    });
  } catch (error) {
    console.error("Enrichment API Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
