import { revalidatePath } from "next/cache";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  if (!process.env.REVALIDATION_SECRET || secret !== process.env.REVALIDATION_SECRET) {
    return Response.json({ error: "Invalid secret" }, { status: 401 });
  }

  const path = request.nextUrl.searchParams.get("path");
  if (path) {
    revalidatePath(path);
    return Response.json({ revalidated: true, path });
  }

  // 기본: 위키 제품 페이지 전체 무효화
  revalidatePath("/wiki/product/[id]", "page");
  return Response.json({ revalidated: true, target: "wiki/product/[id]" });
}
