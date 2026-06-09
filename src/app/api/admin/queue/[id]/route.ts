import { updateContentItem, deleteContentItem } from "@/lib/data/content";
import { NextResponse } from "next/server";
import { submitToIndexNow } from "@/lib/naver-indexnow";
import { getSiteUrl } from "@/lib/site-url";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { id } = params;

    if (body.status && !["pending", "review", "published", "failed"].includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const updatedData = await updateContentItem(id, body);
    if (!updatedData) throw new Error("Item not found");

    if (updatedData.status === "published") {
      const siteUrl = getSiteUrl();
      const url = updatedData.hpid
        ? `${siteUrl}/pharmacy/${updatedData.hpid}`
        : updatedData.slug ? `${siteUrl}/blog/${updatedData.slug}` : "";
      if (url) submitToIndexNow([url]).catch((e) => console.error("IndexNow Error:", e));
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
    const { id } = params;
    const deletedData = await deleteContentItem(id);

    if (deletedData?.status === "published") {
      const siteUrl = getSiteUrl();
      const url = deletedData.hpid
        ? `${siteUrl}/pharmacy/${deletedData.hpid}`
        : deletedData.slug ? `${siteUrl}/blog/${deletedData.slug}` : "";
      if (url) submitToIndexNow([url]).catch((e) => console.error("IndexNow Error:", e));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Queue delete error:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
