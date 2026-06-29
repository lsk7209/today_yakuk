import type { ReactNode } from "react";

const authoritySources = [
  {
    name: "식품의약품안전처 의약품안전나라",
    href: "https://nedrug.mfds.go.kr/",
    description: "의약품 허가, 효능, 용법, 주의사항 확인",
  },
  {
    name: "건강보험심사평가원 병원·약국 찾기",
    href: "https://www.hira.or.kr/",
    description: "의료기관 및 약국 공공 정보 확인",
  },
  {
    name: "대한약사회",
    href: "https://www.kpanet.or.kr/",
    description: "약국 이용과 의약품 안전 관련 공식 안내",
  },
];

export default function BlogLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <aside
        className="container mb-12 mt-8 max-w-3xl rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
        aria-labelledby="blog-authority-sources"
      >
        <h2 id="blog-authority-sources" className="text-base font-bold text-gray-900">
          참고할 공식 자료
        </h2>
        <ul className="mt-3 space-y-2 text-sm text-gray-600">
          {authoritySources.map((source) => (
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
