import Link from "next/link";
import type { Metadata } from "next";
import { buildArticleJsonLd } from "@/lib/seo";

const metaTitle = "소화불량·과음 후 약국에서 물어볼 것 | 오늘약국";
const metaDescription =
    "속이 더부룩하거나 술 마신 다음 날 머리가 깨질 듯 아플 때! 약국에서 증상에 딱 맞는 약을 고르는 꿀팁을 알려드립니다.";

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

            <div className="prose prose-lg prose-brand mx-auto text-gray-700">
                <h3>🤢 PART 1: 소화불량, 증상별로 약이 다르다!</h3>
                <p>단순히 &apos;소화제&apos; 하나가 만능이 아닙니다. 내 증상을 체크해보세요.</p>
                <ul>
                    <li>
                        <strong>과식으로 꽉 막힌 느낌:</strong> 소화효소제(베아제, 훼스탈 등)가 음식물 분해를 돕습니다.
                    </li>
                    <li>
                        <strong>명치가 아프고 위경련이 올 때:</strong> 진경제(부스코판 등)가 위장 근육의 경련을 풀어주어 통증을 줄입니다.
                    </li>
                    <li>
                        <strong>속이 쓰리고 신물이 올라올 때:</strong> 제산제(개비스콘, 알마겔 등)나 위산분비억제제가 필요합니다.
                        <br />
                        <span className="text-sm text-gray-500">* 이때 소화효소제만 먹으면 오히려 속이 더 쓰릴 수 있어요!</span>
                    </li>
                    <li>
                        <strong>배에 가스가 차서 빵빵할 때:</strong> 가스제거 성분(시메티콘)이 포함된 약을 고르세요.
                    </li>
                </ul>

                <hr />

                <h3>🍺 PART 2: 숙취해소, 타이밍과 증상이 생명!</h3>
                <p>숙취도 두통형, 구토형, 피로형 등 유형이 다양합니다.</p>
                <ul>
                    <li>
                        <strong>음주 전 미리 방어:</strong> 간 대사를 돕는 앰플(헤포스, 가네스 등)이나 숙취해소음료를 미리 마시면 알코올 분해를 돕습니다.
                    </li>
                    <li>
                        <strong>머리가 깨질 듯 아플 때:</strong>
                        <span className="text-red-500 font-bold">주의!</span> 술 마신 후 <strong>타이레놀(아세트아미노펜)은 절대 금지</strong>입니다. 간 독성을 유발할 수 있습니다.
                        대신 이부프로펜/덱시부프로펜 계열 진통제를 드시되, 위장 장애가 있다면 반하사심탕 같은 한방 제제가 더 안전할 수 있습니다.
                    </li>
                    <li>
                        <strong>속이 울렁거리고 토할 것 같을 때:</strong> 반하사심탕, 인진호탕 등 위장 운동을 조절하고 구역감을 줄이는 생약 성분 드링크가 효과적입니다.
                    </li>
                    <li>
                        <strong>물만 마시면 된다?</strong> 수분 섭취는 필수지만, 전해질과 당분이 포함된 이온음료나 포도당 캔디, 꿀물을 곁들이면 회복이 훨씬 빠릅니다.
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

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
            />
        </div>
    );
}
