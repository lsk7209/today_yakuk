import Link from "next/link";
import type { Metadata } from "next";
import { buildArticleJsonLd } from "@/lib/seo";

const metaTitle = "고혈압·당뇨약 복용자, 명절/연휴 대비 필수 체크리스트 | 오늘약국";
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

export default function Page() {
    const articleJsonLd = buildArticleJsonLd({
        title: metaTitle,
        description: metaDescription,
        slug: "/blog/hypertension-diabetes-holiday-tips",
    });

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

            <div className="prose prose-lg prose-brand mx-auto text-gray-700">
                <h3>1. 약 재고 파악은 &apos;일주일 전&apos;에!</h3>
                <p>
                    가장 흔한 실수가 &quot;연휴 시작 전날 병원 가야지&quot;라고 미루는 것입니다.
                    연휴 직전에는 대기 환자가 많거나 조기 마감될 수 있습니다.
                    최소 일주일 전에 남은 약 개수를 세어보고, 연휴 기간을 포함해 <strong>3~5일치 여유분</strong>을 미리 처방받으세요.
                </p>

                <h3>2. 약 먹는 시간을 놓쳤다면?</h3>
                <div className="rounded-xl border border-red-100 bg-red-50 p-5">
                    <ul className="my-0">
                        <li>
                            <strong>고혈압약:</strong> 생각난 즉시 복용하세요. 단, 다음 복용 시간이 8시간도 남지 않았다면 이번 회차는 건너뛰고 다음 정해진 시간에 드세요. 절대 2배 용량을 드시면 안 됩니다(저혈압 쇼크 위험).
                        </li>
                        <li>
                            <strong>당뇨약:</strong> 식전/식후 복용 원칙이 중요합니다. 식사 시간을 놓쳐 저혈당 위험이 있다면 사탕 등을 섭취하고, 약 복용 여부는 자가혈당 측정 후 결정하는 것이 안전합니다. 인슐린 주사는 투여 시기를 놓쳤으면 의사와 미리 상의했던 메뉴얼을 따르세요.
                        </li>
                    </ul>
                </div>

                <h3>3. 기름진 명절 음식, 혈당 스파이크 주의보</h3>
                <p>
                    떡, 전, 잡채 등 명절 음식은 탄수화물과 지방이 폭발적입니다.
                </p>
                <ul>
                    <li>
                        <strong>채소 먼저 먹기:</strong> 나물이나 쌈 채소를 식사 맨 처음에 먹으면 혈당 상승 폭을 완만하게 줄일 수 있습니다.
                    </li>
                    <li>
                        <strong>과음 주의:</strong> 술은 그 자체로 칼로리가 높고, 안주 섭취를 늘리며, 간 기능을 저하해 약물 대사에 영향을 줍니다. 분위기만 즐기시고 절주하세요.
                    </li>
                </ul>

                <h3>4. 연휴 중 응급 상황 대처</h3>
                <p>
                    혹시라도 갑작스러운 흉통, 심한 두통, 마비 증상, 의식 저하 등이 나타나면 지체 없이 119를 부르거나 응급실로 가야 합니다.
                    이때 의료진에게 <strong>복용 중인 약 리스트(처방전 사진)</strong>를 보여주면 신속한 처치에 큰 도움이 됩니다.
                </p>

                <hr />
                <p className="text-center font-bold text-brand-700">
                    미리 준비하는 센스가 건강한 연휴를 만듭니다.<br />
                    오늘 저녁, 남은 약 봉투를 꼭 확인해보세요!
                </p>
            </div>

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

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
            />
        </div>
    );
}
