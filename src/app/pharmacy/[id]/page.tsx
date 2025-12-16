import { notFound } from "next/navigation";
import Link from "next/link";
import { Phone, MapPin, Navigation, Clock, AlertCircle, Sparkles, Info, CheckCircle2, Star, Building2, Calendar, HelpCircle, ExternalLink } from "lucide-react";
import {
  formatHourRange,
  formatHHMM,
  DAY_KEYS,
  getBadgeClass,
  getOperatingStatus,
  getSeoulNow,
} from "@/lib/hours";
import { Pharmacy } from "@/types/pharmacy";
import { AdsPlaceholder } from "@/components/ads-placeholder";
import { StickyFab } from "@/components/sticky-fab";
import { JsonLd } from "@/components/seo/json-ld";
import { getPublishedContentByHpid } from "@/lib/data/content";
import {
  buildPharmacyJsonLd,
  dynamicDescription,
  generateDescription,
} from "@/lib/seo";
import { getSiteUrl } from "@/lib/site-url";
import {
  findNearbyWithinKm,
  getPharmacyByHpid,
  getPharmaciesByRegion,
} from "@/lib/data/pharmacies";
import { generatePharmacyContent } from "@/lib/gemini";

type Params = { id: string };
const siteUrl = getSiteUrl();

function naverDescription(input: string): string {
  const s = input.replace(/\s+/g, " ").trim();
  // Naver는 길면 잘리므로 "앞 80자"에 핵심을 넣되,
  // Google/AI 클릭률을 위해 전체는 140~160자 범위로 유지
  if (s.length <= 155) return s;
  return `${s.slice(0, 152)}...`;
}

function extractDong(address?: string | null): string | null {
  if (!address) return null;
  const parts = address.split(" ");
  const found = parts.find((p) => p.endsWith("동") || p.endsWith("가"));
  return found ?? null;
}

function trimTitle(title: string): string {
  const t = title.replace(/\s+/g, " ").trim();
  // AITDK 권장(40~60자). 너무 길면 잘라서 의미 유지.
  if (t.length <= 58) return t;
  return `${t.slice(0, 57)}…`;
}

function buildPharmacyMetaTitle(pharmacy: Pharmacy): string {
  const city = pharmacy.city ?? "";
  const dong = extractDong(pharmacy.address) ?? "";
  const region = [city, dong].filter(Boolean).join(" ");
  // template("%s | 오늘약국")에 의해 뒤에 서비스명이 붙으므로 여기서는 본문만 구성
  const base = `${pharmacy.name} | ${region || city || "지역"} 영업시간·전화·길찾기`;
  return trimTitle(base);
}

function buildPharmacyMetaDescription(pharmacy: Pharmacy, fallback: string): string {
  const now = getSeoulNow();
  const todayKey = DAY_KEYS[now.getDay()];
  const open = formatHHMM(pharmacy.operating_hours?.[todayKey]?.open ?? "");
  const close = formatHHMM(pharmacy.operating_hours?.[todayKey]?.close ?? "");
  const city = pharmacy.city ?? "";
  const dong = extractDong(pharmacy.address) ?? "";
  const region = [city, dong].filter(Boolean).join(" ");

  // 첫 문장은 80자 이내로 핵심만(네이버 노출 대응)
  const first = `${pharmacy.name}${region ? `(${region})` : ""} 오늘 영업시간 ${open || "미등록"}~${close || "미등록"}.`;
  const second =
    ` 주소·전화·길찾기·주말/공휴일 운영·FAQ·근처 대체 약국 정보를 한 번에 확인하세요.`;
  const composed = `${first}${second}`.trim();

  // fallback(기존 dynamicDescription)이 더 유용하면 섞되, 길이/초문장 규칙을 지킴
  const merged = composed.length >= 120 ? composed : `${composed} ${fallback}`.trim();
  return naverDescription(merged);
}

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
  
  // Gemini 생성 컨텐츠가 있으면 우선 사용 (메타데이터 생성 시에는 API 호출하지 않음 - 성능 고려)
  const title = aiContent?.title ?? buildPharmacyMetaTitle(pharmacy);
  const rawDescription = aiContent?.ai_summary ?? dynamicDescription(pharmacy);
  const description = buildPharmacyMetaDescription(pharmacy, rawDescription);
  return {
    title,
    description,
    alternates: {
      canonical: `/pharmacy/${pharmacy.hpid}`,
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/pharmacy/${pharmacy.hpid}`,
      siteName: "오늘약국",
      locale: "ko_KR",
      type: "website",
      images: [
        {
          url: `/api/og?title=${encodeURIComponent(title)}&subtitle=${encodeURIComponent(
            `${pharmacy.city ?? pharmacy.province ?? ""} 약국`,
          )}`,
          width: 1200,
          height: 630,
        },
      ],
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

  // Fetch region mates lazily; if province not present, fallback to empty array.
  const regionList =
    pharmacy.province && pharmacy.city
      ? await getPharmaciesByRegion(pharmacy.province, pharmacy.city)
      : [];
  const nearby = findNearbyWithinKm(pharmacy, regionList);

  // 기존 content_queue에서 컨텐츠 가져오기
  const aiContent = await getPublishedContentByHpid(pharmacy.hpid);

  // 기존 컨텐츠가 없거나 불완전한 경우, Gemini API로 실시간 생성
  const needsGeneration = !aiContent || !aiContent.ai_summary || !aiContent.ai_faq || aiContent.ai_faq.length === 0;
  const geminiContent = needsGeneration
    ? await generatePharmacyContent(pharmacy, nearby)
    : null;

  const status = getOperatingStatus(pharmacy.operating_hours);

  const mapQuery = encodeURIComponent(`${pharmacy.name} ${pharmacy.address}`);
  const mapUrl = `https://map.naver.com/p/search/${mapQuery}`;
  type FAQItem = { question: string; answer: string };
  type BulletItem = { text: string };

  // 컨텐츠 병합: Gemini 생성 컨텐츠 우선, 없으면 기존 컨텐츠 사용
  const finalSummary = geminiContent?.summary ?? aiContent?.ai_summary ?? dynamicDescription(pharmacy);
  const finalDetailedDescription = geminiContent?.detailed_description ?? null;

  const aiBullets: string[] =
    geminiContent?.bullets ??
    aiContent?.ai_bullets?.map((b) => {
      if (typeof b === "string") return b;
      if (typeof b === "object" && b !== null && "text" in b) {
        return (b as BulletItem).text;
      }
      return String(b);
    }) ?? [];

  const localTips = geminiContent?.local_tips ?? [];
  const nearbyLandmarks = geminiContent?.nearby_landmarks ?? [];

  const aiFaq: FAQItem[] =
    geminiContent?.faq?.map((f) => ({ question: f.question, answer: f.answer })) ??
    aiContent?.ai_faq?.map((f) => {
      if (typeof f === "object" && f !== null) {
        if ("question" in f && "answer" in f) {
          return { question: f.question, answer: f.answer };
        }
        if ("q" in f && "a" in f) {
          return { question: (f as { q: string; a: string }).q, answer: (f as { q: string; a: string }).a };
        }
      }
      return { question: "", answer: "" };
    }).filter((f) => f.question && f.answer) ?? [];

  // FAQ가 없으면 기본 FAQ 생성
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

  // 추가 섹션 병합
  const extraSections = [
    ...(geminiContent?.extra_sections ?? []),
    ...(aiContent?.extra_sections ?? []),
  ];

  const descriptions = aiContent
    ? [finalSummary, ...aiBullets]
    : generateDescription(pharmacy);
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqList.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "홈", item: `${siteUrl}/` },
      { "@type": "ListItem", position: 2, name: "약국", item: `${siteUrl}/nearby` },
      { "@type": "ListItem", position: 3, name: pharmacy.name, item: `${siteUrl}/pharmacy/${pharmacy.hpid}` },
    ],
  };

  return (
    <article className="container py-10 sm:py-14 space-y-8 bg-white min-h-screen">
      <header className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex-1 min-w-0">
            <span className={getBadgeClass(status)}>
              {status.emoji && <span aria-hidden>{status.emoji}</span>}
              {status.label}
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight mt-2 flex items-center gap-2">
              <span>🏥</span>
              <span>{pharmacy.name}</span>
            </h1>
            <p className="text-base text-gray-700 font-semibold flex items-center gap-2 mt-3 bg-gray-50 rounded-lg px-4 py-2 border border-gray-200">
              <MapPin className="h-5 w-5 text-brand-600 flex-shrink-0" />
              <span className="flex-1">
                <span className="text-gray-500 font-medium">📍 주소:</span>{" "}
                <span className="text-gray-900 font-bold">{pharmacy.address}</span>
              </span>
            </p>
            {pharmacy.tel && (
              <p className="text-base text-gray-700 font-semibold flex items-center gap-2 mt-2 bg-brand-50 rounded-lg px-4 py-2 border border-brand-200">
                <Phone className="h-5 w-5 text-brand-600 flex-shrink-0" />
                <span className="flex-1">
                  <span className="text-gray-600 font-medium">📞 전화:</span>{" "}
                  <a
                    href={`tel:${pharmacy.tel}`}
                    className="text-brand-700 font-black hover:text-brand-800 underline decoration-2"
                  >
                    {pharmacy.tel}
                  </a>
                </span>
              </p>
            )}
          </div>
        </div>
      </header>

      <AdsPlaceholder label="광고 표시 영역 (ATF)" height={160} />

      {/* 요약 (gemini_summary 또는 content_queue) */}
      {(pharmacy.gemini_summary || finalSummary) && (
        <section className="rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/30 p-6 shadow-md">
          <div className="flex items-start gap-3 mb-4">
            <div className="rounded-full bg-emerald-100 p-2">
              <Sparkles className="h-5 w-5 text-emerald-700 flex-shrink-0" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <span>✨</span>
                <span>약국 소개</span>
              </h2>
            </div>
          </div>
          <div className="bg-white/80 rounded-xl p-4 border border-emerald-100">
            <p className="text-base text-gray-800 leading-relaxed whitespace-pre-line">
              {pharmacy.gemini_summary || finalSummary}
            </p>
          </div>
        </section>
      )}

      <section className="rounded-2xl border-2 border-gray-200 bg-white p-6 shadow-md space-y-5">
        <div className="flex flex-wrap gap-3 text-sm">
          <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-100 to-emerald-50 px-4 py-2 text-gray-800 font-bold shadow-sm border border-emerald-200">
            <Clock className="h-4 w-4 text-emerald-700" />
            <span>⏰ 영업 상태:</span>
            <span className="text-emerald-700">{status.label}</span>
          </span>
          {pharmacy.tel ? (
            <a
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-600 to-brand-700 text-white px-5 py-2 font-black hover:from-brand-700 hover:to-brand-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              href={`tel:${pharmacy.tel}`}
            >
              <Phone className="h-4 w-4" />
              <span>📞 전화 걸기</span>
            </a>
          ) : null}
          <Link
            className="inline-flex items-center gap-2 rounded-full border-2 border-gray-300 bg-white px-5 py-2 font-bold text-gray-700 hover:border-brand-400 hover:bg-brand-50 transition-all shadow-sm hover:shadow-md"
            href={mapUrl}
            target="_blank"
          >
            <Navigation className="h-4 w-4" />
            <span>🗺️ 지도에서 보기</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
        <AdsPlaceholder label="광고 표시 영역 (CTA 하단)" height={160} />
        <div className="space-y-4 text-base text-gray-800 leading-relaxed">
          {descriptions.map((line, idx) => {
            // 중요 정보(전화번호, 영업시간, 주소) 강조
            const highlighted = line
              .replace(/(\d{2,3}-\d{3,4}-\d{4})/g, '<strong class="text-brand-700 font-black">$1</strong>')
              .replace(/(\d{2}:\d{2})/g, '<strong class="text-emerald-700 font-bold">$1</strong>')
              .replace(/(서울특별시|강남구|세곡동)/g, '<strong class="text-gray-900 font-bold">$1</strong>');
            return (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <p
                  className="flex-1"
                  dangerouslySetInnerHTML={{ __html: highlighted }}
                />
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-white p-6 shadow-md space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b-2 border-gray-200">
          <div className="rounded-full bg-brand-100 p-2">
            <Info className="h-5 w-5 text-brand-700" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <span>📋</span>
            <span>{pharmacy.name} 상세 정보</span>
          </h2>
          {geminiContent ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-100 to-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-800 border border-emerald-200 shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
              <span>✨ AI 요약</span>
            </span>
          ) : null}
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-base text-gray-800 leading-relaxed font-medium">
            {finalSummary}
          </p>
        </div>
        {finalDetailedDescription && (
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-base text-gray-800 leading-relaxed">
              {finalDetailedDescription}
            </p>
          </div>
        )}
        {aiBullets.length > 0 && (
          <div className="bg-white rounded-xl p-5 border-2 border-emerald-100 space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
              <h3 className="text-lg font-black text-gray-900">⭐ 주요 특징</h3>
            </div>
            <ul className="space-y-3">
              {aiBullets.map((bullet, idx) => {
                // 중요 정보 강조
                const highlighted = bullet
                  .replace(/(\d{2}:\d{2})/g, '<strong class="text-emerald-700 font-black">$1</strong>')
                  .replace(/(평일|토요일|일요일|공휴일)/g, '<strong class="text-brand-700 font-bold">$1</strong>')
                  .replace(/(서울특별시|강남구|세곡동)/g, '<strong class="text-gray-900 font-bold">$1</strong>');
                return (
                  <li key={idx} className="flex items-start gap-3 text-base text-gray-800 leading-relaxed">
                    <div className="rounded-full bg-emerald-100 p-1 mt-1 flex-shrink-0">
                      <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                    </div>
                    <span dangerouslySetInnerHTML={{ __html: highlighted }} />
                  </li>
                );
              })}
            </ul>
          </div>
        )}
        {localTips.length > 0 && (
          <div className="mt-5 pt-5 border-t-2 border-gray-200 bg-amber-50 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="text-2xl">💡</div>
              <h3 className="text-lg font-black text-gray-900">지역 이용 팁</h3>
            </div>
            <ul className="space-y-3">
              {localTips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-3 text-base text-gray-800 leading-relaxed">
                  <span className="text-amber-600 font-black mt-0.5">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {nearbyLandmarks.length > 0 && (
          <div className="mt-5 pt-5 border-t-2 border-gray-200 bg-blue-50 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="text-2xl">📍</div>
              <h3 className="text-lg font-black text-gray-900">주변 주요 시설</h3>
            </div>
            <ul className="space-y-3">
              {nearbyLandmarks.map((landmark, idx) => (
                <li key={idx} className="flex items-start gap-3 text-base text-gray-800 leading-relaxed">
                  <Building2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>{landmark}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section className="rounded-2xl border-2 border-gray-200 bg-white p-6 shadow-md space-y-5">
        <div className="flex items-center justify-between pb-3 border-b-2 border-gray-200">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-blue-100 p-2">
              <Calendar className="h-5 w-5 text-blue-700" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
              <span>📅</span>
              <span>요일별 영업시간</span>
            </h2>
          </div>
          <span className="text-sm font-bold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">⏰ KST 기준</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {DAY_LABELS.map(([key, label]) => {
            const todayKey = DAY_KEYS[getSeoulNow().getDay()];
            const isToday = key === todayKey;
            const hours = formatHourRange(pharmacy.operating_hours?.[key]);
            const dayEmojis: Record<string, string> = {
              mon: "월",
              tue: "화",
              wed: "수",
              thu: "목",
              fri: "금",
              sat: "토",
              sun: "일",
              holiday: "🎉",
            };
            return (
              <div
                key={key}
                className={`rounded-xl border-2 px-4 py-4 transition-all ${
                  isToday
                    ? "border-emerald-500 bg-gradient-to-br from-emerald-50 to-emerald-100 shadow-lg scale-105"
                    : "border-gray-200 bg-gray-50 hover:border-gray-300 hover:shadow-md"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <p className={`text-base font-black ${isToday ? "text-emerald-800" : "text-gray-800"}`}>
                    {dayEmojis[key] || label}
                  </p>
                  {isToday && (
                    <span className="text-xs font-black text-emerald-700 bg-emerald-200 px-2 py-0.5 rounded-full">
                      오늘
                    </span>
                  )}
                </div>
                <p className={`text-sm font-bold ${isToday ? "text-emerald-900" : "text-gray-700"}`}>
                  {hours === "정보 없음" ? (
                    <span className="text-gray-400">—</span>
                  ) : (
                    <span className={isToday ? "text-emerald-800" : ""}>{hours}</span>
                  )}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <AdsPlaceholder label="중간 광고 영역" height={160} />

      <section className="space-y-4 rounded-2xl border-2 border-gray-200 bg-white p-6 shadow-md">
        <div className="flex items-center justify-between pb-3 border-b-2 border-gray-200">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-purple-100 p-2">
              <MapPin className="h-5 w-5 text-purple-700" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
              <span>🏥</span>
              <span>반경 2km 내 다른 약국</span>
            </h2>
          </div>
          <span className="text-sm font-bold text-purple-700 bg-purple-50 px-3 py-1.5 rounded-full border border-purple-200">
            ⭐ 추천 리스트
          </span>
        </div>
        {nearby.length ? (
          <div className="space-y-3 mt-4">
            {nearby.slice(0, 3).map((p) => {
              const dist = distanceKm(
                pharmacy.latitude,
                pharmacy.longitude,
                p.latitude,
                p.longitude,
              ).toFixed(1);
              return (
                <Link
                  key={p.hpid}
                  href={`/pharmacy/${p.hpid}`}
                  className="block rounded-xl border-2 border-gray-200 bg-gradient-to-r from-white to-gray-50 p-5 shadow-md hover:border-brand-400 hover:shadow-xl transition-all transform hover:scale-[1.02]"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Building2 className="h-5 w-5 text-brand-600 flex-shrink-0" />
                        <p className="text-lg font-black text-gray-900">{p.name}</p>
                      </div>
                      <p className="text-sm text-gray-700 font-medium flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-gray-500" />
                        <span>{p.address}</span>
                      </p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-lg font-black text-brand-700 bg-brand-50 px-3 py-1.5 rounded-full border-2 border-brand-200">
                        {dist} km
                      </span>
                      <span className="text-xs text-gray-500 mt-1">📍 거리</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="mt-4 p-5 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-base text-gray-600 text-center font-medium">주변 추천 약국 정보가 없습니다.</p>
          </div>
        )}
      </section>

      <section className="space-y-4 rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-6 shadow-md">
        <div className="flex items-center gap-3 pb-3 border-b-2 border-amber-200">
          <div className="rounded-full bg-amber-100 p-2">
            <AlertCircle className="h-5 w-5 text-amber-700" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <span>⚠️</span>
            <span>이 약국이 문 닫았나요?</span>
          </h2>
        </div>
        <div className="bg-white/80 rounded-xl p-4 border border-amber-200">
          <p className="text-base text-gray-800 leading-relaxed font-semibold flex items-center gap-2">
            <span>💡</span>
            <span>반경 2km 내 영업 중인 약국을 바로 확인하세요. 혼잡 시 빠른 대안 방문을 돕습니다.</span>
          </p>
        </div>
        {nearby.length ? (
          <div className="space-y-3">
            {(() => {
              const nearbyOpen = nearby.filter(
                (p) => getOperatingStatus(p.operating_hours).label === "영업 중",
              );
              if (!nearbyOpen.length) {
                return (
                  <p className="text-base text-gray-600">
                    현재 영업 중인 대체 약국 정보를 찾지 못했습니다.
                  </p>
                );
              }
              return nearbyOpen.slice(0, 3).map((p) => {
                const dist = distanceKm(
                  pharmacy.latitude,
                  pharmacy.longitude,
                  p.latitude,
                  p.longitude,
                ).toFixed(1);
                return (
                  <Link
                    key={p.hpid}
                    href={`/pharmacy/${p.hpid}`}
                    className="block rounded-xl border-2 border-emerald-200 bg-gradient-to-r from-emerald-50 to-white p-5 shadow-md hover:border-emerald-400 hover:shadow-xl transition-all transform hover:scale-[1.02]"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                          <p className="text-lg font-black text-gray-900">{p.name}</p>
                          <span className="text-xs font-black text-emerald-700 bg-emerald-200 px-2 py-0.5 rounded-full">
                            영업 중
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 font-medium flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-gray-500" />
                          <span>{p.address}</span>
                        </p>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-lg font-black text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-full border-2 border-emerald-300">
                          {dist} km
                        </span>
                        <span className="text-xs text-gray-500 mt-1">📍 거리</span>
                      </div>
                    </div>
                  </Link>
                );
              });
            })()}
          </div>
        ) : (
          <p className="text-base text-gray-600">
            현재 영업 중인 대체 약국 정보를 찾지 못했습니다.
          </p>
        )}
      </section>

      <section className="space-y-4 rounded-2xl border-2 border-gray-200 bg-white p-6 shadow-md">
        <div className="flex items-center gap-3 pb-3 border-b-2 border-gray-200">
          <div className="rounded-full bg-blue-100 p-2">
            <HelpCircle className="h-5 w-5 text-blue-700" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <span>❓</span>
            <span>자주 묻는 질문</span>
          </h2>
        </div>
        <div className="space-y-3 mt-4">
          {faqList.map((faq, idx) => {
            // 답변에서 중요 정보 강조
            const highlightedAnswer = faq.answer
              .replace(/(\d{2,3}-\d{3,4}-\d{4})/g, '<strong class="text-brand-700 font-black">$1</strong>')
              .replace(/(\d{2}:\d{2})/g, '<strong class="text-emerald-700 font-bold">$1</strong>')
              .replace(/(영업 중|영업 종료|곧 종료)/g, '<strong class="text-emerald-700 font-bold">$1</strong>')
              .replace(/(서울특별시|강남구|세곡동)/g, '<strong class="text-gray-900 font-bold">$1</strong>');
            return (
              <details
                key={faq.question}
                className="group rounded-xl border-2 border-gray-200 bg-gradient-to-r from-white to-gray-50 p-5 shadow-sm hover:shadow-lg hover:border-brand-300 transition-all"
              >
                <summary className="font-black text-gray-900 cursor-pointer list-none flex items-center gap-3 text-lg">
                  <span className="text-brand-600 font-black">Q{idx + 1}.</span>
                  <span className="flex-1">{faq.question}</span>
                  <span className="text-gray-400 group-open:text-brand-600 transition-transform group-open:rotate-180">
                    ▼
                  </span>
                </summary>
                <div className="mt-4 pt-4 border-t-2 border-gray-200 text-base text-gray-800 leading-relaxed">
                  <div className="flex items-start gap-3">
                    <span className="text-emerald-600 font-black mt-1">A.</span>
                    <div
                      className="flex-1"
                      dangerouslySetInnerHTML={{ __html: highlightedAnswer }}
                    />
                  </div>
                </div>
              </details>
            );
          })}
        </div>
      </section>

      {geminiContent?.cta && (
        <section className="rounded-2xl border-2 border-brand-300 bg-gradient-to-br from-brand-50 via-emerald-50 to-brand-100 p-6 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-brand-200 p-3">
              <Star className="h-6 w-6 text-brand-800 fill-brand-800" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-black text-brand-900 mb-3 flex items-center gap-2">
                <span>⭐</span>
                <span>이 약국을 추천합니다</span>
              </h2>
              <div className="bg-white/90 rounded-xl p-4 border border-brand-200">
                <p className="text-base text-brand-900 leading-relaxed font-semibold">
                  {geminiContent.cta}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {extraSections.length > 0 && (
        <section className="space-y-5 rounded-2xl border-2 border-gray-200 bg-white p-6 shadow-md">
          <div className="flex items-center gap-3 pb-3 border-b-2 border-gray-200">
            <div className="rounded-full bg-indigo-100 p-2">
              <Info className="h-5 w-5 text-indigo-700" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
              <span>ℹ️</span>
              <span>추가 안내</span>
            </h2>
          </div>
          <div className="space-y-4 mt-4">
            {extraSections.map((section, idx) => {
              // 중요 정보 강조
              const highlighted = section.body
                .replace(/(\d{2,3}-\d{3,4}-\d{4})/g, '<strong class="text-brand-700 font-black">$1</strong>')
                .replace(/(\d{2}:\d{2})/g, '<strong class="text-emerald-700 font-bold">$1</strong>')
                .replace(/(서울특별시|강남구|세곡동)/g, '<strong class="text-gray-900 font-bold">$1</strong>');
              return (
                <div
                  key={`${section.title}-${idx}`}
                  className="rounded-xl border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-white p-5 shadow-sm hover:shadow-md transition-all"
                >
                  <h3 className="text-lg font-black text-gray-900 mb-3 flex items-center gap-2">
                    <span className="text-indigo-600">📌</span>
                    <span>{section.title}</span>
                  </h3>
                  <div className="bg-white rounded-lg p-4 border border-gray-100">
                    <p
                      className="text-base text-gray-800 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: highlighted }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 w-[min(480px,calc(100%-2rem))] z-30">
        <div className="rounded-full border border-brand-200 bg-white shadow-2xl px-4 py-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-base font-semibold">{pharmacy.name}</p>
            <p className="text-sm text-[var(--muted)] truncate">{pharmacy.address}</p>
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

      <JsonLd id="jsonld-pharmacy" data={buildPharmacyJsonLd(pharmacy)} />
      <JsonLd id="jsonld-breadcrumbs" data={breadcrumbJsonLd} />
      <JsonLd id="jsonld-faq" data={faqJsonLd} />
      
      {/* Sticky FAB (모바일 전용) */}
      <StickyFab tel={pharmacy.tel} mapUrl={mapUrl} />
    </article>
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

