import Link from "next/link";
import type { Metadata } from "next";
import { buildArticleJsonLd } from "@/lib/seo";
import { AdSlotTop, AdSlotBottom } from "@/components/ads/AdSlot";

const metaTitle = "여행 중 처방전 분실 시 대처법 | 약국오늘";
const metaDescription =
    "즐거운 여행 중 복용하던 약을 잃어버렸다면? 처방전 재발급 방법, 약국에서의 대체 조제 가능 여부, 응급실 방문 기준 등 현실적인 대처법을 알려드립니다.";

export const metadata: Metadata = {
    title: metaTitle,
    description: metaDescription,
    alternates: { canonical: "/blog/lost-prescription-action-guide" },
    openGraph: {
        title: metaTitle,
        description: metaDescription,
        url: "/blog/lost-prescription-action-guide",
        type: "article",
        images: ["/og-image.svg"],
    },
};

const faqs = [
    {
        q: "처방전을 잃어버렸는데 약국에서 그냥 약을 줄 수 있나요?",
        a: "전문의약품(처방의약품)은 처방전 없이 약국에서 구매할 수 없습니다. 다만 일반의약품의 경우 증상을 설명하면 약사님이 적절한 대체 약품을 안내해 드릴 수 있습니다. 약봉투에 '전문의약품' 표기가 있었는지 먼저 확인해 보세요.",
    },
    {
        q: "병원 팩스로 처방전을 전송받으려면 어떻게 해야 하나요?",
        a: "원래 진료받은 병원에 전화해 현재 위치 근처 약국의 팩스 번호를 알려주시면 됩니다. 병원에서 해당 약국으로 직접 처방전을 팩스 전송할 수 있으며, 일부 병원은 이메일 발송도 지원합니다. 단, 병원마다 본인 확인 절차와 정책이 다르므로 반드시 사전에 전화로 확인하세요.",
    },
    {
        q: "여행 중 응급실에서도 처방전을 받을 수 있나요?",
        a: "네, 응급실에서도 의사 진료 후 처방전을 받을 수 있습니다. 특히 인슐린·심장약·뇌전증약 등 생명과 직결된 만성질환 약을 분실한 경우라면 야간이나 휴일에도 응급실 방문을 주저하지 마세요. 보통 1~3일분의 응급 처방이 가능합니다.",
    },
    {
        q: "건강보험심사평가원 '내가 먹는 약' 서비스는 어디서 조회하나요?",
        a: "건강보험심사평가원 홈페이지(hira.or.kr) 또는 'The건강보험' 앱에서 공인인증서·간편인증으로 로그인하면 최근 처방 이력과 약품명을 확인할 수 있습니다. 여행 중 스마트폰으로도 바로 조회할 수 있어 재처방 시 매우 유용합니다.",
    },
    {
        q: "대체 조제를 받아도 효과가 같은가요?",
        a: "대체 조제란 동일한 성분·함량을 가진 다른 제약사의 약으로 조제하는 것으로, 생물학적 동등성이 인정된 약품 간에만 허용됩니다. 약효 면에서는 기존 약과 동등하게 인정되며, 약사법에 따라 합법적으로 진행되는 안전한 절차이므로 안심하고 복용하셔도 됩니다.",
    },
    {
        q: "해외여행 중 처방전을 잃어버렸다면 어떻게 해야 하나요?",
        a: "먼저 국내 병원에 국제전화로 영문 처방전 이메일 발송을 요청하세요. 현지 약국이나 병원에서도 약품 성분명(generic name)을 알고 있으면 구매하거나 재처방받기 수월합니다. 여행자 보험에 가입되어 있다면 현지 병원 진료비 보상도 가능하니 보험사에 먼저 문의하는 것도 좋습니다.",
    },
];

export default function Page() {
    const articleJsonLd = buildArticleJsonLd({
        title: metaTitle,
        description: metaDescription,
        slug: "/blog/lost-prescription-action-guide",
    });

    return (
        <div className="mx-auto max-w-3xl space-y-10 py-10">
            <div className="space-y-4 text-center">
                <span className="inline-block rounded-full bg-brand-100 px-3 py-1 text-xs font-bold text-brand-600">
                    위기 탈출 가이드
                </span>
                <h1 className="text-3xl font-extrabold leading-tight text-gray-900 sm:text-4xl">
                    여행 중 처방전(약) 분실 시 당황하지 않고 대처하는 법
                </h1>
                <p className="text-lg text-gray-600">
                    &quot;혈압약인데 하루라도 안 먹으면 불안해요&quot;, &quot;아이 항생제를 잃어버렸어요&quot; <br className="hidden sm:block" />
                    낯선 곳에서 약을 잃어버렸을 때 가장 빠르게 해결하는 방법을 단계별로 안내합니다.
                </p>
            </div>

            <AdSlotTop />

            <section className="rounded-2xl border border-gray-50 bg-white p-6 sm:p-8 shadow-sm space-y-4">
                <h2 className="text-xl font-bold text-gray-900">이 가이드가 필요한 순간</h2>
                <p className="text-gray-700 leading-relaxed">
                    여행 중 처방약을 분실하는 상황은 생각보다 자주 발생합니다. 짐을 분산하다 한 가방에만 약을 챙겼다가 그 가방을 잃어버리거나, 숙소를 옮기는 과정에서 약 파우치를 두고 오는 경우가 대표적입니다. 특히 고혈압·당뇨·갑상선 등 매일 빠짐없이 복용해야 하는 만성질환 약이라면 하루만 빠져도 불안감이 커질 수밖에 없습니다. 상황을 침착하게 파악하고 아래 순서대로 대처하면 대부분의 경우 24시간 이내에 약을 다시 구할 수 있습니다.
                </p>
                <ul className="mt-4 space-y-2">
                    <li className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
                        <span className="text-brand-600 font-bold mt-0.5 shrink-0">✓</span>
                        처방전 없이 살 수 있는 일반의약품인지 먼저 확인해야 합니다
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
                        <span className="text-brand-600 font-bold mt-0.5 shrink-0">✓</span>
                        기존 병원에 팩스·이메일 전송을 요청하면 당일 해결되는 경우가 많습니다
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
                        <span className="text-brand-600 font-bold mt-0.5 shrink-0">✓</span>
                        건강보험심사평가원 &apos;내가 먹는 약&apos; 앱으로 약 이름을 즉시 조회할 수 있습니다
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
                        <span className="text-brand-600 font-bold mt-0.5 shrink-0">✓</span>
                        생명 직결 약(인슐린·심장약 등) 분실 시 야간 응급실도 적절한 선택입니다
                    </li>
                </ul>
            </section>

            <div className="prose prose-lg prose-brand mx-auto text-gray-700">
                <h3>1. 약국에서 바로 살 수 있는 약인지 확인하세요</h3>
                <p>
                    모든 약이 처방전이 필요한 것은 아닙니다. 만성질환 약이나 항생제가 아니라면, 증상을 설명하고
                    <strong>일반의약품</strong>으로 대체할 수 있는지 약사님께 문의하세요.
                    예를 들어 가벼운 진통제, 소화제, 알러지약, 파스 등은 처방전 없이 구매 가능합니다.
                    약봉투에 &apos;전문의약품&apos; 문구가 적혀 있었는지 기억을 떠올려 보세요. 그 문구가 없었다면 일반의약품일 가능성이 높습니다.
                    약사님께 복용하던 약의 이름이나 모양·색깔을 설명하면 적절한 대체 제품을 추천받을 수 있습니다.
                </p>

                <h3>2. 기존 다니던 병원에 전화하여 &apos;처방전 전송&apos; 요청하기</h3>
                <p>
                    가장 확실한 방법은 원래 진료받았던 병원에 연락하는 것입니다.
                    현재 위치 근처의 약국 팩스 번호를 병원에 알려주면, 병원에서 약국으로 처방전을 팩스 전송해 줄 수 있습니다.
                    일부 병원은 이메일이나 의료정보 앱(건강e음, 나의건강기록)을 통한 전자처방전 전달도 지원하므로 전화 시 가능한 방법을 함께 확인하세요.
                    단, 병원 정책이나 의료법 규정에 따라 본인 확인 절차가 필요하거나 불가할 수도 있으니 반드시 전화로 먼저 문의하시기 바랍니다.
                </p>
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 not-prose text-sm text-yellow-800">
                    <strong>Tip:</strong> 평소 처방전이나 약 봉투를 사진 찍어두면, 약 이름과 용량을 정확히 알 수 있어 대체 약 상담이나 재처방 시 매우 큰 도움이 됩니다. 스마트폰 사진첩 내 별도 폴더(예: &apos;내 처방전&apos;)에 보관해 두는 습관을 들이세요.
                </div>

                <h3>3. 근처 병원 방문하여 재처방 받기</h3>
                <p>
                    팩스 전송이 어렵다면 근처 병원을 방문해야 합니다. 이때 중요한 것은 <strong>&apos;내가 먹던 약의 정보&apos;</strong>입니다.
                    건강보험심사평가원 &apos;내가 먹는 약! 한눈에&apos; 서비스(hira.or.kr 또는 앱)에서 최근 처방 이력을 확인할 수 있으며, 공인인증서나 간편인증으로 스마트폰에서도 바로 조회 가능합니다.
                    조회된 약 이름과 용량을 의사에게 보여주면 동일하거나 가장 유사한 약으로 빠르게 처방받을 수 있습니다.
                    <ul>
                        <li>건강보험심사평가원 &apos;내가 먹는 약! 한눈에&apos; 서비스 조회</li>
                        <li>처방전 사진 또는 약 봉투 사진 제시</li>
                        <li>복용 중인 약의 정확한 이름이나 모양 설명</li>
                        <li>성분명(generic name)을 알고 있다면 함께 전달</li>
                    </ul>
                </p>

                <h3>4. 응급실 방문이 필요한 경우</h3>
                <p>
                    휴일이나 야간이라 문 연 병원이 없고, 생명과 직결된 약(심장약, 인슐린, 뇌전증 약 등)을 분실했다면 지체 없이 응급실로 가야 합니다.
                    응급실에서도 기본적으로 1~3일분의 비상 처방이 가능하며, 응급 진료비는 건강보험이 적용되어 일반 진료비와 큰 차이가 없는 경우도 많습니다.
                    여행자 보험에 가입되어 있다면 응급 의료비가 보상될 수 있으니, 보험증권을 미리 스마트폰에 저장해 두는 것도 좋은 방법입니다.
                    당뇨 환자의 경우 인슐린 분실은 즉각적인 위험으로 이어질 수 있으므로, 응급실 방문을 망설이지 마세요.
                </p>

                <h3>5. 대체 조제(동일 성분 조제)란?</h3>
                <p>
                    처방전을 가지고 있는데 해당 약국에 딱 그 제약회사의 약이 없는 경우, 성분과 함량이 동일한 다른 회사의 약으로 조제받을 수 있습니다.
                    이는 &apos;생물학적 동등성&apos;이 인정된 약품 간에 허용되는 합법적 절차로, 약사법에 근거합니다.
                    대체 조제를 진행할 경우 약사는 처방 의사에게 사후 통보 의무가 있으며, 환자에게도 반드시 고지해야 합니다.
                    따라서 약사님이 대체 조제를 권하시면 안심하고 복용하셔도 되며, 궁금한 점은 약사님께 직접 문의하세요.
                </p>

                <hr />

                <h3>요약: 여행 떠나기 전 3가지 체크리스트</h3>
                <ol>
                    <li>여분의 약을 2-3일치 넉넉하게 챙기기 (분산 보관 추천)</li>
                    <li>처방전이나 약 봉투 사진 찍어두기</li>
                    <li>만성질환자는 영문 처방전(해외여행 시) 준비하기</li>
                </ol>
            </div>

            <section className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900">실전 시나리오</h2>
                <div className="space-y-3">
                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-brand-700 bg-brand-50 rounded-full px-2 py-0.5">상황 1</span>
                            <h3 className="text-base font-bold text-gray-900">주말 여행 중 혈압약을 숙소에 두고 왔어요</h3>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            토요일 오전, 숙소를 체크아웃하고 나서야 혈압약을 방에 두고 온 것을 알았습니다. 먼저 스마트폰으로 건강보험심사평가원 앱에 접속해 처방 이력을 확인하고, 근처 문 연 내과를 찾아 약 이름과 용량을 보여주며 당일 재처방을 받았습니다. 주말에도 문을 여는 병원을 &apos;약국오늘&apos;에서 미리 검색해 두면 시간을 크게 절약할 수 있습니다.
                        </p>
                    </div>
                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-brand-700 bg-brand-50 rounded-full px-2 py-0.5">상황 2</span>
                            <h3 className="text-base font-bold text-gray-900">아이 항생제를 분실해서 치료 중단이 걱정됩니다</h3>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            이틀째 항생제를 복용 중이던 아이의 약 파우치를 버스 안에 두고 내렸습니다. 항생제는 처방전 없이 구매할 수 없기 때문에 근처 소아과를 방문했고, 원래 처방 병원에서 팩스로 처방 내역을 전송받아 같은 성분의 항생제를 조제받을 수 있었습니다. 항생제는 치료 기간을 끝까지 지키는 것이 중요하므로 분실 즉시 대처하는 것이 바람직합니다.
                        </p>
                    </div>
                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-brand-700 bg-brand-50 rounded-full px-2 py-0.5">상황 3</span>
                            <h3 className="text-base font-bold text-gray-900">명절 연휴 중 인슐린 주사기를 잃어버렸어요</h3>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            추석 연휴 첫날 저녁, 인슐린 케이스를 분실한 것을 뒤늦게 발견했습니다. 연휴라 병원은 문을 닫았고, 혈당이 걱정되어 바로 응급실을 찾았습니다. 응급실 담당 의사가 혈당 수치를 확인한 후 3일치 인슐린과 주사기를 처방해 주었으며, 건강보험 적용으로 예상보다 적은 비용으로 해결할 수 있었습니다.
                        </p>
                    </div>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900">자주 묻는 질문(FAQ)</h2>
                <div className="space-y-3">
                    {faqs.map((faq, i) => (
                        <div key={i} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-2">
                            <h3 className="text-base font-bold text-gray-900">Q. {faq.q}</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">A. {faq.a}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="rounded-2xl bg-brand-50 p-6 sm:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">근처 약국/병원 찾기가 급하신가요?</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            지금 바로 내 주변 운영 중인 약국을 확인하세요.
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
                    <Link href="/blog/prescription-holiday-guide" className="rounded-xl border border-white bg-white p-4 hover:border-brand-200 hover:shadow-sm transition-all">
                        <p className="text-sm font-bold text-gray-900 hover:text-brand-700">처방전 약 연휴에 못 받을 때 대처법</p>
                        <p className="text-xs text-gray-500 mt-1">연휴 처방전 긴급 대처</p>
                    </Link>
                    <Link href="/blog/pharmacy-visit-checklist-3" className="rounded-xl border border-white bg-white p-4 hover:border-brand-200 hover:shadow-sm transition-all">
                        <p className="text-sm font-bold text-gray-900 hover:text-brand-700">약국 방문 전 확인 3가지</p>
                        <p className="text-xs text-gray-500 mt-1">방문 전 체크리스트</p>
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
