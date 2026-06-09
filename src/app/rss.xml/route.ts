import { NextResponse } from "next/server";
import { listPublishedContent } from "@/lib/data/content";
import { getSiteUrl } from "@/lib/site-url";

const SITE_URL = getSiteUrl();
const FEED_TITLE = "약국오늘 블로그 | TodayPharmacy";
const FEED_DESCRIPTION = "지금 문 연 근처약국을 빠르게 찾고 영업시간·위치를 확인하세요. 약국 이용 팁과 건기식 정보를 제공합니다.";

const STATIC_FEED_ITEMS = [
  { slug: "magnesium-deficiency-guide", title: "마그네슘 부족 신호 6가지와 영양제 선택법", summary: "산화 vs 글리시네이트 형태별 흡수율 비교와 올바른 복용법", date: "2026-06-09" },
  { slug: "lutein-astaxanthin-guide", title: "루테인 vs 아스타잔틴: 눈 건강 영양제 비교", summary: "황반 보호·항산화력·병용 여부까지 눈 건강 영양제 완전 비교", date: "2026-06-09" },
  { slug: "vitamin-d-deficiency-guide", title: "비타민D 결핍 신호 7가지와 올바른 보충 방법", summary: "국내 성인 75% 부족 상태, 혈중 농도 기준과 용량별 보충법", date: "2026-06-09" },
  { slug: "probiotics-selection-guide", title: "유산균 균주 선택 가이드", summary: "CFU보다 균주 종류가 중요한 이유와 목적별 선택법", date: "2026-06-09" },
  { slug: "omega3-selection-guide", title: "오메가3 알티지 vs 에틸에스텔 선택 가이드", summary: "흡수율·가격·형태별 차이와 복용법 완전 정리", date: "2026-06-09" },
  { slug: "summer-first-aid-kit", title: "여름 필수 구급 약품 목록", summary: "여름철 가정에 구비해야 할 상비약과 영양제 리스트", date: "2026-06-09" },
  { slug: "skin-trouble-first-aid-kit", title: "피부 트러블 응급처치 키트", summary: "벌레 물림·햇빛 화상·알러지 각각에 맞는 응급 대처법", date: "2026-06-09" },
  { slug: "pregnancy-pharmacy-guide", title: "임산부 안전한 영양제 섭취 가이드", summary: "엽산·철분·비타민D 필수 영양소와 임신 중 주의해야 할 성분", date: "2026-06-09" },
  { slug: "digestion-hangover-pharmacy-guide", title: "소화·숙취 약국 가이드", summary: "소화제·숙취해소제 선택 기준과 약국에서 바로 구할 수 있는 제품", date: "2026-06-09" },
  { slug: "night-radius-tips", title: "야간·주말 약국 반경 설정 팁", summary: "야간 약국을 놓치지 않는 반경 설정과 위치 권한 활용법", date: "2026-06-09" },
  { slug: "prescription-prep-tips", title: "처방전 방문 전 준비 팁", summary: "약국 방문 전 처방전·보험카드·복약 이력 준비 체크리스트", date: "2026-06-09" },
  { slug: "lost-prescription-action-guide", title: "처방전을 잃어버렸을 때 대처법", summary: "처방전 분실 시 재발급·약국 방문·응급 대처 단계별 안내", date: "2026-06-09" },
  { slug: "hypertension-diabetes-holiday-tips", title: "고혈압·당뇨 복용자 연휴 대비 가이드", summary: "만성질환 약 연휴 준비, 비상 약국 확인, 용량 주의사항", date: "2026-06-09" },
  { slug: "kids-fever-meds-check", title: "소아 발열 약 구매 전 체크리스트", summary: "연령·체중별 용량 계산과 구매 시 주의사항", date: "2026-05-16" },
  { slug: "night-pharmacy-checklist", title: "야간 약국 방문 체크리스트", summary: "심야 방문 전 확인할 항목 6가지", date: "2026-05-16" },
  { slug: "pharmacy-faq-top10", title: "약국 자주 묻는 질문 TOP 10", summary: "처방전, 재고, 영업시간 등 자주 묻는 질문 모음", date: "2026-05-16" },
  { slug: "holiday-open-pharmacy-tips", title: "공휴일 문 연 약국 찾는 팁", summary: "공휴일 당번 약국 조회 방법과 사전 준비 체크리스트", date: "2026-05-16" },
  { slug: "kids-fever-medicine-comparison", title: "소아 발열 약 비교 가이드", summary: "아세트아미노펜 vs 이부프로펜, 연령별 용량 기준 정리", date: "2026-05-16" },
  { slug: "night-pharmacy-3steps", title: "야간 약국 찾기 3단계", summary: "심야에 약국을 빠르게 찾는 단계별 실전 방법", date: "2026-05-16" },
  { slug: "prescription-holiday-guide", title: "처방전 약 연휴에 못 받을 때 대처법", summary: "처방전 유효기간 3일 규정·비상약국 조회·응급 대처까지 총정리", date: "2026-05-16" },
  { slug: "pharmacy-visit-checklist-3", title: "약국 방문 전 꼭 확인해야 할 것들", summary: "헛걸음을 막는 3가지 필수 확인 사항 — 영업, 재고, 처방전 유효기간", date: "2026-05-16" },
  { slug: "holiday-pharmacy-open-check", title: "공휴일에 약국이 열려 있나요? 빠른 확인 방법", summary: "공휴일 약국 영업 여부와 휴일지킴이약국을 30초 안에 확인하는 4가지 방법", date: "2026-05-16" },
];

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

// Ensure recently published posts reach feed readers quickly.
export const revalidate = 600;

export async function GET() {
  const items = await listPublishedContent(30);

  const staticItems = STATIC_FEED_ITEMS.map((item) => {
    const link = `${SITE_URL}/blog/${item.slug}`;
    const pubDate = new Date(item.date).toUTCString();
    return `
      <item>
        <title><![CDATA[${item.title}]]></title>
        <link>${link}</link>
        <guid>${link}</guid>
        <pubDate>${pubDate}</pubDate>
        <description><![CDATA[${item.summary}]]></description>
      </item>`;
  }).join("");

  const dynamicItems = items.map((item) => {
    const link = `${SITE_URL}/blog/${item.slug}`;
    const pubDate = new Date(item.published_at || item.publish_at).toUTCString();
    const description = item.ai_summary || (item.content_html ? stripHtml(item.content_html).slice(0, 400) : item.title);
    return `
      <item>
        <title><![CDATA[${item.title}]]></title>
        <link>${link}</link>
        <guid>${link}</guid>
        <pubDate>${pubDate}</pubDate>
        <description><![CDATA[${description}]]></description>
      </item>`;
  }).join("");

  const feedItems = staticItems + dynamicItems || `
      <item>
        <title><![CDATA[약국오늘 안내]]></title>
        <link>${SITE_URL}</link>
        <guid>${SITE_URL}</guid>
        <pubDate>${new Date().toUTCString()}</pubDate>
        <description><![CDATA[오늘 문 연 약국을 빠르게 찾는 서비스입니다.]]></description>
      </item>
    `;

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title><![CDATA[${FEED_TITLE}]]></title>
    <link>${SITE_URL}</link>
    <description><![CDATA[${FEED_DESCRIPTION}]]></description>
    <language>ko</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${feedItems}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "s-maxage=600, stale-while-revalidate=300",
    },
  });
}
