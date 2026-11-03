import type { Metadata } from "next";
import ConsultationGuide from "@/components/blog/ConsultationGuide";
const title = "임신·수유 중 약국 상담 준비";
const intro = "임신 주차와 수유 여부, 복용 중인 제품을 함께 확인해 약국과 진료실에서 상담할 내용을 정리합니다.";
export const metadata: Metadata = { title, description: intro, alternates: { canonical: "/blog/pregnancy-pharmacy-guide" } };
export default function Page() {
  return <ConsultationGuide title={title} intro={intro} correction={"베이킹소다를 물에 타 마시는 자가요법을 허용했던 문장을 삭제했습니다. 임신 중 속쓰림에 베이킹소다를 임의로 섭취하지 말고, 제산제를 포함한 제품의 복용 여부는 담당 의료진·약사에게 확인하세요. 일률적인 임신 영양제 용량과 약물 안전 등급 설명도 철회합니다."} checklist={["임신 주차·출산 예정일 또는 수유 여부를 먼저 알리세요.", "처방약·일반약·영양제·한약의 제품명과 성분표 사진, 마지막 복용 시간을 준비하세요.", "증상의 시작 시점과 변화, 알레르기·기저질환을 메모하세요.", "기존 처방약을 임의로 중단하거나 다른 약으로 바꾸지 말고 처방한 의료진에게 확인하세요."]} faqs={[{"question": "현재 임신 주차 또는 수유 상황에서 이 제품을 사용할 수 있나요?", "answer": "임신 주차 또는 수유 여부와 제품명·성분표를 먼저 알리세요. 같은 증상이라도 개인 상태에 따라 판단이 달라질 수 있으므로 담당 의료진·약사에게 복용 여부를 확인하세요."}, {"question": "기존 처방약·영양제와 중복되는 성분이 있나요?", "answer": "처방약뿐 아니라 일반약·영양제·한약의 포장이나 성분표를 모두 보여주세요. 지금까지 먹은 양과 시각을 함께 전달해 중복 성분과 함께 사용할 때의 주의사항을 확인하세요."}, {"question": "증상이 계속될 때 어디에서 진료를 받아야 하나요?", "answer": "증상이 시작된 시점과 심해지는 양상, 동반 증상을 메모해 담당 의료진에게 연락하세요. 상태가 급격히 나빠지면 약국 운영시간 확인보다 의료기관에 도움을 요청하는 것이 먼저입니다."}]} sources={[{"label": "의약품안전나라 — 제품명으로 허가사항 확인", "url": "https://nedrug.mfds.go.kr/"}, {"label": "임신 중 제산제 관련 NHS Wales 확인 경로 (영문)", "url": "https://111.wales.nhs.uk/encyclopaedia/a/article/antacids"}]} />;
}
