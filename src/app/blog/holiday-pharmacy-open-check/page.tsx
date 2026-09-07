import Link from "next/link";
import type { Metadata } from "next";
import StaticTOC from "@/components/blog/StaticTOC";
import { AdSlotTop, AdSlotBottom } from "@/components/ads/AdSlot";

const SLUG = "/blog/holiday-pharmacy-open-check";
const metaTitle = "공휴일에 약국이 열려 있나요? 빠른 확인 방법";
const metaDescription =
  "공휴일 문 여는 약국을 E-GEN·휴일지킴이약국에서 찾고, 방문 날짜와 영업시간을 전화로 확인하는 방법을 안내합니다. 검색 결과가 다를 때의 확인 순서도 정리했습니다.";

export const metadata: Metadata = {
  title: metaTitle,
  description: metaDescription,
  alternates: { canonical: SLUG },
  openGraph: {
    title: metaTitle,
    description: metaDescription,
    url: SLUG,
    type: "article",
    images: [
      {
        url: `/api/og?title=${encodeURIComponent("공휴일에 약국이 열려 있나요? 빠른 확인 방법")}`,
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: metaTitle,
    description: metaDescription,
    images: [`/api/og?title=${encodeURIComponent("공휴일에 약국이 열려 있나요? 빠른 확인 방법")}`],
  },
};

/* ── JSON-LD: Article + speakable + FAQPage ── */
const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "공휴일에 약국이 열려 있나요? 빠른 확인 방법",
  description: metaDescription,
  author: {
    "@type": "Organization",
    name: "약국오늘",
    url: "https://todaypharm.kr",
  },
  publisher: {
    "@type": "Organization",
    name: "약국오늘",
    logo: { "@type": "ImageObject", url: "https://todaypharm.kr/og-image.svg" },
  },
  datePublished: "2026-05-16T00:00:00+09:00",
  dateModified: "2026-09-07T00:00:00+09:00",
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": "https://todaypharm.kr/blog/holiday-pharmacy-open-check",
  },
  speakable: {
    "@type": "SpeakableSpecification",
    cssSelector: [".aeo-answer", "h1"],
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "홈", item: "https://todaypharm.kr/" },
    { "@type": "ListItem", position: 2, name: "블로그", item: "https://todaypharm.kr/blog" },
    {
      "@type": "ListItem",
      position: 3,
      name: "공휴일에 약국이 열려 있나요?",
      item: "https://todaypharm.kr/blog/holiday-pharmacy-open-check",
    },
  ],
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "공휴일에도 약국이 꼭 열려 있나요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "공휴일 운영 여부는 약국과 날짜에 따라 다릅니다. E-GEN 또는 대한약사회 휴일지킴이약국에서 방문할 지역과 시간을 확인하고, 출발 전 해당 약국에 전화하세요.",
      },
    },
    {
      "@type": "Question",
      name: "명절 연휴에 약국을 찾으려면 어떻게 해야 하나요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "연휴 전체를 같은 일정으로 보지 말고 방문할 날짜와 시간을 정해 검색하세요. 후보 약국의 전화번호를 저장한 뒤 당일 영업 여부와 도착 예정 시각에 이용 가능한지 확인하세요.",
      },
    },
    {
      "@type": "Question",
      name: "공휴일 약국 정보가 앱에서 잘못 표시되는 경우가 있나요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "네. 검색 정보와 실제 운영은 다를 수 있습니다. 영업 중 표시는 방문 가능성을 보장하지 않으므로, 조기 마감이나 임시 휴업 여부를 약국에 전화로 확인하세요.",
      },
    },
  ],
};

const steps = [
  {
    num: "1",
    title: "E-GEN에서 방문 날짜와 시간으로 약국 검색",
    text: "방문할 지역·날짜·시간을 기준으로 찾아보고, 결과의 주소와 전화번호를 확인한 뒤 실제 운영 여부는 해당 약국에 전화로 확인하세요.",
    body: (
      <>
        중앙응급의료센터의 응급의료포털{" "}
        <a
          href="https://www.e-gen.or.kr/egen/holiday_medical.do"
          target="_blank"
          rel="noreferrer noopener"
          style={{ color: "#2563eb", textDecoration: "underline" }}
        >
          E-GEN 병원·약국 검색
        </a>
        에서 약국을 선택하고 방문할 지역·날짜·시간을 기준으로 찾아보세요.
        오늘 영업하는 곳과 연휴 중 다른 날 영업하는 곳을 구분하는 것이 중요합니다.
        결과의 주소와 전화번호를 확인한 뒤 실제 운영 여부는 해당 약국에 전화로 확인하세요.
      </>
    ),
  },
  {
    num: "2",
    title: "약국오늘에서 가까운 후보 약국 확인",
    text: "위치 권한과 검색 조건을 확인하고 후보 약국의 주소를 살펴보세요. 표시된 운영시간만으로 공휴일 방문 가능 여부를 확정하지 마세요.",
    body: (
      <>
        가까운 약국을 찾을 때는 약국오늘의{" "}
        <Link href="/nearby" style={{ color: "#2563eb", textDecoration: "underline" }}>
          /nearby 페이지
        </Link>
        를 이용할 수 있습니다. 위치 권한과 검색 조건을 확인하고 후보 약국의 주소를 살펴보세요.
        표시된 운영시간만으로 공휴일 방문 가능 여부를 확정하지 마세요.
        이 글은 개별 약국 정보의 당일 갱신이나 실시간 영업을 보장하지 않습니다.
      </>
    ),
  },
  {
    num: "3",
    title: "대한약사회 휴일지킴이약국에서 다시 확인",
    text: "다른 검색 서비스와 결과가 다르면 같은 날짜와 시간으로 조회했는지 먼저 비교하세요. 실제 운영 여부는 약국에 직접 확인하세요.",
    body: (
      <>
        <a href="https://www.pharm114.or.kr/" target="_blank" rel="noreferrer noopener"
          style={{ color: "#2563eb", textDecoration: "underline" }}>대한약사회 휴일지킴이약국</a>
        에서도 후보를 찾아볼 수 있습니다. 다른 검색 서비스와 결과가 다르면
        같은 날짜와 시간으로 조회했는지 먼저 비교하세요.
        두 화면의 정보가 일치하더라도 실제 운영 여부는 약국에 직접 확인하는 것이 좋습니다.
      </>
    ),
  },
  {
    num: "4",
    title: "출발 전 전화로 도착 시각과 이용 가능 여부 확인",
    text: "오늘 몇 시까지 운영하는지, 도착 예정 시각에도 이용할 수 있는지 물어보세요. 전화가 연결되지 않으면 영업 중이라고 단정하지 말고 다른 후보를 확인하세요.",
    body: (
      <>
        <strong>오늘 몇 시까지 운영하는지, 도착 예정 시각에도 이용할 수 있는지</strong> 물어보세요.
        필요한 의약품이 있다면 제품명·성분명 등 확인할 정보를 준비해 재고와 상담 가능 여부를 문의하세요.
        전화가 연결되지 않으면 영업 중이라고 단정하지 말고 다른 후보를 확인하세요.
      </>
    ),
  },
];

const faqs = [
  {
    q: "공휴일에도 약국이 꼭 열려 있나요?",
    a: "공휴일 운영 여부는 약국과 날짜에 따라 다릅니다. E-GEN 또는 대한약사회 휴일지킴이약국에서 방문할 지역과 시간을 확인하고, 출발 전 해당 약국에 전화하세요.",
  },
  {
    q: "명절 연휴에 약국을 찾으려면 어떻게 해야 하나요?",
    a: "연휴 전체를 같은 일정으로 보지 말고 방문할 날짜와 시간을 정해 검색하세요. 후보 약국의 전화번호를 저장한 뒤 당일 영업 여부와 도착 예정 시각에 이용 가능한지 확인하세요.",
  },
  {
    q: "공휴일 약국 정보가 앱에서 잘못 표시되는 경우가 있나요?",
    a: "네. 검색 정보와 실제 운영은 다를 수 있습니다. 영업 중 표시는 방문 가능성을 보장하지 않으므로, 조기 마감이나 임시 휴업 여부를 약국에 전화로 확인하세요.",
  },
];

export default function BlogHolidayPharmacyOpenCheck() {
  const howToJsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "공휴일 약국 영업 확인 단계별 방법",
    description: metaDescription,
    step: steps.map((item, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: item.title,
      text: item.text,
    })),
  };
  return (
    <div className="container py-10 sm:py-14 max-w-2xl mx-auto bg-white min-h-screen">

      {/* ── 카테고리 레이블 ── */}
      <p
        style={{
          fontSize: "0.8rem",
          fontWeight: 700,
          color: "#1d4ed8",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          marginBottom: "12px",
        }}
      >
        블로그 · 공휴일 약국
      </p>

      {/* ── H1 ── */}
      <h1
        style={{
          fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
          fontWeight: 900,
          lineHeight: 1.3,
          color: "#0f172a",
          marginBottom: "20px",
        }}
      >
        공휴일에 약국이 열려 있나요? 빠른 확인 방법
      </h1>

      {/* ── Hook H1 + AEO speakable 즉답 단락 ── */}
      <p
        className="aeo-answer"
        style={{
          fontSize: "1.08rem",
          lineHeight: 1.8,
          background: "#f8fafc",
          borderLeft: "4px solid #2563eb",
          padding: "16px 20px",
          borderRadius: "10px",
          marginBottom: "24px",
          color: "#0f172a",
        }}
      >
        공휴일에는 평소 이용하던 약국도 운영시간이 다를 수 있다.{" "}
        <strong>E-GEN 또는 대한약사회 휴일지킴이약국에서 방문할 날짜와 시간으로 검색한 뒤,
        출발 전 약국에 전화해 실제 영업 여부를 확인하자.</strong>{" "}
        검색 결과는 후보를 찾는 데 쓰고, 방문 가능 여부는 별도로 확인하는 것이 핵심이다.
      </p>

      {/* ── 근거 박스 (statistic) ── */}
      <aside
        className="aw-box aw-box-statistic"
        style={{
          background: "#f0fdf4",
          border: "1px solid #bbf7d0",
          borderLeft: "4px solid #16a34a",
          borderRadius: "10px",
          padding: "16px 20px",
          marginBottom: "32px",
        }}
      >
        <div style={{ fontWeight: 700, color: "#166534", marginBottom: "10px", fontSize: "0.95rem" }}>
          검색 전에 정할 세 가지
        </div>
        <ul style={{ margin: 0, paddingLeft: "18px", lineHeight: 1.8 }}>
          <li>
            <strong>방문 날짜와 도착 예정 시각:</strong> 연휴 중 하루만 운영하는 약국과 혼동하지 않는다.
          </li>
          <li>
            <strong>이동 가능한 지역:</strong> 가까운 후보가 없으면 검색 지역을 넓혀 다시 확인한다.
          </li>
          <li>
            <strong>전화로 물어볼 내용:</strong> 영업시간, 도착 시 이용 가능 여부, 필요한 의약품의 재고를 확인한다.
          </li>
        </ul>
      </aside>

      <StaticTOC
        items={[
          { id: "h2-why", text: "공휴일 약국 운영, 왜 들쭉날쭉한가" },
          { id: "h2-methods", text: "공휴일 약국 빠른 확인 4가지 방법" },
          { id: "h2-exception", text: "예외와 주의사항 — 명절 연휴는 다르다" },
          { id: "h2-faq", text: "자주 묻는 질문" },
        ]}
      />

      <AdSlotTop />

      {/* ── H2: 배경 ── */}
      <h2
        id="h2-why"
        style={{
          marginTop: "36px",
          marginBottom: "12px",
          fontSize: "1.35rem",
          fontWeight: 800,
          color: "#1a365d",
        }}
      >
        공휴일 약국 운영, 왜 들쭉날쭉한가
      </h2>
      <p style={{ lineHeight: 1.85, marginBottom: "14px", color: "#1e293b" }}>
        공휴일 운영 여부를 평일 시간표나 이전 방문 경험만으로 판단하면 헛걸음할 수 있다.
        확인해야 할 것은 전국 평균 영업률이 아니라 <strong>방문할 약국의 해당 날짜 운영시간</strong>이다.
        검색 화면의 날짜가 오늘인지, 도착 예정 시각이 운영시간 안에 들어가는지부터 확인하자.
      </p>

      {/* ── 정의 박스 ── */}
      <aside
        className="aw-box aw-box-definition"
        style={{
          background: "#eff6ff",
          border: "1px solid #bfdbfe",
          borderLeft: "4px solid #2563eb",
          borderRadius: "10px",
          padding: "16px 20px",
          marginBottom: "28px",
        }}
      >
        <div style={{ fontWeight: 700, color: "#1e40af", marginBottom: "8px", fontSize: "0.95rem" }}>
          핵심 정의
        </div>
        <dl style={{ margin: 0 }}>
          <dt style={{ fontWeight: 700, marginTop: "4px" }}>휴일지킴이약국</dt>
          <dd style={{ margin: "4px 0 0 0", color: "#1e293b", lineHeight: 1.75 }}>
            대한약사회가 제공하는 약국 검색 서비스로, 휴일에 이용할 약국을 찾을 때 참고할 수 있다.
            검색 결과가 실제 방문 가능 여부를 보장하는 것은 아니다.
            (공식 서비스:{" "}
            <a
              href="https://www.pharm114.or.kr/"
              target="_blank"
              rel="noreferrer noopener"
              style={{ color: "#2563eb", textDecoration: "underline" }}
            >
              휴일지킴이약국
            </a>
            ).
          </dd>
        </dl>
      </aside>

      {/* ── H2: 확인 방법 4단계 ── */}
      <h2
        id="h2-methods"
        style={{
          marginTop: "36px",
          marginBottom: "16px",
          fontSize: "1.35rem",
          fontWeight: 800,
          color: "#1a365d",
        }}
      >
        공휴일 약국 빠른 확인 4가지 방법
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {steps.map((step) => (
          <div
            key={step.num}
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              padding: "18px 20px",
              background: "#fff",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
              <span
                style={{
                  flexShrink: 0,
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  background: "#2563eb",
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: "0.85rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: "2px",
                }}
              >
                {step.num}
              </span>
              <div>
                <h3
                  style={{
                    fontWeight: 700,
                    fontSize: "1rem",
                    color: "#0f172a",
                    marginBottom: "6px",
                    lineHeight: 1.4,
                  }}
                >
                  {step.title}
                </h3>
                <p style={{ lineHeight: 1.8, color: "#334155", fontSize: "0.97rem", margin: 0 }}>
                  {step.body}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── H2: 예외·주의사항 (명절 연휴 L5 사례 포함) ── */}
      <h2
        id="h2-exception"
        style={{
          marginTop: "40px",
          marginBottom: "12px",
          fontSize: "1.35rem",
          fontWeight: 800,
          color: "#1a365d",
        }}
      >
        예외와 주의사항 — 명절 연휴는 다르다
      </h2>
      <p style={{ lineHeight: 1.85, marginBottom: "14px", color: "#1e293b" }}>
        설·추석 연휴에는 방문할 날짜를 하루씩 구분해 확인하자.
        전날 검색해 둔 약국이라도 출발하는 날 다시 확인하고 전화번호를 함께 저장해 두는 편이 좋다.
        하나의 후보만 정해 두기보다 이동 가능한 다른 약국도 확인해 두면 일정이 바뀌었을 때 대응하기 쉽다.
      </p>

      {/* ── 사례 박스 (L5 case) ── */}
      <aside
        className="aw-box aw-box-case"
        style={{
          background: "#fefce8",
          border: "1px solid #fde68a",
          borderLeft: "4px solid #d97706",
          borderRadius: "10px",
          padding: "16px 20px",
          marginBottom: "28px",
        }}
      >
        <div style={{ fontWeight: 700, color: "#92400e", marginBottom: "8px", fontSize: "0.95rem" }}>
          검색 결과가 다를 때의 확인 순서
        </div>
        <p style={{ lineHeight: 1.8, color: "#1c1917", margin: 0, fontSize: "0.95rem" }}>
          한 화면에는 영업 중, 다른 화면에는 휴무로 보인다면 먼저 날짜·시간과 약국 주소가 같은지 비교한다.
          같은 이름의 다른 지점인지도 확인한다. 조건을 맞춰도 결과가 다르면 전화로 확인하고,
          연결되지 않으면 어느 화면이 맞다고 추측해 출발하지 말고 다른 후보를 찾아본다.
        </p>
      </aside>

      <p style={{ lineHeight: 1.85, marginBottom: "14px", color: "#1e293b" }}>
        또한 앱에 &apos;영업 중&apos;으로 표시되더라도 조기 마감이나 임시 휴업이 발생할 수 있다.
        데이터 갱신과 현장 변경 사이에는 차이가 생길 수 있으며, 이 글에서는 당일 동기화를 보장하지 않는다.
        방문 전 전화로 영업 여부와 필요한 약 재고를 확인하면 불필요한 이동을 줄일 수 있다.
      </p>

      {/* ── 비교표: 시기별 운영률 ── */}
      <div style={{ overflowX: "auto", margin: "20px 0" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.92rem" }}>
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              <th style={{ border: "1px solid #e2e8f0", padding: "10px 12px", textAlign: "left", fontWeight: 700, color: "#0f172a" }}>시기</th>
              <th style={{ border: "1px solid #e2e8f0", padding: "10px 12px", textAlign: "left", fontWeight: 700, color: "#0f172a" }}>확인할 내용</th>
              <th style={{ border: "1px solid #e2e8f0", padding: "10px 12px", textAlign: "left", fontWeight: 700, color: "#0f172a" }}>권장 확인 방법</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ border: "1px solid #e2e8f0", padding: "10px 12px" }}>평일</td>
              <td style={{ border: "1px solid #e2e8f0", padding: "10px 12px" }}>도착 시각과 마감 시각</td>
              <td style={{ border: "1px solid #e2e8f0", padding: "10px 12px" }}>지도 앱 / 약국오늘</td>
            </tr>
            <tr style={{ background: "#fafafa" }}>
              <td style={{ border: "1px solid #e2e8f0", padding: "10px 12px" }}>일반 공휴일</td>
              <td style={{ border: "1px solid #e2e8f0", padding: "10px 12px" }}>해당 날짜 운영 여부</td>
              <td style={{ border: "1px solid #e2e8f0", padding: "10px 12px" }}>E-GEN / 휴일지킴이약국 검색 후 전화</td>
            </tr>
            <tr>
              <td style={{ border: "1px solid #e2e8f0", padding: "10px 12px" }}>명절 연휴 당일</td>
              <td style={{ border: "1px solid #e2e8f0", padding: "10px 12px" }}>연휴 날짜별 운영시간</td>
              <td style={{ border: "1px solid #e2e8f0", padding: "10px 12px" }}>날짜를 지정해 검색하고 당일 전화 확인</td>
            </tr>
          </tbody>
        </table>
        <p style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "6px" }}>
          위 표는 방문 전 확인 순서이며 전국 약국의 영업률이나 운영 보장 수치를 뜻하지 않는다.
        </p>
      </div>

      {/* ── H2: FAQ ── */}
      <h2
        id="h2-faq"
        style={{
          marginTop: "40px",
          marginBottom: "16px",
          fontSize: "1.35rem",
          fontWeight: 800,
          color: "#1a365d",
        }}
      >
        자주 묻는 질문
      </h2>
      <div className="aw-faq" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {faqs.map((faq) => (
          <details
            key={faq.q}
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: "10px",
              padding: "12px 16px",
            }}
          >
            <summary style={{ fontWeight: 700, cursor: "pointer", lineHeight: 1.6, color: "#0f172a", fontSize: "0.97rem" }}>
              {faq.q}
            </summary>
            <div style={{ marginTop: "10px", lineHeight: 1.8, color: "#334155", fontSize: "0.95rem" }}>
              {faq.a}
            </div>
          </details>
        ))}
      </div>

      {/* ── Outro O1 (action) ── */}
      <div
        style={{
          marginTop: "40px",
          padding: "20px 22px",
          background: "#eff6ff",
          border: "1px solid #bfdbfe",
          borderRadius: "12px",
        }}
      >
        <p style={{ fontWeight: 700, color: "#1e40af", marginBottom: "10px", fontSize: "1rem" }}>
          지금 바로 할 수 있는 3가지
        </p>
        <ol style={{ paddingLeft: "20px", margin: 0, lineHeight: 1.9, color: "#1e293b" }}>
          <li>
            <Link href="/nearby" style={{ color: "#2563eb", textDecoration: "underline", fontWeight: 600 }}>
              약국오늘 /nearby
            </Link>
            에서 위치 권한과 검색 조건을 확인하고 가까운 후보 약국을 찾는다.
          </li>
          <li>
            E-GEN 또는 휴일지킴이약국에서 방문할 날짜와 시간을 확인한다.
          </li>
          <li>
            다가오는 공휴일·명절 전날,{" "}
            <Link href="/guide/holiday-checklist" style={{ color: "#2563eb", textDecoration: "underline", fontWeight: 600 }}>
              공휴일 체크리스트
            </Link>
            를 참고해 당번 약국 위치와 전화번호를 메모해 둔다.
          </li>
        </ol>
        <p style={{ marginTop: "12px", color: "#334155", lineHeight: 1.75 }}>
          출발 전에는 약국에 전화해 도착 예정 시각에도 이용할 수 있는지 확인한다.
        </p>
      </div>

      {/* ── AI Disclosure (P4) ── */}
      <footer
        className="aw-footer-disclosure"
        style={{
          marginTop: "28px",
          padding: "14px 16px",
          background: "#f8fafc",
          borderRadius: "10px",
          color: "#64748b",
          fontSize: "0.82rem",
          lineHeight: 1.65,
        }}
      >
        확인·수정일: 2026년 9월 7일. 이 글은 AI 도구를 활용해 공식 검색 서비스의 이용 안내를 정리했습니다.
        E-GEN과 대한약사회 휴일지킴이약국 링크를 참고하세요. 개별 약국의 실시간 운영 현황을 검증한 글은 아닙니다.
      </footer>

      <section className="rounded-2xl border border-gray-100 bg-gray-50 p-6 space-y-4">
        <h2 className="text-lg font-bold text-gray-900">함께 읽으면 좋은 글</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { href: "/blog/holiday-open-pharmacy-tips", label: "공휴일 문 연 약국 찾는 5가지 팁", desc: "위치 권한·종료 임박·전화 확인 방법" },
            { href: "/blog/night-pharmacy-checklist", label: "야간 약국 방문 체크리스트", desc: "심야 방문 전 확인할 항목 6가지" },
            { href: "/nearby", label: "내 주변 약국 바로 찾기 →", desc: "위치 기반 현재 영업 중인 약국 검색" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-xl border border-gray-200 bg-white p-4 hover:shadow-md hover:border-brand-200 transition-all space-y-1"
            >
              <p className="font-bold text-gray-900 text-sm">{item.label}</p>
              <p className="text-xs text-gray-500">{item.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <AdSlotBottom />

      {/* ── YMYL Disclaimer ── */}
      <aside
        className="aw-ymyl-disclaimer"
        style={{
          marginTop: "12px",
          padding: "14px 16px",
          background: "#fef3c7",
          borderLeft: "4px solid #f59e0b",
          borderRadius: "10px",
          color: "#7c2d12",
          fontSize: "0.82rem",
          lineHeight: 1.65,
        }}
      >
        ⚠️ 본 사이트는 의료인이 운영하지 않으며, 이 글의 어떤 내용도 진단·처방·치료를 대체하지 않습니다.
        의약품 복용 및 의학적 결정은 반드시 담당 약사·의료진과 상의하시기 바랍니다.
      </aside>

      {/* ── JSON-LD ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
    </div>
  );
}
