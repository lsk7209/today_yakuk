import Link from "next/link";
import type { Metadata } from "next";
import { JsonLd, buildBreadcrumbSchema } from "@/components/seo/json-ld";
import scheduleAudit from "../../../../content/schedule-audits/2026-08-28.json";

const slug = "/blog/supplement-additives-label-guide";
const title = "영양제 첨가물 표시 읽는 법: 원료·기능성분과 구분하기";
const description =
  "건강기능식품의 기능정보·원료명·영양정보와 첨가물 관련 표시를 구분하고, 자료 없음이나 키워드 미확인을 성분 부재로 오해하지 않는 방법을 설명합니다.";

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

const signalRows = [
  {
    label: "관련 키워드 표시",
    meaning: "공개 원재료 텍스트에서 약국오늘이 확인 대상으로 둔 표현이 보였다는 뜻",
    notMeaning: "공식 첨가물 분류, 함량, 위해성 또는 개인별 적합성 판정",
  },
  {
    label: "지정 키워드 미확인",
    meaning: "현재 확인 범위에서 지정한 표현을 찾지 못했다는 뜻",
    notMeaning: "해당 첨가물이 없거나 제품이 무첨가·안전하다는 증명",
  },
  {
    label: "자료 없음",
    meaning: "화면에서 해석할 구조화 정보가 현재 없다는 뜻",
    notMeaning: "원료가 없거나 표시 의무가 없다는 결론",
  },
];

export default function SupplementAdditivesLabelGuidePage() {
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "홈", url: "https://todaypharm.kr/" },
    { name: "블로그", url: "https://todaypharm.kr/blog" },
    {
      name: "영양제 첨가물 표시 읽기",
      url: "https://todaypharm.kr" + slug,
    },
  ]);

  return (
    <article className="mx-auto max-w-3xl space-y-10 py-10">
      <JsonLd id="supplement-additives-breadcrumb" data={breadcrumbSchema} />

      <header className="space-y-4">
        <span className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800">
          로컬 검토용 초안 · 미발행
        </span>
        <h1 className="text-3xl font-black leading-tight text-slate-950 sm:text-4xl">
          {title}
        </h1>
        <p className="text-lg leading-relaxed text-slate-600">
          &ldquo;지정 키워드 미확인&rdquo;이나 &ldquo;자료 없음&rdquo;은 첨가물이 없다는
          뜻이 아닙니다. 먼저 제품을 정확히 맞춘 뒤 기능정보, 원료명, 영양정보와 첨가물 관련
          표현을 각각 다른 정보로 읽어야 합니다.
        </p>
        <p className="text-sm leading-relaxed text-slate-500">
          검토 목표 슬롯:{" "}
          <time dateTime={scheduleAudit.nextCandidateSlot.publishAtKst}>
            2026년 9월 22일 09:00 KST
          </time>
          {" "}· 실제 예약이 아닌 다음 후보 시각입니다.
        </p>
      </header>

      <section className="rounded-2xl border border-brand-200 bg-brand-50 p-6 sm:p-8">
        <h2 className="text-xl font-black text-slate-950">먼저 답부터</h2>
        <p className="mt-3 leading-relaxed text-slate-700">
          건강기능식품 라벨에서 기능정보는 신고된 기능성 내용을 확인하는 영역이고, 원료명은
          제품에 사용된 원료를 확인하는 영역입니다. 영양정보의 수치와 광고 문구도 목적이
          다릅니다. 한 영역의 표현만 보고 제품 전체의 기능, 안전성 또는 &ldquo;무첨가&rdquo;를
          판단하지 마세요.
        </p>
      </section>

      <section className="prose prose-lg prose-slate max-w-none">
        <h2>1. 제품명·업소명·신고번호를 먼저 맞추세요</h2>
        <p>
          이름이 비슷한 제품이라도 제조업소나 품목제조신고번호가 다를 수 있습니다. 포장과
          식품안전나라 검색 결과에서 제품명, 업소명, 신고번호를 먼저 대조한 다음 원료 표시를
          읽으세요. 다른 제품의 원료 정보를 같은 제품의 정보로 오인하면 이후 비교도 모두
          어긋납니다.
        </p>

        <h2>2. 기능정보·원료명·영양정보를 한 칸처럼 읽지 마세요</h2>
        <div className="not-prose my-6 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-900">
              <tr>
                <th className="px-4 py-3 font-black">구분</th>
                <th className="px-4 py-3 font-black">확인 목적</th>
                <th className="px-4 py-3 font-black">단독으로 판단하면 안 되는 것</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white text-slate-600">
              <tr>
                <td className="px-4 py-3 font-bold text-slate-900">기능정보</td>
                <td className="px-4 py-3">제품에 표시된 기능성 내용 확인</td>
                <td className="px-4 py-3">개인별 효과·치료 효과</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-bold text-slate-900">원료명</td>
                <td className="px-4 py-3">사용 원료와 표시 문구 확인</td>
                <td className="px-4 py-3">원료별 함량·유해성·우월성</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-bold text-slate-900">영양정보</td>
                <td className="px-4 py-3">표시된 1일 섭취량 기준 수치 확인</td>
                <td className="px-4 py-3">빈 필드만으로 성분 부재 판단</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-bold text-slate-900">앞면 강조 문구</td>
                <td className="px-4 py-3">제품이 강조하는 특징 파악</td>
                <td className="px-4 py-3">공식 기능정보·전체 원료의 대체</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          &ldquo;부원료&rdquo;와 &ldquo;첨가물&rdquo;도 문맥 없이 같은 말로 취급하지 마세요.
          포장에 적힌 전체 원재료명과 현재 적용되는 표시기준을 함께 확인해야 합니다. 특정
          표현이 눈에 띈다는 이유만으로 함량, 역할 또는 건강 영향을 추정할 수 없습니다.
        </p>

        <h2>3. 약국오늘의 세 가지 신호는 이렇게 읽으세요</h2>
        <p>
          제품 상세의 첨가물 신호는 공개 원재료 텍스트를 읽기 쉽게 보조하는 화면입니다. 공식
          시험 결과나 안전성 등급이 아닙니다.
        </p>
      </section>

      <section className="grid gap-4">
        {signalRows.map((row) => (
          <div key={row.label} className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="font-black text-slate-950">{row.label}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              <strong className="text-slate-900">뜻:</strong> {row.meaning}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-rose-700">
              <strong>뜻하지 않는 것:</strong> {row.notMeaning}
            </p>
          </div>
        ))}
      </section>

      <section className="prose prose-lg prose-slate max-w-none">
        <h2>4. &ldquo;무첨가&rdquo;는 무엇이 빠졌다는 말인지 확인하세요</h2>
        <p>
          앞면에 &ldquo;무첨가&rdquo;가 보이면 그 표현이 어떤 성분이나 범위를 가리키는지 포장
          전체에서 확인하세요. 한 성분에 관한 문구를 모든 첨가물이 없다는 뜻으로 넓혀 읽지
          않는 것이 핵심입니다. 사이트에서 지정 키워드를 찾지 못한 경우도 마찬가지입니다.
        </p>
        <p>
          첨가물 기준과 제품 표시는 개정될 수 있으므로 오래된 요약 글보다 국가법령정보센터와
          식품의약품안전처의 현재 원문을 우선하세요. 이 글은 첨가물의 안전·위험 순위를 만들거나
          특정 제품을 추천하지 않습니다.
        </p>

        <h2>5. 약국에 문의할 때는 판단보다 자료를 준비하세요</h2>
        <ul>
          <li>제품 앞·뒷면과 전체 원재료명이 보이는 사진</li>
          <li>제품명, 제조업소명, 품목제조신고번호</li>
          <li>현재 사용 중인 의약품과 다른 건강기능식품 목록</li>
          <li>확인하려는 특정 원료나 알레르기 관련 표시</li>
        </ul>
        <p>
          전화로는 제품 재고나 개인별 복용 결정을 확정해 달라고 하기보다, 라벨을 가져가 상담할
          수 있는지와 현재 영업 여부를 먼저 확인하세요. 실제 재고와 상담 가능 여부는 약국별로
          달라질 수 있습니다. 문장을 정리하기 어렵다면{" "}
          <Link href="/guide/call-scripts">약국 전화 문의 문장 예시</Link>를 참고할 수 있습니다.
        </p>
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
            — 제품명, 업소명, 신고번호와 등록일 대조
          </li>
          <li>
            <a
              href="https://law.go.kr/LSW/admRulInfoP.do?admRulSeq=2100000263562&chrClsCd=010201"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-brand-700 underline underline-offset-4"
            >
              국가법령정보센터 건강기능식품의 표시기준
            </a>{" "}
            — 현재 시행 중인 표시 항목과 개정 원문 확인
          </li>
          <li>
            <a
              href="https://impfood.mfds.go.kr/CFBDD02F01"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-brand-700 underline underline-offset-4"
            >
              식품의약품안전처 식품첨가물의 기준 및 규격 고시전문
            </a>{" "}
            — 최신 식품첨가물 기준·규격 고시 확인
          </li>
        </ul>
      </section>

      <section className="rounded-2xl bg-slate-950 p-6 text-white sm:p-8">
        <h2 className="text-xl font-black">제품명부터 맞춘 뒤 라벨을 함께 확인하세요</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-300">
          먼저 영양제 신고정보에서 같은 제품인지 확인하고, 기본 라벨 순서가 헷갈리면 기존
          라벨 가이드를 읽어보세요. 개인 상황과 함께 확인이 필요하면 방문 전 가까운 약국의
          영업시간과 상담 가능 여부를 전화로 확인하는 편이 좋습니다.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/wiki"
            className="rounded-full bg-white px-5 py-2.5 text-sm font-black text-slate-950 hover:bg-slate-100"
          >
            영양제 신고정보 찾기
          </Link>
          <Link
            href="/blog/supplement-label-reading-guide"
            className="rounded-full border border-white/30 px-5 py-2.5 text-sm font-black text-white hover:bg-white/10"
          >
            라벨 읽는 기본 순서
          </Link>
          <Link
            href="/nearby"
            data-analytics-event="content_to_nearby_click"
            data-source-surface="supplement_additives_guide"
            data-cta-placement="bottom"
            className="rounded-full border border-white/30 px-5 py-2.5 text-sm font-black text-white hover:bg-white/10"
          >
            가까운 약국 찾기
          </Link>
        </div>
      </section>

      <p className="rounded-xl border border-slate-200 bg-white p-4 text-xs leading-relaxed text-slate-500">
        작성 고지: 이 글은 위 공식 자료와 약국오늘 화면의 표시 계약을 바탕으로 현재 Codex
        세션에서 직접 작성했습니다. 외부 글쓰기 API를 사용하지 않았으며 의료 전문가의 검토,
        개인 진료 또는 제품 안전성 평가를 대신하지 않습니다.
      </p>
    </article>
  );
}
