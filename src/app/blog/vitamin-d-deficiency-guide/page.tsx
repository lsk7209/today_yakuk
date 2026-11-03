import type { Metadata } from "next";
import ConsultationGuide from "@/components/blog/ConsultationGuide";
const title = "비타민D 검사·보충제 상담 전 확인할 것";
const intro = "검사 결과와 이미 복용하는 제품을 바탕으로 약사·의료진에게 확인할 질문을 정리합니다.";
export const metadata: Metadata = { title, description: intro, alternates: { canonical: "/blog/vitamin-d-deficiency-guide" } };
export default function Page() {
  return <ConsultationGuide title={title} intro={intro} correction={"조사 대상과 원문을 확인하지 못한 국내 성인 75% 부족 통계, 증상만으로 결핍을 판단하는 설명, 누구에게나 적용하는 용량·햇빛 노출 시간을 삭제했습니다. 이 글은 결핍 진단이나 보충 용량을 정하지 않습니다."} checklist={["검사받았다면 검사명·결과 수치·단위·검사일을 함께 준비하세요.", "종합비타민 등 이미 복용하는 모든 제품의 성분표와 하루 섭취량을 확인하세요.", "처방받은 제품이 있다면 일반 보충제와 구분해 상담하세요.", "기저질환·다른 약·임신 여부에 따라 판단이 달라질 수 있으므로 현재 상태를 알려주세요."]} faqs={[{"question": "검사 결과가 제 상황에서 어떤 의미인지 확인할 수 있나요?", "answer": "검사명·수치·단위·검사일을 함께 확인해야 합니다. 인터넷에서 본 기준 하나로 결핍을 판단하거나 제품을 고르지 말고 검사한 의료기관에 결과의 의미를 물어보세요."}, {"question": "여러 제품의 비타민D가 중복되는지 함께 봐주실 수 있나요?", "answer": "각 제품의 하루 섭취량과 비타민D 표시 함량을 제품별로 적어 가져가세요. 처방약과 보충제를 구분해 보여주고 추가 섭취가 필요한지 상담하세요."}, {"question": "추가 검사나 처방 의료진의 확인이 필요한가요?", "answer": "검사를 받게 된 이유, 현재 복용하는 제품과 기간을 의료진에게 알려주세요. 추가 검사 여부와 추적 시점은 개인 상태에 따라 확인하며 이 글에서는 공통 일정을 제시하지 않습니다."}]} sources={[{"label": "의약품안전나라 — 의약품 허가사항", "url": "https://nedrug.mfds.go.kr/"}, {"label": "식품안전나라 — 건강기능식품 신고정보", "url": "https://www.foodsafetykorea.go.kr/"}]} />;
}
