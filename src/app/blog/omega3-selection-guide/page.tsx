import Link from "next/link";
import type { Metadata } from "next";
import { buildArticleJsonLd } from "@/lib/seo";
import { AdSlotTop, AdSlotBottom } from "@/components/ads/AdSlot";

const metaTitle =
    "오메가3 선택 가이드: 알티지형 vs 에틸에스텔형, 어떤 게 내 몸에 맞을까 | 약국오늘";
const metaDescription =
    "오메가3 제품 선택 시 가장 헷갈리는 알티지(rTG)형과 에틸에스텔(EE)형의 차이점, 흡수율 비교, 용량과 복용법, 부작용 주의사항을 정리했습니다.";

const faqs = [
    {
        q: "알티지(rTG)형이 무조건 더 좋은 건가요?",
        a: "알티지형은 흡수율이 에틸에스텔형보다 약 2~3배 높다고 알려져 있지만 가격도 그만큼 높습니다. 심혈관 질환 위험이 높거나 중성지방 수치가 높은 분께는 알티지형이 유리하지만, 일반 건강 유지 목적이라면 에틸에스텔형도 충분히 효과적입니다. 본인의 목적과 예산을 함께 고려해 선택하세요.",
    },
    {
        q: "오메가3는 왜 식후에 복용해야 하나요?",
        a: "오메가3는 지용성 영양소입니다. 식사 후 위장에 음식물이 있을 때 복용하면 담즙 분비가 촉진되어 흡수율이 크게 높아집니다. 공복에 복용하면 흡수율이 떨어질 뿐 아니라 속이 불편하거나 생선 냄새 트림이 심해질 수 있습니다.",
    },
    {
        q: "임산부도 오메가3를 복용할 수 있나요?",
        a: "DHA는 태아의 뇌와 눈 발달에 중요한 영양소로 임산부에게도 권장됩니다. 다만 EPA 함량이 높은 제품보다 DHA 비율이 높은 임산부 전용 오메가3를 선택하고, 하루 DHA 200~300 mg 섭취를 목표로 하세요. 복용 전 산부인과 의사나 약사와 상담하는 것이 안전합니다.",
    },
];

export const metadata: Metadata = {
    title: metaTitle,
    description: metaDescription,
    alternates: { canonical: "/blog/omega3-selection-guide" },
    openGraph: {
        title: metaTitle,
        description: metaDescription,
        url: "/blog/omega3-selection-guide",
        type: "article",
        images: ["/og-image.svg"],
    },
};

export default function Page() {
    const articleJsonLd = buildArticleJsonLd({
        title: metaTitle,
        description: metaDescription,
        slug: "/blog/omega3-selection-guide",
    });

    const faqJsonLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
            "@type": "Question",
            name: faq.q,
            acceptedAnswer: { "@type": "Answer", text: faq.a },
        })),
    };

    const breadcrumbJsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            { "@type": "ListItem", position: 1, name: "홈", item: "https://todaypharm.kr/" },
            { "@type": "ListItem", position: 2, name: "블로그", item: "https://todaypharm.kr/blog" },
            {
                "@type": "ListItem",
                position: 3,
                name: "오메가3 선택 가이드",
                item: "https://todaypharm.kr/blog/omega3-selection-guide",
            },
        ],
    };

    const howToJsonLd = {
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: "오메가3 제품 고르는 3단계",
        description: metaDescription,
        step: [
            {
                "@type": "HowToStep",
                position: 1,
                name: "EPA+DHA 함량 확인",
                text: "제품 뒷면 기능성분 표시에서 EPA+DHA 합계가 하루 500 mg 이상인지 확인하세요. 총 중량이 아닌 순수 EPA+DHA 함량 기준입니다.",
            },
            {
                "@type": "HowToStep",
                position: 2,
                name: "알티지형 vs 에틸에스텔형 선택",
                text: "심혈관 위험 개선이 목적이라면 흡수율이 높은 알티지(rTG)형을, 일반 건강 유지 목적이라면 에틸에스텔(EE)형을 선택하세요.",
            },
            {
                "@type": "HowToStep",
                position: 3,
                name: "원료 출처 및 산패 여부 확인",
                text: "소형 어류(멸치·정어리·고등어) 유래 원료가 중금속 오염 위험이 낮습니다. 개봉 후 강한 생선 냄새가 나면 산패를 의심하고 교체하세요.",
            },
        ],
    };

    return (
        <div className="mx-auto max-w-3xl space-y-10 py-10">
            <div className="space-y-4 text-center">
                <span className="inline-block rounded-full bg-brand-100 px-3 py-1 text-xs font-bold text-brand-600">
                    영양제 선택 가이드
                </span>
                <h1 className="text-3xl font-extrabold leading-tight text-gray-900 sm:text-4xl">
                    오메가3 선택 가이드: 알티지형 vs 에틸에스텔형
                </h1>
                <p className="text-lg text-gray-600">
                    어떤 형태가 내 몸에 맞을까? 흡수율부터 복용법까지 핵심만 정리했습니다.
                </p>
            </div>

            <AdSlotTop />

            <section className="rounded-2xl border border-gray-50 bg-white p-6 sm:p-8 shadow-sm space-y-4">
                <h2 className="text-xl font-bold text-gray-900">오메가3의 주요 효능</h2>
                <p className="text-sm text-gray-700 leading-relaxed">
                    오메가3 지방산(EPA·DHA)은 혈중 중성지방 감소, 심혈관 건강 지원, 눈 건강(DHA), 뇌
                    기능 유지(DHA) 등 다양한 기능성이 식약처와 해외 연구를 통해 확인된 영양소입니다. 특히
                    EPA는 혈전 생성 억제와 혈관 염증 완화에, DHA는 망막과 뇌세포 구성 성분으로 중요하게
                    작용합니다. 국내 건강기능식품 기준상 혈중 중성지방 개선을 위해서는 하루 EPA+DHA 합계
                    0.5~2 g 섭취가 권고됩니다.
                </p>
                <ul className="mt-4 space-y-2">
                    <li className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
                        <span className="text-brand-600 font-bold mt-0.5 shrink-0">✓</span>
                        혈중 중성지방 수치가 높아 심혈관 위험이 걱정되는 분
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
                        <span className="text-brand-600 font-bold mt-0.5 shrink-0">✓</span>
                        눈 피로·황반 건강이 염려되는 분
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
                        <span className="text-brand-600 font-bold mt-0.5 shrink-0">✓</span>
                        임산부 또는 어린이 두뇌 발달을 지원하고 싶은 분
                    </li>
                </ul>
            </section>

            <div className="prose prose-lg prose-brand mx-auto text-gray-700">
                <h3>1. 알티지형 vs 에틸에스텔형: 핵심 차이점</h3>
                <p>
                    시중 오메가3 제품은 크게 알티지(rTG, 재에스터화 트리글리세리드)형과 에틸에스텔(EE,
                    Ethyl Ester)형으로 나뉩니다. 에틸에스텔형은 정제 과정에서 만들어지는 형태로 가격이
                    저렴하지만 흡수율이 상대적으로 낮습니다. 알티지형은 에틸에스텔 상태의 오메가3를 다시
                    자연 트리글리세리드 구조로 전환한 것으로, 체내 흡수율이 에틸에스텔형 대비 약 2~3배
                    높다는 연구 결과가 있습니다. 다만 알티지형은 제조 단가가 높아 가격이 비쌉니다.
                </p>
                <p>
                    흡수율 외에도 혈중 오메가3 농도를 높이는 속도에서 차이가 납니다. 알티지형은 식후
                    4~6시간 혈중 EPA+DHA 농도가 에틸에스텔형보다 유의미하게 높게 유지됩니다.
                    심혈관 질환 고위험군, 중성지방이 매우 높은 분, 임산부처럼 DHA가 충분히 공급되어야
                    하는 경우에는 알티지형이 더 유리합니다. 반면 일반적인 건강 보조 목적이라면
                    에틸에스텔형을 꾸준히 복용하는 것만으로도 충분한 효과를 기대할 수 있습니다.
                </p>

                <h3>2. 하루 섭취 권장량: EPA+DHA 합계 기준</h3>
                <p>
                    식약처 건강기능식품 기준으로 혈중 중성지방 개선 목적의 권장 섭취량은 하루 EPA+DHA
                    합계 500~2,000 mg입니다. 일반 건강 유지에는 500~1,000 mg이 적절하며, 중성지방이
                    높거나 심혈관 고위험군에게는 의사 처방하에 하루 2~4 g까지 사용되기도 합니다.
                    제품 라벨에서 총 중량(예: 1,000 mg 캡슐)과 순수 EPA+DHA 함량(예: EPA 600 mg + DHA
                    260 mg)을 반드시 구분해서 확인하세요. 총 중량 중 오메가3 순도가 낮은 제품은 실제
                    유효 성분 함량이 훨씬 적을 수 있습니다.
                </p>

                <h3>3. 복용 시 주의사항</h3>
                <ul>
                    <li>
                        <strong>항응고제 병용:</strong> 오메가3는 혈소판 응집을 억제하는 작용이 있어
                        와파린, 아스피린 등 항응고·항혈소판제를 복용 중이라면 의사·약사와 반드시 상담
                        후 복용하세요. 출혈 시간이 늘어날 수 있습니다.
                    </li>
                    <li>
                        <strong>수술 전 주의:</strong> 큰 수술을 앞두고 있다면 최소 2주 전부터 고용량
                        오메가3 복용을 중단하는 것이 일반적인 권고입니다. 담당 의사에게 복용 중임을
                        반드시 알리세요.
                    </li>
                    <li>
                        <strong>산패 여부 확인:</strong> 개봉 후 강한 생선 냄새가 나거나 색이 진해졌다면
                        산패된 것일 수 있으므로 교체를 권장합니다. 직사광선을 피해 서늘한 곳에
                        보관하세요.
                    </li>
                </ul>

                <h3>4. 오메가3 제품 고르는 3단계</h3>
                <ol>
                    <li>
                        <strong>EPA+DHA 함량 확인:</strong> 제품 뒷면 &ldquo;기능성분&rdquo; 표시에서
                        EPA+DHA 합계를 확인하세요. 1회 섭취량 기준 500 mg 이상이 권장 기준입니다.
                    </li>
                    <li>
                        <strong>형태 선택:</strong> 목적에 맞게 알티지형 또는 에틸에스텔형을 고르세요.
                        가격 대비 효율을 따진다면 에틸에스텔형도 훌륭한 선택입니다.
                    </li>
                    <li>
                        <strong>원료 출처 확인:</strong> 소형 어류(멸치·정어리·고등어·크릴새우) 유래
                        원료가 중금속 오염 가능성이 낮아 선호됩니다. 제조사 원료 공개 여부도 신뢰도의
                        지표가 됩니다.
                    </li>
                </ol>

                <hr />

                <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                    <h4 className="text-blue-700 m-0 mb-2">오메가3 제품 정보</h4>
                    <p className="m-0 text-gray-700">
                        더 다양한 오메가3 제품 비교 정보가 궁금하다면{" "}
                        <Link
                            href="/wiki?category=omega3"
                            className="text-brand-600 underline hover:text-brand-700"
                        >
                            오메가3 제품 위키
                        </Link>
                        에서 확인하세요.
                    </p>
                </div>
            </div>

            <section className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900">자주 묻는 질문</h2>
                <div className="space-y-3">
                    {faqs.map((faq, i) => (
                        <div
                            key={i}
                            className="rounded-2xl border border-gray-100 bg-gray-50 p-5 space-y-2"
                        >
                            <p className="text-sm font-bold text-gray-900">Q. {faq.q}</p>
                            <p className="text-sm text-gray-600 leading-relaxed">A. {faq.a}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="rounded-2xl bg-brand-50 p-6 sm:p-8 mt-10">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">오메가3 관련 제품 정보</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            성분별 제품 비교와 약사 추천 정보를 확인하세요.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link
                            href="/wiki?category=omega3"
                            className="inline-flex items-center rounded-full bg-brand-600 px-4 py-2 text-sm font-bold text-white shadow-md hover:bg-brand-700 transition-colors"
                        >
                            오메가3 제품 보기
                        </Link>
                    </div>
                </div>
            </section>

            <section className="rounded-2xl border border-brand-100 bg-brand-50/40 p-6 space-y-3">
                <h2 className="text-lg font-bold text-gray-900">관련 가이드</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                    <Link
                        href="/blog/vitamin-d-deficiency-guide"
                        className="rounded-xl border border-white bg-white p-4 hover:border-brand-200 hover:shadow-sm transition-all"
                    >
                        <p className="text-sm font-bold text-gray-900 hover:text-brand-700">
                            비타민D 결핍 신호 7가지
                        </p>
                        <p className="text-xs text-gray-500 mt-1">결핍 진단과 보충 방법</p>
                    </Link>
                    <Link
                        href="/blog/probiotics-selection-guide"
                        className="rounded-xl border border-white bg-white p-4 hover:border-brand-200 hover:shadow-sm transition-all"
                    >
                        <p className="text-sm font-bold text-gray-900 hover:text-brand-700">
                            유산균 선택 가이드
                        </p>
                        <p className="text-xs text-gray-500 mt-1">균주 종류별 선택 기준</p>
                    </Link>
                </div>
            </section>

      <section className="rounded-2xl border border-gray-100 bg-gray-50 p-6 space-y-4">
        <h2 className="text-lg font-bold text-gray-900">함께 읽으면 좋은 글</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { href: "/blog/probiotics-selection-guide", label: "유산균 균주 선택 가이드", desc: "목적별 균주 선택법과 CFU 해석" },
            { href: "/blog/vitamin-d-deficiency-guide", label: "비타민D 결핍 신호 7가지", desc: "결핍 증상과 올바른 보충 방법" },
            { href: "/blog/lutein-astaxanthin-guide", label: "루테인 vs 아스타잔틴 비교", desc: "눈 건강 영양제 선택 기준 정리" },
            { href: "/wiki?category=omega3", label: "오메가3 제품 전체 목록 →", desc: "약국오늘 영양제 위키에서 확인" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-xl border border-gray-200 bg-white p-4 hover:shadow-md hover:border-brand-200 transition-all space-y-1"
            >
              <p className="font-bold text-gray-900 text-sm">{item.label}</p>
              <p className="text-xs text-gray-500">{item.desc}</p>
            </Link>
          ))}
        </div>
      </section>

            <AdSlotBottom />

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />
        </div>
    );
}
