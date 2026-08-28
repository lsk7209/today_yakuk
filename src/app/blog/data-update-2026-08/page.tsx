import Link from "next/link";
import type { Metadata } from "next";
import {
  JsonLd,
  buildBreadcrumbSchema,
} from "@/components/seo/json-ld";
import audit from "../../../../content/data-audits/2026-08-27.json";
import followUpAudit from "../../../../content/data-audits/2026-08-28.json";

const slug = "/blog/data-update-2026-08";
const supplementCount = audit.publicSitemap.datasets.supplements.entriesSinceCutoff;
const medicineCount = audit.publicSitemap.datasets.medicines.entriesSinceCutoff;
const pharmacyCurrent = audit.githubActions.pharmacyCurrent.sourceTotal;
const pharmacyPrevious = audit.githubActions.pharmacyPrevious.sourceTotal;
const pharmacyDelta = pharmacyCurrent - pharmacyPrevious;
const title = "2026년 8월 약국·의약품·건강기능식품 데이터 업데이트";
const description =
  `약국오늘이 2026년 8월 공공데이터 동기화에서 확인한 건강기능식품 ${supplementCount}개, 의약품 ${medicineCount}개 신규 반영과 약국 원천 데이터 변화를 설명합니다.`;
const observedAt = audit.observedAt;
const followUpObservedAt = followUpAudit.observedAtKst;
const followUpEnrichment = followUpAudit.githubActions.autoEnrichment;
const followUpPublicDelta = Object.values(followUpAudit.publicDelta.datasets).reduce(
  (sum, dataset) => sum + dataset.entriesSinceBaseline,
  0,
);
const supplementSamples = audit.publicSitemap.datasets.supplements.candidates.map((item) => ({
  name: item.name,
  href: new URL(item.loc).pathname,
}));
const medicineSamples = audit.publicSitemap.datasets.medicines.candidates.map((item) => ({
  name: item.name,
  href: new URL(item.loc).pathname,
}));

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

export default function DataUpdatePage() {
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "홈", url: "https://todaypharm.kr/" },
    { name: "블로그", url: "https://todaypharm.kr/blog" },
    { name: "데이터 업데이트", url: `https://todaypharm.kr${slug}` },
  ]);

  return (
    <article className="mx-auto max-w-3xl space-y-10 py-10">
      <JsonLd id="data-update-schema" data={breadcrumbSchema} />

      <header className="space-y-4">
        <span className="inline-flex rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700">
          로컬 검토용 초안 · 미발행
        </span>
        <h1 className="text-3xl font-black leading-tight text-slate-950 sm:text-4xl">
          2026년 8월 약국·의약품·건강기능식품 데이터 업데이트
        </h1>
        <p className="text-lg leading-relaxed text-slate-600">
          약국오늘은 공공 API에서 받은 정보를 그대로 쌓는 데서 끝내지 않고, 언제 무엇이
          반영됐는지와 숫자가 실제로 무엇을 뜻하는지 함께 확인합니다. 이번 점검에서는
          건강기능식품과 의약품 상세 페이지가 새로 추가됐고 약국 원천 목록도 소폭
          변했습니다.
        </p>
        <p className="text-sm text-slate-500">
          데이터 확인 시각: <time dateTime={observedAt}>2026년 8월 27일 21:43 KST</time>
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-3" aria-label="업데이트 요약">
        {[
          [`${supplementCount.toLocaleString("ko-KR")}개`, "건강기능식품 상세 페이지", "약국오늘 DB에 새로 생성"],
          [`${medicineCount.toLocaleString("ko-KR")}개`, "의약품 상세 페이지", "약국오늘 DB에 새로 생성"],
          [`+${pharmacyDelta.toLocaleString("ko-KR")}건`, "약국 원천 API 응답", `${pharmacyPrevious.toLocaleString("ko-KR")}건에서 ${pharmacyCurrent.toLocaleString("ko-KR")}건`],
        ].map(([value, label, note]) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-3xl font-black text-brand-700">{value}</p>
            <h2 className="mt-2 text-sm font-bold text-slate-900">{label}</h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">{note}</p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
        <h2 className="text-lg font-bold text-amber-950">먼저 알아둘 해석 기준</h2>
        <p className="mt-3 leading-relaxed text-amber-950/80">
          여기서 &ldquo;새로 반영&rdquo;은 약국오늘 데이터베이스에 새 행과 상세 경로가
          생겼다는 뜻입니다. 식약처의 신규 허가·신고일이나 신제품 출시일을 뜻하지
          않습니다. 약국 원천 응답이 4건 늘어난 사실도 신규 개업 약국이 정확히 4곳이라는
          의미는 아닙니다. 변경·재등록·응답 범위 조정 가능성이 있어 개별 식별자가 없는
          실행 기록만으로는 원인을 단정하지 않습니다.
        </p>
      </section>

      <section className="space-y-5 rounded-2xl border border-sky-200 bg-sky-50 p-6 sm:p-8">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-sky-700">8월 28일 후속 확인</p>
          <h2 className="mt-2 text-xl font-black text-slate-950">새 공개 경로는 0건이었습니다</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-700">
            <time dateTime={followUpObservedAt}>2026년 8월 28일 07:31 KST</time>에 이전
            관측 시각 이후 공개 sitemap을 다시 확인했습니다. 약국·건강기능식품·의약품·블로그
            네 범주의 새 경로 합계는 {followUpPublicDelta}건이므로 별도 &ldquo;신규 데이터&rdquo;
            글은 만들지 않았습니다.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3" aria-label="후속 데이터 점검 요약">
          {[
            [`${followUpPublicDelta}건`, "새 공개 경로", "네 sitemap 범주 합계"],
            [`${followUpEnrichment.attemptedExistingRows}개`, "기존 제품 재확인", "자동 보강 실행 대상"],
            [`${followUpEnrichment.meaningfulEnrichments}건`, "유효 영양성분 보강", "구조화 값이 모두 비어 집계 제외"],
          ].map(([value, label, note]) => (
            <div key={label} className="rounded-xl bg-white p-4 shadow-sm">
              <p className="text-2xl font-black text-sky-800">{value}</p>
              <h3 className="mt-1 text-sm font-bold text-slate-950">{label}</h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">{note}</p>
            </div>
          ))}
        </div>
        <p className="text-sm leading-relaxed text-slate-700">
          자동 보강 로그는 기존 제품 {followUpEnrichment.attemptedExistingRows}개를 성공으로
          표시했지만 각 제품에서 읽은 구조화 영양성분은 {followUpEnrichment.structuredNutritionFactsFound}개였습니다.
          빈 필드를 성분 부재나 유효 보강으로 해석하지 않도록 로컬 수집 코드를 수정했고, 독자가
          같은 오류를 피할 수 있게{" "}
          <Link href="/blog/supplement-label-reading-guide" className="font-black text-sky-900 underline underline-offset-4">
            영양제 라벨 읽는 순서
          </Link>
          를 별도 미발행 초안으로 준비했습니다.
        </p>
      </section>

      <section className="prose prose-lg prose-slate max-w-none">
        <h2>이번 동기화에서 확인한 내용</h2>
        <p>
          8월 23일 시작된 전체 동기화 기록에는 건강기능식품 공공 API 응답 {audit.githubActions.weeklyHealthData.hff.sourceTotal.toLocaleString("ko-KR")}건을 처리했고 실패한 배치가
          없었다고 남아 있습니다. 8월 27일 공개 sitemap을 별도로 관측해 보니 8월 24일 생성 시각으로 표시된 건강기능식품 상세 경로가 {supplementCount.toLocaleString("ko-KR")}개였습니다.
          같은 동기화 기록의 의약품 원천 응답은 {audit.githubActions.weeklyHealthData.medicines.sourceTotal.toLocaleString("ko-KR")}건이며, 공개 sitemap에서 같은 날짜 범위의 새 의약품 상세 경로
          {medicineCount.toLocaleString("ko-KR")}개를 확인했습니다. 실행 시각과 sitemap 시각은 가깝지만 실행별 신규 삽입 건수를 직접 집계한 것은 아닙니다.
        </p>
        <p>
          약국 데이터는 매일 전체 목록을 다시 확인합니다. 8월 26일 실행의 원천 응답은
          {pharmacyPrevious.toLocaleString("ko-KR")}건이었고 8월 27일 실행은 {pharmacyCurrent.toLocaleString("ko-KR")}건이었습니다. 다만 약국 레코드의
          갱신 시각은 전체 동기화 때 함께 바뀌므로, 그 시각만 보고 어느 약국이 새로
          추가됐는지는 판별할 수 없습니다. 약국오늘은 이 차이를 숨기지 않고 &ldquo;최근
          갱신&rdquo;과 &ldquo;신규 개업&rdquo;을 구분합니다.
        </p>

        <h2>새 건강기능식품 정보를 읽는 순서</h2>
        <ol>
          <li>
            <strong>제품명과 품목제조신고번호</strong>가 찾으려는 제품과 같은지 먼저
            확인합니다. 이름이 비슷한 제품은 신고번호가 다를 수 있습니다.
          </li>
          <li>
            <strong>제조사와 공개 원재료명</strong>을 확인합니다. 키워드가 표시되지
            않았다고 해서 특정 원재료가 없거나 제품 안전성이 보장되는 것은 아닙니다.
          </li>
          <li>
            <strong>영양성분과 신고된 기능성 문구</strong>를 제품 포장 표시와 대조합니다.
            사이트의 분류 태그는 탐색을 돕는 표지이며 성분 함량이나 개인별 효과를
            보증하지 않습니다.
          </li>
        </ol>
        <p>
          이번에 생성된 경로의 예시는 아래와 같습니다. 목록은 데이터 반영 여부를
          보여주기 위한 표본이며 제품 추천이나 효능 비교가 아닙니다.
        </p>
        <ul>
          {supplementSamples.map((item) => (
            <li key={item.href}>
              <Link href={item.href}>{item.name} 신고·성분 정보</Link>
            </li>
          ))}
        </ul>

        <h2>새 의약품 정보를 읽는 순서</h2>
        <p>
          의약품 페이지는 의약품안전나라 공개 허가정보의 효능·효과, 용법·용량,
          주의사항, 상호작용, 이상반응과 보관 방법을 항목별로 보여줍니다. 제품명이
          비슷해도 제형과 성분이 다를 수 있으므로 품목기준코드와 제조사를 함께
          확인해야 합니다. 실제 사용 여부와 용량은 페이지 한 줄만 보고 결정하지 말고
          제품 설명서와 약사·의료진의 안내를 우선하세요.
        </p>
        <ul>
          {medicineSamples.map((item) => (
            <li key={item.href}>
              <Link href={item.href}>{item.name} 허가 정보</Link>
            </li>
          ))}
        </ul>

        <h2>약국 정보는 출발 전에 한 번 더 확인하세요</h2>
        <p>
          공공데이터의 약국명·주소·전화번호·운영시간은 후보를 찾는 출발점입니다.
          휴일, 임시 휴무, 조기 마감, 재고와 조제 가능 여부는 현장 사정에 따라 달라질
          수 있습니다. <Link href="/">약국오늘에서 가까운 약국을 찾은 뒤</Link> 전화로
          실제 영업과 필요한 업무가 가능한지 확인하면 헛걸음을 줄일 수 있습니다.
        </p>

        <h2>집계 방법과 한계</h2>
        <p>
          신규 상세 경로 수는 공개 sitemap의 <code>lastmod</code>를 읽기 전용으로
          집계했습니다. 현재 건강기능식품과 의약품 sitemap의 <code>lastmod</code>는
          사이트 DB의 생성 시각을 사용합니다. 약국 sitemap은 마지막 동기화 시각을
          사용하므로 신규 수 집계에는 사용하지 않았습니다. 운영 DB 자격증명이나 원천
          API 키를 읽지 않았고, 데이터 쓰기·콘텐츠 발행·워크플로 재실행도 하지
          않았습니다.
        </p>
        <p>
          재현 자료는 <a href={audit.publicSitemap.indexUrl}>공개 sitemap index</a>,{" "}
          <a href={audit.githubActions.weeklyHealthData.url}>건강기능식품·의약품 동기화 기록</a>,{" "}
          <a href={audit.githubActions.pharmacyPrevious.url}>이전 약국 동기화 기록</a>,{" "}
          <a href={audit.githubActions.pharmacyCurrent.url}>현재 약국 동기화 기록</a>에서
          확인할 수 있습니다.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
        <h2 className="text-lg font-bold text-slate-900">공식 원문 확인처</h2>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-slate-600">
          <li>
            <a href="https://www.foodsafetykorea.go.kr/" target="_blank" rel="noopener noreferrer">
              식품안전나라
            </a>{" "}
            — 건강기능식품 신고·원재료 정보 확인
          </li>
          <li>
            <a href="https://nedrug.mfds.go.kr/" target="_blank" rel="noopener noreferrer">
              의약품안전나라
            </a>{" "}
            — 의약품 허가·용법·주의사항 확인
          </li>
          <li>
            <a href="https://www.e-gen.or.kr/" target="_blank" rel="noopener noreferrer">
              응급의료포털 E-Gen
            </a>{" "}
            — 휴일·야간 의료기관과 약국 정보 확인
          </li>
        </ul>
      </section>

      <section className="rounded-2xl bg-brand-50 p-6 sm:p-8">
        <h2 className="text-xl font-bold text-slate-900">데이터에서 필요한 정보를 찾아보세요</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          제품 상세 정보는 공공자료를 이해하기 쉽게 나눈 참고 정보입니다. 진단이나
          처방을 대신하지 않으며, 복용·사용 전에는 제품 설명서와 전문가 안내를
          확인하세요.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/wiki"
            className="rounded-full bg-brand-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-800"
          >
            영양제·의약품 정보 보기
          </Link>
          <Link
            href="/blog"
            className="rounded-full border border-brand-200 bg-white px-5 py-2.5 text-sm font-bold text-brand-800 hover:border-brand-400"
          >
            블로그 목록
          </Link>
        </div>
      </section>

      <p className="rounded-xl border border-slate-200 bg-white p-4 text-xs leading-relaxed text-slate-500">
        작성 고지: 이 글은 공개 자료와 자동 집계 결과를 바탕으로 AI 도구의 도움을 받아
        정리했습니다. 의료 전문가의 검토나 개인 진료를 대신하지 않습니다.
      </p>
    </article>
  );
}
