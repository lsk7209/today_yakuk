import { NextResponse } from "next/server";
import { getPharmaciesByRegionPaginated } from "@/lib/data/pharmacies";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const province = searchParams.get("province");
  const city = searchParams.get("city") ?? undefined;
  const limit = Number(searchParams.get("limit") ?? 20);
  const offset = Number(searchParams.get("offset") ?? 0);

  if (!province) {
    return NextResponse.json({ message: "province is required" }, { status: 400 });
  }

  const pageSize = Number.isFinite(limit) && limit > 0 && limit <= 100 ? limit : 20;
  const pageOffset = Number.isFinite(offset) && offset >= 0 ? offset : 0;

  let result: Awaited<ReturnType<typeof getPharmaciesByRegionPaginated>>;
  try {
    result = await getPharmaciesByRegionPaginated(province, city, pageSize, pageOffset);
  } catch (error) {
    console.error("pharmacies api read failed", error);
    return NextResponse.json(
      { message: "일시적으로 약국 목록을 불러오지 못했습니다." },
      { status: 503, headers: { "Cache-Control": "no-store", "Retry-After": "60" } },
    );
  }
  const { items, total } = result;
  const nextOffset = pageOffset + items.length;
  const hasMore = nextOffset < total;

  return NextResponse.json({
    items,
    total,
    nextOffset: hasMore ? nextOffset : null,
  });
}

