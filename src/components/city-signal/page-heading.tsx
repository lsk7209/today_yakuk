import Image from "next/image";
import type { ReactNode } from "react";

export default function PageHeading({ index, title, children, art }: { index: string; title: ReactNode; children?: ReactNode; art?: "metro" | "wiki" }) {
  return <header className={`city-page-heading${art ? " city-page-heading-split" : ""}`}>
    <div className="city-page-heading-copy"><p className="city-eyebrow">{index}</p><h1 className="city-display-medium">{title}</h1>{children && <div className="city-lead">{children}</div>}</div>
    {art && <div className="city-heading-art"><Image loading="eager" src={`/city-signal/${art === "metro" ? "city-hours" : "wiki-grid"}.svg`} alt={art === "metro" ? "도시의 건물과 시간을 표현한 일러스트" : "성분 정보를 표현한 브랜드 일러스트"} width={480} height={360} /></div>}
  </header>;
}
