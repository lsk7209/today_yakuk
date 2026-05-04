import "dotenv/config";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

type SearchIntent = "정보형" | "문제해결형" | "비교형" | "체크리스트형" | "FAQ형";

type Topic = {
  id: number;
  category: string;
  title: string;
  slug: string;
  mainKeyword: string;
  expandedKeywords: string[];
  searchIntent: SearchIntent;
  targetReader: string;
  contentAngle: string;
  seasonality: string;
  sourceType: "pharmacy" | "medicine" | "supplement" | "season";
};

type ExistingTitle = {
  title: string;
  slug?: string;
};

type QueueItem = {
  hpid: null;
  title: string;
  slug: string;
  region: null;
  theme: "blog";
  content_html: string;
  ai_summary: string;
  ai_faq: { question: string; answer: string }[];
  ai_bullets: null;
  ai_cta: null;
  extra_sections: null;
  status: "pending";
  publish_at: string;
};

type ScoredQueueItem = QueueItem & {
  quality_score: number;
};

const OUTPUT_DIR = path.join(process.cwd(), "content");
const CSV_PATH = path.join(OUTPUT_DIR, "title-candidates-2026-05-04.csv");
const JSON_PATH = path.join(OUTPUT_DIR, "blog-campaign-2026-05-04.json");
const POSTS_PER_RUN = 100;
const HOUR_MS = 60 * 60 * 1000;
const MIN_QUALITY_SCORE = 85;
const SITE_URL = "https://www.todaypharm.kr";

const OFFICIAL_SOURCES = {
  pharmacy: {
    label: "응급의료포털 E-Gen",
    url: "https://www.e-gen.or.kr/",
    note: "문 여는 약국 정보는 공공 데이터와 현장 사정이 달라질 수 있어 방문 전 전화 확인이 필요합니다.",
  },
  medicine: {
    label: "식품의약품안전처 의약품안전나라",
    url: "https://nedrug.mfds.go.kr/",
    note: "의약품 성분과 허가 사항은 제품별로 다르므로 포장, 설명서, 약사 상담을 함께 확인해야 합니다.",
  },
  supplement: {
    label: "식품안전나라 건강기능식품 정보",
    url: "https://www.foodsafetykorea.go.kr/",
    note: "건강기능식품은 질병 치료제가 아니며 섭취 전 성분, 함량, 주의 대상을 확인해야 합니다.",
  },
  season: {
    label: "질병관리청 건강정보",
    url: "https://www.kdca.go.kr/",
    note: "계절성 건강 문제는 개인 질환과 복용 약에 따라 대응이 달라질 수 있습니다.",
  },
} as const;

const TOPICS: Topic[] = [
  ...buildTopics("약국 찾기/영업시간", "pharmacy", [
    ["내 주변 약국 찾기 전 확인할 영업시간 기준", "nearby-pharmacy-hours-check", "내 주변 약국", ["영업시간", "전화 확인", "헛걸음 방지"], "문제해결형", "급하게 약국을 찾는 사용자", "영업시간과 전화 확인 순서"],
    ["야간 약국 검색 시 반경을 넓히는 순서", "night-pharmacy-radius-order", "야간 약국", ["반경 검색", "위치", "종료 임박"], "체크리스트형", "퇴근 후 약국을 찾는 직장인", "2km에서 10km까지 확장 기준"],
    ["주말 약국 찾기에서 놓치기 쉬운 전화 확인", "weekend-pharmacy-call-check", "주말 약국", ["전화 확인", "재고", "방문 전"], "문제해결형", "주말에 상비약이 필요한 가정", "전화로 영업과 재고를 확인하는 문장"],
    ["공휴일 약국 이용 전 지도와 목록 비교 기준", "holiday-pharmacy-map-list", "공휴일 약국", ["지도", "목록", "길찾기"], "비교형", "공휴일에 가까운 약국을 찾는 사용자", "지도 검색과 목록 검색 차이"],
    ["24시간 약국 찾을 때 실제 영업 확인하는 법", "twenty-four-hour-pharmacy-check", "24시간 약국", ["실제 영업", "전화", "야간"], "정보형", "심야 시간대 방문자", "표시 정보와 실제 운영 차이"],
    ["휴일지킴이약국 검색 후 바로 확인할 항목", "holiday-duty-pharmacy-after-search", "휴일지킴이약국", ["검색 후 확인", "전화", "영업시간"], "체크리스트형", "공공 검색을 이용하는 사용자", "검색 결과 이후 행동"],
    ["일요일 약국 찾기에서 가까움보다 중요한 기준", "sunday-pharmacy-priority", "일요일 약국", ["거리", "영업 종료", "재고"], "비교형", "일요일 약국 방문자", "거리보다 도착 가능성 우선"],
    ["새벽 약국 문의 전 준비할 증상·복용 정보", "early-morning-pharmacy-call-info", "새벽 약국", ["증상", "복용약", "상담"], "문제해결형", "새벽에 가족 약을 찾는 보호자", "전화 상담 전 준비 정보"],
    ["근처 약국 길찾기 전 도착 시간을 계산하는 법", "nearby-pharmacy-arrival-time", "근처 약국", ["길찾기", "도착 시간", "종료 임박"], "정보형", "지도 앱으로 이동하는 사용자", "도착 가능성과 영업 종료 비교"],
    ["동네 약국 선택 시 대형 약국과 비교할 점", "local-pharmacy-vs-large-pharmacy", "동네 약국", ["대형 약국", "상담", "재고"], "비교형", "처음 방문 약국을 고르는 사용자", "접근성과 상담 차이"],
    ["약국 영업시간 변동이 생기는 날 확인 순서", "pharmacy-hours-change-days", "약국 영업시간", ["변동", "공휴일", "방문 전"], "체크리스트형", "명절·연휴 방문자", "변동 가능성이 큰 날짜"],
    ["문 여는 약국 찾기 결과가 다를 때 대처법", "open-pharmacy-result-difference", "문 여는 약국", ["검색 결과", "전화", "대체 약국"], "문제해결형", "검색 결과가 헷갈리는 사용자", "서로 다른 정보 비교"],
    ["약국 전화 연결이 안 될 때 다음 후보 찾는 법", "pharmacy-no-answer-next-option", "약국 전화", ["연결 안 됨", "대체", "반경 확장"], "문제해결형", "통화 실패 사용자", "후보를 빠르게 바꾸는 기준"],
    ["약국 재고 확인 전화에서 꼭 물어볼 표현", "pharmacy-stock-call-phrases", "약국 재고 확인", ["전화 표현", "제품명", "대체품"], "FAQ형", "특정 약을 찾는 사용자", "재고 문의 스크립트"],
    ["약국 위치 권한 허용 전 알아둘 개인정보 기준", "pharmacy-location-permission", "약국 위치 권한", ["개인정보", "위치", "검색"], "정보형", "위치 기반 검색 초보자", "위치 권한의 의미"],
    ["가까운 약국이 닫았을 때 후보를 좁히는 순서", "closed-nearby-pharmacy-next", "가까운 약국", ["닫힘", "후보", "야간"], "체크리스트형", "가장 가까운 약국이 닫힌 사용자", "대체 후보 좁히기"],
    ["약국 검색 결과에서 종료 임박 표시 읽는 법", "pharmacy-closing-soon-label", "약국 검색 결과", ["종료 임박", "영업시간", "방문"], "정보형", "모바일 검색 사용자", "종료 임박 해석"],
    ["지역 약국 목록을 볼 때 먼저 확인할 세 가지", "regional-pharmacy-list-check", "지역 약국 목록", ["목록", "전화", "주소"], "체크리스트형", "지역 페이지 방문자", "목록 기반 선택 기준"],
  ]),
  ...buildTopics("상황별 약국 이용", "pharmacy", [
    ["퇴근 후 약국 이용 시 시간 손실 줄이는 순서", "after-work-pharmacy-time-save", "퇴근 후 약국", ["시간 절약", "길찾기", "전화"], "문제해결형", "직장인", "퇴근 동선 최적화"],
    ["여행 중 약국 찾기 전 숙소 주변 확인법", "travel-pharmacy-near-hotel", "여행 약국", ["숙소", "상비약", "지도"], "체크리스트형", "국내 여행자", "숙소 기준 검색"],
    ["출장 중 처방전 없이 약국 상담받는 요령", "business-trip-pharmacy-consult", "출장 약국", ["처방전 없음", "상담", "증상 설명"], "정보형", "출장자", "낯선 지역 약국 이용"],
    ["명절 약국 이용 시 가족 복용약 정리법", "holiday-family-medicine-list", "명절 약국", ["가족", "복용약", "상담"], "체크리스트형", "명절 귀성 가족", "가족 복용 정보 정리"],
    ["병원 닫은 뒤 약국에서 먼저 물어볼 질문", "after-clinic-closed-pharmacy-questions", "병원 닫은 뒤 약국", ["상담 질문", "응급", "대체"], "FAQ형", "야간 증상 사용자", "병원·약국 판단"],
    ["휴가철 약국 방문 전 챙길 증상 메모", "vacation-pharmacy-symptom-note", "휴가철 약국", ["증상 메모", "상비약", "상담"], "체크리스트형", "휴가 중 가족", "증상 기록"],
    ["장거리 운전 전 약국에서 확인할 졸림 주의", "long-drive-pharmacy-drowsiness", "운전 전 약국", ["졸림", "감기약", "복용 주의"], "정보형", "장거리 운전자", "운전 전 약 복용 주의"],
    ["해외여행 전 약국에서 준비할 상비약 기준", "overseas-travel-pharmacy-kit", "해외여행 상비약", ["약국", "구급상자", "복용법"], "체크리스트형", "해외여행자", "출국 전 준비"],
    ["시험 기간 약국 상담 전 피로·수면 정보 정리", "exam-period-pharmacy-fatigue-sleep", "시험 기간 약국", ["피로", "수면", "영양제"], "정보형", "학생과 보호자", "피로 상담 기준"],
    ["야외활동 전 약국에서 준비할 피부·벌레 대책", "outdoor-pharmacy-skin-insect", "야외활동 약국", ["피부", "벌레물림", "자외선"], "체크리스트형", "캠핑·등산 사용자", "야외 상비품"],
    ["반려가족과 외출 전 사람 약 보관 주의사항", "pet-family-human-medicine-storage", "약 보관", ["반려동물", "외출", "보관"], "정보형", "반려동물 가정", "사람 약 보관 안전"],
    ["회사 비상약함 운영 전 약국 상담 포인트", "office-first-aid-box-pharmacy", "회사 비상약함", ["상비약", "보관", "유효기간"], "문제해결형", "소규모 사업장 담당자", "사무실 비상약 기준"],
    ["이사 후 단골 약국을 고를 때 보는 기준", "after-moving-regular-pharmacy", "단골 약국", ["이사", "상담", "접근성"], "비교형", "이사한 가정", "장기 이용 기준"],
    ["혼자 사는 사람이 약국 정보 저장해둘 항목", "single-household-pharmacy-info", "1인 가구 약국", ["저장", "전화번호", "야간"], "체크리스트형", "1인 가구", "긴급 정보 저장"],
  ]),
  ...buildTopics("응급 상비약", "medicine", [
    ["가정 상비약 구비 기준: 해열·소화·상처 대응", "home-first-aid-medicine-basics", "가정 상비약", ["해열제", "소화제", "상처"], "체크리스트형", "가정", "기본 구성"],
    ["응급약 보관함 정리 전 유효기간 확인 순서", "emergency-medicine-expiry-check", "응급약", ["유효기간", "보관", "폐기"], "체크리스트형", "가정 상비약 관리자", "정리 루틴"],
    ["구급상자 구성 시 약국에서 상담할 품목", "first-aid-box-pharmacy-items", "구급상자", ["품목", "상담", "보관"], "정보형", "초보 가정", "구급상자 품목"],
    ["해열제 상비 전 성분과 연령 확인하는 법", "fever-reducer-ingredient-age", "해열제", ["성분", "연령", "용량"], "정보형", "보호자", "성분·연령 기준"],
    ["진통제 고를 때 위장·간 질환 확인이 필요한 이유", "painkiller-stomach-liver-check", "진통제", ["위장", "간", "복용 주의"], "문제해결형", "통증으로 약국 방문자", "기저질환 확인"],
    ["소화제 상비약 고를 때 증상별로 나누는 기준", "digestive-medicine-symptom-choice", "소화제", ["속쓰림", "더부룩함", "설사"], "비교형", "소화 불편 사용자", "증상별 선택"],
    ["지사제 복용 전 약국에서 먼저 확인할 증상", "anti-diarrhea-pharmacy-warning", "지사제", ["설사", "탈수", "발열"], "문제해결형", "급성 설사 사용자", "복용 전 확인"],
    ["알레르기약 상비 시 졸림과 운전 주의 기준", "allergy-medicine-drowsiness-driving", "알레르기약", ["졸림", "운전", "복용 시간"], "정보형", "알레르기 사용자", "생활 주의"],
    ["상처 밴드와 소독제 선택 전 확인할 상처 상태", "wound-bandage-disinfectant-choice", "상처약", ["밴드", "소독제", "상처 상태"], "비교형", "가벼운 상처 사용자", "상처 상태 분류"],
    ["화상 응급약 준비 전 병원 방문 신호 구분", "burn-first-aid-pharmacy-limit", "화상 응급약", ["병원 신호", "냉각", "연고"], "문제해결형", "가벼운 화상 사용자", "약국 대응 한계"],
    ["벌레물림 약 고를 때 가려움·통증 구분 기준", "insect-bite-medicine-itch-pain", "벌레물림 약", ["가려움", "통증", "부기"], "비교형", "야외활동 사용자", "증상별 선택"],
    ["멀미약 준비 전 복용 시간과 졸림 확인법", "motion-sickness-medicine-timing", "멀미약", ["복용 시간", "졸림", "여행"], "정보형", "여행자", "복용 타이밍"],
    ["파스와 바르는 진통제 선택 전 통증 위치 보기", "patch-topical-pain-relief-choice", "파스", ["바르는 진통제", "통증 위치", "피부"], "비교형", "근육통 사용자", "제형별 선택"],
    ["비상약함을 아이 손이 닿지 않게 보관하는 법", "medicine-storage-child-safety", "비상약함", ["아이 안전", "보관", "오남용"], "체크리스트형", "아이 있는 가정", "안전 보관"],
  ]),
  ...buildTopics("어린이/임산부/고령자", "medicine", [
    ["어린이 약 복용 전 체중과 연령 확인 순서", "children-medicine-weight-age", "어린이 약", ["체중", "연령", "용량"], "체크리스트형", "보호자", "용량 확인"],
    ["아이 감기약 상담 전 증상 기록하는 법", "child-cold-medicine-symptom-note", "아이 감기약", ["증상 기록", "기침", "콧물"], "문제해결형", "부모", "상담 준비"],
    ["어린이 해열제 교차복용 전 약사에게 물을 질문", "children-fever-reducer-questions", "어린이 해열제", ["교차복용", "질문", "시간 간격"], "FAQ형", "부모", "질문 정리"],
    ["임산부 약국 상담 전 임신 주수와 복용약 정리", "pregnancy-pharmacy-week-medicine", "임산부 약국", ["임신 주수", "복용약", "상담"], "체크리스트형", "임산부", "상담 정보"],
    ["수유 중 약 복용 전 확인할 성분과 시간", "breastfeeding-medicine-ingredient-time", "수유 중 약", ["성분", "복용 시간", "상담"], "정보형", "수유부", "복용 시간 확인"],
    ["고령자 복약 관리에서 중복 성분을 찾는 법", "senior-medication-duplicate-ingredient", "고령자 복약", ["중복 성분", "처방약", "일반약"], "문제해결형", "고령자 보호자", "중복 확인"],
    ["만성질환자가 약국에서 영양제 상담받는 순서", "chronic-disease-supplement-consult", "만성질환 영양제", ["상담", "복용약", "상호작용"], "정보형", "만성질환자", "영양제 상담"],
    ["혈압약 복용자가 감기약 살 때 확인할 항목", "blood-pressure-cold-medicine-check", "혈압약 감기약", ["감기약", "혈압", "상담"], "체크리스트형", "고혈압 환자", "성분 확인"],
    ["당뇨 환자가 약국에서 감기약 상담할 때", "diabetes-cold-medicine-pharmacy", "당뇨 감기약", ["혈당", "성분", "상담"], "정보형", "당뇨 환자", "혈당 관련 확인"],
    ["부모님 약 봉투 정리 전 확인할 복용 시간", "parents-medicine-bag-schedule", "부모님 약", ["약 봉투", "복용 시간", "정리"], "체크리스트형", "자녀 보호자", "복용 일정 정리"],
    ["청소년 여드름 약 상담 전 피부 상태 설명법", "teen-acne-pharmacy-consult", "청소년 여드름 약", ["피부 상태", "상담", "자극"], "문제해결형", "청소년과 보호자", "피부 상태 설명"],
    ["어린이 알레르기약 선택 전 졸림 확인 기준", "children-allergy-medicine-drowsiness", "어린이 알레르기약", ["졸림", "학교", "복용 시간"], "정보형", "보호자", "생활 패턴 고려"],
  ]),
  ...buildTopics("증상별 약국 상담", "medicine", [
    ["감기약 상담 전 기침·콧물·열을 구분하는 법", "cold-medicine-cough-runny-fever", "감기약", ["기침", "콧물", "열"], "문제해결형", "감기 증상 사용자", "증상 분류"],
    ["기침약 고를 때 마른기침과 가래기침 차이", "cough-medicine-dry-phlegm", "기침약", ["마른기침", "가래기침", "상담"], "비교형", "기침 증상 사용자", "기침 유형"],
    ["콧물약 복용 전 졸림과 운전 주의 확인", "runny-nose-medicine-drowsiness", "콧물약", ["졸림", "운전", "복용 시간"], "정보형", "비염·감기 사용자", "생활 주의"],
    ["두통약 상담 전 통증 위치와 반복 여부 정리", "headache-medicine-location-repeat", "두통약", ["통증 위치", "반복", "상담"], "체크리스트형", "두통 사용자", "두통 정보 기록"],
    ["속쓰림 약 고르기 전 식사 시간 확인법", "heartburn-medicine-meal-timing", "속쓰림 약", ["식사 시간", "위산", "복용"], "정보형", "속쓰림 사용자", "식사와 증상 관계"],
    ["설사 증상일 때 약국에서 먼저 말할 정보", "diarrhea-pharmacy-info", "설사", ["탈수", "발열", "지사제"], "문제해결형", "급성 설사 사용자", "위험 신호"],
    ["변비약 상담 전 복용약과 생활습관 체크", "constipation-medicine-consult-check", "변비약", ["복용약", "생활습관", "상담"], "체크리스트형", "변비 사용자", "원인 파악"],
    ["피부 가려움 약국 상담 전 발진 모양 확인", "itchy-skin-pharmacy-rash", "피부 가려움", ["발진", "가려움", "연고"], "문제해결형", "피부 증상 사용자", "피부 상태 설명"],
    ["눈 건조할 때 인공눈물 선택 전 확인할 점", "dry-eye-artificial-tears-check", "인공눈물", ["눈 건조", "렌즈", "보존제"], "비교형", "안구건조 사용자", "제품 선택"],
    ["입병 약 고르기 전 통증 위치와 기간 보기", "mouth-ulcer-medicine-duration", "입병 약", ["통증", "기간", "구내염"], "정보형", "구내염 사용자", "기간 기준"],
    ["근육통 약국 상담 전 파스와 먹는 약 비교", "muscle-pain-patch-oral-medicine", "근육통", ["파스", "먹는 약", "피부"], "비교형", "근육통 사용자", "제형 비교"],
    ["생리통 약 복용 전 위장 부담 줄이는 기준", "period-pain-medicine-stomach", "생리통 약", ["위장", "복용 시간", "진통제"], "정보형", "생리통 사용자", "복용 전 주의"],
    ["숙취 약국 상담 전 증상별로 나누는 질문", "hangover-pharmacy-symptom-questions", "숙취 약국", ["두통", "속쓰림", "수분"], "FAQ형", "숙취 사용자", "증상별 상담"],
    ["알레르기 비염 약 선택 전 지속 기간 확인", "allergic-rhinitis-medicine-duration", "알레르기 비염 약", ["지속 기간", "졸림", "상담"], "정보형", "비염 사용자", "기간과 생활 패턴"],
  ]),
  ...buildTopics("의약품 위키", "medicine", [
    ["일반의약품과 전문의약품 차이, 약국 상담 기준", "otc-vs-prescription-medicine", "일반의약품", ["전문의약품", "약국 상담", "처방전"], "비교형", "의약품 구분이 헷갈리는 사용자", "의약품 분류"],
    ["복약법 읽을 때 용법·용량·횟수 구분하는 법", "medicine-directions-dose-frequency", "복약법", ["용법", "용량", "횟수"], "정보형", "약 봉투를 확인하는 사용자", "복약 표시 해석"],
    ["같은 성분 약을 중복 복용하지 않는 확인법", "same-ingredient-duplicate-medicine", "중복 복용", ["성분", "제품명", "상담"], "문제해결형", "여러 약을 복용하는 사용자", "성분 확인"],
    ["약 복용 간격을 지켜야 하는 이유와 확인법", "medicine-dose-interval-check", "복용 간격", ["시간", "용량", "복약"], "정보형", "복용 시간을 놓치는 사용자", "간격 관리"],
    ["약 부작용 의심 시 약국에 설명할 내용", "medicine-side-effect-pharmacy-report", "약 부작용", ["의심", "증상", "상담"], "문제해결형", "복용 후 이상 증상 사용자", "상담 정보"],
    ["처방약과 일반약 함께 먹기 전 확인할 기준", "prescription-otc-combination-check", "처방약 일반약", ["병용", "상호작용", "상담"], "체크리스트형", "처방약 복용자", "병용 확인"],
    ["약 보관 온도와 습도, 욕실 보관이 위험한 이유", "medicine-storage-temperature-humidity", "약 보관", ["온도", "습도", "욕실"], "정보형", "가정 약 보관자", "보관 환경"],
    ["유효기간 지난 약 처리 전 약국에 물어볼 점", "expired-medicine-disposal-pharmacy", "유효기간 지난 약", ["폐기", "약국", "보관"], "FAQ형", "상비약 정리 사용자", "폐기 기준"],
    ["약 봉투에 적힌 식전·식후·취침 전 의미", "medicine-label-before-after-bedtime", "약 봉투", ["식전", "식후", "취침 전"], "정보형", "처방약 복용자", "복용 시점 해석"],
    ["분말·시럽·정제 약 제형별 복용 주의사항", "medicine-form-powder-syrup-tablet", "약 제형", ["분말", "시럽", "정제"], "비교형", "다양한 제형 복용자", "제형별 차이"],
    ["약을 깜빡했을 때 다음 복용 전 확인할 원칙", "missed-dose-next-step", "약 깜빡", ["복용 누락", "다음 복용", "상담"], "문제해결형", "복용을 놓친 사용자", "누락 대처"],
    ["약국 복약상담을 잘 받기 위한 질문 목록", "pharmacy-medication-counseling-questions", "복약상담", ["질문", "복용약", "주의사항"], "FAQ형", "약국 상담 초보자", "질문 목록"],
  ]),
  ...buildTopics("건강기능식품 위키", "supplement", [
    ["영양제 추천보다 먼저 확인할 성분·함량 기준", "supplement-ingredient-dose-check", "영양제", ["성분", "함량", "섭취 주의"], "정보형", "영양제 구매자", "추천 전 확인"],
    ["비타민D 고를 때 함량과 섭취 시간 확인법", "vitamin-d-dose-timing", "비타민D", ["함량", "섭취 시간", "주의"], "정보형", "비타민D 구매자", "함량과 시간"],
    ["오메가3 선택 전 원료와 복용약 확인 기준", "omega3-source-medication-check", "오메가3", ["원료", "복용약", "상담"], "체크리스트형", "오메가3 구매자", "원료·병용"],
    ["유산균 고를 때 균수보다 봐야 할 표시사항", "probiotics-label-check", "유산균", ["표시사항", "보관", "섭취"], "비교형", "유산균 구매자", "표시사항 해석"],
    ["마그네슘 섭취 전 설사와 복용약 확인하기", "magnesium-diarrhea-medication", "마그네슘", ["설사", "복용약", "섭취 주의"], "정보형", "마그네슘 구매자", "부담 확인"],
    ["루테인 제품 고를 때 눈 건강 표시 읽는 법", "lutein-eye-health-label", "루테인", ["눈 건강", "표시", "함량"], "정보형", "눈 건강 관심자", "표시 읽기"],
    ["종합비타민과 단일 영양제 차이, 선택 기준", "multivitamin-vs-single-supplement", "종합비타민", ["단일 영양제", "성분 중복", "선택"], "비교형", "영양제 입문자", "중복 성분"],
    ["건강기능식품 섭취 전 약사에게 물어볼 질문", "supplement-pharmacist-questions", "건강기능식품", ["약사 상담", "복용약", "주의"], "FAQ형", "건기식 구매자", "상담 질문"],
  ]),
  ...buildTopics("계절/날씨 건강", "season", [
    ["환절기 약국 준비물, 감기·비염 구분 기준", "season-change-pharmacy-cold-rhinitis", "환절기 약국", ["감기", "비염", "준비물"], "비교형", "환절기 증상 사용자", "감기와 비염 구분"],
    ["폭염 대비 약국에서 확인할 탈수·피부 관리", "heatwave-pharmacy-dehydration-skin", "폭염 약국", ["탈수", "피부", "수분"], "체크리스트형", "여름철 외출자", "폭염 대비"],
    ["한파 때 약국 방문 전 감기약과 보온용품 체크", "cold-wave-pharmacy-cold-warmth", "한파 약국", ["감기약", "보온", "건조"], "체크리스트형", "겨울철 사용자", "한파 준비"],
    ["미세먼지 심한 날 약국에서 물어볼 눈·코 관리", "fine-dust-pharmacy-eye-nose", "미세먼지 약국", ["눈", "코", "마스크"], "문제해결형", "미세먼지 민감자", "눈·코 대응"],
    ["장마철 약 보관과 피부 트러블 예방 기준", "rainy-season-medicine-storage-skin", "장마철 약 보관", ["습도", "피부", "보관"], "정보형", "장마철 가정", "습도 관리"],
    ["독감 유행기 약국 상담 전 열·기침 기록법", "flu-season-pharmacy-fever-cough", "독감 유행기", ["열", "기침", "상담"], "체크리스트형", "독감 의심 사용자", "증상 기록"],
    ["자외선 강한 날 약국에서 준비할 피부 보호품", "uv-day-pharmacy-skin-protection", "자외선 약국", ["선크림", "피부", "야외활동"], "정보형", "야외활동 사용자", "자외선 대비"],
    ["겨울 건조증 약국 상담 전 부위별 증상 정리", "winter-dryness-pharmacy-body-area", "겨울 건조증", ["피부", "코", "눈"], "문제해결형", "겨울철 건조 증상 사용자", "부위별 상담"],
  ]),
];

function buildTopics(
  category: string,
  sourceType: Topic["sourceType"],
  rows: Array<[string, string, string, string[], SearchIntent, string, string]>,
): Topic[] {
  return rows.map((row) => ({
    id: 0,
    category,
    title: row[0],
    slug: row[1],
    mainKeyword: row[2],
    expandedKeywords: row[3],
    searchIntent: row[4],
    targetReader: row[5],
    contentAngle: row[6],
    seasonality: category === "계절/날씨 건강" ? "계절성" : "상시",
    sourceType,
  }));
}

function normalizeTitle(value: string) {
  return value
    .toLowerCase()
    .replace(/[|:·,.'"`!?()[\]{}]/g, " ")
    .replace(/\b(가이드|체크리스트|방법|기준|정리|faq|top10)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(value: string) {
  return normalizeTitle(value)
    .split(/\s+/)
    .filter((token) => token.length >= 2);
}

function similarity(a: string, b: string) {
  const left = new Set(tokens(a));
  const right = new Set(tokens(b));
  if (!left.size || !right.size) return 0;
  let intersection = 0;
  left.forEach((token) => {
    if (right.has(token)) intersection += 1;
  });
  return Math.round((intersection / Math.max(left.size, right.size)) * 100);
}

function csvEscape(value: string | number) {
  const text = String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
}

function getFirstPublishAt() {
  const now = new Date();
  const first = new Date(now.getTime() + HOUR_MS);
  first.setMinutes(30, 0, 0);
  if (first.getTime() <= now.getTime()) first.setHours(first.getHours() + 1);
  return first;
}

function getPublishAt(index: number, firstPublishAt: Date) {
  return new Date(firstPublishAt.getTime() + index * 5 * HOUR_MS).toISOString();
}

async function collectExistingTitles(): Promise<ExistingTitle[]> {
  const existing: ExistingTitle[] = [];

  const staticBlogDir = path.join(process.cwd(), "src", "app", "blog");
  if (fs.existsSync(staticBlogDir)) {
    const files = fs.readdirSync(staticBlogDir, { withFileTypes: true });
    for (const file of files) {
      if (!file.isDirectory() || file.name.startsWith("[")) continue;
      const pagePath = path.join(staticBlogDir, file.name, "page.tsx");
      if (!fs.existsSync(pagePath)) continue;
      const source = fs.readFileSync(pagePath, "utf8");
      const match = source.match(/const\s+metaTitle\s*=\s*"([^"]+)"/);
      existing.push({ title: match?.[1] ?? file.name.replace(/-/g, " "), slug: file.name });
    }
  }

  const topicPath = path.join(process.cwd(), "content", "blog-topics.md");
  if (fs.existsSync(topicPath)) {
    const source = fs.readFileSync(topicPath, "utf8");
    source.split(/\r?\n/).forEach((line) => {
      const match = line.match(/^\d+\.\s+(.+)$/);
      if (match?.[1]) existing.push({ title: match[1].trim() });
    });
  }

  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (supabaseUrl && serviceKey) {
    const supabase = createClient(supabaseUrl, serviceKey);
    const { data, error } = await supabase
      .from("content_queue")
      .select("title, slug")
      .in("status", ["published", "pending", "review"]);
    if (error) throw error;
    data?.forEach((item) => existing.push({ title: item.title, slug: item.slug }));
  }

  return existing;
}

function scoreTopic(topic: Topic, nearestSimilarity: number) {
  let score = 88;
  if (topic.title.length >= 18 && topic.title.length <= 44) score += 4;
  if (topic.title.indexOf(topic.mainKeyword) <= 8) score += 3;
  if (topic.expandedKeywords.length >= 3) score += 2;
  if (nearestSimilarity >= 70) score -= 18;
  if (nearestSimilarity >= 55) score -= 7;
  if (/(완치|무조건|100%|치료 보장|특효)/.test(topic.title)) score -= 20;
  return Math.max(0, Math.min(100, score));
}

function makeSummary(topic: Topic) {
  const [first, second, third] = topic.expandedKeywords;
  return `${topic.mainKeyword}는 ${first}과 ${second}를 먼저 확인해야 헛걸음과 오복용을 줄일 수 있습니다. 이 글은 ${topic.targetReader}가 ${third}까지 점검하며 약국 상담을 준비하는 기준을 정리합니다.`;
}

function makeFaq(topic: Topic) {
  const [first, second, third] = topic.expandedKeywords;
  return [
    {
      question: `${topic.mainKeyword}는 약국 방문 전 무엇을 먼저 확인해야 하나요?`,
      answer: `${first}을 먼저 확인하고, 상황이 급하면 전화로 ${second}까지 확인하는 것이 좋습니다.`,
    },
    {
      question: `${topic.mainKeyword} 관련 상담을 받을 때 어떤 정보를 말해야 하나요?`,
      answer: `증상 시작 시점, 현재 복용 중인 약, 알레르기 여부, ${third} 관련 상황을 짧게 정리하면 상담이 빨라집니다.`,
    },
    {
      question: `검색 정보만 보고 바로 방문해도 되나요?`,
      answer: `영업시간과 재고는 현장 사정에 따라 달라질 수 있어 방문 전 전화 확인을 권장합니다.`,
    },
    {
      question: `병원 진료가 필요한 신호는 무엇인가요?`,
      answer: `고열, 호흡곤란, 심한 통증, 반복되는 구토, 의식 저하처럼 일상 대처가 어려운 증상은 약국보다 진료가 우선입니다.`,
    },
  ];
}

function makeContentHtml(topic: Topic) {
  const source = OFFICIAL_SOURCES[topic.sourceType];
  const [first, second, third] = topic.expandedKeywords;
  const summary = makeSummary(topic);
  const checklist = [
    `${topic.mainKeyword} 목적을 한 문장으로 정리합니다.`,
    `${first}을 확인하고 검색 결과를 다시 좁힙니다.`,
    `${second}은 전화나 제품 설명으로 재확인합니다.`,
    `${third}이 애매하면 약사에게 현재 상황을 먼저 설명합니다.`,
    `증상이 심하거나 오래가면 병원 진료가 필요한지 물어봅니다.`,
  ];

  return `
<div class="key-takeaways">
  <h3>핵심 요약</h3>
  <ul>
    <li>${topic.mainKeyword}는 ${first} 확인이 출발점입니다.</li>
    <li>${second}은 검색 결과만 믿지 말고 방문 전 한 번 더 확인해야 합니다.</li>
    <li>${third}까지 정리하면 약국 상담 시간이 줄고 선택 실수를 줄일 수 있습니다.</li>
  </ul>
</div>
<p>${summary}</p>
<p>${topic.contentAngle}이 중요한 이유는 약국 정보가 실시간으로 바뀌고, 같은 증상처럼 보여도 나이·복용약·생활 상황에 따라 적절한 선택이 달라지기 때문입니다. 특히 야간이나 주말처럼 선택지가 적은 시간에는 검색, 전화, 이동 판단을 한 번에 정리해야 합니다.</p>
<h2>1. ${topic.mainKeyword}에서 먼저 봐야 할 기준</h2>
<h3>${first}을 먼저 확인하는 이유</h3>
<p>${first}은 ${topic.title}의 첫 번째 판단 기준입니다. 가까운 약국이나 익숙한 제품이 보여도 실제 영업 여부, 보유 재고, 복용 가능 여부가 맞지 않으면 다시 이동해야 합니다. 약국오늘에서 후보를 확인한 뒤 전화로 한 번 더 확인하면 이동 시간을 줄일 수 있습니다.</p>
<p>공공 정보와 포털 정보는 업데이트 시점이 다를 수 있습니다. ${source.label} 같은 공식 자료도 참고하되, 마지막 판단은 방문 전 전화 확인과 현장 상담으로 보완하는 편이 안전합니다.</p>
<h3>${second}을 확인해야 하는 상황</h3>
<p>${second}은 같은 검색어 안에서도 결과가 갈리는 지점입니다. 예를 들어 영업시간이 표시되어도 조제 가능 시간, 재고 보유 여부, 특정 제형 취급 여부는 별도 확인이 필요할 수 있습니다. 전화할 때는 제품명보다 성분, 증상, 복용 대상자를 함께 말하면 대체 선택지를 안내받기 쉽습니다.</p>
<div class="info-box">
  <h3>방문 전 한 줄 확인</h3>
  <p>“지금 방문하면 ${topic.mainKeyword} 관련 상담이나 구매가 가능한가요?”라고 묻고, 이어서 ${first}과 ${second}을 확인하세요.</p>
</div>
<h2>2. 약국 상담 전 준비할 정보</h2>
<h3>증상과 시간을 짧게 정리하기</h3>
<p>약사는 제한된 정보 안에서 일반의약품, 생활 관리, 진료 권고 여부를 판단합니다. 증상이 언제 시작됐는지, 얼마나 반복됐는지, 이미 복용한 약이 있는지, 알레르기나 기저질환이 있는지를 말하면 상담 정확도가 높아집니다.</p>
<ul class="checklist">
${checklist.map((item) => `  <li>${item}</li>`).join("\n")}
</ul>
<h3>복용 중인 약과 대상자 정보</h3>
<p>어린이, 임산부, 고령자, 만성질환자는 같은 제품도 주의 기준이 달라질 수 있습니다. 약 봉투, 처방전 사진, 건강기능식품 목록을 보여주면 중복 성분과 병용 주의 여부를 더 빠르게 확인할 수 있습니다.</p>
<blockquote class="expert-quote">
  <p>약국 상담은 제품명을 고르는 절차가 아니라 현재 상황에 맞는 위험 신호와 선택 기준을 확인하는 과정입니다.</p>
  <cite>약국오늘 복약 정보 편집 기준</cite>
</blockquote>
<h2>3. 선택지를 비교할 때 보는 표</h2>
<h3>검색 결과와 실제 방문 가능성 비교</h3>
<p>검색 결과가 많을수록 좋은 것은 아닙니다. 실제로는 도착 시간, 통화 가능 여부, 재고, 상담 필요성의 우선순위를 정해야 합니다. 아래 표처럼 비교하면 급한 상황에서도 판단이 단순해집니다.</p>
<table>
  <thead>
    <tr><th>구분</th><th>먼저 볼 점</th><th>주의할 점</th></tr>
  </thead>
  <tbody>
    <tr><td>${first}</td><td>현재 상황과 맞는지 확인</td><td>표시 정보가 최신인지 전화 확인</td></tr>
    <tr><td>${second}</td><td>방문 전 문의 가능 여부</td><td>재고와 조제 가능 시간은 변동 가능</td></tr>
    <tr><td>${third}</td><td>복용 대상자와 증상에 맞는지 상담</td><td>심한 증상은 진료 우선</td></tr>
  </tbody>
</table>
<h3>공식 정보와 현장 정보를 함께 쓰기</h3>
<p>${source.label} 자료는 기본 기준을 확인하는 데 도움이 됩니다. 다만 ${source.note} 약국오늘의 근처 약국 찾기, 지역 목록, 전화 연결 버튼을 함께 쓰면 검색에서 방문까지 이어지는 흐름을 짧게 만들 수 있습니다.</p>
<p>참고: <a href="${source.url}" rel="nofollow noopener noreferrer" target="_blank">${source.label}</a></p>
<h2>4. ${topic.targetReader}가 자주 하는 실수</h2>
<h3>가까운 곳만 보고 바로 이동하는 실수</h3>
<p>거리만 보고 이동하면 닫힌 약국, 재고가 없는 약국, 상담이 어려운 시간대에 도착할 수 있습니다. 특히 ${topic.mainKeyword}처럼 상황성이 강한 주제는 가까움보다 실제 이용 가능성이 중요합니다.</p>
<div class="warning-box">
  <h3>주의할 신호</h3>
  <p>고열, 호흡곤란, 심한 알레르기 반응, 지속되는 흉통, 의식 저하가 있으면 약국 상담보다 응급 진료가 우선입니다.</p>
</div>
<h3>제품명만 말하고 상황을 빼는 실수</h3>
<p>제품명만 말하면 약사는 복용 대상자의 나이, 복용 중인 약, 증상 기간을 알 수 없습니다. “누가, 언제부터, 어떤 증상으로, 무엇을 이미 복용했는지”를 말하면 상담이 더 구체적입니다.</p>
<h2>5. 약국오늘에서 바로 실행하는 순서</h2>
<h3>검색에서 방문까지 4단계</h3>
<div class="step-cards">
  <div class="step-card"><span class="step-number">1</span><h4>근처 약국 검색</h4><p>약국오늘에서 현재 위치 또는 지역명으로 후보를 확인합니다.</p></div>
  <div class="step-card"><span class="step-number">2</span><h4>영업시간 확인</h4><p>종료 임박 여부와 이동 시간을 함께 봅니다.</p></div>
  <div class="step-card"><span class="step-number">3</span><h4>전화 확인</h4><p>${first}, ${second}, ${third}을 짧게 묻습니다.</p></div>
  <div class="step-card"><span class="step-number">4</span><h4>상담 후 결정</h4><p>복용 가능 여부와 진료 필요 신호를 확인합니다.</p></div>
</div>
<h3>마무리 기준</h3>
<p>${topic.mainKeyword}는 검색 결과를 많이 보는 것보다 현재 상황에 맞는 후보를 빠르게 좁히는 일이 중요합니다. 약국오늘의 근처 약국 찾기와 전화 확인을 함께 쓰고, 증상이 애매하거나 심하면 약사에게 진료 필요성을 먼저 물어보세요.</p>
<div class="tip-box">
  <h3>약국오늘 메모</h3>
  <p>이 글은 일반 정보이며 개인 진단을 대신하지 않습니다. 복용 중인 약, 임신·수유, 만성질환, 어린이·고령자 여부가 있으면 약사나 의료진 상담을 우선하세요.</p>
</div>`.trim();
}

function scoreArticle(item: QueueItem) {
  const plain = stripHtml(item.content_html);
  const h2Count = (item.content_html.match(/<h2/gi) ?? []).length;
  const h3Count = (item.content_html.match(/<h3/gi) ?? []).length;
  const richCount = [
    "key-takeaways",
    "info-box",
    "warning-box",
    "tip-box",
    "step-cards",
    "checklist",
    "<table",
    "expert-quote",
  ].filter((needle) => item.content_html.includes(needle)).length;

  let score = 70;
  if (plain.length >= 2500) score += 8;
  if (plain.length >= 3500) score += 4;
  if (h2Count >= 4) score += 5;
  if (h3Count >= 6) score += 4;
  if (richCount >= 5) score += 4;
  if (item.ai_faq.length >= 3) score += 3;
  if (item.content_html.includes("rel=\"nofollow noopener noreferrer\"")) score += 2;
  if (/<script|<h1|style="/i.test(item.content_html)) score -= 20;
  if (/(완치|100%|무조건|특효|치료 보장)/.test(plain)) score -= 20;
  return Math.max(0, Math.min(100, score));
}

async function buildCampaign() {
  const existing = await collectExistingTitles();
  const firstPublishAt = getFirstPublishAt();
  const seenSlugs = new Set<string>();
  const rows: string[] = [
    [
      "id",
      "status",
      "category",
      "content_type",
      "search_intent",
      "main_keyword",
      "expanded_keywords",
      "title",
      "quality_score",
      "duplicate_status",
      "cannibalization_status",
      "max_existing_similarity",
      "nearest_existing_title",
      "decision_reason",
    ].join(","),
  ];
  const queueItems: ScoredQueueItem[] = [];

  TOPICS.slice(0, POSTS_PER_RUN).forEach((topic, index) => {
    const id = index + 1;
    topic.id = id;
    const baseSlug = slugify(topic.slug);
    let slug = baseSlug;
    let suffix = 2;
    while (seenSlugs.has(slug)) {
      slug = `${baseSlug}-${suffix++}`;
    }
    seenSlugs.add(slug);
    const nearest = existing
      .map((item) => ({ item, score: similarity(topic.title, item.title) }))
      .sort((a, b) => b.score - a.score)[0];
    const isExistingCampaignItem = nearest?.item.slug === slug;
    const titleScore = scoreTopic(topic, isExistingCampaignItem ? 0 : nearest?.score ?? 0);
    const duplicateStatus = nearest && nearest.score >= 82 && !isExistingCampaignItem ? "fail_duplicate" : "pass";
    const cannibalizationStatus = nearest && nearest.score >= 70 && !isExistingCampaignItem ? "review" : "pass";

    const queueItem: QueueItem = {
      hpid: null,
      title: topic.title,
      slug,
      region: null,
      theme: "blog",
      content_html: makeContentHtml(topic),
      ai_summary: makeSummary(topic),
      ai_faq: makeFaq(topic),
      ai_bullets: null,
      ai_cta: null,
      extra_sections: null,
      status: "pending",
      publish_at: getPublishAt(index, firstPublishAt),
    };
    const articleScore = scoreArticle(queueItem);
    const finalScore = Math.min(titleScore, articleScore);
    if (finalScore < MIN_QUALITY_SCORE || duplicateStatus !== "pass") {
      throw new Error(
        `Quality gate failed: #${id} ${topic.title} score=${finalScore} duplicate=${duplicateStatus}`,
      );
    }

    queueItems.push({ ...queueItem, quality_score: finalScore });
    rows.push(
      [
        id,
        "pass",
        topic.category,
        "blog",
        topic.searchIntent,
        topic.mainKeyword,
        topic.expandedKeywords.join("|"),
        topic.title,
        finalScore,
        duplicateStatus,
        cannibalizationStatus,
        nearest?.score ?? 0,
        nearest?.item.title ?? "",
        `${topic.contentAngle}; ${topic.targetReader} 대상`,
      ]
        .map(csvEscape)
        .join(","),
    );
  });

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(CSV_PATH, `${rows.join("\n")}\n`, "utf8");
  fs.writeFileSync(JSON_PATH, `${JSON.stringify(queueItems, null, 2)}\n`, "utf8");
  return queueItems;
}

async function insertCampaign(items: ScoredQueueItem[]) {
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    throw new Error("Supabase env not found for --insert mode.");
  }

  const supabase = createClient(supabaseUrl, serviceKey);
  const slugs = items.map((item) => item.slug);
  const { data: existing, error: existingError } = await supabase
    .from("content_queue")
    .select("slug")
    .in("slug", slugs);
  if (existingError) throw existingError;
  const existingSlugs = new Set(existing?.map((item) => item.slug) ?? []);
  const freshItems = items
    .filter((item) => !existingSlugs.has(item.slug))
    .map(({ quality_score: _qualityScore, ...item }) => item);
  if (!freshItems.length) return { inserted: 0, skipped: items.length };

  const { error } = await supabase.from("content_queue").insert(freshItems);
  if (error) throw error;
  return { inserted: freshItems.length, skipped: items.length - freshItems.length };
}

async function main() {
  const insert = process.argv.includes("--insert");
  const items = await buildCampaign();
  const minScore = Math.min(...items.map((item) => item.quality_score));
  console.info(`Generated ${items.length} blog posts. min_quality_score=${minScore}`);
  console.info(`CSV: ${path.relative(process.cwd(), CSV_PATH)}`);
  console.info(`JSON: ${path.relative(process.cwd(), JSON_PATH)}`);
  if (insert) {
    const result = await insertCampaign(items);
    console.info(`Supabase insert result: inserted=${result.inserted}, skipped=${result.skipped}`);
  }
  console.info(`${SITE_URL}/blog`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
