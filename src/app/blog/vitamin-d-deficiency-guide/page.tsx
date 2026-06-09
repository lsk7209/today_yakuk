import Link from "next/link";
import type { Metadata } from "next";
import { buildArticleJsonLd } from "@/lib/seo";
import { AdSlotTop, AdSlotBottom } from "@/components/ads/AdSlot";

const metaTitle = "비타민D 결핍 신호 7가지와 올바른 보충 방법 | 약국오늘";
const metaDescription =
    "국내 성인의 약 75%가 비타민D 부족 상태입니다. 결핍 증상, 혈중 농도 기준, 용량별 보충 방법, 비타민D3 vs D2 차이를 정리했습니다.";

const faqs = [
    {
        q: "햇볕만으로 비타민D가 충분히 만들어지나요?",
        a: "이론적으로 맑은 날 오전 10시~오후 2시 사이 팔과 다리를 노출한 채 15~30분 직접 햇볕을 쬐면 하루 필요량을 합성할 수 있습니다. 그러나 한국인은 대부분 자외선 차단제를 사용하고, 긴 소매를 입으며, 실내 생활 시간이 길어 실제 합성량은 매우 부족합니다. 특히 겨울철에는 자외선 B(UVB) 강도가 낮아 햇볕만으로는 거의 합성되지 않습니다.",
    },
    {
        q: "비타민D를 과다복용하면 어떤 위험이 있나요?",
        a: "비타민D는 지용성이라 체내에 축적됩니다. 과다복용 시 혈중 칼슘 농도가 높아지는 고칼슘혈증이 발생할 수 있으며, 구역·구토·식욕 저하·피로·신장 결석 등의 증상이 나타날 수 있습니다. 성인 기준 하루 4,000 IU 이하는 일반적으로 안전하며, 그 이상은 의사 지도 아래 혈액 검사를 병행하면서 복용해야 합니다.",
    },
    {
        q: "비타민D는 언제 먹는 게 가장 좋나요?",
        a: "비타민D는 지용성 영양소이므로 식사와 함께 또는 식후에 복용하면 흡수율이 높아집니다. 특히 지방이 포함된 식사(아침이나 점심)와 함께 복용하는 것이 권장됩니다. 시간대보다는 매일 같은 시간에 꾸준히 복용하는 것이 더 중요합니다.",
    },
];

export const metadata: Metadata = {
    title: metaTitle,
    description: metaDescription,
    alternates: { canonical: "/blog/vitamin-d-deficiency-guide" },
    openGraph: {
        title: metaTitle,
        description: metaDescription,
        url: "/blog/vitamin-d-deficiency-guide",
        type: "article",
        images: ["/og-image.svg"],
    },
};

export default function Page() {
    const articleJsonLd = buildArticleJsonLd({
        title: metaTitle,
        description: metaDescription,
        slug: "/blog/vitamin-d-deficiency-guide",
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
                name: "비타민D 결핍 신호 7가지",
                item: "https://todaypharm.kr/blog/vitamin-d-deficiency-guide",
            },
        ],
    };

    const howToJsonLd = {
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: "비타민D 보충 3단계",
        description: metaDescription,
        step: [
            {
                "@type": "HowToStep",
                position: 1,
                name: "혈액검사로 현재 수치 확인",
                text: "25(OH)D 혈청 농도를 혈액검사로 확인하세요. 20 ng/mL 미만은 결핍, 20~29 ng/mL는 부족, 30 ng/mL 이상이 충분한 수치입니다.",
            },
            {
                "@type": "HowToStep",
                position: 2,
                name: "수치에 따른 용량 결정",
                text: "일반 유지 목적은 하루 1,000~2,000 IU, 결핍 상태라면 4,000 IU까지 증량을 고려하세요. 고용량은 의사와 상담 후 결정하세요.",
            },
            {
                "@type": "HowToStep",
                position: 3,
                name: "지방 함유 식사와 함께 복용",
                text: "지용성인 비타민D는 기름기가 있는 식사 직후 복용하면 흡수율이 높아집니다. K2·마그네슘을 함께 섭취하면 체내 활용도가 더 높아집니다.",
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
                    비타민D 결핍 신호 7가지와 올바른 보충 방법
                </h1>
                <p className="text-lg text-gray-600">
                    국내 성인의 약 75%가 비타민D 부족 상태입니다.{" "}
                    <br className="hidden sm:block" />
                    혈중 농도 기준부터 용량 선택까지 핵심을 정리했습니다.
                </p>
            </div>

            <AdSlotTop />

            <section className="rounded-2xl border border-gray-50 bg-white p-6 sm:p-8 shadow-sm space-y-4">
                <h2 className="text-xl font-bold text-gray-900">국내 비타민D 부족 현황</h2>
                <p className="text-sm text-gray-700 leading-relaxed">
                    질병관리청 국민건강영양조사에 따르면 국내 성인 10명 중 7~8명은 혈중 비타민D 농도가
                    부족(20 ng/mL 미만) 상태입니다. 자외선 차단제 사용 증가, 긴 실내 근무 시간, 대기오염,
                    그리고 한국의 위도상 겨울철 자외선 강도 부족이 주요 원인입니다. 비타민D는 칼슘 흡수를
                    돕는 뼈 건강 영양소로만 알려졌지만, 실제로는 면역 조절, 근육 기능, 뇌 신경계, 심혈관
                    건강에도 광범위하게 관여하는 중요한 호르몬성 비타민입니다.
                </p>
                <ul className="mt-4 space-y-2">
                    <li className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
                        <span className="text-brand-600 font-bold mt-0.5 shrink-0">✓</span>
                        이유 없이 자주 피곤하거나 무기력한 분
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
                        <span className="text-brand-600 font-bold mt-0.5 shrink-0">✓</span>
                        감기·호흡기 감염이 유난히 잦은 분
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
                        <span className="text-brand-600 font-bold mt-0.5 shrink-0">✓</span>
                        골다공증 예방이나 뼈 건강이 걱정되는 분
                    </li>
                </ul>
            </section>

            <div className="prose prose-lg prose-brand mx-auto text-gray-700">
                <h3>1. 비타민D 결핍 신호 7가지</h3>
                <p>
                    비타민D 결핍은 서서히 진행되어 초기에는 자각하기 어렵습니다. 다음과 같은 신호가
                    2가지 이상 지속된다면 혈액검사를 받아보는 것이 좋습니다.
                </p>
                <ol>
                    <li>
                        <strong>만성 피로·무기력:</strong> 충분히 자도 피로가 풀리지 않거나 오후에
                        극심한 무기력감이 반복됩니다.
                    </li>
                    <li>
                        <strong>근육통·뼈 통증:</strong> 특별한 운동 없이도 등·허리·다리 근육이 자주
                        뻐근하거나 뼈가 두들기는 듯한 통증이 느껴집니다.
                    </li>
                    <li>
                        <strong>우울감·기분 저하:</strong> 비타민D 수용체는 뇌의 세로토닌 합성에도
                        관여합니다. 결핍 시 계절성 우울증이나 만성 우울감이 심해질 수 있습니다.
                    </li>
                    <li>
                        <strong>면역력 저하:</strong> 감기·독감 등 호흡기 감염이 남들보다 자주 걸리거나
                        회복이 느린 경우 비타민D 결핍을 의심해볼 수 있습니다.
                    </li>
                    <li>
                        <strong>잦은 탈모:</strong> 자가면역 탈모(원형탈모)와 비타민D 결핍 간의 연관성이
                        여러 연구에서 보고되고 있습니다.
                    </li>
                    <li>
                        <strong>상처 회복 지연:</strong> 비타민D는 피부 재생과 감염 방어에 관여하므로
                        결핍 시 상처 회복이 평소보다 느려질 수 있습니다.
                    </li>
                    <li>
                        <strong>잦은 감기·호흡기 감염:</strong> 비타민D는 면역세포(T세포·대식세포)
                        활성화에 직접 관여해, 수치가 낮으면 감기에 더 자주, 더 오래 걸리는 경향이 있습니다.
                    </li>
                </ol>

                <h3>2. 혈중 농도 기준</h3>
                <p>
                    비타민D 상태는 혈청 25(OH)D 농도로 판단합니다. 국내외 지침을 종합하면 다음과 같습니다.
                </p>
                <ul>
                    <li><strong>결핍:</strong> 20 ng/mL(50 nmol/L) 미만 — 보충 치료가 필요한 수준</li>
                    <li><strong>부족:</strong> 20~29 ng/mL — 보충이 권장되는 수준</li>
                    <li><strong>충분:</strong> 30~100 ng/mL — 건강 유지에 적절한 수준</li>
                    <li><strong>과잉(독성):</strong> 150 ng/mL 초과 — 고칼슘혈증 위험</li>
                </ul>
                <p>
                    검사는 동네 내과·가정의학과·건강검진 항목에 포함될 수 있으므로, 결핍이 의심된다면
                    먼저 혈액검사 후 용량을 결정하는 것이 가장 정확합니다.
                </p>

                <h3>3. 비타민D3 vs D2 차이</h3>
                <p>
                    시중 제품은 D3(콜레칼시페롤)와 D2(에르고칼시페롤)로 나뉩니다. D3는 동물성(양모·어류
                    등)에서, D2는 식물성(버섯·효모)에서 유래합니다. 연구에 따르면 D3가 D2보다 혈중 농도를
                    더 효과적으로 높이고 오래 유지하는 것으로 알려져 있습니다. 채식주의자나 비건이라면
                    버섯·이끼 유래 D3 또는 D2를 선택할 수 있습니다.
                </p>

                <h3>4. 권장 용량과 함께 먹으면 좋은 영양소</h3>
                <p>
                    국내 건강기능식품 기준 비타민D 권장 섭취량은 성인 하루 400~800 IU이지만, 실제 결핍
                    예방·개선에는 1,000~2,000 IU가 더 현실적인 기준으로 권고됩니다. 혈중 농도가 결핍
                    수준이라면 의사 지도하에 4,000 IU까지 증량하기도 합니다. 안전 상한선은 성인 기준
                    하루 4,000 IU입니다.
                </p>
                <p>
                    비타민D는 단독보다 다음 영양소와 함께 섭취할 때 시너지 효과가 납니다.
                </p>
                <ul>
                    <li>
                        <strong>비타민K2:</strong> 비타민D로 흡수된 칼슘이 혈관이 아닌 뼈로 이동하도록
                        유도합니다. 골다공증 예방과 혈관 석회화 방지에 중요합니다.
                    </li>
                    <li>
                        <strong>마그네슘:</strong> 비타민D를 활성 형태로 전환하는 효소에 마그네슘이
                        필요합니다. 마그네슘이 부족하면 비타민D 보충 효과가 반감됩니다.
                    </li>
                    <li>
                        <strong>칼슘:</strong> 비타민D는 장에서 칼슘 흡수율을 높이므로 함께 섭취하면
                        뼈 건강 효과가 극대화됩니다.
                    </li>
                </ul>

                <hr />

                <div className="bg-yellow-50 p-5 rounded-xl border border-yellow-100">
                    <h4 className="text-yellow-700 m-0 mb-2">뼈 건강 · 면역 영양제 정보</h4>
                    <p className="m-0 text-gray-700">
                        비타민D 관련 뼈 건강 제품은{" "}
                        <Link
                            href="/wiki?category=bone"
                            className="text-brand-600 underline hover:text-brand-700"
                        >
                            뼈 건강 제품 위키
                        </Link>
                        에서, 면역 영양제는{" "}
                        <Link
                            href="/wiki?category=immune"
                            className="text-brand-600 underline hover:text-brand-700"
                        >
                            면역 영양제 위키
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
                        <h2 className="text-xl font-bold text-gray-900">비타민D 관련 제품 정보</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            뼈 건강·면역력 영양제 제품 비교와 약사 추천을 확인하세요.
                        </p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        <Link
                            href="/wiki?category=bone"
                            className="inline-flex items-center rounded-full bg-brand-600 px-4 py-2 text-sm font-bold text-white shadow-md hover:bg-brand-700 transition-colors"
                        >
                            뼈 건강 제품 보기
                        </Link>
                        <Link
                            href="/wiki?category=immune"
                            className="inline-flex items-center rounded-full border border-brand-600 px-4 py-2 text-sm font-bold text-brand-600 hover:bg-brand-50 transition-colors"
                        >
                            면역 영양제 보기
                        </Link>
                    </div>
                </div>
            </section>

            <section className="rounded-2xl border border-brand-100 bg-brand-50/40 p-6 space-y-3">
                <h2 className="text-lg font-bold text-gray-900">관련 가이드</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                    <Link
                        href="/blog/omega3-selection-guide"
                        className="rounded-xl border border-white bg-white p-4 hover:border-brand-200 hover:shadow-sm transition-all"
                    >
                        <p className="text-sm font-bold text-gray-900 hover:text-brand-700">
                            오메가3 선택 가이드
                        </p>
                        <p className="text-xs text-gray-500 mt-1">알티지형 vs 에틸에스텔형</p>
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
            { href: "/blog/omega3-selection-guide", label: "오메가3 알티지 vs 에틸에스텔 가이드", desc: "형태별 흡수율 차이와 올바른 선택법" },
            { href: "/blog/magnesium-deficiency-guide", label: "마그네슘 부족 신호 6가지", desc: "비타민D와 함께 필요한 마그네슘 보충법" },
            { href: "/blog/lutein-astaxanthin-guide", label: "루테인 vs 아스타잔틴 비교", desc: "자외선 차단 시 눈 건강 영양제 선택" },
            { href: "/wiki?category=bone", label: "뼈/치아 영양제 전체 목록 →", desc: "약국오늘 영양제 위키에서 확인" },
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
