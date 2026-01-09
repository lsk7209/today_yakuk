/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { distanceKm } from "@/lib/data/pharmacies";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = Number(searchParams.get("lat"));
  const lon = Number(searchParams.get("lon"));
  const radiusKm = Number(searchParams.get("radiusKm") ?? 3);
  const limit = Number(searchParams.get("limit") ?? 40);

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return NextResponse.json({ message: "lat/lon is required" }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();

  // Rough bounding box filter to reduce rows, then precise distance calc.
  const delta = Math.max(radiusKm / 111, 0.05); // ~1deg lat ~111km, min bbox
  const minLat = lat - delta;
  const maxLat = lat + delta;
  const minLon = lon - delta;
  const maxLon = lon + delta;

  const { data, error } = await supabase
    .from("pharmacies")
    .select("*")
    .gte("latitude", minLat)
    .lte("latitude", maxLat)
    .gte("longitude", minLon)
    .lte("longitude", maxLon)
    .limit(400); // defensive cap

  if (error) {
    return NextResponse.json({ message: "데이터를 불러오지 못했습니다." }, { status: 500 });
  }

  const within = ((data ?? []) as any[])
    .filter((p) => p.latitude && p.longitude)
    .map((p) => ({
      pharmacy: p,
      distance: distanceKm(lat, lon, p.latitude as number, p.longitude as number),
    }))
    .filter((item) => item.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);

  return NextResponse.json({
    items: within.map((w) => ({
      ...w.pharmacy,
      distanceKm: w.distance,
    })),
    total: within.length,
  });
}

