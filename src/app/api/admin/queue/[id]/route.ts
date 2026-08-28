import { updateContentItem, deleteContentItem } from "@/lib/data/content";
import { NextResponse } from "next/server";
import { submitToIndexNow } from "@/lib/naver-indexnow";
import { getSiteUrl } from "@/lib/site-url";
import { contentItemUpdateSchema } from "@/lib/content-update";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    const { id } = await params;

    const parsed = contentItemUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid update fields", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const updatedData = await updateContentItem(id, parsed.data);
    if (!updatedData) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
