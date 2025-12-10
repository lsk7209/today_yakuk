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

  const { items, total } = await getPharmaciesByRegionPaginated(province, city, pageSize, pageOffset);
  const nextOffset = pageOffset + items.length;
  const hasMore = nextOffset < total;

  return NextResponse.json({
    items,
    total,
    nextOffset: hasMore ? nextOffset : null,
  });
}

