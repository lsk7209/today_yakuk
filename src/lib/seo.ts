import { Pharmacy } from "@/types/pharmacy";
import {
  DAY_KEYS,
  formatHHMM,
  getOperatingStatus,
  getSeoulNow,
} from "./hours";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "http://localhost:3000";

const DAY_TO_SCHEMA: Record<string, string> = {
  mon: "https://schema.org/Monday",
  tue: "https://schema.org/Tuesday",
  wed: "https://schema.org/Wednesday",
  thu: "https://schema.org/Thursday",
  fri: "https://schema.org/Friday",
  sat: "https://schema.org/Saturday",
  sun: "https://schema.org/Sunday",
  holiday: "https://schema.org/PublicHolidays",
};

export function dynamicTitle(pharmacy: Pharmacy) {
  const now = getSeoulNow();
  const day = now.getDay();
  const hour = now.getHours();
  const region =
    pharmacy.city ||
    pharmacy.province ||
    (pharmacy.address ? pharmacy.address.split(" ")[0] : "추천");

  if (hour >= 20) {
    return `${pharmacy.name} | ${region} 심야 야간 약국`;
  }
  if (day === 0 || day === 6) {
    return `${pharmacy.name} | ${region} 휴일지킴이 문 여는 약국`;
  }
  return `${pharmacy.name} | ${region} 추천 약국`;
}

export function dynamicDescription(pharmacy: Pharmacy) {
  const now = getSeoulNow();
  const todayKey = DAY_KEYS[now.getDay()];
  const open = formatHHMM(pharmacy.operating_hours?.[todayKey]?.open ?? "");
  const close = formatHHMM(pharmacy.operating_hours?.[todayKey]?.close ?? "");
  const special = pharmacy.description_raw
    ? ` ${pharmacy.description_raw}`
    : "";

  return `${pharmacy.name}은 ${
    pharmacy.address || `${pharmacy.province ?? ""} ${pharmacy.city ?? ""}`
  }에 위치해 있습니다. 오늘 영업시간은 ${
    open || "미등록"
  }부터 ${close || "미등록"}까지입니다.${special}`;
}

export function generateDescription(pharmacy: Pharmacy) {
  const status = getOperatingStatus(pharmacy.operating_hours);
  const now = getSeoulNow();
  const dayLabel = ["일", "월", "화", "수", "목", "금", "토"][now.getDay()];
  const todayKey = DAY_KEYS[now.getDay()];
  const closeText = formatHHMM(pharmacy.operating_hours?.[todayKey]?.close ?? "");
  const openText = formatHHMM(pharmacy.operating_hours?.[todayKey]?.open ?? "");
  const region = pharmacy.province && pharmacy.city
    ? `${pharmacy.province} ${pharmacy.city}`
    : pharmacy.address;

  return [
    `${pharmacy.name}은 ${region}에 위치한 지역 약국으로, ${dayLabel}요일 영업시간은 ${openText || "미등록"} ~ ${closeText || "미등록"}입니다.`,
    `현재 상태는 '${status.label}'이며, 전화(${pharmacy.tel ?? "번호 미등록"}) 또는 지도 안내를 통해 빠르게 방문하실 수 있습니다.`,
    `야간·주말 운영 여부를 실시간으로 반영하여 응급 상황에도 이용 가능한 약국을 제공합니다.`,
    `주변 거주민과 방문객 모두를 위해 복약 상담과 기본 의약품을 안정적으로 제공하는 것을 목표로 합니다.`,
  ];
}

export function buildOpeningHoursSpecification(pharmacy: Pharmacy) {
  const hours = pharmacy.operating_hours;
  if (!hours) return [];
  return Object.entries(hours)
    .filter(([, slot]) => slot?.open && slot?.close)
    .map(([day, slot]) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: DAY_TO_SCHEMA[day] ?? day,
      opens: formatHHMM(slot?.open),
      closes: formatHHMM(slot?.close),
    }));
}

export function buildPharmacyJsonLd(pharmacy: Pharmacy) {
  const openingHoursSpecification = buildOpeningHoursSpecification(pharmacy);
  return {
    "@context": "https://schema.org",
    "@type": ["Pharmacy", "LocalBusiness"],
    name: pharmacy.name,
    description: dynamicDescription(pharmacy),
    telephone: pharmacy.tel,
    address: {
      "@type": "PostalAddress",
      streetAddress: pharmacy.address,
      addressCountry: "KR",
      addressRegion: pharmacy.province,
      addressLocality: pharmacy.city,
    },
    geo:
      pharmacy.latitude && pharmacy.longitude
        ? {
            "@type": "GeoCoordinates",
            latitude: pharmacy.latitude,
            longitude: pharmacy.longitude,
          }
        : undefined,
    url: `${siteUrl}/pharmacy/${pharmacy.id}`,
    openingHoursSpecification,
  };
}

