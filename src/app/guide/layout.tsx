import type { ReactNode } from "react";

const guideSources = [
  {
    name: "응급의료포털 E-Gen",
    href: "https://www.e-gen.or.kr/",
    description: "야간·휴일 의료기관과 약국 정보를 확인할 때 참고할 수 있는 공공 포털",
  },
  {
    name: "건강보험심사평가원 병원·약국 찾기",
    href: "https://www.hira.or.kr/",
    description: "약국과 의료기관 기본 정보를 확인할 수 있는 공식 서비스",
  },
  {
    name: "식품의약품안전처 의약품안전나라",
    href: "https://nedrug.mfds.go.kr/",
    description: "의약품 효능, 용법, 주의사항을 확인할 수 있는 공식 자료",
  },
];

export default function GuideLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <aside
        className="container mb-12 mt-8 max-w-4xl rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
        aria-labelledby="guide-authority-sources"
      >
        <h2 id="guide-authority-sources" className="text-base font-bold text-gray-900">
          함께 확인할 공식 자료
        </h2>
        <ul className="mt-3 space-y-2 text-sm text-gray-600">
          {guideSources.map((source) => (
            <li key={source.href} className="leading-relaxed">
              <a
                href={source.href}
                className="font-semibold text-brand-700 underline-offset-4 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {source.name}
              </a>
              <span className="text-gray-500"> - {source.description}</span>
            </li>
          ))}
        </ul>
      </aside>
    </>
  );
}
