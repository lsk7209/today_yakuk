import { notFound } from "next/navigation";
import Link from "next/link";
import { Phone, MapPin, Navigation, Clock, AlertCircle } from "lucide-react";
import {
  formatHourRange,
  getBadgeClass,
  getOperatingStatus,
} from "@/lib/hours";
import { Pharmacy } from "@/types/pharmacy";
import { AdsPlaceholder } from "@/components/ads-placeholder";
import { getPublishedContentByHpid, getPublishedContentBySlug } from "@/lib/data/content";
import {
  buildPharmacyJsonLd,
  dynamicDescription,
  dynamicTitle,
  generateDescription,
} from "@/lib/seo";
import {
  findNearbyWithinKm,
  getPharmacyByHpid,
  getPharmaciesByRegion,
} from "@/lib/data/pharmacies";

type Params = { id: string };

const DAY_LABELS: [keyof NonNullable<Pharmacy["operating_hours"]>, string][] = [
  ["mon", "월"],
  ["tue", "화"],
  ["wed", "수"],
  ["thu", "목"],
  ["fri", "금"],
  ["sat", "토"],
  ["sun", "일"],
  ["holiday", "공휴"],
];

export async function generateMetadata({ params }: { params: Params }) {
  const pharmacy = await getPharmacyByHpid(params.id);
  if (!pharmacy) return {};
  const aiContent = await getPublishedContentByHpid(params.id);
  return {
    title: aiContent?.title ?? dynamicTitle(pharmacy),
    description: aiContent?.ai_summary ?? dynamicDescription(pharmacy),
    alternates: {
      canonical: `/pharmacy/${pharmacy.hpid}`,
    },
  };
}

export default function PharmacyDetailPage({ params }: { params: Params }) {
  const pharmacyPromise = getPharmacyByHpid(params.id);
  return <Content pharmacyPromise={pharmacyPromise} />;
}

async function Content({
  pharmacyPromise,
}: {
  pharmacyPromise: Promise<Pharmacy | null>;
}) {
  const [pharmacy] = await Promise.all([pharmacyPromise]);
  if (!pharmacy) return notFound();

  const aiContent = await getPublishedContentByHpid(pharmacy.hpid);

  // Fetch region mates lazily; if province not present, fallback to empty array.
  const regionList =
    pharmacy.province && pharmacy.city
      ? await getPharmaciesByRegion(pharmacy.province, pharmacy.city)
      : [];
  const nearby = findNearbyWithinKm(pharmacy, regionList);

  const status = getOperatingStatus(pharmacy.operating_hours);

  const mapQuery = encodeURIComponent(`${pharmacy.name} ${pharmacy.address}`);
  const mapUrl = `https://map.naver.com/p/search/${mapQuery}`;
  const aiBullets =
    aiContent?.ai_bullets?.map((b) => ("text" in b ? b.text : (b as any).text ?? String(b)))) ?? [];
  const aiFaq =
    aiContent?.ai_faq?.map((f) => ({
      question: "question" in f ? f.question : (f as any).q,
      answer: "answer" in f ? f.answer : (f as any).a,
    })) ?? [];

  const descriptions = aiContent
    ? [aiContent.ai_summary ?? dynamicDescription(pharmacy), ...aiBullets]
    : generateDescription(pharmacy);

  const faqList =
    aiFaq.length > 0
      ? aiFaq
      : [
          {
            question: "지금 영업 중인가요?",
            answer: `현재 상태는 '${status.label}'입니다. 상세 영업시간은 요일별 표와 종료 예정 시간에서 확인하세요.`,
          },
          {
            question: "전화 연결이 가능한가요?",
            answer: pharmacy.tel
              ? `전화 버튼으로 바로 연결할 수 있습니다. 번호: ${pharmacy.tel}`
              : "전화번호가 등록되어 있지 않습니다. 방문 전 지도 검색을 활용해 주세요.",
          },
          {
            question: "근처 대체 약국도 있나요?",
            answer: nearby.length
              ? "아래 '반경 2km 내 다른 약국'과 '이 약국이 문 닫았나요?' 섹션에서 대체 약국을 확인하세요."
              : "현재 반경 2km 내 추천 약국 정보가 없습니다.",
          },
          {
            question: "반경/거리 정보는 어떻게 계산되나요?",
            answer: "브라우저 위치 기준 직선거리를 표시합니다. 실제 이동 시간은 지도 길찾기로 확인하세요.",
          },
        ];

  const extraSections = aiContent?.extra_sections ?? [];
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqList.map((faq) => ({
      "@type": "Question",
      name: (faq as any).q ?? (faq as any).question,
      acceptedAnswer: {
        "@type": "Answer",
        text: (faq as any).a ?? (faq as any).answer,
      },
    })),
  };

  return (
    <div className="container py-10 sm:py-14 space-y-8">
      <header className="space-y-2">
        <span className={getBadgeClass(status)}>{status.label}</span>
        <h1 className="text-3xl font-bold">{pharmacy.name}</h1>
        <p className="text-sm text-[var(--muted)] flex items-center gap-2">
          <MapPin className="h-4 w-4 text-brand-600" />
          {pharmacy.address}
        </p>
      </header>

      <AdsPlaceholder label="광고 표시 영역 (ATF)" height={160} />

      <section className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm space-y-3">
        <div className="flex flex-wrap gap-2 text-sm text-[var(--muted)]">
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1">
            <Clock className="h-4 w-4" />
            영업 상태: {status.label}
          </span>
          {pharmacy.tel ? (
            <a
              className="inline-flex items-center gap-1 rounded-full bg-brand-600 text-white px-3 py-1 font-semibold"
              href={`tel:${pharmacy.tel}`}
            >
              <Phone className="h-4 w-4" />
              전화 걸기
            </a>
          ) : null}
          <Link
            className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-white px-3 py-1 font-semibold hover:border-brand-200"
            href={mapUrl}
            target="_blank"
          >
            <Navigation className="h-4 w-4" />
            지도에서 보기
          </Link>
        </div>
        <AdsPlaceholder label="광고 표시 영역 (CTA 하단)" height={160} />
        <div className="space-y-2 text-sm text-[var(--muted)]">
          {descriptions.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-brand-700" />
          <h2 className="text-xl font-semibold text-brand-800">{pharmacy.name} 요약 설명</h2>
        </div>
        <p className="text-sm text-emerald-900">
          {descriptions[0]}
        </p>
        <ul className="text-sm text-emerald-900 list-disc list-inside space-y-1">
          {descriptions.slice(1).map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">요일별 영업시간</h2>
          <span className="text-xs text-[var(--muted)]">KST 기준</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          {DAY_LABELS.map(([key, label]) => (
            <div
              key={key}
              className="rounded-xl border border-[var(--border)] bg-slate-50 px-3 py-2"
            >
              <p className="text-xs font-semibold text-brand-700 mb-1">{label}</p>
              <p className="text-[var(--muted)]">
                {formatHourRange(pharmacy.operating_hours?.[key])}
              </p>
            </div>
          ))}
        </div>
      </section>

      <AdsPlaceholder label="중간 광고 영역" height={160} />

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">반경 2km 내 다른 약국</h2>
          <span className="text-xs text-[var(--muted)]">추천 리스트</span>
        </div>
        {nearby.length ? (
          <div className="space-y-3">
            {nearby.slice(0, 3).map((p) => (
              <Link
                key={p.hpid}
                href={`/pharmacy/${p.hpid}`}
                className="block rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm hover:border-brand-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">{p.name}</p>
                    <p className="text-xs text-[var(--muted)]">{p.address}</p>
                  </div>
                  <span className="text-xs text-brand-700">
                    {distanceKm(
                      pharmacy.latitude,
                      pharmacy.longitude,
                      p.latitude,
                      p.longitude,
                    ).toFixed(1)}{" "}
                    km
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--muted)]">주변 추천 약국 정보가 없습니다.</p>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-amber-600" />
          <h2 className="text-xl font-semibold">이 약국이 문 닫았나요?</h2>
        </div>
        <p className="text-sm text-[var(--muted)]">
          반경 2km 내 영업 중인 약국을 바로 확인하세요. 혼잡 시 빠른 대안 방문을 돕습니다.
        </p>
        {nearby.length ? (
          <div className="space-y-3">
            {(() => {
              const nearbyOpen = nearby.filter(
                (p) => getOperatingStatus(p.operating_hours).label === "영업 중",
              );
              if (!nearbyOpen.length) {
                return (
                  <p className="text-sm text-[var(--muted)]">
                    현재 영업 중인 대체 약국 정보를 찾지 못했습니다.
                  </p>
                );
              }
              return nearbyOpen.slice(0, 3).map((p) => (
                <Link
                  key={p.hpid}
                  href={`/pharmacy/${p.hpid}`}
                  className="block rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm hover:border-brand-200"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">{p.name}</p>
                      <p className="text-xs text-[var(--muted)]">{p.address}</p>
                    </div>
                    <span className="text-xs text-brand-700">
                      {distanceKm(
                        pharmacy.latitude,
                        pharmacy.longitude,
                        p.latitude,
                        p.longitude,
                      ).toFixed(1)}{" "}
                      km
                    </span>
                  </div>
                </Link>
              ));
            })()}
          </div>
        ) : (
          <p className="text-sm text-[var(--muted)]">
            현재 영업 중인 대체 약국 정보를 찾지 못했습니다.
          </p>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-brand-700" />
          <h2 className="text-xl font-semibold">자주 묻는 질문</h2>
        </div>
        <div className="space-y-2">
          {faqList.map((faq) => (
            <div
              key={(faq as any).question ?? (faq as any).q}
              className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-sm"
            >
              <h3 className="font-semibold text-[var(--foreground)] mb-1">
                {(faq as any).question ?? (faq as any).q}
              </h3>
              <p className="text-sm text-[var(--muted)] leading-relaxed">
                {(faq as any).answer ?? (faq as any).a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {extraSections.length ? (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">추가 안내</h2>
          <div className="space-y-3">
            {extraSections.map((section) => (
              <div
                key={section.title}
                className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm space-y-2"
              >
                <h3 className="text-lg font-semibold">{section.title}</h3>
                <p className="text-sm text-[var(--muted)] leading-relaxed">{section.body}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {extraSections.length ? (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">추가 안내</h2>
          <div className="space-y-3">
            {extraSections.map((section) => (
              <div
                key={section.title}
                className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm space-y-2"
              >
                <h3 className="text-lg font-semibold">{section.title}</h3>
                <p className="text-sm text-[var(--muted)] leading-relaxed">{section.body}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 w-[min(480px,calc(100%-2rem))] z-30">
        <div className="rounded-full border border-brand-200 bg-white shadow-2xl px-4 py-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">{pharmacy.name}</p>
            <p className="text-xs text-[var(--muted)] truncate">{pharmacy.address}</p>
          </div>
          <div className="flex gap-2">
            <Link
              href={mapUrl}
              className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold hover:border-brand-200"
              target="_blank"
            >
              <Navigation className="h-4 w-4" />
              길찾기
            </Link>
            {pharmacy.tel ? (
              <a
                href={`tel:${pharmacy.tel}`}
                className="inline-flex items-center gap-1 rounded-full bg-brand-600 text-white px-4 py-2 text-sm font-semibold hover:bg-brand-700"
              >
                <Phone className="h-4 w-4" />
                전화
              </a>
            ) : null}
          </div>
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildPharmacyJsonLd(pharmacy)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd),
        }}
      />
    </div>
  );
}

function toRad(num?: number | null) {
  if (!num) return 0;
  return (num * Math.PI) / 180;
}

function distanceKm(
  lat1?: number | null,
  lon1?: number | null,
  lat2?: number | null,
  lon2?: number | null,
) {
  if (
    lat1 === undefined ||
    lon1 === undefined ||
    lat2 === undefined ||
    lon2 === undefined ||
    lat1 === null ||
    lon1 === null ||
    lat2 === null ||
    lon2 === null
  )
    return 0;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

