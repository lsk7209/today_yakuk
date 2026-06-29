import Link from "next/link";
import type { Metadata } from "next";
import { buildArticleJsonLd } from "@/lib/seo";
import { AdSlotTop, AdSlotBottom } from "@/components/ads/AdSlot";

const metaTitle = "고혈압·당뇨약 복용자, 명절/연휴 대비 필수 체크리스트";
const metaDescription =
    "약이 떨어지면 큰일 나는 만성질환자분들을 위해! 연휴 전 약 관리법, 깜빡했을 때 대처법, 그리고 음식 조절 팁까지 정리했습니다.";

export const metadata: Metadata = {
    title: metaTitle,
    description: metaDescription,
    alternates: { canonical: "/blog/hypertension-diabetes-holiday-tips" },
    openGraph: {
        title: metaTitle,
        description: metaDescription,
        url: "/blog/hypertension-diabetes-holiday-tips",
        type: "article",
        images: ["/og-image.svg"],
    },
};

const faqs = [
    {
        q: "연휴 시작 이틀 전에 약국에 가면 늦을까요?",
        a: "연휴 직전 약국과 병원은 처방 대기가 평소보다 2~3배 늘어나 조기 마감되는 곳도 많습니다. 최소 5~7일 전에 잔여 약 수량을 확인하고 처방을 받는 것이 가장 안전합니다. 특히 인슐린·인슐린 펜 카트리지처럼 냉장 보관이 필요한 약품은 연휴 기간에 대체 조달이 매우 어렵기 때문에 더 일찍 준비해야 합니다.",
    },
    {
        q: "명절 여행 중 처방약을 분실했을 때 어떻게 해야 하나요?",
        a: "스마트폰에 미리 저장해 둔 처방전 사진이나 약 봉투 사진을 들고 여행지 인근 약국을 방문하면 동일 성분 약을 소량 구매할 수 있는 경우가 있습니다. 여의치 않으면 응급의료기관에서 단기 처방을 받는 방법도 있으며, 귀가 후에는 반드시 담당 의사와 복약 공백에 대해 상의하세요. 사전에 복용 약 리스트를 종이에 적어 지갑에 넣어 두면 분실 상황에서도 빠르게 대처할 수 있습니다.",
    },
    {
        q: "연휴 중 고혈압약을 하루 통째로 건너뛰었는데 괜찮을까요?",
        a: "하루를 완전히 건너뛰었다면 다음 날 정해진 시간에 정상 용량 한 알만 복용하면 됩니다. 절대 2배 용량을 한 번에 드시면 안 됩니다. 2일 이상 복약 공백이 생겼거나 두통·어지럼증·두근거림 같은 증상이 나타나면 가까운 응급실이나 당직 의원을 방문해 혈압을 측정받는 것이 안전합니다.",
    },
    {
        q: "명절 음식을 먹은 뒤 혈당이 많이 올라갔다면 당뇨약을 추가로 먹어도 되나요?",
        a: "담당 의사로부터 자가 조절 허가를 받은 경우가 아니면 임의로 약 용량을 늘리는 것은 위험합니다. 우선 20~30분 가벼운 식후 걷기 운동으로 혈당 소비를 유도하고, 다음 식사에서 탄수화물 섭취량을 줄이세요. 혈당이 300mg/dL 이상이거나 구역·복통·호흡 이상이 동반된다면 즉시 응급실을 방문해야 합니다.",
    },
    {
        q: "냉장 보관이 필요한 인슐린을 여행 중 어떻게 관리하나요?",
        a: "개봉 전 인슐린은 반드시 2~8℃ 냉장 보관이 필요하지만, 개봉 후 사용 중인 바이알이나 펜은 실온(25℃ 이하)에서 보통 28일까지 보관 가능합니다(제품마다 다름). 장거리 이동 시 의약품 전용 냉장 파우치나 아이스팩을 사용하고, 직사광선과 차량 트렁크의 고온은 피해야 합니다. 장기 여행이라면 숙소 미니바 냉장고를 적극 활용하세요.",
    },
    {
        q: "연휴에 문을 여는 약국을 어떻게 찾을 수 있나요?",
        a: "보건복지부가 운영하는 '휴일지킴이약국' 제도에 따라 공휴일에도 순번제로 영업하는 약국이 지역마다 지정되어 있습니다. 약국오늘 사이트의 '내 주변 약국 찾기' 기능을 이용하거나, 건강보험심사평가원 앱(심평원)에서도 실시간으로 운영 중인 약국을 확인할 수 있습니다. 지역 보건소 당직 전화(129)를 통해서도 안내받을 수 있습니다.",
    },
];

export default function Page() {
    const articleJsonLd = buildArticleJsonLd({
        title: metaTitle,
        description: metaDescription,
        slug: "/blog/hypertension-diabetes-holiday-tips",
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
      { "@type": "ListItem", position: 3, name: "고혈압·당뇨 연휴 약 관리 팁", item: "https://todaypharm.kr/blog/hypertension-diabetes-holiday-tips" },
    ],
  };
  const howToJsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "고혈압·당뇨약 복용자 연휴 대비 4단계",
    description: metaDescription,
    step: [
      { "@type": "HowToStep", position: 1, name: "약 재고 사전 확인", text: "연휴 시작 최소 1주일 전에 복용 중인 약 수량을 확인하고, 부족하면 담당 의사에게 연장 처방을 요청하세요." },
      { "@type": "HowToStep", position: 2, name: "복약 시간 준수", text: "식사 시간이 바뀌더라도 당뇨약은 정해진 복약 일정을 지키고, 복약 시간을 놓쳤을 때의 대처법을 미리 숙지하세요." },
      { "@type": "HowToStep", position: 3, name: "명절 음식 혈당 관리", text: "채소를 먼저 먹은 뒤 단백질, 밥 순서로 식사하면 혈당 스파이크를 예방할 수 있습니다." },
      { "@type": "HowToStep", position: 4, name: "연휴 중 응급 상황 대처", text: "증상이 악화되면 당번약국 또는 응급실을 이용하고, E-gen 앱으로 가까운 기관을 확인하세요." },
    ],
  };
  return (
        <div className="mx-auto max-w-3xl space-y-10 py-10">
            <div className="space-y-4 text-center">
                <span className="inline-block rounded-full bg-brand-100 px-3 py-1 text-xs font-bold text-brand-600">
                    만성질환 건강관리
                </span>
                <h1 className="text-3xl font-extrabold leading-tight text-gray-900 sm:text-4xl">
                    약 떨어지면 응급상황! 고혈압·당뇨 환자의 안전한 연휴 보내기
                </h1>
                <p className="text-lg text-gray-600">
                    즐거운 명절이나 긴 연휴, 약이 떨어지거나 평소와 다른 식사로 혈당/혈압이 흔들릴 수 있습니다.<br className="hidden sm:block" />
                    건강하게 연휴를 보내기 위한 3가지 핵심 수칙을 확인하세요.
                </p>
            </div>

            <AdSlotTop />

            <section className="rounded-2xl border border-gray-50 bg-white p-6 sm:p-8 shadow-sm space-y-4">
                <h2 className="text-xl font-bold text-gray-900">이 글이 필요한 순간</h2>
                <p className="text-sm text-gray-600 leading-relaxed">
                    고혈압·당뇨 같은 만성질환은 하루라도 약을 거르면 혈압·혈당이 급격히 흔들릴 수 있어 연휴는 특히 위험한 시기입니다.
                    한국의 5일 이상 장연휴에는 동네 병원·의원 대부분이 문을 닫고, 약국도 당번 약국만 최소 인원으로 운영됩니다.
                    처방전 없이는 대부분의 만성질환 약을 구매할 수 없기 때문에 연휴 전 사전 준비가 사실상 유일한 대비책입니다.
                    아래 체크리스트를 미리 확인해 연휴 내내 안심하고 쉴 수 있도록 준비하세요.
                </p>
                <ul className="mt-4 space-y-2">
                    <li className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
                        <span className="text-brand-600 font-bold mt-0.5 shrink-0">✓</span>
                        연휴 시작 일주일 전, 복용 중인 모든 약의 잔여 수량을 확인하고 부족한 약은 미리 처방받으세요.
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
                        <span className="text-brand-600 font-bold mt-0.5 shrink-0">✓</span>
                        스마트폰에 처방전 사진과 약 봉투 사진을 저장해 두면 분실·응급 상황에서 즉시 도움이 됩니다.
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
                        <span className="text-brand-600 font-bold mt-0.5 shrink-0">✓</span>
                        명절 음식은 혈당·혈압 모두에 영향을 주므로 식단 전략과 운동 루틴을 미리 계획해 두세요.
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
                        <span className="text-brand-600 font-bold mt-0.5 shrink-0">✓</span>
                        휴일지킴이 약국 위치와 응급 연락처(119, 129)를 미리 메모해 두면 긴급 상황에서 당황하지 않을 수 있습니다.
                    </li>
                </ul>
            </section>

            <div className="prose prose-lg prose-brand mx-auto text-gray-700">
                <h3>1. 약 재고 파악은 &apos;일주일 전&apos;에!</h3>
                <p>
                    가장 흔한 실수가 &quot;연휴 시작 전날 병원 가야지&quot;라고 미루는 것입니다.
                    연휴 직전에는 대기 환자가 급증해 오전에 이미 예약이 마감되는 의원이 많고, 일부 병원은 연휴 전날 오후부터 조기 마감하기도 합니다.
                    최소 일주일 전에 남은 약 개수를 세어보고, 연휴 기간을 포함해 <strong>3~5일치 여유분</strong>을 미리 처방받으세요.
                    인슐린 주사제나 혈압계 소모품처럼 재고가 한정된 품목은 2주 전부터 준비하는 것이 더욱 안전합니다.
                    약을 소분해서 여행 가방에 넣을 때는 원래 포장·라벨을 보존해 성분명과 용량을 언제든 확인할 수 있게 하세요.
                </p>

                <h3>2. 약 먹는 시간을 놓쳤다면?</h3>
                <p>
                    연휴 중 식사 시간이 불규칙해지면 복약 시간을 놓치는 일이 잦아집니다.
                    약의 종류에 따라 대처법이 다르므로 반드시 아래 원칙을 기억해 두세요.
                </p>
                <div className="rounded-xl border border-red-100 bg-red-50 p-5">
                    <ul className="my-0">
                        <li>
                            <strong>고혈압약:</strong> 생각난 즉시 복용하세요. 단, 다음 복용 시간이 8시간도 남지 않았다면 이번 회차는 건너뛰고 다음 정해진 시간에 드세요. 절대 2배 용량을 드시면 안 됩니다(저혈압 쇼크 위험). 하루를 통째로 건너뛰었더라도 다음 날 정상 용량으로 재개하면 되며, 두통·어지럼증이 생기면 가까운 당직 의원을 방문하세요.
                        </li>
                        <li>
                            <strong>당뇨약(경구):</strong> 식전/식후 복용 원칙이 중요합니다. 식사 시간을 놓쳐 저혈당 위험이 있다면 사탕 등을 섭취하고, 약 복용 여부는 자가혈당 측정 후 결정하는 것이 안전합니다. 혈당이 이미 낮은 상태에서 일부 당뇨약을 추가 복용하면 저혈당을 악화시킬 수 있어 주의가 필요합니다.
                        </li>
                        <li>
                            <strong>인슐린 주사:</strong> 투여 시기를 놓쳤으면 의사와 미리 상의해 두었던 자가 조절 메뉴얼을 따르세요. 임의로 용량을 늘리거나 두 번치를 한꺼번에 투여하면 심각한 저혈당으로 이어질 수 있습니다. 여행지에서는 당분 음식을 항상 휴대해 비상 저혈당에 대비하세요.
                        </li>
                    </ul>
                </div>

                <h3>3. 기름진 명절 음식, 혈당 스파이크 주의보</h3>
                <p>
                    떡, 전, 잡채 등 명절 음식은 탄수화물과 지방이 폭발적입니다.
                    특히 한 상에 여러 가지 음식이 한꺼번에 차려지는 명절 식탁에서는 자신도 모르게 평소보다 2~3배 많은 칼로리를 섭취하게 됩니다.
                    혈당 스파이크는 식후 30분~1시간 사이 최고조에 달하기 때문에, 식사 직후 20분 이상 가볍게 걷는 것만으로도 혈당 상승폭을 크게 줄일 수 있습니다.
                </p>
                <ul>
                    <li>
                        <strong>채소 먼저 먹기:</strong> 나물이나 쌈 채소를 식사 맨 처음에 먹으면 혈당 상승 폭을 완만하게 줄일 수 있습니다. 섬유질이 위에서 포도당 흡수를 늦추는 역할을 해 인슐린 반응을 부드럽게 합니다. 이후 단백질(생선, 두부, 육류 소량), 마지막으로 밥·떡 순서로 먹으면 효과가 더 큽니다.
                    </li>
                    <li>
                        <strong>국물 나트륨 주의:</strong> 전골, 국밥, 떡국 등 국물 음식에는 나트륨이 1그릇당 1,000~2,000mg씩 들어 있어 고혈압 환자에게 특히 위험합니다. 국물은 최소한으로 줄이고 건더기 위주로 드시는 것이 바람직합니다.
                    </li>
                    <li>
                        <strong>과음 주의:</strong> 술은 그 자체로 칼로리가 높고, 안주 섭취를 늘리며, 간 기능을 저하해 약물 대사에 영향을 줍니다. 일부 당뇨약(설포닐요소제 계열)은 알코올과 반응해 급격한 저혈당을 유발하기도 합니다. 분위기만 즐기시고 절주하거나 무알코올 음료로 대체하세요.
                    </li>
                </ul>

                <h3>4. 연휴 중 응급 상황 대처</h3>
                <p>
                    혹시라도 갑작스러운 흉통, 심한 두통, 마비 증상, 의식 저하 등이 나타나면 지체 없이 119를 부르거나 응급실로 가야 합니다.
                    고혈압 환자의 경우 수축기 혈압이 180mmHg 이상이거나 이완기 혈압이 110mmHg 이상이면 고혈압 위기로 즉각 처치가 필요한 상황입니다.
                    당뇨 환자는 혈당 300mg/dL 이상, 구역·구토·복통이 동반될 때 당뇨병성 케톤산증일 수 있어 역시 지체 없이 응급실을 방문해야 합니다.
                    이때 의료진에게 <strong>복용 중인 약 리스트(처방전 사진)</strong>를 보여주면 신속한 처치에 큰 도움이 됩니다.
                    사전에 복용 약·용량·복용 시간을 한 장 메모해 지갑에 넣어두면 의식이 없는 상황에서도 동행인이 의료진에게 정보를 전달할 수 있습니다.
                </p>

                <hr />
                <p className="text-center font-bold text-brand-700">
                    미리 준비하는 센스가 건강한 연휴를 만듭니다.<br />
                    오늘 저녁, 남은 약 봉투를 꼭 확인해보세요!
                </p>
            </div>

            <section className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900">실전 시나리오</h2>
                <div className="space-y-3">
                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-brand-700 bg-brand-50 rounded-full px-2 py-0.5">상황 1</span>
                            <h3 className="text-base font-bold text-gray-900">연휴 3일째, 고혈압약이 딱 오늘 치 밖에 안 남은 상황</h3>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            오늘 분은 정해진 시간에 복용하고, 휴일지킴이 약국이나 당직 의원을 찾아 처방전 재발급 또는 임시 처방을 요청하세요. 약국오늘에서 현재 운영 중인 인근 약국을 검색하면 빠르게 찾을 수 있습니다. 내일부터 복약이 중단되지 않도록 오늘 안에 반드시 해결해야 하며, 대처가 어렵다면 응급의료기관을 방문하는 것이 안전합니다.
                        </p>
                    </div>
                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-brand-700 bg-brand-50 rounded-full px-2 py-0.5">상황 2</span>
                            <h3 className="text-base font-bold text-gray-900">명절 저녁 풍성하게 먹었더니 식후 혈당이 250을 넘겼다</h3>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            당장 집 근처를 20~30분 빠르게 걸으면 혈당을 자연스럽게 낮출 수 있습니다. 다음 식사는 탄수화물을 절반으로 줄이고 단백질과 채소 위주로 드세요. 혈당이 300mg/dL 이상이거나 구역·복통이 동반된다면 가까운 응급실을 방문해야 합니다.
                        </p>
                    </div>
                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-brand-700 bg-brand-50 rounded-full px-2 py-0.5">상황 3</span>
                            <h3 className="text-base font-bold text-gray-900">여행지에서 약 봉투를 숙소에 두고 외출해 점심 복약을 놓쳤다</h3>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            숙소로 돌아가 약을 찾아 복용하되, 다음 복용 시간까지 4시간 미만이 남았다면 이번 회차는 건너뛰고 다음 정해진 시간에 복용하세요. 외출 시에는 하루치 약을 소형 지퍼백에 넣어 항상 가방에 휴대하는 습관을 들이면 이런 상황을 예방할 수 있습니다. 자가혈압계나 혈당계가 있다면 수치를 한 번 측정해 정상 범위인지 확인하는 것이 좋습니다.
                        </p>
                    </div>
                </div>
            </section>

            <section className="rounded-2xl bg-brand-50 p-6 sm:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">당장 약이 떨어지셨나요?</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            휴일지킴이 약국을 찾아 문의해 보세요.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link
                            href="/nearby"
                            className="inline-flex items-center rounded-full bg-brand-600 px-4 py-2 text-sm font-bold text-white shadow-md hover:bg-brand-700 transition-colors"
                        >
                            내 주변 약국 찾기
                        </Link>
                    </div>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900">자주 묻는 질문</h2>
                <div className="space-y-3">
                    {faqs.map((faq, i) => (
                        <div key={i} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-2">
                            <p className="text-sm font-bold text-gray-900">Q. {faq.q}</p>
                            <p className="text-sm text-gray-600 leading-relaxed">A. {faq.a}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="rounded-2xl border border-brand-100 bg-brand-50/40 p-6 space-y-3">
                <h2 className="text-lg font-bold text-gray-900">관련 가이드</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                    <Link href="/blog/prescription-holiday-guide" className="rounded-xl border border-white bg-white p-4 hover:border-brand-200 hover:shadow-sm transition-all">
                        <p className="text-sm font-bold text-gray-900 hover:text-brand-700">처방전 약 연휴에 못 받을 때 대처법</p>
                        <p className="text-xs text-gray-500 mt-1">연휴 처방전 대처</p>
                    </Link>
                    <Link href="/guide/holiday-checklist" className="rounded-xl border border-white bg-white p-4 hover:border-brand-200 hover:shadow-sm transition-all">
                        <p className="text-sm font-bold text-gray-900 hover:text-brand-700">공휴일 약국 이용 체크리스트</p>
                        <p className="text-xs text-gray-500 mt-1">공휴일 약국 가이드</p>
                    </Link>
                </div>
            </section>

            <section className="rounded-2xl border border-gray-100 bg-gray-50 p-6 space-y-4">
        <h2 className="text-lg font-bold text-gray-900">함께 읽으면 좋은 글</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { href: "/blog/magnesium-deficiency-guide", label: "마그네슘 부족 신호 6가지", desc: "혈압과 관련 있는 마그네슘 결핍 증상과 보충법" },
            { href: "/blog/omega3-selection-guide", label: "오메가3 선택 가이드", desc: "혈관 건강을 위한 오메가3 형태별 선택법" },
            { href: "/wiki?category=immune", label: "면역력 영양제 전체 보기 →", desc: "약국오늘 영양제 위키에서 확인" },
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
