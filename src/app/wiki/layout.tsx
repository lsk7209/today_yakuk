import type { ReactNode } from "react";

const wikiSources = [
  {
    name: "식품의약품안전처 의약품안전나라",
    href: "https://nedrug.mfds.go.kr/",
    description: "의약품 허가, 효능, 용법, 주의사항 공식 자료",
  },
  {
    name: "식품안전나라",
    href: "https://www.foodsafetykorea.go.kr/",
    description: "건강기능식품과 식품 안전 정보를 확인할 수 있는 공공 자료",
  },
  {
    name: "한국건강기능식품협회",
    href: "https://www.khff.or.kr/",
    description: "건강기능식품 제도와 표시 정보 참고 자료",
  },
];

export default function WikiLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <aside
        className="container mb-12 mt-8 max-w-5xl rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
        aria-labelledby="wiki-authority-sources"
      >
        <h2 id="wiki-authority-sources" className="text-base font-bold text-gray-900">
          영양제·의약품 정보 확인 시 참고할 공식 자료
        </h2>
        <ul className="mt-3 space-y-2 text-sm text-gray-600">
          {wikiSources.map((source) => (
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
