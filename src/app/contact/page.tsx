import type { Metadata } from "next";
import Link from "next/link";
import { getSiteUrl } from "@/lib/site-url";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "문의하기",
  description: "약국 정보 수정 요청, 제휴 문의, 서비스 개선 제안을 약국오늘 운영팀에 전달하세요.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "문의하기",
    description: "약국 정보 수정 요청과 서비스 문의를 남길 수 있는 공식 문의 페이지입니다.",
    url: `${siteUrl}/contact`,
    siteName: "약국오늘",
    locale: "ko_KR",
    type: "website",
  },
};

const requestItems = [
  "약국명, 주소, 변경이 필요한 항목을 함께 적어주세요.",
  "운영 시간 변경이라면 확인한 날짜와 시간도 적어주시면 검토가 빨라집니다.",
  "광고·제휴 문의는 회사명과 연락 가능한 회신 정보를 함께 남겨주세요.",
];

const responseSteps = [
  "접수된 문의는 우선순위에 따라 검토합니다.",
  "데이터 수정 요청은 공공데이터 원본과 현장 확인 정보를 함께 비교합니다.",
  "검토가 끝나면 반영하거나 추가 확인이 필요한 내용을 회신합니다.",
];

export default function ContactPage() {
  const contactJsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "문의하기",
    description:
      "약국 정보 수정 요청, 제휴 문의, 서비스 개선 제안을 약국오늘 운영팀에 전달하세요.",
    url: `${siteUrl}/contact`,
    inLanguage: "ko",
    isPartOf: { "@type": "WebSite", name: "약국오늘", url: siteUrl },
  };

  return (
    <div className="bg-[var(--background)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }}
      />
      <div className="container py-10 sm:py-14 space-y-6">
        <header className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm space-y-4">
          <p className="text-xs font-black tracking-[0.18em] text-brand-700">CONTACT</p>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900">문의하기</h1>
          <p className="max-w-3xl text-gray-600 leading-relaxed">
            약국 정보 수정 요청, 서비스 제안, 제휴 문의는 아래 연락처로 남겨주세요. 약국오늘은 공공데이터 기반
            서비스이므로, 실제 현장 정보와 다른 부분이 있으면 근거와 함께 알려주시면 더 빠르게 검토할 수 있습니다.
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <article className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm space-y-5">
            <div>
              <p className="text-sm font-black text-brand-700">기본 연락처</p>
              <p className="mt-2 text-lg font-black text-gray-900">support@todayyakuk.com</p>
              <p className="mt-2 text-sm text-gray-600">평일 10:00 ~ 18:00 (KST) 기준으로 순차 확인합니다.</p>
            </div>
            <div>
              <p className="text-sm font-black text-brand-700">빠른 처리 팁</p>
              <ul className="mt-3 space-y-3 text-sm text-gray-700 leading-relaxed">
                {requestItems.map((item) => (
                  <li key={item} className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </article>

          <article className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
            <h2 className="text-2xl font-black text-gray-900">문의 처리 흐름</h2>
            <ol className="mt-5 space-y-3">
              {responseSteps.map((item, index) => (
                <li key={item} className="flex gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-black text-white">
                    {index + 1}
                  </span>
                  <p className="text-sm leading-relaxed text-gray-700">{item}</p>
                </li>
              ))}
            </ol>

            <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-4 text-sm leading-relaxed text-emerald-900">
              개인정보가 포함된 자료를 보내실 때에는 꼭 필요한 정보만 남겨 주세요. 위치 정보나 민감한 건강 정보는
              문의 처리 목적 범위를 넘지 않도록 최소화해 주시는 것이 안전합니다.
            </div>
          </article>
        </section>

        <section className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
          <h2 className="text-2xl font-black text-gray-900">관련 안내</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/privacy"
              className="inline-flex items-center rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-black text-gray-900 hover:border-brand-300 hover:text-brand-700"
            >
              개인정보처리방침
            </Link>
            <Link
              href="/terms"
              className="inline-flex items-center rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-black text-gray-900 hover:border-brand-300 hover:text-brand-700"
            >
              이용약관
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-black text-gray-900 hover:border-brand-300 hover:text-brand-700"
            >
              서비스 소개
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

