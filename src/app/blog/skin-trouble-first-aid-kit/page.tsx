import Link from "next/link";
import type { Metadata } from "next";
import { buildArticleJsonLd } from "@/lib/seo";
import { AdSlotTop, AdSlotBottom } from "@/components/ads/AdSlot";

const metaTitle = "피부 트러블(벌레·햇빛) 응급 처치 키트";
const metaDescription =
    "여름철 야외활동이나 여행 시 필수! 벌레 물렸을 때, 햇빛 화상 입었을 때, 갑작스러운 알러지에 대비하는 약국 상비약 키트를 소개합니다.";

export const metadata: Metadata = {
    title: metaTitle,
    description: metaDescription,
    alternates: { canonical: "/blog/skin-trouble-first-aid-kit" },
    openGraph: {
        title: metaTitle,
        description: metaDescription,
        url: "/blog/skin-trouble-first-aid-kit",
        type: "article",
        images: ["/og-image.svg"],
    },
};

export default function Page() {
    const articleJsonLd = buildArticleJsonLd({
        title: metaTitle,
        description: metaDescription,
        slug: "/blog/skin-trouble-first-aid-kit",
    });

    const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "홈", item: "https://todaypharm.kr/" },
      { "@type": "ListItem", position: 2, name: "블로그", item: "https://todaypharm.kr/blog" },
      { "@type": "ListItem", position: 3, name: "피부 트러블 응급 키트", item: "https://todaypharm.kr/blog/skin-trouble-first-aid-kit" },
    ],
  };
    const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      { "@type": "Question", name: "아이에게 사용할 수 있는 피부 트러블 약은?", acceptedAnswer: { "@type": "Answer", text: "키즈 전용 항히스타민 연고와 소아용 저농도 모기 기피제(이카리딘 성분)를 사용하세요. 스테로이드 연고는 소아과 상담 후 사용하는 것이 안전합니다." } },
      { "@type": "Question", name: "일광화상 시 물집을 터트려도 되나요?", acceptedAnswer: { "@type": "Answer", text: "물집은 터트리지 마세요. 터트리면 2차 세균 감염 위험이 높아집니다. 화상 연고(덱스판테놀)를 부드럽게 도포하고 느슨한 면 소재 옷을 입어 자극을 줄이세요." } },
      { "@type": "Question", name: "먹는 항히스타민제는 운전 중 복용해도 되나요?", acceptedAnswer: { "@type": "Answer", text: "졸음이 올 수 있으므로 운전 전에는 주의하세요. 로라타딘(클라리틴) 계열은 상대적으로 졸음이 덜해 낮 활동 중 복용에 유리합니다." } },
    ],
  };
  const howToJsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "피부 트러블 증상별 응급 처치 3단계",
    description: metaDescription,
    step: [
      { "@type": "HowToStep", position: 1, name: "벌레 물림 대처", text: "물린 직후 5~10분 이내 항히스타민 연고를 도포하고 냉찜질을 병행하세요. 긁어 상처가 생기면 항생제 연고를 덧바르고 밴드로 덮으세요." },
      { "@type": "HowToStep", position: 2, name: "일광화상 대처", text: "시원한 물로 15~20분간 피부를 식힌 뒤 냉장 보관한 알로에 베라 겔을 도포하세요. 통증이 심하면 이부프로펜 소염진통제를 복용하세요." },
      { "@type": "HowToStep", position: 3, name: "두드러기·알러지 대처", text: "전신에 두드러기가 생기면 먹는 항히스타민제를 복용하고, 진물이 나는 부위에는 칼라민 로션을 도포하세요. 증상이 심하면 즉시 의원을 방문하세요." },
    ],
  };
  return (
        <div className="mx-auto max-w-3xl space-y-10 py-10">
            <div className="space-y-4 text-center">
                <span className="inline-block rounded-full bg-brand-100 px-3 py-1 text-xs font-bold text-brand-600">
                    계절별 준비물
                </span>
                <h1 className="text-3xl font-extrabold leading-tight text-gray-900 sm:text-4xl">
                    캠핑·여행 필수! 피부 트러블 응급 처치 키트 구성하기
                </h1>
                <p className="text-lg text-gray-600">
                    모기에 퉁퉁 부었을 때, 햇빛에 화끈거릴 때 당황하지 마세요. <br className="hidden sm:block" />
                    약국에서 미리 준비하면 좋은 피부 상비약 리스트를 공개합니다.
                </p>
            </div>

            <AdSlotTop />

            <section className="rounded-2xl border border-gray-50 bg-white p-6 sm:p-8 shadow-sm space-y-4">
                <h2 className="text-xl font-bold text-gray-900">이 키트가 필요한 순간</h2>
                <p className="text-gray-700 leading-relaxed">
                    여름철 야외활동 중 갑작스러운 피부 트러블은 여행 전체를 망칠 수 있습니다. 가까운 약국을 찾기 어려운 캠핑장이나 해외 여행지에서는 미리 챙겨 온 응급 처치 키트 하나가 큰 차이를 만듭니다. 국내 야외 활동 인구가 연간 1,500만 명을 넘어서면서 피부 트러블 관련 상담 건수도 매년 여름마다 급증하는 추세입니다. 증상이 심해지기 전에 초기 대응만 제대로 해도 2차 감염이나 장기 흉터를 예방할 수 있습니다.
                </p>
                <ul className="mt-4 space-y-2">
                    <li className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
                        <span className="text-brand-600 font-bold mt-0.5 shrink-0">✓</span>
                        캠핑·등산·낚시 등 야외 활동 시 벌레 물림과 풀독 노출 위험이 높아집니다.
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
                        <span className="text-brand-600 font-bold mt-0.5 shrink-0">✓</span>
                        해변·계곡에서의 장시간 자외선 노출은 일광화상으로 이어져 수일간 고통을 줄 수 있습니다.
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
                        <span className="text-brand-600 font-bold mt-0.5 shrink-0">✓</span>
                        어린아이가 동행할 경우 성인용과 소아용 약품을 반드시 구분하여 준비해야 합니다.
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
                        <span className="text-brand-600 font-bold mt-0.5 shrink-0">✓</span>
                        약국 영업 시간 외 새벽이나 공휴일에도 즉시 대응할 수 있도록 미리 구비해 두는 것이 안전합니다.
                    </li>
                </ul>
            </section>

            <div className="prose prose-lg prose-brand mx-auto text-gray-700">
                <h3>🚨 CASE 1: 벌레에 물렸을 때 (모기, 개미 등)</h3>
                <ul>
                    <li>
                        <strong>바르는 항히스타민제/소염제:</strong> 물린 직후 가려움과 붓기를 가라앉힙니다. (예: 버물리, 써버쿨 등) 최대한 빨리 발라야 히스타민 반응을 억제할 수 있으므로 물린 후 5~10분 이내 도포가 이상적입니다. 냉찜질과 병행하면 초기 부기를 더 빠르게 줄일 수 있습니다.
                        <br />
                        <span className="text-sm text-gray-500">* 아이용은 자극이 적은 키즈 전용 제품을 추천합니다.</span>
                    </li>
                    <li>
                        <strong>스테로이드 연고 (약한 강도):</strong> 심하게 부어오르거나 알러지 반응이 있을 때 효과적입니다. (예: 리도맥스 등) 하루 1~2회 소량을 얇게 도포하는 것이 기본이며, 7일 이상 지속 사용은 피하는 것이 좋습니다. 얼굴이나 회음부 등 피부가 얇은 부위에는 특히 주의가 필요합니다.
                        <br />
                        <span className="text-sm text-gray-500">* 긁어서 상처가 난 곳에는 항생제 연고를 먼저 발라야 합니다.</span>
                    </li>
                    <li>
                        <strong>모기 기피제:</strong> 예방이 최선! &apos;이카리딘&apos; 성분 함유 제품이 안전하고 효과적입니다. 활동 30분 전 노출 부위에 충분히 뿌려야 효과가 지속되며, 땀을 많이 흘린 후에는 2~3시간마다 재도포가 필요합니다. 영유아에게는 반드시 소아용 저농도 제품을 선택해야 합니다.
                    </li>
                </ul>

                <h3>☀️ CASE 2: 햇빛에 화상을 입었을 때 (일광화상)</h3>
                <ul>
                    <li>
                        <strong>알로에 베라 겔:</strong> 냉장고에 넣어 차갑게 한 후 바르면 열감을 식히는 데 탁월합니다. 약은 아니지만 필수품입니다. 화상 부위를 먼저 시원한 물로 15~20분간 식힌 뒤 도포하면 더욱 효과적이며, 수분 공급과 피부 진정을 동시에 해결할 수 있습니다. 여행 중에는 소형 튜브 타입을 가방에 항상 넣어두는 것이 좋습니다.
                    </li>
                    <li>
                        <strong>화상 연고 (덱스판테놀, 구아이아줄렌):</strong> 피부 재생을 돕고 염증을 완화합니다. (예: 비판텐, 아즈렌 등) 덱스판테놀은 피부 세포 재생에 직접 관여하는 성분으로, 일광화상의 홍반과 벗겨짐을 줄이는 데 도움이 됩니다. 화상 부위가 물집이 잡혔다면 터트리지 않고 연고를 부드럽게 도포해야 2차 감염을 막을 수 있습니다.
                    </li>
                    <li>
                        <strong>소염진통제 (먹는 약):</strong> 화끈거림과 통증이 너무 심하다면 이부프로펜 등 진통제를 복용하는 것이 도움이 됩니다. 이부프로펜은 소염 작용도 있어 일광화상의 붉어짐과 붓기를 함께 완화해 주는 장점이 있습니다. 위장이 약한 분은 공복 복용을 피하고, 위장 보호제와 함께 복용하면 좋습니다.
                    </li>
                </ul>

                <h3>🌿 CASE 3: 풀독, 알 수 없는 두드러기</h3>
                <ul>
                    <li>
                        <strong>먹는 항히스타민제:</strong> 전신에 두드러기가 나거나 가려움이 멈추지 않을 때 가장 빠른 해결책입니다. (예: 지르텍, 클라리틴 등) 세티리진(지르텍) 계열은 작용 시간이 빠르고 지속 시간이 길어 여행 중 사용하기 편리합니다. 로라타딘(클라리틴) 계열은 상대적으로 졸음이 덜해 낮 활동 중 복용에 유리합니다.
                        <br />
                        <span className="text-sm text-gray-500">* 졸음이 올 수 있으니 운전 전에는 주의하세요.</span>
                    </li>
                    <li>
                        <strong>칼라민 로션:</strong> 진물이나거나 가려운 부위에 바르면 쿨링 효과와 진정 효과가 있습니다. 아연 성분이 피부 분비물을 건조시키고 염증을 가라앉혀, 풀에 스쳤거나 땀띠처럼 퍼진 발진에도 효과적입니다. 도포 전 부위를 가볍게 세정하고 완전히 건조한 후 바르면 흡수가 잘 됩니다.
                    </li>
                    <li>
                        <strong>항생제 연고:</strong> 긁히거나 상처가 생긴 피부에 2차 세균 감염을 예방합니다. (예: 후시딘, 마데카솔 등) 야외 환경에서 생긴 작은 찰과상이나 벌레에 긁힌 상처는 세균에 노출되기 쉬우므로, 상처를 깨끗이 세척한 뒤 항생제 연고를 바르고 밴드로 덮어두는 것이 좋습니다.
                    </li>
                </ul>

                <hr />

                <h3>💡 팁: 약국에서 이렇게 말씀하세요</h3>
                <p className="bg-gray-50 p-4 rounded-lg">
                    &quot;주말에 캠핑 가는데, 아이랑 같이 쓸 수 있는 순한 벌레약이랑 화상 연고 주세요.&quot;
                    <br />
                    &quot;제가 모기에 물리면 퉁퉁 붓는 알러지가 있는데, 먹는 약도 같이 챙겨주세요.&quot;
                    <br />
                    &quot;5박 6일 여행인데 피부 트러블 대비해서 상비약 세트로 추천해 주실 수 있나요?&quot;
                </p>

                <h3>📦 키트 구성 체크리스트</h3>
                <p>
                    아래 항목을 인쇄하거나 메모 앱에 저장해 약국 방문 전 참고하세요. 약사에게 보여주면 빠르게 추천받을 수 있습니다.
                </p>
                <ul>
                    <li>바르는 항히스타민제 (키즈용·성인용 구분)</li>
                    <li>약한 강도 스테로이드 연고 1종</li>
                    <li>항생제 연고 1종 (상처 대비)</li>
                    <li>덱스판테놀 화상 연고 1종</li>
                    <li>먹는 항히스타민제 (1박 1정 기준으로 여유분 포함)</li>
                    <li>이부프로펜 소염진통제 (성인용)</li>
                    <li>이카리딘 모기 기피제</li>
                    <li>알로에 베라 겔 또는 칼라민 로션</li>
                    <li>멸균 거즈, 밴드, 의료용 테이프 (소량)</li>
                </ul>
            </div>

            <section className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900">실전 시나리오</h2>
                <div className="space-y-3">
                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-brand-700 bg-brand-50 rounded-full px-2 py-0.5">상황 1</span>
                            <h3 className="text-base font-bold text-gray-900">캠핑장 저녁, 아이가 모기에 대여섯 군데 물렸을 때</h3>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            텐트 안에서 잠들려는 아이가 모기에 집중적으로 물려 울음을 터뜨렸습니다. 이럴 때는 준비해 간 키즈 전용 바르는 항히스타민제를 즉시 도포하고, 차가운 물수건으로 2~3분간 냉찜질을 해 주면 빠르게 진정됩니다. 긁어서 상처가 생겼다면 항생제 연고를 덧바르고 밴드로 덮어 아이가 더 긁지 않도록 해 주세요.
                        </p>
                    </div>
                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-brand-700 bg-brand-50 rounded-full px-2 py-0.5">상황 2</span>
                            <h3 className="text-base font-bold text-gray-900">바닷가에서 온종일 수영 후 등과 어깨가 빨갛게 달아올랐을 때</h3>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            선크림을 발랐지만 수영 후 재도포를 잊어 일광화상이 생긴 경우입니다. 숙소에 돌아오면 바로 시원한 샤워로 피부를 식히고, 냉장고에 보관해 둔 알로에 베라 겔을 넓게 도포합니다. 통증이 심하다면 이부프로펜 소염진통제를 복용하고, 화상 부위에는 비판텐 연고를 얇게 바른 뒤 느슨한 면 소재 옷을 입어 자극을 최소화하세요.
                        </p>
                    </div>
                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-brand-700 bg-brand-50 rounded-full px-2 py-0.5">상황 3</span>
                            <h3 className="text-base font-bold text-gray-900">등산 중 풀숲을 지나다 팔뚝 전체에 발진과 가려움이 퍼졌을 때</h3>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            옻나무·쐐기풀 등 식물 접촉성 피부염은 처음엔 작은 붉은 반점으로 시작하지만 수 시간 내 급격히 퍼질 수 있습니다. 등산로에서 내려오는 즉시 깨끗한 물로 해당 부위를 씻어내고, 먹는 항히스타민제를 복용하면서 칼라민 로션을 발라 가려움을 억제합니다. 발진이 얼굴이나 목으로 번지거나 호흡 곤란이 느껴진다면 즉시 병원을 방문해야 합니다.
                        </p>
                    </div>
                </div>
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-6 sm:p-8 shadow-sm space-y-6">
                <h2 className="text-xl font-bold text-gray-900">자주 묻는 질문</h2>
                <div className="space-y-5 divide-y divide-gray-100">
                    <div className="pt-5 first:pt-0 space-y-2">
                        <p className="text-sm font-bold text-gray-900">Q. 벌레에 물린 곳에 스테로이드 연고와 항생제 연고를 같이 써도 되나요?</p>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            긁혀서 상처가 난 부위라면 항생제 연고를 먼저 바르고, 붓기가 심한 주변 피부에 스테로이드 연고를 별도로 바르는 방식으로 사용할 수 있습니다. 두 연고를 같은 부위에 겹쳐 바르기보다는 목적에 따라 구분해서 사용하는 것이 효과적입니다. 사용 전 약사에게 두 제품을 보여주고 확인받는 것이 가장 안전합니다.
                        </p>
                    </div>
                    <div className="pt-5 space-y-2">
                        <p className="text-sm font-bold text-gray-900">Q. 일광화상이 생겼을 때 물집을 터트려야 할까요?</p>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            물집은 피부가 스스로 보호하기 위해 만든 방어막이므로 절대 인위적으로 터트리지 않는 것이 원칙입니다. 터트리면 2차 세균 감염과 흉터 위험이 크게 높아집니다. 덱스판테놀 연고를 부드럽게 바르고 멸균 거즈로 덮어 보호하면서 자연스럽게 흡수될 때까지 기다리는 것이 좋습니다.
                        </p>
                    </div>
                    <div className="pt-5 space-y-2">
                        <p className="text-sm font-bold text-gray-900">Q. 먹는 항히스타민제는 증상이 없을 때도 미리 먹어두면 효과가 있나요?</p>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            알러지 반응이 예상되는 환경(예: 꽃가루 많은 봄 등산)에 앞서 1시간 전 복용하면 예방적 효과를 기대할 수 있습니다. 단, 매일 장기 복용은 전문가 상담 없이 권장하지 않으며, 캠핑·여행 기간에 한해 단기로 활용하는 것이 일반적입니다. 졸음 부작용이 걱정된다면 로라타딘 또는 펙소페나딘 계열을 약사에게 요청해 보세요.
                        </p>
                    </div>
                    <div className="pt-5 space-y-2">
                        <p className="text-sm font-bold text-gray-900">Q. 피부 트러블 상비약은 어떤 조건으로 보관해야 하나요?</p>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            대부분의 연고류는 직사광선을 피하고 서늘한 곳(25°C 이하)에 보관하는 것이 원칙입니다. 여름철 차량 내부나 텐트 안은 온도가 급격히 올라가므로 아이스박스 또는 그늘진 배낭 안쪽에 보관하는 것이 좋습니다. 알로에 베라 겔의 경우 냉장 보관 시 훨씬 청량한 효과를 낼 수 있어 여행지 숙소 냉장고에 바로 넣어두는 것을 추천합니다.
                        </p>
                    </div>
                    <div className="pt-5 space-y-2">
                        <p className="text-sm font-bold text-gray-900">Q. 아이에게 어른용 스테로이드 연고를 소량 써도 괜찮을까요?</p>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            소아의 피부는 성인보다 얇고 흡수율이 높아 어른용 연고를 사용하면 전신 흡수량이 과도해질 수 있습니다. 특히 얼굴이나 피부가 겹치는 부위에는 더욱 주의가 필요합니다. 반드시 소아용으로 허가된 제품을 사용하고, 약사에게 아이의 나이와 체중을 알려준 뒤 적합한 제품을 추천받는 것이 가장 안전합니다.
                        </p>
                    </div>
                </div>
            </section>

            <section className="rounded-2xl bg-brand-50 p-6 sm:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">여행 전 약국 들르는 것을 깜빡하셨나요?</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            목적지 근처나 가는 길에 있는 약국을 미리 찾아보세요.
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
                    <Link href="/blog/summer-first-aid-kit" className="rounded-xl border border-white bg-white p-4 hover:border-brand-200 hover:shadow-sm transition-all">
                        <p className="text-sm font-bold text-gray-900 hover:text-brand-700">여름철 상비약 완전 정리</p>
                        <p className="text-xs text-gray-500 mt-1">여름 대비 상비약</p>
                    </Link>
                    <Link href="/guide/summer-emergency-kit" className="rounded-xl border border-white bg-white p-4 hover:border-brand-200 hover:shadow-sm transition-all">
                        <p className="text-sm font-bold text-gray-900 hover:text-brand-700">여름 응급 키트 구성법</p>
                        <p className="text-xs text-gray-500 mt-1">휴가철 대비 키트</p>
                    </Link>
                    <Link href="/blog/pharmacy-visit-checklist-3" className="rounded-xl border border-white bg-white p-4 hover:border-brand-200 hover:shadow-sm transition-all">
                        <p className="text-sm font-bold text-gray-900 hover:text-brand-700">약국 방문 전 3가지 확인</p>
                        <p className="text-xs text-gray-500 mt-1">영업·재고·처방 확인</p>
                    </Link>
                    <Link href="/guide/call-scripts" className="rounded-xl border border-white bg-white p-4 hover:border-brand-200 hover:shadow-sm transition-all">
                        <p className="text-sm font-bold text-gray-900 hover:text-brand-700">약국 전화 확인 문장</p>
                        <p className="text-xs text-gray-500 mt-1">방문 전 문의 체크리스트</p>
                    </Link>
                </div>
            </section>

            <section className="rounded-2xl border border-gray-100 bg-gray-50 p-6 space-y-4">
        <h2 className="text-lg font-bold text-gray-900">함께 읽으면 좋은 글</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { href: "/blog/lutein-astaxanthin-guide", label: "루테인 vs 아스타잔틴", desc: "자외선 노출 후 눈 건강 영양제 선택법" },
            { href: "/blog/vitamin-d-deficiency-guide", label: "비타민D 결핍 신호 7가지", desc: "햇빛 차단 시 부족해지는 비타민D 보충" },
            { href: "/wiki", label: "영양제 위키 전체 보기 →", desc: "식약처 데이터 기반 영양제·건강기능식품 정보" },
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
