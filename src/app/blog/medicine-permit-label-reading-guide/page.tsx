import Link from "next/link";
import type { Metadata } from "next";
import { JsonLd, buildBreadcrumbSchema } from "@/components/seo/json-ld";
import octoberAudit from "../../../../content/data-audits/2026-10-08.json";

const slug = "/blog/medicine-permit-label-reading-guide";
const title = "의약품 허가정보 읽는 순서: 효능·용법·주의사항 확인법";
const description =
  "의약품 상세 페이지와 포장 설명서에서 제품명·품목기준코드, 효능·효과, 용법·용량, 사용상 주의사항과 상호작용을 차례로 확인하는 방법을 설명합니다.";
const sampleMedicines = octoberAudit.publicDelta.datasets.medicines.candidates.map(
  (item) => ({
    name: item.name,
    href: new URL(item.loc).pathname,
  }),
);
const totalNewMedicines = octoberAudit.publicDelta.datasets.medicines.entriesSinceBaseline;
const recentBatchCount = octoberAudit.publicDelta.datasets.medicines.recentBatchCountSince20260930;

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

export default function MedicinePermitLabelReadingGuidePage() {
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "홈", url: "https://todaypharm.kr/" },
    { name: "블로그", url: "https://todaypharm.kr/blog" },
    { name: "의약품 허가정보 읽기", url: `https://todaypharm.kr${slug}` },
  ]);

  return (
    <article className="mx-auto max-w-3xl space-y-10 py-10">
      <JsonLd id="medicine-permit-guide-breadcrumb" data={breadcrumbSchema} />

      <header className="space-y-4">
        <span className="inline-flex rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700">
          로컬 검토용 초안 · 미발행
        </span>
        <h1 className="text-3xl font-black leading-tight text-slate-950 sm:text-4xl">
          {title}
        </h1>
        <p className="text-lg leading-relaxed text-slate-600">
          의약품 정보를 볼 때는 익숙한 브랜드명만 보지 말고 제품명·제조사·품목기준코드를
          먼저 맞춘 뒤 효능·효과, 용법·용량, 사용 전 주의사항, 병용 금기와 이상반응을
          순서대로 확인해야 합니다. 화면에 일부 항목이 비어 있다고 해서 부작용이나 주의사항이
          없다는 뜻으로 해석하면 안 됩니다.
        </p>
        <p className="text-sm text-slate-500">
          데이터 기준 확인:{" "}
          <time dateTime={octoberAudit.observedAtKst}>2026년 10월 8일 14:16 KST</time>
        </p>
      </header>

      <section className="rounded-2xl border border-brand-200 bg-brand-50 p-6 sm:p-8">
        <h2 className="text-xl font-black text-slate-950">허가정보 확인 4단계</h2>
        <ol className="mt-4 grid gap-3 text-sm leading-relaxed text-slate-700 sm:grid-cols-2">
          {[
            "제품명·제조사·품목기준코드와 제형(정제·연고·시럽 등)이 찾으려는 약과 같은지 대조하기",
            "효능·효과에 적힌 허가 범위가 현재 확인하려는 증상 항목과 맞는지 살펴보기",
            "용법·용량에서 연령 구분, 1회량, 1일 횟수, 투여 경로(내복·외용)를 함께 읽기",
            "사용 전 주의사항, 병용 주의 약물·음식, 이상반응과 보관 방법을 복용·사용 전에 확인하기",
          ].map((item, index) => (
            <li key={item} className="rounded-xl bg-white p-4 shadow-sm">
              <strong className="mr-2 text-brand-700">{index + 1}</strong>
              {item}
            </li>
          ))}
        </ol>
      </section>

      <section className="prose prose-lg prose-slate max-w-none">
        <h2>1. 이름이 비슷해도 성분과 제형이 다를 수 있습니다</h2>
        <p>
          같은 계열 이름 뒤에 플러스, 에스, 시럽, 연고, 겔, 스프레이 같은 표현이 붙으면 유효성분이나
          함량, 사용 부위가 달라질 수 있습니다. 약국오늘 의약품 상세 페이지 상단의{" "}
          <strong>품목기준코드</strong>와 제조사명을 제품 포장 또는 의약품안전나라 검색 결과와 먼저
          대조하세요.
        </p>

        <h2>2. 내복약과 외용제는 용법·용량 읽는 법이 다릅니다</h2>
        <p>
          정제·캡슐·산제·시럽 같은 내복약은 연령별 1회 복용량과 복용 간격, 식전·식후 여부를 함께
          봐야 합니다. 반대로 크림·연고·겔·나잘스프레이 같은 외용제는 바르거나 뿌리는 부위, 하루
          사용 횟수, 눈·점막 접촉 주의처럼 적용 부위 제한을 먼저 확인해야 합니다.
        </p>

        <h2>3. 주의사항과 상호작용은 복용 전에 먼저 읽으세요</h2>
        <p>
          허가정보의 주의사항에는 특정 질환자, 임부·수유부, 소아·고령자 주의와 함께 다른 감기약·해열진통제·항히스타민제와의
          중복 복용 경고가 포함됩니다. 감기약이나 진통제처럼 여러 제품에 같은 성분이 들어 있는 경우,
          제품 이름이 달라도 성분이 겹칠 수 있으므로 복용 중인 약 목록을 약사나 의사에게 보여주고
          확인하는 편이 안전합니다.
        </p>

        <h2>4. 빈 칸은 &ldquo;주의사항 없음&rdquo;을 뜻하지 않습니다</h2>
        <p>
          공공 API 응답이나 요약 화면에서 특정 항목이 비어 있거나 짧게 보이는 경우는 원천 데이터
          제공 범위나 항목 구분 때문일 수 있습니다. 빈 필드를 &ldquo;이상반응 없음&rdquo;이나
          &ldquo;누구나 복용 가능&rdquo;으로 해석하지 말고, 실제 제품 첨부문서와 의약품안전나라
          원문을 기준으로 확인하세요.
        </p>
        <p>
          8월 28일 기준선 이후 공개 sitemap 점검에서는 의약품 상세 경로 {totalNewMedicines}개(이 중
          10월 4일 동기화 반영분 {recentBatchCount}개)가 새로 확인되었습니다. 이 숫자는 약국오늘
          데이터베이스에 상세 경로가 생성된 시각을 뜻하며, 식약처의 신규 품목허가일이나 신약 출시일을
          뜻하지 않습니다. 자세한 데이터 집계 경계는{" "}
          <Link href="/blog/data-update-2026-08">공공데이터 업데이트 기록 초안</Link>에서 함께
          살펴볼 수 있습니다.
        </p>

        <h2>최근 반영된 의약품 상세 표본 6개</h2>
        <p>
          아래 목록은 10월 4일 동기화에서 추가된 정제·산제·연고·크림·시럽·스프레이 등 다양한 제형의
          공개 허가정보 표본입니다. 특정 제품 추천이나 효능 우열 비교가 아니며, 품목기준코드와 항목
          구성을 확인하는 참고 예시입니다.
        </p>
        <ul>
          {sampleMedicines.map((item) => (
            <li key={item.href}>
              <Link href={item.href}>{item.name} 공개 허가정보</Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
        <h2 className="text-lg font-black text-slate-950">공식 원문 확인처</h2>
        <ul className="mt-4 space-y-3 text-sm leading-relaxed text-slate-600">
          <li>
            <a
              href="https://nedrug.mfds.go.kr/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-brand-700 underline underline-offset-4"
            >
              식품의약품안전처 의약품안전나라
            </a>{" "}
            — 품목기준코드, 허가사항, 첨부문서(효능·용법·주의사항) 원문 확인
          </li>
          <li>
            <a
              href="https://www.health.kr/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-brand-700 underline underline-offset-4"
            >
              약학정보원 의약품 검색
            </a>{" "}
            — 성분 정보, 낱알 식별, 복약지도 요약 확인
          </li>
          <li>
            <a
              href="https://www.e-gen.or.kr/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-brand-700 underline underline-offset-4"
            >
              응급의료포털 E-Gen
            </a>{" "}
            — 야간·휴일 운영 약국 및 의료기관 확인
          </li>
        </ul>
      </section>

      <section className="rounded-2xl bg-slate-950 p-6 text-white sm:p-8">
        <h2 className="text-xl font-black">복용 전에는 약국에 먼저 문의하세요</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-300">
          전문·일반의약품 구분, 처방전 필요 여부, 실제 취급 및 재고 상황은 제품과 약국마다 다릅니다.
          약국오늘에서 가까운 약국을 찾은 뒤 방문 전 전화로 영업 여부와 상담 가능 여부를 확인하세요.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/wiki"
            className="rounded-full bg-white px-5 py-2.5 text-sm font-black text-slate-950 hover:bg-slate-100"
          >
            의약품·영양제 위키 보기
          </Link>
          <Link
            href="/nearby"
            data-analytics-event="content_to_nearby_click"
            data-source-surface="medicine_permit_guide"
            data-cta-placement="bottom"
            className="rounded-full border border-white/30 px-5 py-2.5 text-sm font-black text-white hover:bg-white/10"
          >
            가까운 약국 찾기
          </Link>
        </div>
      </section>

      <p className="rounded-xl border border-slate-200 bg-white p-4 text-xs leading-relaxed text-slate-500">
        작성 고지: 이 글은 의약품안전나라 공개 허가정보 구조와 약국오늘의 읽기 전용 점검 결과를
        바탕으로 외부 글쓰기 API 없이 직접 작성했습니다. 의학 진단이나 처방, 복약지도를 대신하지
        않으므로 실제 사용 전에는 의사·약사와 상의하세요.
      </p>
    </article>
  );
}
