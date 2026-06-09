import Link from "next/link";
import type { Metadata } from "next";
import { buildArticleJsonLd } from "@/lib/seo";
import { AdSlotTop, AdSlotBottom } from "@/components/ads/AdSlot";

const metaTitle =
    "마그네슘 부족 신호 6가지와 영양제 선택법: 산화마그네슘 vs 글리시네이트 | 약국오늘";
const metaDescription =
    "다리 경련, 수면 장애, 만성 피로가 마그네슘 부족 신호일 수 있습니다. 흡수율이 다른 형태별 마그네슘 영양제 비교와 올바른 복용법을 정리했습니다.";

const faqs = [
    {
        q: "산화마그네슘은 왜 설사를 유발하나요?",
        a: "산화마그네슘은 흡수율이 약 4% 내외로 매우 낮습니다. 흡수되지 못한 마그네슘이 장 내 수분을 끌어당겨 삼투성 설사를 유발합니다. 이 성질을 역으로 이용해 변비약으로도 사용됩니다. 마그네슘 결핍 보충을 목적으로 한다면 흡수율이 높은 구연산마그네슘·글리시네이트·말산마그네슘 형태를 선택하는 것이 좋습니다.",
    },
    {
        q: "칼슘과 마그네슘을 같이 먹어도 되나요?",
        a: "칼슘과 마그네슘은 함께 복용하면 서로의 흡수를 일부 경쟁할 수 있습니다. 일반적으로 칼슘:마그네슘 비율 2:1(예: 칼슘 500 mg + 마그네슘 250 mg)로 복용하는 것이 권장됩니다. 고용량 칼슘과 마그네슘을 동시에 복용할 경우 아침·저녁으로 나누어 먹으면 흡수 경쟁을 줄일 수 있습니다.",
    },
    {
        q: "마그네슘을 얼마나 먹어야 효과가 나타나나요?",
        a: "마그네슘 보충 효과는 개인마다 다르지만, 수면 개선과 근육 경련 감소는 2~4주 꾸준히 복용 후부터 느끼는 경우가 많습니다. 단, 세포 내 마그네슘 농도가 정상화되려면 최소 6~8주 이상이 필요하다는 연구도 있습니다. 결핍이 심한 경우 초기에는 하루 300~400 mg(원소 마그네슘 기준)을 복용하고, 증상이 개선되면 150~200 mg 유지 용량으로 줄이는 방식을 활용할 수 있습니다.",
    },
];

export const metadata: Metadata = {
    title: metaTitle,
    description: metaDescription,
    alternates: { canonical: "/blog/magnesium-deficiency-guide" },
    openGraph: {
        title: metaTitle,
        description: metaDescription,
        url: "/blog/magnesium-deficiency-guide",
        type: "article",
        images: ["/og-image.svg"],
    },
};

export default function Page() {
    const articleJsonLd = buildArticleJsonLd({
        title: metaTitle,
        description: metaDescription,
        slug: "/blog/magnesium-deficiency-guide",
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
                name: "마그네슘 부족 신호와 영양제 선택법",
                item: "https://todaypharm.kr/blog/magnesium-deficiency-guide",
            },
        ],
    };

    const howToJsonLd = {
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: "마그네슘 보충 4단계",
        description: metaDescription,
        step: [
            {
                "@type": "HowToStep",
                position: 1,
                name: "증상 확인",
                text: "다리 경련, 수면 장애, 만성 피로, 두통, 불안감, 변비 중 2가지 이상이 반복된다면 마그네슘 부족을 의심할 수 있습니다. 혈액 검사(혈청 마그네슘)로 결핍 여부를 확인하는 것이 가장 정확합니다.",
            },
            {
                "@type": "HowToStep",
                position: 2,
                name: "형태 선택",
                text: "수면 개선·근육 이완 목적이라면 글리시네이트, 변비 해소 겸용이라면 구연산마그네슘, 에너지 대사 지원이 목적이라면 말산마그네슘을 선택하세요. 단순 저가 보충이라면 산화마그네슘보다 흡수율이 높은 형태를 권장합니다.",
            },
            {
                "@type": "HowToStep",
                position: 3,
                name: "용량 결정",
                text: "성인 기준 하루 원소 마그네슘 200~400 mg이 일반적인 보충 범위입니다. 제품 라벨에서 &ldquo;마그네슘으로서&rdquo;(원소 마그네슘 기준) 함량을 확인하세요. 총 화합물 중량과 원소 마그네슘 함량은 다릅니다.",
            },
            {
                "@type": "HowToStep",
                position: 4,
                name: "복용 시간 결정",
                text: "수면 개선과 근육 이완 효과를 원한다면 취침 1~2시간 전 복용이 가장 효과적입니다. 소화 불편이 있다면 저녁 식후에 복용하세요. 변비 해소가 목적이라면 아침 공복 복용도 고려할 수 있습니다.",
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
                    마그네슘 부족 신호 6가지와 영양제 선택법: 산화마그네슘 vs 글리시네이트
                </h1>
                <p className="text-lg text-gray-600">
                    다리 경련부터 수면 장애까지, 마그네슘 결핍 신호와 형태별 올바른 보충법을 정리했습니다.
                </p>
            </div>

            <AdSlotTop />

            <section className="rounded-2xl border border-gray-50 bg-white p-6 sm:p-8 shadow-sm space-y-4">
                <h2 className="text-xl font-bold text-gray-900">마그네슘 결핍이 흔한 이유</h2>
                <p className="text-sm text-gray-700 leading-relaxed">
                    마그네슘은 체내 300가지 이상의 효소 반응에 관여하는 필수 미네랄이지만, 현대인의
                    식단에서는 만성적으로 부족하기 쉽습니다. 가공식품과 정제 탄수화물 위주의 식사는
                    마그네슘 함량이 낮고, 스트레스를 받으면 부신에서 코르티솔이 분비되면서 마그네슘이
                    소변으로 더 빨리 빠져나갑니다. 커피·알코올도 신장의 마그네슘 재흡수를 방해해 배출량을
                    늘립니다. 당뇨병 환자나 이뇨제·PPI(위산 억제제) 복용자는 결핍 위험이 특히 높습니다.
                    혈청 마그네슘 수치가 정상 범위(0.75~0.95 mmol/L)라도 세포 내 마그네슘은 부족한
                    &ldquo;잠재적 결핍&rdquo; 상태일 수 있어 증상 기반 판단이 중요합니다.
                </p>
                <ul className="mt-2 space-y-2">
                    <li className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
                        <span className="text-brand-600 font-bold mt-0.5 shrink-0">✓</span>
                        스트레스가 많고 커피를 하루 3잔 이상 마시는 분
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
                        <span className="text-brand-600 font-bold mt-0.5 shrink-0">✓</span>
                        이뇨제·메트포르민·PPI를 장기 복용 중인 분
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
                        <span className="text-brand-600 font-bold mt-0.5 shrink-0">✓</span>
                        채소·견과류 섭취가 부족한 가공식품 위주 식단을 하는 분
                    </li>
                </ul>
            </section>

            <div className="prose prose-lg prose-brand mx-auto text-gray-700">
                <h3>1. 마그네슘 결핍 신호 6가지</h3>
                <ul>
                    <li>
                        <strong>다리 경련·근육 경련:</strong> 마그네슘은 근육 수축 후 이완에 필요한
                        미네랄입니다. 부족하면 근육이 과도하게 수축된 상태가 유지되어 야간 다리 경련
                        (쥐)이 자주 발생합니다. 특히 임산부와 운동을 많이 하는 사람에게 흔합니다.
                    </li>
                    <li>
                        <strong>수면 장애:</strong> 마그네슘은 GABA 수용체를 활성화해 신경을 안정시키고,
                        멜라토닌 생성 조효소로도 작용합니다. 결핍 시 쉽게 잠들지 못하거나 수면 중 자주
                        깨는 증상이 나타납니다.
                    </li>
                    <li>
                        <strong>만성 피로:</strong> ATP(에너지) 합성 과정에 마그네슘이 필수적으로
                        관여합니다. 충분히 자도 피곤하고 기력이 없다면 마그네슘을 포함한 에너지 대사
                        관련 영양소 결핍을 점검해볼 필요가 있습니다.
                    </li>
                    <li>
                        <strong>두통·편두통:</strong> 마그네슘이 부족하면 뇌혈관 수축·이완 조절이
                        어려워져 긴장성 두통과 편두통 빈도가 높아진다는 연구들이 있습니다. 만성 편두통
                        환자에서 혈중 마그네슘 수치가 낮은 경우가 많습니다.
                    </li>
                    <li>
                        <strong>불안감·예민함:</strong> 마그네슘은 스트레스 호르몬(코르티솔) 조절에
                        관여합니다. 결핍 시 신경이 과민해지고 이유 없는 불안감이나 짜증이 잦아질 수
                        있습니다.
                    </li>
                    <li>
                        <strong>변비:</strong> 마그네슘은 장 근육 수축을 돕고, 흡수되지 않은 마그네슘이
                        장 내 수분을 끌어당겨 변을 부드럽게 합니다. 결핍 시 장 운동이 느려져 변비가
                        생길 수 있습니다.
                    </li>
                </ul>

                <h3>2. 형태별 마그네슘 비교: 산화 vs 구연산 vs 글리시네이트 vs 말산</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                        <thead>
                            <tr className="bg-brand-50">
                                <th className="border border-gray-200 px-3 py-2 text-left font-bold text-gray-800">형태</th>
                                <th className="border border-gray-200 px-3 py-2 text-left font-bold text-gray-800">흡수율</th>
                                <th className="border border-gray-200 px-3 py-2 text-left font-bold text-gray-800">주요 용도</th>
                                <th className="border border-gray-200 px-3 py-2 text-left font-bold text-gray-800">가격</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border border-gray-200 px-3 py-2 text-gray-700">산화마그네슘</td>
                                <td className="border border-gray-200 px-3 py-2 text-gray-700">낮음 (~4%)</td>
                                <td className="border border-gray-200 px-3 py-2 text-gray-700">변비 해소, 저가 보충</td>
                                <td className="border border-gray-200 px-3 py-2 text-gray-700">매우 저렴</td>
                            </tr>
                            <tr className="bg-gray-50">
                                <td className="border border-gray-200 px-3 py-2 text-gray-700">구연산마그네슘</td>
                                <td className="border border-gray-200 px-3 py-2 text-gray-700">높음 (~30%)</td>
                                <td className="border border-gray-200 px-3 py-2 text-gray-700">일반 결핍 보충, 변비 겸용</td>
                                <td className="border border-gray-200 px-3 py-2 text-gray-700">보통</td>
                            </tr>
                            <tr>
                                <td className="border border-gray-200 px-3 py-2 text-gray-700">글리시네이트</td>
                                <td className="border border-gray-200 px-3 py-2 text-gray-700">매우 높음 (~80%)</td>
                                <td className="border border-gray-200 px-3 py-2 text-gray-700">수면 개선, 불안 완화, 근육 이완</td>
                                <td className="border border-gray-200 px-3 py-2 text-gray-700">높음</td>
                            </tr>
                            <tr className="bg-gray-50">
                                <td className="border border-gray-200 px-3 py-2 text-gray-700">말산마그네슘</td>
                                <td className="border border-gray-200 px-3 py-2 text-gray-700">높음 (~40%)</td>
                                <td className="border border-gray-200 px-3 py-2 text-gray-700">에너지 대사, 만성 피로</td>
                                <td className="border border-gray-200 px-3 py-2 text-gray-700">보통~높음</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <h3>3. 하루 권장량과 복용 타이밍</h3>
                <p>
                    한국 영양소 섭취 기준 마그네슘 권장량은 성인 남성 370 mg, 성인 여성 280 mg(원소
                    마그네슘 기준)입니다. 보충제로는 하루 200~400 mg 범위가 일반적이며, 상한 섭취량은
                    보충제 기준 350 mg입니다. 취침 1~2시간 전 복용이 수면 개선과 근육 이완에 가장
                    효과적입니다. 마그네슘은 신경계를 안정시키고 멜라토닌 합성을 지원하므로 야간에
                    효과를 발휘합니다. 소화가 약한 경우에는 저녁 식후에 복용하고, 변비 해소가 주목적이라면
                    아침 공복이나 식간 복용도 고려할 수 있습니다.
                </p>

                <h3>4. 주의사항</h3>
                <ul>
                    <li>
                        <strong>신장 질환:</strong> 마그네슘은 신장으로 배출됩니다. 만성 신장 질환(CKD)
                        환자는 마그네슘이 체내에 축적되어 근무력증·저혈압·심부정맥 등 과마그네슘혈증
                        위험이 있으므로 반드시 의사 처방 하에 복용하세요.
                    </li>
                    <li>
                        <strong>항생제 상호작용:</strong> 마그네슘은 테트라사이클린계·퀴놀론계 항생제와
                        결합해 흡수를 방해할 수 있습니다. 항생제 복용 시에는 마그네슘 복용을 최소
                        2시간 이상 간격을 두고 분리해서 복용하세요.
                    </li>
                    <li>
                        <strong>혈압약·근이완제:</strong> 마그네슘이 혈압 강하 작용을 보조할 수 있어
                        혈압약과 병용 시 혈압이 과도하게 낮아질 수 있습니다. 복용 전 의사·약사와
                        상담하세요.
                    </li>
                </ul>

                <hr />

                <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                    <h4 className="text-blue-700 m-0 mb-2">뼈·근육 건강 제품 정보</h4>
                    <p className="m-0 text-gray-700">
                        마그네슘 외 뼈·근육 건강 관련 영양제 비교 정보는{" "}
                        <Link
                            href="/wiki?category=bone"
                            className="text-brand-600 underline hover:text-brand-700"
                        >
                            뼈·근육 건강 제품 위키
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
                        <h2 className="text-xl font-bold text-gray-900">뼈·근육 건강 관련 제품 정보</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            마그네슘·칼슘·비타민D 제품 비교와 약사 추천 정보를 확인하세요.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link
                            href="/wiki?category=bone"
                            className="inline-flex items-center rounded-full bg-brand-600 px-4 py-2 text-sm font-bold text-white shadow-md hover:bg-brand-700 transition-colors"
                        >
                            뼈·근육 제품 보기
                        </Link>
                    </div>
                </div>
            </section>

            <section className="rounded-2xl border border-gray-100 bg-gray-50 p-6 space-y-4">
                <h2 className="text-lg font-bold text-gray-900">함께 읽으면 좋은 글</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                    {[
                        { href: "/blog/vitamin-d-deficiency-guide", label: "비타민D 결핍 신호 7가지", desc: "결핍 증상과 올바른 보충 방법" },
                        { href: "/blog/probiotics-selection-guide", label: "유산균 균주 선택 가이드", desc: "목적별 균주 선택법과 CFU 해석" },
                        { href: "/wiki?category=bone", label: "뼈·근육 건강 제품 전체 목록 →", desc: "약국오늘 영양제 위키에서 확인" },
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
