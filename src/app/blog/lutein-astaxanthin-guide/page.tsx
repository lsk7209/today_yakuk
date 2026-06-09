import Link from "next/link";
import type { Metadata } from "next";
import { buildArticleJsonLd } from "@/lib/seo";
import { AdSlotTop, AdSlotBottom } from "@/components/ads/AdSlot";

const metaTitle =
    "루테인 vs 아스타잔틴: 눈 건강 영양제, 어떻게 다르고 같이 먹어도 될까 | 약국오늘";
const metaDescription =
    "루테인과 아스타잔틴은 모두 눈 건강에 좋다고 알려져 있지만 작용 방식이 다릅니다. 황반 보호, 항산화력, 용량, 병용 여부를 비교 정리했습니다.";

const faqs = [
    {
        q: "루테인은 하루에 얼마나 먹어야 하나요?",
        a: "식약처 건강기능식품 기준 루테인 권장 섭취량은 하루 10~20 mg입니다. 지아잔틴이 함께 포함된 제품이라면 지아잔틴 2 mg 내외도 함께 섭취하는 것이 황반 건강에 더 유리합니다. 용량을 초과해서 복용해도 추가 효과는 거의 없으며, 과다 복용 시 피부가 노랗게 변하는 황색증이 생길 수 있으므로 권장량을 지키는 것이 좋습니다.",
    },
    {
        q: "아스타잔틴에 부작용이 있나요?",
        a: "아스타잔틴은 일반적으로 안전하게 알려져 있지만 고용량(하루 12 mg 이상) 복용 시 피부색이 약간 붉어지거나 소화불량, 변 색 변화가 보고된 사례가 있습니다. 또한 항응고제나 혈압약을 복용 중인 경우 상호작용 가능성이 있으므로 복용 전 약사나 의사와 상담을 권장합니다. 임산부·수유부는 안전성 데이터가 충분하지 않아 주의가 필요합니다.",
    },
    {
        q: "40대부터 루테인과 아스타잔틴을 먹어야 하나요?",
        a: "황반 색소 밀도는 30~40대부터 서서히 감소하기 시작합니다. 특히 스마트폰이나 컴퓨터 화면을 하루 6시간 이상 사용하거나, 야외 활동이 많아 자외선 노출이 잦은 경우, 가족 중 황반변성 환자가 있는 경우라면 40대 이전이라도 보충을 고려할 수 있습니다. 단, 영양제는 균형 잡힌 식단의 보조 수단임을 기억하고, 정기적인 안과 검진과 함께 활용하세요.",
    },
];

export const metadata: Metadata = {
    title: metaTitle,
    description: metaDescription,
    alternates: { canonical: "/blog/lutein-astaxanthin-guide" },
    openGraph: {
        title: metaTitle,
        description: metaDescription,
        url: "/blog/lutein-astaxanthin-guide",
        type: "article",
        images: ["/og-image.svg"],
    },
};

export default function Page() {
    const articleJsonLd = buildArticleJsonLd({
        title: metaTitle,
        description: metaDescription,
        slug: "/blog/lutein-astaxanthin-guide",
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
                name: "루테인 vs 아스타잔틴 가이드",
                item: "https://todaypharm.kr/blog/lutein-astaxanthin-guide",
            },
        ],
    };

    const howToJsonLd = {
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: "눈 건강 영양제 고르는 3단계",
        description: metaDescription,
        step: [
            {
                "@type": "HowToStep",
                position: 1,
                name: "증상 파악",
                text: "황반변성·노안 위험이 주된 걱정이라면 루테인·지아잔틴을, 눈 피로·충혈·건조감이 주 증상이라면 아스타잔틴을 우선 고려하세요. 두 증상이 복합적으로 있다면 병용도 가능합니다.",
            },
            {
                "@type": "HowToStep",
                position: 2,
                name: "성분 선택",
                text: "루테인은 하루 10~20 mg(지아잔틴 2 mg 포함 권장), 아스타잔틴은 하루 4~12 mg이 통상적인 사용 범위입니다. 제품 라벨의 기능성 성분 함량을 반드시 확인하세요.",
            },
            {
                "@type": "HowToStep",
                position: 3,
                name: "용량 확인 및 식후 복용",
                text: "루테인과 아스타잔틴은 모두 지용성 카로티노이드입니다. 반드시 식후에 복용해야 흡수율이 높아집니다. 공복 복용 시 유효 성분의 상당 부분이 그대로 배출될 수 있습니다.",
            },
        ],
    };

    return (
        <div className="mx-auto max-w-3xl space-y-10 py-10">
            <div className="space-y-4 text-center">
                <span className="inline-block rounded-full bg-brand-100 px-3 py-1 text-xs font-bold text-brand-600">
                    눈 건강 영양제 가이드
                </span>
                <h1 className="text-3xl font-extrabold leading-tight text-gray-900 sm:text-4xl">
                    루테인 vs 아스타잔틴: 눈 건강 영양제, 어떻게 다르고 같이 먹어도 될까
                </h1>
                <p className="text-lg text-gray-600">
                    황반 보호부터 눈 피로 개선까지, 두 성분의 차이와 병용 방법을 정리했습니다.
                </p>
            </div>

            <AdSlotTop />

            <section className="rounded-2xl border border-gray-50 bg-white p-6 sm:p-8 shadow-sm space-y-4">
                <h2 className="text-xl font-bold text-gray-900">루테인이란? — 황반을 지키는 색소</h2>
                <p className="text-sm text-gray-700 leading-relaxed">
                    루테인(Lutein)은 망막 중심부 황반에 고농도로 존재하는 카로티노이드 색소입니다. 황반
                    색소 밀도(MPOD)를 높여 청색광과 자외선이 망막 세포를 손상시키는 것을 막는 &ldquo;천연
                    선글라스&rdquo; 역할을 합니다. 체내에서 합성되지 않아 음식이나 보충제로만 섭취 가능하며,
                    케일·시금치·달걀노른자 등에 풍부하게 들어 있습니다. 나이가 들수록 황반 색소
                    밀도가 낮아지면서 황반변성 위험이 높아지는데, 루테인 보충이 이를 늦추는 데 도움을
                    준다는 연구(AREDS2)가 있습니다. 식약처 인정 기능성은 &ldquo;눈 건강에 도움을 줄 수
                    있음&rdquo;이며, 하루 권장 섭취량은 10~20 mg입니다.
                </p>
                <ul className="mt-2 space-y-2">
                    <li className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
                        <span className="text-brand-600 font-bold mt-0.5 shrink-0">✓</span>
                        황반변성·녹내장 가족력이 있는 분
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
                        <span className="text-brand-600 font-bold mt-0.5 shrink-0">✓</span>
                        스마트폰·모니터를 하루 6시간 이상 사용하는 분
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
                        <span className="text-brand-600 font-bold mt-0.5 shrink-0">✓</span>
                        노안 진행이 빠르게 느껴지는 40~50대 이상
                    </li>
                </ul>
            </section>

            <div className="prose prose-lg prose-brand mx-auto text-gray-700">
                <h3>1. 아스타잔틴이란? — 항산화력이 비타민C의 6,000배</h3>
                <p>
                    아스타잔틴(Astaxanthin)은 연어·새우·크릴새우·헤마토코쿠스 조류에서 유래하는
                    붉은색 카로티노이드입니다. 항산화력이 비타민C의 약 6,000배, 비타민E의 약 550배로
                    알려져 있으며, 지용성과 수용성 양쪽에서 활성산소를 동시에 제거하는 독특한 구조를
                    갖고 있습니다. 혈뇌장벽과 혈안장벽을 통과할 수 있어 눈의 모세혈관과 수정체에 직접
                    작용할 수 있다는 점이 루테인과의 가장 큰 차이입니다. 눈 근육(모양체근) 피로 완화,
                    충혈 감소, 조절력 회복에 도움을 준다는 임상 결과들이 발표되어 있으며, 피부 광노화
                    억제, 운동 후 근육 피로 회복 등 눈 이외의 기능도 연구 중입니다.
                </p>

                <h3>2. 루테인 vs 아스타잔틴 비교</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                        <thead>
                            <tr className="bg-brand-50">
                                <th className="border border-gray-200 px-3 py-2 text-left font-bold text-gray-800">항목</th>
                                <th className="border border-gray-200 px-3 py-2 text-left font-bold text-blue-700">루테인</th>
                                <th className="border border-gray-200 px-3 py-2 text-left font-bold text-red-600">아스타잔틴</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border border-gray-200 px-3 py-2 text-gray-700">주요 효능</td>
                                <td className="border border-gray-200 px-3 py-2 text-gray-700">황반 색소 밀도 증가, 청색광 차단</td>
                                <td className="border border-gray-200 px-3 py-2 text-gray-700">눈 피로·충혈 완화, 모양체근 회복</td>
                            </tr>
                            <tr className="bg-gray-50">
                                <td className="border border-gray-200 px-3 py-2 text-gray-700">권장 용량</td>
                                <td className="border border-gray-200 px-3 py-2 text-gray-700">10~20 mg/일</td>
                                <td className="border border-gray-200 px-3 py-2 text-gray-700">4~12 mg/일</td>
                            </tr>
                            <tr>
                                <td className="border border-gray-200 px-3 py-2 text-gray-700">원료 출처</td>
                                <td className="border border-gray-200 px-3 py-2 text-gray-700">마리골드 꽃 추출물</td>
                                <td className="border border-gray-200 px-3 py-2 text-gray-700">헤마토코쿠스 조류, 연어</td>
                            </tr>
                            <tr className="bg-gray-50">
                                <td className="border border-gray-200 px-3 py-2 text-gray-700">혈안장벽 통과</td>
                                <td className="border border-gray-200 px-3 py-2 text-gray-700">제한적</td>
                                <td className="border border-gray-200 px-3 py-2 text-gray-700">가능</td>
                            </tr>
                            <tr>
                                <td className="border border-gray-200 px-3 py-2 text-gray-700">가격대</td>
                                <td className="border border-gray-200 px-3 py-2 text-gray-700">상대적으로 저렴</td>
                                <td className="border border-gray-200 px-3 py-2 text-gray-700">다소 높음</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <h3>3. 함께 먹어도 될까?</h3>
                <p>
                    루테인과 아스타잔틴은 서로 다른 경로로 눈 건강을 지원하기 때문에 병용이 가능합니다.
                    루테인이 황반 색소를 직접 보충하는 &ldquo;구조적 보호&rdquo; 역할을 한다면, 아스타잔틴은
                    혈안장벽을 넘어 모양체근 피로와 산화 스트레스를 완화하는 &ldquo;기능적 회복&rdquo;에 초점을
                    맞춥니다. 두 성분 모두 지용성 카로티노이드이므로 식후에 복용해야 흡수율이
                    높아집니다. 다만 카로티노이드 계열 성분을 여러 가지 복용할 경우 각 성분이 흡수 단계에서
                    경쟁할 수 있으므로, 같은 끼니 식후보다는 아침·저녁으로 시간을 나누어 복용하면
                    흡수 효율을 높일 수 있습니다. 두 가지를 한꺼번에 복용하기 어렵다면 주증상에 따라
                    하나씩 선택하는 것도 좋은 방법입니다.
                </p>

                <h3>4. 상황별 선택 가이드</h3>
                <ul>
                    <li>
                        <strong>황반변성·노안 위험이 주된 걱정 → 루테인(+지아잔틴):</strong> 황반
                        색소 밀도를 직접 높이는 루테인이 최우선입니다. 지아잔틴이 함께 포함된 복합
                        제품을 선택하면 황반 보호 효과를 더 높일 수 있습니다.
                    </li>
                    <li>
                        <strong>디지털 기기 과부하로 인한 눈 피로·충혈 → 아스타잔틴:</strong> 하루
                        4~12 mg의 아스타잔틴이 모양체근 피로 완화와 핀트 조절 기능 회복에 도움을
                        줍니다. 4~8주 이상 꾸준히 복용해야 효과가 나타납니다.
                    </li>
                    <li>
                        <strong>50대 이상 복합 관리 → 두 성분 병용:</strong> 황반 보호와 산화 스트레스
                        관리를 동시에 원한다면 루테인 10 mg + 아스타잔틴 4~6 mg 병용을 고려할 수
                        있습니다. 복용 전 안과 전문의나 약사와 상담을 권장합니다.
                    </li>
                </ul>

                <hr />

                <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                    <h4 className="text-blue-700 m-0 mb-2">눈 건강 제품 정보</h4>
                    <p className="m-0 text-gray-700">
                        더 다양한 눈 건강 영양제 비교 정보는{" "}
                        <Link
                            href="/wiki?category=eye"
                            className="text-brand-600 underline hover:text-brand-700"
                        >
                            눈 건강 제품 위키
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
                        <h2 className="text-xl font-bold text-gray-900">눈 건강 관련 제품 정보</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            루테인·아스타잔틴 제품 비교와 약사 추천 정보를 확인하세요.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link
                            href="/wiki?category=eye"
                            className="inline-flex items-center rounded-full bg-brand-600 px-4 py-2 text-sm font-bold text-white shadow-md hover:bg-brand-700 transition-colors"
                        >
                            눈 건강 제품 보기
                        </Link>
                    </div>
                </div>
            </section>

            <section className="rounded-2xl border border-gray-100 bg-gray-50 p-6 space-y-4">
                <h2 className="text-lg font-bold text-gray-900">함께 읽으면 좋은 글</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                    {[
                        { href: "/blog/omega3-selection-guide", label: "오메가3 선택 가이드", desc: "알티지형 vs 에틸에스텔형 비교" },
                        { href: "/blog/vitamin-d-deficiency-guide", label: "비타민D 결핍 신호 7가지", desc: "결핍 증상과 올바른 보충 방법" },
                        { href: "/wiki?category=eye", label: "눈 건강 제품 전체 목록 →", desc: "약국오늘 영양제 위키에서 확인" },
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
