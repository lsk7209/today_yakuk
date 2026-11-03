import type { Metadata } from "next";
import ConsultationGuide from "@/components/blog/ConsultationGuide";
const title = "어린이 해열제 복용 전 약국 상담 준비";
const intro = "아이의 나이·체중, 제품별 농도와 복용 기록을 정리해 약사·의료진에게 확인할 질문을 안내합니다.";
export const metadata: Metadata = { title, description: intro, alternates: { canonical: "/blog/kids-fever-medicine-comparison" } };
export default function Page() {
  return <ConsultationGuide title={title} intro={intro}
    correction="제품별 허가사항을 직접 대조하지 않은 공통 용량·연령·간격 표와 일률적인 금기 설명을 삭제했습니다. 해열제를 임의로 추가하거나 교대하지 마세요. 의사의 처방과 복용 간격 안내가 있다면 그 내용을 약사와 함께 확인하세요. 특정 시간이 지날 때까지 기다려야 한다는 뜻으로 이 글을 사용하지 마세요."
    checklist={[
      "아이의 생년월일·현재 체중, 증상의 시작 시점과 체온 측정 기록을 준비하세요.",
      "복용한 제품의 포장·성분명·농도, 실제 먹인 양과 시각을 기록하세요.",
      "같은 상표라도 성분이나 농도가 다를 수 있으므로 제품을 직접 보여주세요.",
      "호흡이 힘들거나 의식이 떨어지는 등 응급상황이 의심되면 약국 검색을 기다리지 말고 119에 도움을 요청하세요.",
    ]}
    faqs={[{"question": "이 제품의 허가사항이 아이의 나이와 체중에 맞나요?", "answer": "아이의 현재 체중과 나이, 제품명·성분명·농도를 함께 보여주고 해당 제품의 허가사항을 확인해 달라고 요청하세요. 다른 제품의 복용량 표를 그대로 적용하지 마세요."}, {"question": "같은 성분이 감기약이나 다른 제품에도 들어 있나요?", "answer": "같은 상표인지보다 실제 성분과 농도를 확인해야 합니다. 감기약과 최근 사용한 제품을 모두 가져가 성분이 겹치는지 약사에게 확인하세요."}, {"question": "복용한 양이나 시간이 불명확할 때 어떻게 확인해야 하나요?", "answer": "확실하지 않은 복용량이나 시각을 추측해 추가로 먹이지 말고, 알고 있는 기록과 제품을 의료진·약사에게 전달하세요. 과량 복용이 의심되거나 상태가 나빠지면 즉시 의료기관에 도움을 요청하세요."}, {"question": "약국 상담보다 의료기관 진료가 먼저 필요한 상태인가요?", "answer": "증상의 시작 시점과 변화, 아이의 반응·호흡·수분 섭취 상태 등을 의료진에게 전달하세요. 호흡이 힘들거나 의식이 떨어지는 등 응급상황이 의심되면 119에 도움을 요청하세요."}]}
    sources={[
      { label: "의약품안전나라 — 제품별 용법·용량과 주의사항 확인", url: "https://nedrug.mfds.go.kr/" },
      { label: "식품의약품안전처 어린이 해열제 복용 안내 확인 경로", url: "https://www.mfds.go.kr/" },
    ]} />;
}
