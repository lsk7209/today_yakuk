import Link from "next/link";
import type { Metadata } from "next";
import { buildArticleJsonLd } from "@/lib/seo";
import { AdSlotTop, AdSlotBottom } from "@/components/ads/AdSlot";

const metaTitle = "소화불량·과음 후 약국에서 물어볼 것 | 약국오늘";
const metaDescription =
    "속이 더부룩하거나 술 마신 다음 날 머리가 깨질 듯 아플 때! 약국에서 증상에 딱 맞는 약을 고르는 꿀팁을 알려드립니다.";

const faqs = [
    {
        q: "소화제는 식전에 먹나요, 식후에 먹나요?",
        a: "소화효소제는 식사 직전이나 식사 중에 복용해야 효과가 좋습니다. 식후에 이미 속이 불편하다면 복용해도 도움이 될 수 있지만, 예방 효과는 식전 복용에 비해 낮습니다. 위장운동 촉진제(돔페리돈 계열)는 식전 15~30분에 복용하는 것이 원칙이므로, 어떤 종류의 소화제인지 약사에게 먼저 확인하세요.",
    },
    {
        q: "술 마신 날 타이레놀을 먹으면 왜 안 되나요?",
        a: "타이레놀의 주성분 아세트아미노펜은 간에서 대사되는데, 알코올도 동일한 간 대사 경로를 사용합니다. 두 물질이 경쟁적으로 간을 거치면 독성 대사물질이 과생성되어 간세포가 심각하게 손상될 수 있습니다. 음주 후 두통에는 반드시 이부프로펜 또는 덱시부프로펜 계열 진통제를 소량의 식사와 함께 복용하세요.",
    },
    {
        q: "숙취해소 음료는 마시기 전에 마셔야 하나요, 후에 마셔야 하나요?",
        a: "제품 성분에 따라 다릅니다. 간 대사를 돕는 앰플 타입(헤포스, 가네스 등)은 음주 전 복용 시 알코올 분해 속도를 높이는 효과가 있습니다. 전해질·비타민 보충 위주의 타입은 음주 후나 다음 날 아침에 마셔도 회복에 도움이 되므로, 라벨의 복용 타이밍 안내를 꼭 확인하세요.",
    },
];

export const metadata: Metadata = {
    title: metaTitle,
    description: metaDescription,
    alternates: { canonical: "/blog/digestion-hangover-pharmacy-guide" },
    openGraph: {
        title: metaTitle,
        description: metaDescription,
        url: "/blog/digestion-hangover-pharmacy-guide",
        type: "article",
        images: ["/og-image.svg"],
    },
};

export default function Page() {
    const articleJsonLd = buildArticleJsonLd({
        title: metaTitle,
        description: metaDescription,
        slug: "/blog/digestion-hangover-pharmacy-guide",
    });

    return (
        <div className="mx-auto max-w-3xl space-y-10 py-10">
            <div className="space-y-4 text-center">
                <span className="inline-block rounded-full bg-brand-100 px-3 py-1 text-xs font-bold text-brand-600">
                    증상별 맞춤 가이드
                </span>
                <h1 className="text-3xl font-extrabold leading-tight text-gray-900 sm:text-4xl">
                    체했을 때 vs 숙취가 심할 때, 약국에서 뭐 달라고 하지?
                </h1>
                <p className="text-lg text-gray-600">
                    &quot;그냥 소화제 주세요&quot;, &quot;술 깨는 약 주세요&quot;라고만 하시나요? <br className="hidden sm:block" />
                    증상을 더 구체적으로 말하면 효과 직빵(?)인 약을 받을 수 있습니다.
                </p>
            </div>

            <AdSlotTop />

            <section className="rounded-2xl border border-gray-50 bg-white p-6 sm:p-8 shadow-sm space-y-4">
                <h2 className="text-xl font-bold text-gray-900">이 가이드가 필요한 순간</h2>
                <p className="text-gray-700 leading-relaxed">
                    소화불량과 숙취는 매우 흔한 증상이지만, 약국에서 올바른 약을 고르지 못하면 오히려 증상이 악화될 수 있습니다.
                    소화효소제·제산제·위장운동 촉진제·진경제는 작용 기전이 전혀 다르기 때문에 증상을 정확히 파악하고 선택하는 것이 중요합니다.
                    숙취의 경우 음주 전·후 타이밍과 증상 유형(두통·구역·피로)에 따라 필요한 성분이 달라지며, 잘못된 진통제 선택은 간 손상 위험을 높입니다.
                    이 가이드를 읽고 내 증상을 간단히 파악해두면 약사와 훨씬 빠르고 정확한 상담이 가능합니다.
                </p>
                <ul className="mt-4 space-y-2">
                    <li className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
                        <span className="text-brand-600 font-bold mt-0.5 shrink-0">✓</span>
                        과식·기름진 음식 후 더부룩함이 30분이 지나도 해소되지 않을 때
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
                        <span className="text-brand-600 font-bold mt-0.5 shrink-0">✓</span>
                        술자리 다음 날 두통·구역감·피로 중 어디서 시작할지 모를 때
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
                        <span className="text-brand-600 font-bold mt-0.5 shrink-0">✓</span>
                        약국에서 어떤 말로 증상을 설명해야 할지 막막하게 느껴질 때
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
                        <span className="text-brand-600 font-bold mt-0.5 shrink-0">✓</span>
                        늘 먹던 소화제나 진통제가 효과가 없어 다른 약이 필요한지 궁금할 때
                    </li>
                </ul>
            </section>

            <div className="prose prose-lg prose-brand mx-auto text-gray-700">
                <h3>🤢 PART 1: 소화불량, 증상별로 약이 다르다!</h3>
                <p>
                    단순히 &apos;소화제&apos; 하나가 만능이 아닙니다. 내 증상을 체크해보세요.
                    소화 관련 약은 크게 소화효소제·위장운동 촉진제·제산제·진경제 네 가지로 나뉘며, 각각 완전히 다른 메커니즘으로 작용합니다.
                    잘못된 약을 선택하면 증상이 완화되지 않거나 오히려 불편함이 커질 수 있으니, 아래 기준을 참고해 자신의 상황에 맞는 약을 선택하세요.
                </p>
                <ul>
                    <li>
                        <strong>과식으로 꽉 막힌 느낌:</strong> 소화효소제(베아제, 훼스탈 등)가 음식물 분해를 돕습니다.
                        아밀라아제·프로테아제·리파아제 등 다양한 효소가 포함된 복합 소화효소제를 선택하면 탄수화물·단백질·지방을 고루 분해할 수 있습니다.
                        식사 직전 또는 식사 중 복용 시 가장 효과적이며, 이미 더부룩한 상태라면 식후에 복용해도 어느 정도 도움이 됩니다.
                        증상이 반복된다면 위장운동 촉진제 추가 여부를 약사와 상의해보세요.
                    </li>
                    <li>
                        <strong>명치가 아프고 위경련이 올 때:</strong> 진경제(부스코판 등)가 위장 근육의 경련을 풀어주어 통증을 줄입니다.
                        스트레스성 복통이나 과민성 대장 증상에도 효과적으로 쓰이며, 보통 15~30분 내에 작용이 시작됩니다.
                        진경제는 근육 이완을 유도하는 약이므로, 단순 소화불량용 소화효소제와는 전혀 다른 계열임을 기억하세요.
                        만약 통증이 매우 심하거나 발열·혈변 등 다른 증상이 동반된다면 약국보다 의료기관 방문이 우선입니다.
                    </li>
                    <li>
                        <strong>속이 쓰리고 신물이 올라올 때:</strong> 제산제(개비스콘, 알마겔 등)나 위산분비억제제가 필요합니다.
                        제산제는 즉각적으로 위산을 중화하는 반면, 파모티딘 같은 H2 차단제는 위산 분비 자체를 억제해 효과가 더 오래 지속됩니다.
                        공복에 증상이 심하다면 식전에, 식후 역류가 주 증상이라면 식후 30분 이내에 복용하는 것이 효과적입니다.
                        <br />
                        <span className="text-sm text-gray-500">* 이때 소화효소제만 먹으면 오히려 속이 더 쓰릴 수 있어요!</span>
                    </li>
                    <li>
                        <strong>배에 가스가 차서 빵빵할 때:</strong> 가스제거 성분(시메티콘)이 포함된 약을 고르세요.
                        시메티콘은 장 내 가스 기포를 뭉쳐서 자연스럽게 배출되도록 돕는 물리적 작용을 하며, 흡수되지 않으므로 비교적 안전합니다.
                        탄산음료·콩류·유제품 섭취 후 자주 발생하는 분들은 식사 후 즉시 복용하면 팽만감을 빠르게 완화할 수 있습니다.
                        시메티콘 단독 제품이 없다면 소화효소와 시메티콘이 복합된 제품을 약사에게 요청해보세요.
                    </li>
                </ul>

                <hr />

                <h3>🍺 PART 2: 숙취해소, 타이밍과 증상이 생명!</h3>
                <p>
                    숙취도 두통형·구토형·피로형 등 유형이 다양합니다.
                    알코올이 간에서 분해되는 과정에서 생성되는 아세트알데히드가 주요 원인이며, 탈수·전해질 불균형·저혈당이 복합적으로 작용해 증상이 심해집니다.
                    단순히 물만 많이 마신다고 해결되지 않는 이유가 여기 있으며, 증상 유형에 맞는 제품 선택이 회복 속도를 크게 좌우합니다.
                    가능하다면 음주 전부터 준비하는 것이 가장 효과적인 전략입니다.
                </p>
                <ul>
                    <li>
                        <strong>음주 전 미리 방어:</strong> 간 대사를 돕는 앰플(헤포스, 가네스 등)이나 숙취해소음료를 미리 마시면 알코올 분해를 돕습니다.
                        밀크씨슬(실리마린) 성분은 간세포 보호 효과가 있어 음주 전 복용 시 간 부담을 줄여주는 데 도움이 됩니다.
                        음주 전 가벼운 식사도 알코올 흡수 속도를 늦춰주므로, 빈속 음주는 최대한 피하는 것이 좋습니다.
                        약국에서 &quot;술자리 전에 쓸 제품&quot;이라고 말하면 성분과 복용 타이밍을 함께 안내받을 수 있습니다.
                    </li>
                    <li>
                        <strong>머리가 깨질 듯 아플 때:</strong>
                        <span className="text-red-500 font-bold">주의!</span> 술 마신 후 <strong>타이레놀(아세트아미노펜)은 절대 금지</strong>입니다. 간 독성을 유발할 수 있습니다.
                        대신 이부프로펜/덱시부프로펜 계열 진통제를 드시되, 위장 장애가 있다면 반하사심탕 같은 한방 제제가 더 안전할 수 있습니다.
                        진통제 복용 전에는 반드시 소량의 음식이나 우유를 먹어 위장 자극을 줄이는 것이 중요합니다.
                        음주 직후 상태라면 진통제보다 충분한 수면과 전해질 보충이 우선입니다.
                    </li>
                    <li>
                        <strong>속이 울렁거리고 토할 것 같을 때:</strong> 반하사심탕, 인진호탕 등 위장 운동을 조절하고 구역감을 줄이는 생약 성분 드링크가 효과적입니다.
                        이런 한방 제제는 위장 점막을 자극하지 않으면서 구역감을 완화해주므로 위가 예민한 분들에게도 비교적 안전하게 사용할 수 있습니다.
                        구역감이 심할 때는 차갑게 마시기보다 상온이나 따뜻하게 마시는 것이 위장에 덜 자극적입니다.
                        증상이 12시간 이상 지속되거나 혈변·극심한 복통이 동반되면 즉시 의료기관을 찾으세요.
                    </li>
                    <li>
                        <strong>물만 마시면 된다?</strong> 수분 섭취는 필수지만, 전해질과 당분이 포함된 이온음료나 포도당 캔디, 꿀물을 곁들이면 회복이 훨씬 빠릅니다.
                        알코올의 이뇨 작용으로 나트륨·칼륨 등 전해질도 함께 손실되기 때문에 순수한 물만으로는 전해질 불균형이 해소되지 않습니다.
                        약국에서 경구수액제(ORS) 또는 전해질 보충 제품을 구매하면 더욱 빠른 회복에 도움이 됩니다.
                        소량씩 자주 마시는 것이 한꺼번에 많이 마시는 것보다 위장 부담이 적습니다.
                    </li>
                </ul>

                <div className="bg-brand-50 p-5 rounded-xl border border-brand-100">
                    <h4 className="flex items-center text-brand-700 m-0 mb-2">
                        <span className="text-xl mr-2">💊</span>
                        약사님께 이렇게 말해보세요
                    </h4>
                    <p className="m-0 text-gray-700">
                        &quot;어제 회식 때 소주 2병 마셨는데, 아직도 <strong>속이 울렁거리고 토할 것 같아요.</strong>&quot;
                        <br />
                        &quot;기름진 걸 많이 먹었더니 <strong>명치가 콕콕 찌르듯이 아파요.</strong>&quot;
                    </p>
                </div>
            </div>

            <section className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900">실전 시나리오</h2>
                <div className="space-y-3">
                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-brand-700 bg-brand-50 rounded-full px-2 py-0.5">상황 1</span>
                            <h3 className="text-base font-bold text-gray-900">회식 다음 날 아침, 두통과 구역감이 동시에</h3>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            어젯밤 팀 회식에서 소주 두 병을 마신 뒤 아침에 일어나니 머리가 지끈거리고 속도 울렁입니다.
                            이런 경우 타이레놀 대신 이부프로펜 계열 진통제를 소량의 음식과 함께 복용하고, 반하사심탕 드링크로 구역감을 먼저 잡아주세요.
                            이온음료 한 병을 함께 마시면 전해질 보충이 되어 전반적인 회복 속도가 눈에 띄게 빨라집니다.
                        </p>
                    </div>
                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-brand-700 bg-brand-50 rounded-full px-2 py-0.5">상황 2</span>
                            <h3 className="text-base font-bold text-gray-900">뷔페 후 꽉 막힌 느낌, 속 쓰림과 가스가 동시에</h3>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            주말 뷔페에서 과식 후 배가 빵빵하고, 속도 쓰리고, 트림도 자꾸 나오는 복합 증상이 생겼습니다.
                            이때는 소화효소제 단독으로는 부족하며, 제산제(속 쓰림 완화)와 시메티콘 성분(가스 제거)이 함께 포함된 복합 제품을 약사에게 요청하는 것이 효율적입니다.
                            &quot;과식 후 속 쓰리고 가스도 차요&quot;라고 구체적으로 말씀하시면 약사가 한 번에 적합한 제품을 바로 안내해 드립니다.
                        </p>
                    </div>
                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-brand-700 bg-brand-50 rounded-full px-2 py-0.5">상황 3</span>
                            <h3 className="text-base font-bold text-gray-900">저녁 술자리 전, 미리 약국에 들렀을 때</h3>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            오늘 저녁 피할 수 없는 술자리가 있을 때, 미리 약국에 들러 예방적으로 준비할 수 있습니다.
                            간 대사 보조 앰플이나 밀크씨슬 성분 제품을 술자리 30분 전에 복용하고, 이부프로펜 계열 진통제와 전해질 보충 제품을 함께 챙겨두면 다음 날 아침 회복에 큰 도움이 됩니다.
                            약사에게 &quot;오늘 저녁 술자리 전후로 쓸 제품을 추천해 주세요&quot;라고 하면 한 번에 패키지처럼 안내받을 수 있습니다.
                        </p>
                    </div>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900">자주 묻는 질문</h2>
                <div className="space-y-3">
                    {faqs.map((faq, index) => (
                        <div key={index} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-2">
                            <p className="text-sm font-bold text-gray-900">Q. {faq.q}</p>
                            <p className="text-sm text-gray-600 leading-relaxed">A. {faq.a}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="rounded-2xl border border-gray-200 p-6 sm:p-8 mt-10">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">지금 바로 약국에 가야 한다면?</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            음주 후에는 운전 금지! 가까운 약국을 걸어서 찾아보세요.
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

            <section className="rounded-2xl border border-brand-100 bg-brand-50/40 p-6 space-y-3">
                <h2 className="text-lg font-bold text-gray-900">관련 가이드</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                    <Link href="/guide/call-scripts" className="rounded-xl border border-white bg-white p-4 hover:border-brand-200 hover:shadow-sm transition-all">
                        <p className="text-sm font-bold text-gray-900 hover:text-brand-700">전화 스크립트: 재고 확인 템플릿</p>
                        <p className="text-xs text-gray-500 mt-1">전화로 재고 확인하기</p>
                    </Link>
                    <Link href="/blog/summer-first-aid-kit" className="rounded-xl border border-white bg-white p-4 hover:border-brand-200 hover:shadow-sm transition-all">
                        <p className="text-sm font-bold text-gray-900 hover:text-brand-700">여름철 상비약 완전 정리</p>
                        <p className="text-xs text-gray-500 mt-1">여름 대비 상비약</p>
                    </Link>
                </div>
            </section>

            <AdSlotBottom />

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
            />
        </div>
    );
}
