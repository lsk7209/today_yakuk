import Link from "next/link";
import type { Metadata } from "next";
import { JsonLd, buildBreadcrumbSchema } from "@/components/seo/json-ld";
import baselineAudit from "../../../../content/data-audits/2026-08-27.json";
import followUpAudit from "../../../../content/data-audits/2026-08-28.json";

const slug = "/blog/supplement-label-reading-guide";
const title = "영양제 라벨 읽는 순서: 기능성·원료명·섭취량";
const description =
  "건강기능식품 라벨에서 제품명과 신고번호, 기능정보, 원료명, 1일 섭취량과 주의사항을 확인하는 순서를 설명합니다.";
const sampleProducts = baselineAudit.publicSitemap.datasets.supplements.candidates.map(
  (item) => ({
    name: item.name,
    href: new URL(item.loc).pathname,
  }),
);
const enrichment = followUpAudit.githubActions.autoEnrichment;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: slug },
  robots: { index: false, follow: false },
  openGraph: {
    title,
    description,
    url: slug,
    type: "article",
    images: ["/og-image.svg"],
  },
};

export default function SupplementLabelReadingGuidePage() {
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "홈", url: "https://todaypharm.kr/" },
    { name: "블로그", url: "https://todaypharm.kr/blog" },
    { name: "영양제 라벨 읽기", url: `https://todaypharm.kr${slug}` },
  ]);

  return (
    <article className="mx-auto max-w-3xl space-y-10 py-10">
      <JsonLd id="supplement-label-breadcrumb" data={breadcrumbSchema} />

      <header className="space-y-4">
        <span className="inline-flex rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700">
          로컬 검토용 초안 · 미발행
        </span>
        <h1 className="text-3xl font-black leading-tight text-slate-950 sm:text-4xl">
          {title}
        </h1>
        <p className="text-lg leading-relaxed text-slate-600">
          제품 앞면의 큰 문구보다 먼저 제품명과 신고번호를 맞추고, 기능정보와 원료명,
          하루 섭취량, 주의사항을 차례로 확인하세요. 약국오늘의 빈 데이터나 분류 태그만으로
          성분의 유무·효과·안전성을 판단하면 안 됩니다.
        </p>
        <p className="text-sm text-slate-500">
          데이터 후속 확인: <time dateTime={followUpAudit.observedAtKst}>2026년 8월 28일 07:31 KST</time>
        </p>
      </header>

      <section className="rounded-2xl border border-brand-200 bg-brand-50 p-6 sm:p-8">
        <h2 className="text-xl font-black text-slate-950">2분 안에 보는 핵심 순서</h2>
        <ol className="mt-4 grid gap-3 text-sm leading-relaxed text-slate-700 sm:grid-cols-2">
          {[
            "제품명·제조사·품목제조신고번호를 같은 제품인지 대조하기",
            "기능정보 문구와 단순 원료명·광고 문구를 구분하기",
            "1일 섭취량과 1회량, 섭취 횟수, 섭취방법을 함께 보기",
            "섭취 시 주의사항·알레르기 관련 표시·유통기한 확인하기",
          ].map((item, index) => (
            <li key={item} className="rounded-xl bg-white p-4 shadow-sm">
              <strong className="mr-2 text-brand-700">{index + 1}</strong>
              {item}
            </li>
          ))}
        </ol>
      </section>

      <section className="prose prose-lg prose-slate max-w-none">
        <h2>1. 제품명과 신고번호부터 맞추세요</h2>
        <p>
          비슷한 이름의 제품도 제조사나 품목제조신고번호가 다를 수 있습니다. 제품 포장과
          약국오늘 상세 페이지, 식품안전나라 검색 결과의 제품명·업소명·신고번호가 같은지
          먼저 대조하세요. 검색 결과의 등록일은 공식 조회 항목이지, 그날 새 제품이 출시됐다는
          뜻으로 단정할 수는 없습니다.
        </p>

        <h2>2. 기능정보와 원료명은 같은 칸이 아닙니다</h2>
        <p>
          원료명에 익숙한 성분명이 보인다는 사실만으로 제품 전체의 기능성이나 개인별 효과를
          확정할 수 없습니다. 반대로 약국오늘 분류 태그는 제품을 찾기 위한 탐색 표지입니다.
          태그가 실제 함량, 신고된 기능성, 효과 또는 안전성을 보증하지 않습니다. 기능 관련
          판단은 제품에 표시된 기능정보와 공식 조회 결과를 기준으로 다시 확인하세요.
        </p>

        <h2>3. 섭취량은 숫자 하나가 아니라 한 묶음으로 읽으세요</h2>
        <p>
          &ldquo;500 mg&rdquo;처럼 눈에 띄는 숫자만 보지 말고 1일 섭취량, 1회 섭취량,
          하루 섭취 횟수와 섭취방법을 함께 읽어야 합니다. 다른 건강기능식품이나 의약품을
          함께 사용 중이라면 라벨을 가져가 약사·의료진에게 보여주는 편이 안전합니다. 이 글은
          개인별 섭취량을 정하거나 복용 결정을 대신하지 않습니다.
        </p>

        <h2>4. 주의사항과 알레르기 관련 표시를 마지막에 넘기지 마세요</h2>
        <p>
          섭취 시 주의사항, 알레르기 관련 표시, 보관방법과 유통기한을 구매 전에 확인하세요.
          임신·수유 중이거나 질환이 있고 의약품을 복용하는 경우에는 일반적인 온라인 설명보다
          제품 표시와 전문가 안내를 우선해야 합니다.
        </p>

        <h2>5. 데이터가 비어 있으면 &ldquo;없음&rdquo;으로 읽지 마세요</h2>
        <p>
          약국오늘의 구조화 영양성분 칸이 비어 있다는 것은 현재 수집·파싱된 값이 표시되지
          않는다는 뜻입니다. 실제 제품에 해당 성분이 없다는 증거가 아닙니다. 8월 27일 기준선
          이후 자동 보강 작업도 기존 제품 {enrichment.attemptedExistingRows}개를 확인했지만,
          파서가 읽은 구조화 영양성분은 {enrichment.structuredNutritionFactsFound}개였습니다.
          따라서 이를 {enrichment.meaningfulEnrichments}건의 유효 보강으로 집계했고, 빈 결과를
          성분 부재로 해석하지 않았습니다.
        </p>
        <p>
          같은 후속 점검에서 약국·건강기능식품·의약품·블로그 공개 sitemap의 기준선 이후 새
          경로도 모두 0건이었습니다. 새 제품이나 새 허가가 확인됐다고 부풀리지 않고,
          기존 데이터의 읽는 방법과 한계를 먼저 보완한 이유입니다. 자세한 집계는{" "}
          <Link href="/blog/data-update-2026-08">2026년 8월 데이터 업데이트 초안</Link>에서
          확인할 수 있습니다.
        </p>

        <h2>연습용 제품 3개</h2>
        <p>
          아래 링크는 제품명·제조사·신고번호와 구조화 필드를 대조하는 연습용 표본입니다.
          추천 순위나 효능 비교가 아닙니다.
        </p>
        <ul>
          {sampleProducts.map((item) => (
            <li key={item.href}>
              <Link href={item.href}>{item.name} 공개 신고정보</Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
        <h2 className="text-lg font-black text-slate-950">공식 원문 확인처</h2>
        <ul className="mt-4 space-y-3 text-sm leading-relaxed text-slate-600">
          <li>
            <a
              href="https://www.foodsafetykorea.go.kr/portal/healthyfoodlife/searchHomeHF.do"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-brand-700 underline underline-offset-4"
            >
              식품안전나라 건강기능식품 검색
            </a>{" "}
            — 제품명, 업소명, 품목제조신고번호와 등록일 대조
          </li>
          <li>
            <a
              href="https://www.mfds.go.kr/brd/m_207/view.do?Data_stts_gubun=C9999&company_cd=&company_nm=&itm_seq_1=0&itm_seq_2=0&multi_itm_seq=0&page=1&seq=15095&srchFr=&srchTo=&srchTp=0&srchWord=%EA%B1%B4%EA%B0%95%EA%B8%B0%EB%8A%A5%EC%8B%9D%ED%92%88"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-brand-700 underline underline-offset-4"
            >
              식품의약품안전처 건강기능식품의 표시기준
            </a>{" "}
            — 현재 적용되는 표시기준 원문 확인
          </li>
        </ul>
      </section>

      <section className="rounded-2xl bg-slate-950 p-6 text-white sm:p-8">
        <h2 className="text-xl font-black">제품 라벨을 들고 확인하면 더 정확합니다</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-300">
          약국오늘 위키에서 신고정보를 찾고, 복용 중인 의약품이나 개인 상태와 함께 상담이
          필요하면 가까운 약국에 먼저 전화해 상담 가능 여부와 영업시간을 확인하세요.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/wiki"
            className="rounded-full bg-white px-5 py-2.5 text-sm font-black text-slate-950 hover:bg-slate-100"
          >
            영양제 신고정보 찾기
          </Link>
          <Link
            href="/nearby"
            data-analytics-event="content_to_nearby_click"
            data-source-surface="supplement_label_guide"
            data-cta-placement="bottom"
            className="rounded-full border border-white/30 px-5 py-2.5 text-sm font-black text-white hover:bg-white/10"
          >
            가까운 약국 찾기
          </Link>
        </div>
      </section>

      <p className="rounded-xl border border-slate-200 bg-white p-4 text-xs leading-relaxed text-slate-500">
        작성 고지: 이 글은 위 공개자료와 약국오늘의 읽기 전용 점검 결과를 바탕으로 현재
        Codex 세션에서 직접 작성했습니다. 외부 글쓰기 API를 사용하지 않았으며, 의료 전문가의
        검토나 개인 진료를 대신하지 않습니다.
      </p>
    </article>
  );
}
