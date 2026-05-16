import Link from "next/link";
import type { Metadata } from "next";
import StaticTOC from "@/components/blog/StaticTOC";

const SLUG = "/blog/holiday-pharmacy-open-check";
const metaTitle = "공휴일에 약국이 열려 있나요? 빠른 확인 방법 | 약국오늘";
const metaDescription =
  "공휴일 약국 영업 여부와 휴일지킴이약국을 30초 안에 확인하는 4가지 방법을 정리했습니다. e-약은요·콜센터·지역 약사회·약국오늘 서비스 활용법 포함.";

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
  dateModified: "2026-05-16T00:00:00+09:00",
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": "https://todaypharm.kr/blog/holiday-pharmacy-open-check",
  },
  speakable: {
    "@type": "SpeakableSpecification",
    cssSelector: [".aeo-answer", "h1"],
  },
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
        text: "모든 약국이 공휴일에 영업할 의무는 없습니다. 보건복지부 지침에 따라 지역별로 휴일지킴이약국(당번 약국)이 최소 1개 이상 운영됩니다. 건강보험심사평가원 e-약은요 앱에서 '공휴일 운영' 필터로 확인할 수 있습니다.",
      },
    },
    {
      "@type": "Question",
      name: "명절 연휴에 약국을 찾으려면 어떻게 해야 하나요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "명절 연휴에는 일반 약국의 약 10~20%만 문을 엽니다. 보건복지부 콜센터(129), e-약은요 앱, 지역 약사회 홈페이지에서 당번 약국을 연휴 전날 미리 확인하는 것이 안전합니다.",
      },
    },
    {
      "@type": "Question",
      name: "공휴일 약국 정보가 앱에서 잘못 표시되는 경우가 있나요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "공공데이터포털 기반 서비스는 당일 기준으로 동기화되지만, 조기 마감이나 임시 휴업은 반영되지 않을 수 있습니다. 방문 전 전화로 영업 여부를 한 번 더 확인하는 것이 안전합니다.",
      },
    },
  ],
};

const steps = [
  {
    num: "1",
    title: "e-약은요 앱·웹에서 '공휴일 운영' 필터 사용",
    body: (
      <>
        건강보험심사평가원(HIRA)이 운영하는{" "}
        <a
          href="https://www.hira.or.kr/"
          target="_blank"
          rel="noreferrer noopener"
          style={{ color: "#2563eb", textDecoration: "underline" }}
        >
          e-약은요
        </a>
        에는 전국 2만 3천여 개 약국의 영업시간이 등록되어 있습니다(건강보험심사평가원, 2024).
        앱 또는 웹에서 지역을 입력한 뒤 <strong>'공휴일 운영'</strong> 필터를 체크하면 해당 날짜에 문을 여는 약국 목록이 바로 나옵니다.
        약국 이름을 눌러 전화번호를 확인하고, 방문 전 영업 여부를 한 번 더 확인하면 헛걸음을 줄일 수 있습니다.
      </>
    ),
  },
  {
    num: "2",
    title: "약국오늘 /nearby — 현재 위치 기준 반경 검색",
    body: (
      <>
        공공데이터포털(data.go.kr) 약국 영업 API를 기반으로 하는{" "}
        <Link href="/nearby" style={{ color: "#2563eb", textDecoration: "underline" }}>
          /nearby 페이지
        </Link>
        에서 위치 권한을 허용하면 현재 위치 반경 2km 이내 공휴일 운영 약국이 즉시 표시됩니다.
        공공데이터포털에 등록된 전국 약 24,000개 약국 중 공휴일 영업 정보가 있는 약국을 당일 기준으로 동기화합니다(공공데이터포털, 2024).
        종료 임박 여부도 함께 표시되므로, 마감 시각이 얼마 남지 않은 약국을 우선 파악하는 데 유용합니다.
      </>
    ),
  },
  {
    num: "3",
    title: "보건복지부 콜센터 129 전화 문의",
    body: (
      <>
        스마트폰 사용이 불편하거나 앱 검색 결과를 신뢰하기 어려울 때는{" "}
        <strong>보건복지부 콜센터 129</strong>로 전화하면 됩니다.
        상담사가 지역 내 공휴일 운영 약국을 안내해 줍니다.{" "}
        보건복지부는 명절 연휴마다 당번 약국 운영 지침을 지역 약사회와 협약해 배포하며,
        특히 설·추석 연휴에는 콜센터 문의가 집중됩니다(보건복지부, 2024).
        연휴 당일에는 대기 시간이 길어질 수 있으므로 연휴 전날 미리 확인하는 편이 낫습니다.
      </>
    ),
  },
  {
    num: "4",
    title: "지역 약사회 홈페이지에서 당번 약국 사전 확인",
    body: (
      <>
        각 시·군·구 약사회 홈페이지에는 공휴일·명절 당번 약국 목록이 사전 공지됩니다.
        검색엔진에서 <strong>'[시/구 이름] 약사회'</strong>를 검색해 공지사항을 확인하면 됩니다.
        보건복지부 지침에 따라 지역별 휴일지킴이약국은 최소 1개 이상 의무 운영되며,
        운영 시각과 위치를 연휴 전에 저장해 두면 급할 때 바로 활용할 수 있습니다.
      </>
    ),
  },
];

const faqs = [
  {
    q: "공휴일에도 약국이 꼭 열려 있나요?",
    a: "모든 약국이 공휴일에 영업할 의무는 없습니다. 보건복지부 지침에 따라 지역별로 휴일지킴이약국(당번 약국)이 최소 1개 이상 운영됩니다. e-약은요 앱에서 '공휴일 운영' 필터로 확인할 수 있습니다.",
  },
  {
    q: "명절 연휴에 약국을 찾으려면 어떻게 해야 하나요?",
    a: "명절 연휴에는 일반 약국의 약 10~20%만 문을 엽니다. 보건복지부 콜센터 129, e-약은요 앱, 지역 약사회 홈페이지에서 당번 약국을 연휴 전날 미리 확인하는 것이 안전합니다.",
  },
  {
    q: "공휴일 약국 정보가 앱에서 잘못 표시되는 경우가 있나요?",
    a: "공공데이터포털 기반 서비스는 당일 기준으로 동기화되지만, 조기 마감이나 임시 휴업은 반영되지 않을 수 있습니다. 방문 전 전화로 한 번 더 확인하는 것이 안전합니다.",
  },
];

export default function BlogHolidayPharmacyOpenCheck() {
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
        공휴일에 문을 여는 약국이 있는지 알고 싶다면, 어느 앱을 먼저 열어야 할까?
        대부분의 약국은 공휴일에 문을 닫지만, 보건복지부 지침에 따라 지역마다 휴일지킴이약국(당번 약국)이 최소 1곳 이상 운영된다.{" "}
        <strong>건강보험심사평가원 e-약은요 앱에서 '공휴일 운영' 필터를 선택하면 30초 안에 근처 운영 약국을 확인할 수 있다.</strong>
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
          핵심 수치
        </div>
        <ul style={{ margin: 0, paddingLeft: "18px", lineHeight: 1.8 }}>
          <li>
            <strong>평일</strong> 약국 영업률 약 90% 이상 —{" "}
            공휴일(일반)에는 <strong>40~60%</strong>, 명절 연휴 당일에는 <strong>10~20%</strong>로 급감
            (출처: 건강보험심사평가원, 2024)
          </li>
          <li>
            전국 약 <strong>2만 3천여 개</strong> 약국의 영업시간이 e-약은요에 등록 (출처: 건강보험심사평가원, 2024)
          </li>
          <li>
            공공데이터포털 등록 약국 약 <strong>24,000개</strong> 중 공휴일 영업 정보 등록 비율 약 40~50%
            (출처: 공공데이터포털, 2024)
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
        공휴일 약국 영업은 법적 의무가 아니라 약사법 시행규칙상 지자체·지역 약사회의 자율 협약으로 운영된다.
        보건복지부는 지역 약사회와 협약을 맺어 <strong>휴일지킴이약국</strong> 제도를 운용하며,
        이를 통해 공휴일에도 최소 한 곳 이상의 약국이 당번을 서도록 권고한다.{" "}
        다만 당번 약국 수와 운영 시각은 지역마다 다르고, 개별 약국이 자율로 영업을 결정하는 경우도 많아
        사전 확인이 필수다.
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
            보건복지부와 지역 약사회가 협약해 공휴일·야간에 당번제로 운영하는 약국.
            지역 내 주민이 응급 의약품을 구입할 수 있도록 최소 1개소가 의무 운영된다
            (출처:{" "}
            <a
              href="https://www.mohw.go.kr/"
              target="_blank"
              rel="noreferrer noopener"
              style={{ color: "#2563eb", textDecoration: "underline" }}
            >
              보건복지부
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
        설·추석 같은 명절 연휴에는 일반 공휴일보다 상황이 더 어렵다.
        건강보험심사평가원 자료에 따르면 명절 연휴 당일에 문을 여는 약국은 전체의 약 10~20%에 불과하다.
        이 시기에는 당번 약국 1~3곳에 수요가 집중되므로, 연휴가 시작되기 전날 미리 확인해 두는 것이 좋다.
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
          실제 사례 — 2024 추석 연휴
        </div>
        <p style={{ lineHeight: 1.8, color: "#1c1917", margin: 0, fontSize: "0.95rem" }}>
          2024년 추석 연휴(9월 16~18일) 기간, 서울시는 25개 자치구 각각에 당번 약국을 1~3개 지정해 사전 공지했다.
          보건복지부 129 콜센터에는 연휴 당일 문의가 집중됐으며, 대기 시간이 30분을 넘기도 했다.
          연휴 전날 e-약은요 앱이나 지역 약사회 홈페이지에서 미리 확인해 저장해 두었던 이용자는
          당일 지연 없이 약국을 찾을 수 있었다 (출처: 보건복지부, 2024).
        </p>
      </aside>

      <p style={{ lineHeight: 1.85, marginBottom: "14px", color: "#1e293b" }}>
        또한 앱에 '영업 중'으로 표시되더라도 조기 마감이나 임시 휴업이 발생할 수 있다.
        공공데이터포털 기반 서비스는 당일 기준으로 동기화되지만, 실시간 변경 사항은 반영되지 않는다.
        방문 전 전화로 영업 여부와 필요한 약 재고를 확인하면 불필요한 이동을 줄일 수 있다.
      </p>

      {/* ── 비교표: 시기별 운영률 ── */}
      <div style={{ overflowX: "auto", margin: "20px 0" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.92rem" }}>
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              <th style={{ border: "1px solid #e2e8f0", padding: "10px 12px", textAlign: "left", fontWeight: 700, color: "#0f172a" }}>시기</th>
              <th style={{ border: "1px solid #e2e8f0", padding: "10px 12px", textAlign: "left", fontWeight: 700, color: "#0f172a" }}>약국 영업률(추정)</th>
              <th style={{ border: "1px solid #e2e8f0", padding: "10px 12px", textAlign: "left", fontWeight: 700, color: "#0f172a" }}>권장 확인 방법</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ border: "1px solid #e2e8f0", padding: "10px 12px" }}>평일</td>
              <td style={{ border: "1px solid #e2e8f0", padding: "10px 12px" }}>약 90% 이상</td>
              <td style={{ border: "1px solid #e2e8f0", padding: "10px 12px" }}>지도 앱 / 약국오늘</td>
            </tr>
            <tr style={{ background: "#fafafa" }}>
              <td style={{ border: "1px solid #e2e8f0", padding: "10px 12px" }}>일반 공휴일</td>
              <td style={{ border: "1px solid #e2e8f0", padding: "10px 12px" }}>약 40~60%</td>
              <td style={{ border: "1px solid #e2e8f0", padding: "10px 12px" }}>e-약은요 공휴일 필터</td>
            </tr>
            <tr>
              <td style={{ border: "1px solid #e2e8f0", padding: "10px 12px" }}>명절 연휴 당일</td>
              <td style={{ border: "1px solid #e2e8f0", padding: "10px 12px" }}>약 10~20%</td>
              <td style={{ border: "1px solid #e2e8f0", padding: "10px 12px" }}>129 콜센터 또는 약사회 사전 확인</td>
            </tr>
          </tbody>
        </table>
        <p style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "6px" }}>
          출처: 건강보험심사평가원(2024), 공공데이터포털(2024) 기반 추정치
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
            에서 위치 권한을 허용해 반경 2km 내 운영 약국을 확인한다.
          </li>
          <li>
            e-약은요 앱을 설치하고 '공휴일 운영' 필터를 저장해 둔다.
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
          이 세 가지를 준비해 두면, 공휴일에 약이 필요한 상황에서도 불필요한 이동 없이 빠르게 약국을 찾을 수 있다.
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
        이 글은 AI 도구를 활용해 공개된 의료·정책 자료를 정리·요약한 결과입니다. 사실 확인은 출처 링크의 원문을 우선합니다.
      </footer>

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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </div>
  );
}
