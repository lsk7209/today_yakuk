import Link from "next/link";
import type { Metadata } from "next";
import { buildArticleJsonLd } from "@/lib/seo";
import { AdSlotTop, AdSlotBottom } from "@/components/ads/AdSlot";

const metaTitle = "비타민D 결핍 신호 7가지와 올바른 보충 방법";
const metaDescription =
    "비타민D 결핍이 의심되는 신호, 혈중 농도 기준, 섭취 기준과 상한, 비타민D3 vs D2 차이를 정리했습니다. 복용 전 의사·약사와 상담하세요.";

const faqs = [
    {
        q: "햇볕만으로 비타민D가 충분히 만들어지나요?",
        a: "햇볕을 쬐면 피부에서 비타민D가 만들어지지만, 합성량은 계절·시간대·피부색·자외선 차단제 사용 여부에 따라 크게 달라 일정 시간으로 단정하기 어렵습니다. 한국인은 대부분 자외선 차단제를 사용하고, 긴 소매를 입으며, 실내 생활 시간이 길어 실제 합성량이 부족할 수 있습니다. 특히 겨울철에는 자외선 B(UVB) 강도가 낮아 햇볕만으로는 충분하지 않을 수 있습니다.",
    },
    {
        q: "비타민D를 과다복용하면 어떤 위험이 있나요?",
        a: "비타민D는 지용성이라 체내에 축적됩니다. 과다복용 시 혈중 칼슘 농도가 높아지는 고칼슘혈증이 발생할 수 있으며, 구역·구토·식욕 저하·피로·신장 결석 등의 증상이 나타날 수 있습니다. 한국인 영양소 섭취기준의 성인 상한섭취량은 하루 100 μg(4,000 IU)이며, 그 이상은 의사 지도 아래 혈액 검사를 병행해야 합니다.",
    },
    {
        q: "비타민D는 언제 먹는 게 가장 좋나요?",
        a: "비타민D는 지용성 영양소이므로 식사와 함께 복용하면 흡수에 도움이 된다고 알려져 있습니다. 복용 시간과 방법은 제품 라벨을 따르세요.",
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
                text: "용량은 제품 라벨과 의사·약사 안내를 따르세요. 성인 상한섭취량은 하루 4,000 IU(100 μg)이며, 결핍 치료용 고용량은 반드시 의사가 정합니다.",
            },
            {
                "@type": "HowToStep",
                position: 3,
                name: "지방 함유 식사와 함께 복용",
                text: "지용성인 비타민D는 식사와 함께 복용하면 흡수에 도움이 된다고 알려져 있습니다. 다른 영양제와 함께 먹어도 되는지는 약사에게 확인하세요.",
            },
        ],
    };

    return (
        <div className="mx-auto max-w-3xl space-y-10 py-10">
            <div className="space-y-4 text-center">
                <span className="inline-block rounded-full bg-brand-100 px-3 py-1 text-xs font-bold text-brand-600">
                    영양제 선택 가이드
                </span>
                <p className="city-eyebrow">HEALTH JOURNAL / ARTICLE</p>
                <h1 className="text-3xl font-extrabold leading-tight text-gray-900 sm:text-4xl">
                    비타민D 결핍 신호 7가지와 올바른 보충 방법
                </h1>
                <p className="text-lg text-gray-600">
                    혈중 농도 기준부터 섭취 기준과 상한까지 핵심을 정리했습니다.
                </p>
            </div>

            <AdSlotTop />

            <section className="city-card border bg-white p-6 sm:p-8 space-y-4">
                <h2 className="text-xl font-bold text-gray-900">국내 비타민D 부족 현황</h2>
                <p className="text-sm text-gray-700 leading-relaxed">
                    자외선 차단제 사용, 긴 실내 근무 시간, 겨울철 낮은 자외선 강도 등으로 비타민D가
                    부족해질 수 있습니다. 부족 여부는 혈액검사로 확인합니다. 비타민D는 칼슘 흡수를
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
                        일부 연구가 있으나 원인은 다양하므로 탈모가 계속되면 진료를 받으세요.
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
                    비타민D 상태는 혈청 25(OH)D 농도로 판단합니다. 아래는 흔히 쓰이는 기준이며 학회·검사기관마다 다를 수 있으므로 해석은 의사에게 맡기세요.
                </p>
                <ul>
                    <li><strong>결핍:</strong> 20 ng/mL(50 nmol/L) 미만</li>
                    <li><strong>부족:</strong> 20~29 ng/mL</li>
                    <li><strong>충분:</strong> 30 ng/mL 이상(기관에 따라 20 ng/mL 이상을 충분으로 봄)</li>
                </ul>
                <p>
                    검사는 동네 내과·가정의학과·건강검진 항목에 포함될 수 있으므로, 결핍이 의심된다면
                    먼저 혈액검사 후 용량을 결정하는 것이 가장 정확합니다.
                </p>

                <h3>3. 비타민D3 vs D2 차이</h3>
                <p>
                    시중 제품은 D3(콜레칼시페롤)와 D2(에르고칼시페롤)로 나뉩니다. D3는 동물성(양모·어류
                    등)에서, D2는 식물성(버섯·효모)에서 유래합니다. 어느 쪽이 더 적합한지는 개인 상태에 따라
                    다르므로 약사와 상담하세요. 채식주의자나 비건이라면 식물성 원료 제품도 있습니다.
                </p>

                <h3>4. 권장 용량과 함께 먹으면 좋은 영양소</h3>
                <p>
                    한국인 영양소 섭취기준(보건복지부·한국영양학회)에서 성인(12~64세)의 비타민D
                    충분섭취량은 하루 10 μg(400 IU), 상한섭취량은 하루 100 μg(4,000 IU)입니다. 연령별
                    기준은 원문 표에서 확인하세요. 결핍이 확인된 경우의 용량은 의사가 정합니다.
                </p>
                <p>
                    비타민D는 다음 영양소와 함께 언급되는 경우가 많습니다. 각 성분의 복용 여부와 용량은 개인 상태에 따라 다르므로 약사와 상담하세요.
                </p>
                <ul>
                    <li>
                        <strong>비타민K2:</strong> 칼슘의 뼈 대사에
                        관여한다고 알려져 있습니다. 항응고제(와파린) 복용 중이라면 비타민K 섭취 전에 반드시 의사·약사에게 확인하세요.
                    </li>
                    <li>
                        <strong>마그네슘:</strong> 비타민D를 활성 형태로 전환하는 효소에 마그네슘이
                        필요합니다. 마그네슘 부족 여부는 혈액검사와 진료로 확인하세요.
                    </li>
                    <li>
                        <strong>칼슘:</strong> 비타민D는 장에서 칼슘 흡수율을 높이므로 칼슘 보충제는
                        과다 섭취 시 부작용이 있으므로 제품 라벨의 섭취량을 따르세요.
                    </li>
                </ul>

                <hr />

                <div className="city-card bg-yellow-50 p-5 border border-yellow-100">
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
                            className="city-card border bg-gray-50 p-5 space-y-2"
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

            <section className="city-card border bg-brand-50/40 p-6 space-y-3">
                <h2 className="text-lg font-bold text-gray-900">관련 가이드</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                    <Link
                        href="/blog/omega3-selection-guide"
                        className="city-card border border-white bg-white p-4 hover:border-brand-200 transition-all"
                    >
                        <p className="text-sm font-bold text-gray-900 hover:text-brand-700">
                            오메가3 선택 가이드
                        </p>
                        <p className="text-xs text-gray-500 mt-1">알티지형 vs 에틸에스텔형</p>
                    </Link>
                    <Link
                        href="/blog/probiotics-selection-guide"
                        className="city-card border border-white bg-white p-4 hover:border-brand-200 transition-all"
                    >
                        <p className="text-sm font-bold text-gray-900 hover:text-brand-700">
                            유산균 선택 가이드
                        </p>
                        <p className="text-xs text-gray-500 mt-1">균주 종류별 선택 기준</p>
                    </Link>
                </div>
            </section>

      <section className="city-card border bg-gray-50 p-6 space-y-4">
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
              className="city-card border bg-white p-4 hover:border-brand-200 transition-all space-y-1"
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
