import { notFound } from "next/navigation";
import { getPharmaciesByRegionPaginated } from "@/lib/data/pharmacies";
import { PharmacyListInfinite } from "@/components/pharmacy-list-infinite";

type Params = {
  province: string;
  city: string;
};

export default async function ProvinceCityPage({ params }: { params: Params }) {
  const province = decodeURIComponent(params.province);
  const city = decodeURIComponent(params.city);

  const { items, total } = await getPharmaciesByRegionPaginated(province, city, 20, 0);

  if (!items.length) {
    return notFound();
  }

  return (
    <div className="container py-10 sm:py-14 space-y-6">
      <header className="space-y-3">
        <p className="text-sm font-semibold text-brand-700">
          {province} · {city === "전체" ? "모든 지역" : city}
        </p>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h1 className="text-3xl font-bold">영업 중인 약국 리스트</h1>
          <p className="text-xs text-[var(--muted)]">
            현재 시간 기준 상태 및 심야·공휴일 필터 지원
          </p>
        </div>
      </header>

      <PharmacyListInfinite
        province={province}
        city={city === "전체" ? undefined : city}
        initialItems={items}
        total={total}
        pageSize={20}
      />
    </div>
  );
}

