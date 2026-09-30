/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { distanceKm, longitudeDegreeScale } from "@/lib/geo-distance";
import { getTursoClient, parseJson } from "@/lib/turso";
import {
  getCoordinateBounds,
  isValidLatitude,
  isValidLongitude,
  parseNearbyRadius,
} from "@/lib/geo-bounds";
import { getOperatingStatusAt, isOperating } from "@/lib/hours";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const latParam = searchParams.get("lat");
  const lonParam = searchParams.get("lon");
  const lat = latParam === null || latParam.trim() === "" ? Number.NaN : Number(latParam);
  const lon = lonParam === null || lonParam.trim() === "" ? Number.NaN : Number(lonParam);
  const requestedLimit = Number(searchParams.get("limit") ?? 40);
  const limit = Number.isFinite(requestedLimit)
    ? Math.min(Math.max(Math.trunc(requestedLimit), 1), 50)
    : 40;
  // Optional, backward-compatible filter: when omitted, behavior is unchanged.
  const openOnly = searchParams.get("open") === "true";

  const db = getTursoClient();

  if (q) {
    if (q.length < 2) {
      return NextResponse.json({ message: "검색어는 2글자 이상 입력해주세요." }, { status: 400 });
    }

    try {
      const result = await db.execute({
        sql: "SELECT * FROM pharmacies WHERE name LIKE ? OR address LIKE ? LIMIT ?",
        args: [`%${q}%`, `%${q}%`, limit],
      });
      return NextResponse.json({
        items: result.rows.map((p) => ({ ...p, operating_hours: parseJson(p.operating_hours, null), distanceKm: undefined })),
        total: result.rows.length,
      });
    } catch {
      return NextResponse.json({ message: "검색 중 오류가 발생했습니다." }, { status: 500 });
    }
  }

  if (!isValidLatitude(lat) || !isValidLongitude(lon)) {
    return NextResponse.json({ message: "lat/lon or q is required" }, { status: 400 });
  }

  const radiusKm = parseNearbyRadius(searchParams.get("radiusKm"));
  if (radiusKm === null) {
    return NextResponse.json(
      { message: "radiusKm must be between 0.1 and 50" },
      { status: 400 },
    );
  }

  // Reduce rows with a latitude-aware bounding box, then calculate exact distance.
  const { minLat, maxLat, minLon, maxLon } = getCoordinateBounds(lat, lon, radiusKm);
  const lonScale = longitudeDegreeScale(lat);

  try {
    const result = await db.execute({
      sql: `SELECT * FROM pharmacies
            WHERE latitude BETWEEN ? AND ? AND longitude BETWEEN ? AND ?
            ORDER BY ((latitude - ?) * (latitude - ?))
              + (((longitude - ?) * ?) * ((longitude - ?) * ?))
            LIMIT 400`,
      args: [minLat, maxLat, minLon, maxLon, lat, lat, lon, lonScale, lon, lonScale],
    });

    const within = (result.rows as any[])
      .filter((p) => Number.isFinite(Number(p.latitude)) && Number.isFinite(Number(p.longitude)))
      .map((p) => ({
        pharmacy: p,
        distance: distanceKm(lat, lon, p.latitude as number, p.longitude as number),
      }))
      .filter((item) => item.distance <= radiusKm);

    // Apply the open-now filter across all in-radius candidates (bounded by
    // the 400-row candidate query above) before truncating to `limit`, so a
    // closer-but-closed pharmacy does not push a farther-but-open one out of
    // the response.
    const filtered = openOnly
      ? within.filter((item) => {
          const hours = parseJson(item.pharmacy.operating_hours, null);
          return isOperating(getOperatingStatusAt(hours, new Date()));
        })
      : within;

    const page = filtered.sort((a, b) => a.distance - b.distance).slice(0, limit);

    return NextResponse.json({
      items: page.map((w) => ({
        ...w.pharmacy,
        operating_hours: parseJson(w.pharmacy.operating_hours, null),
        distanceKm: w.distance,
      })),
      total: page.length,
      // True when the 400-row candidate cap may have excluded further
      // in-radius pharmacies from consideration (open-filter accuracy is
      // bounded by the same candidate window as the unfiltered search).
      coverageLimited: result.rows.length >= 400,
    });
  } catch {
    return NextResponse.json({ message: "데이터를 불러오지 못했습니다." }, { status: 500 });
  }
}

