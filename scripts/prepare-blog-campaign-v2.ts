import "dotenv/config";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

type SearchIntent = "정보형" | "문제해결형" | "비교형" | "체크리스트형" | "FAQ형";
type SourceType = "pharmacy" | "medicine" | "supplement" | "season";

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
  sourceType: SourceType;
};

type TopicRow = [string, string, string, string[], SearchIntent, string, string];

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
const CSV_PATH = path.join(OUTPUT_DIR, "title-candidates-2026-05-04-v2.csv");
const JSON_PATH = path.join(OUTPUT_DIR, "blog-campaign-2026-05-04-v2.json");
const TITLE_COUNT = 100;
const POST_COUNT = 2;
const HOUR_MS = 60 * 60 * 1000;
const MIN_QUALITY_SCORE = 85;
const V1_JSON_PATH = path.join(OUTPUT_DIR, "blog-campaign-2026-05-04.json");

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

const CLUSTERS = [
  {
    category: "약국 상담 준비",
    sourceType: "pharmacy" as const,
    rows: [
      ["약국 상담 메모 작성법: 증상·복용약·알레르기", "pharmacy-consult-memo-symptom-medicine-allergy", "약국 상담 메모", ["증상", "복용약", "알레르기"], "체크리스트형" as const, "상담 전 정보를 정리하려는 사용자", "상담 전 메모로 상담 시간을 줄이는 방법"],
      ["약국 방문 전 증상 설명을 짧게 정리하는 법", "pharmacy-visit-symptom-brief", "약국 방문 전", ["증상 설명", "시간", "상담"], "문제해결형" as const, "처음 약국 상담을 받는 사용자", "증상을 한 문장으로 말하는 기준"],
      ["약사에게 복용약을 보여줄 때 가릴 정보와 남길 정보", "pharmacist-current-medicine-info", "약사 복용약 상담", ["복용약", "개인정보", "상담"], "정보형" as const, "처방약을 함께 복용 중인 사용자", "약 봉투와 사진을 안전하게 활용하는 법"],
      ["약국에서 대체품을 물어볼 때 필요한 제품 정보", "pharmacy-alternative-product-info", "약국 대체품", ["제품 정보", "성분", "재고"], "FAQ형" as const, "찾는 제품이 없는 사용자", "제품명 대신 성분과 용도를 말하는 법"],
      ["약국 상담 질문 순서: 급한 증상부터 복용 주의까지", "pharmacy-question-order-urgent-caution", "약국 상담 질문", ["급한 증상", "복용 주의", "질문 순서"], "체크리스트형" as const, "상담 내용을 놓치기 쉬운 사용자", "질문 우선순위"],
      ["약국 통화 전 30초 안에 말할 핵심 정보", "pharmacy-call-thirty-seconds-info", "약국 통화", ["30초", "핵심 정보", "영업 확인"], "문제해결형" as const, "전화 확인을 빨리 해야 하는 사용자", "짧은 통화 스크립트"],
      ["약국에서 병원 진료 필요성을 물어보는 표현", "pharmacy-ask-medical-visit-signal", "병원 진료 필요성", ["약국", "위험 신호", "표현"], "FAQ형" as const, "약국과 병원 사이에서 고민하는 사용자", "진료 권고를 묻는 질문"],
      ["약국 첫 방문자가 약사에게 말하면 좋은 생활 정보", "first-pharmacy-visit-life-info", "약국 첫 방문", ["생활 정보", "복용 시간", "상담"], "정보형" as const, "새 약국을 이용하는 사용자", "생활 패턴 기반 상담"],
      ["약국 상담 후 복용법을 다시 확인하는 질문", "after-pharmacy-consult-dose-questions", "복용법 확인", ["약국 상담 후", "복용 간격", "주의"], "FAQ형" as const, "상담 내용을 다시 확인하는 사용자", "상담 후 확인 질문"],
      ["약국에서 가족 약을 대신 살 때 준비할 정보", "buy-family-medicine-pharmacy-info", "가족 약", ["대리 구매", "나이", "복용약"], "체크리스트형" as const, "가족 약을 대신 사는 보호자", "대상자 정보 준비"],
    ],
  },
  {
    category: "복약 안전",
    sourceType: "medicine" as const,
    rows: [
      ["복용 중인 약 목록 만드는 법: 처방약·일반약·영양제", "current-medicine-list-prescription-otc-supplement", "복용약 목록", ["처방약", "일반약", "영양제"], "체크리스트형" as const, "여러 약을 함께 먹는 사용자", "복용 목록 통합"],
      ["약 성분표 보는 법: 주성분·함량·주의문구", "medicine-ingredient-label-main-dose-caution", "약 성분표", ["주성분", "함량", "주의문구"], "정보형" as const, "성분 확인이 필요한 사용자", "성분표 읽기"],
      ["약 설명서에서 먼저 읽을 세 줄: 효능보다 주의사항", "medicine-leaflet-first-three-lines", "약 설명서", ["주의사항", "복용법", "보관"], "정보형" as const, "설명서가 어려운 사용자", "설명서 우선순위"],
      ["약 복용 시간표 만들기: 아침·점심·저녁·취침 전", "medicine-schedule-morning-night", "약 복용 시간표", ["아침", "저녁", "취침 전"], "체크리스트형" as const, "복용 시간이 헷갈리는 사용자", "시간표 작성"],
      ["약 먹고 졸릴 때 운전·근무 전 확인할 점", "medicine-drowsiness-driving-work-check", "약 졸림", ["운전", "근무", "복용 주의"], "문제해결형" as const, "졸림이 걱정되는 사용자", "생활 안전"],
      ["약과 술을 같이 피해야 하는 이유를 확인하는 법", "medicine-alcohol-caution-check", "약과 술", ["음주", "간", "상담"], "정보형" as const, "회식 전 복용약이 있는 사용자", "음주 주의"],
      ["약 복용 누락 기록법: 건너뛰기 전 확인할 기준", "missed-dose-record-check", "복용 누락", ["기록", "다음 복용", "상담"], "문제해결형" as const, "약 복용을 놓친 사용자", "누락 대응"],
      ["약 부작용 메모 양식: 증상·시간·복용량", "medicine-side-effect-note-format", "약 부작용 메모", ["증상", "시간", "복용량"], "체크리스트형" as const, "이상 증상을 기록하려는 사용자", "상담용 기록"],
      ["약 봉투 여러 개를 날짜별로 정리하는 방법", "medicine-bag-date-organization", "약 봉투 정리", ["날짜", "복용 시간", "가족"], "정보형" as const, "가족 약을 관리하는 사용자", "약 봉투 정리"],
      ["약 이름이 비슷할 때 제품을 착각하지 않는 법", "similar-medicine-name-avoid-mistake", "약 이름", ["비슷한 이름", "제품 확인", "성분"], "문제해결형" as const, "제품명이 헷갈리는 사용자", "제품 착각 방지"],
    ],
  },
  {
    category: "가정 약 관리",
    sourceType: "medicine" as const,
    rows: [
      ["상비약 보관 온도 기준: 습기·직사광선·아이 안전", "home-medicine-storage-temperature-safety", "상비약 보관", ["습기", "직사광선", "아이 안전"], "체크리스트형" as const, "가정 상비약을 관리하는 사용자", "보관 환경"],
      ["폐의약품 버리기 전 확인할 약국 수거 기준", "expired-medicine-disposal-pharmacy-collection", "폐의약품", ["약국 수거", "분리", "보관"], "정보형" as const, "오래된 약을 정리하는 사용자", "폐기 기준"],
      ["약장 정리 루틴: 매달 확인할 유효기간과 포장 상태", "medicine-cabinet-monthly-routine", "약장 정리", ["유효기간", "포장 상태", "매달"], "체크리스트형" as const, "약장을 정리하는 가정", "월간 점검"],
      ["아이 있는 집 약 보관 위치를 정하는 기준", "child-home-medicine-storage-location", "아이 약 보관", ["보관 위치", "잠금", "오남용"], "문제해결형" as const, "아이 있는 가정", "안전 위치"],
      ["냉장 보관 약을 실온에 뒀을 때 확인할 점", "refrigerated-medicine-room-temperature-check", "냉장 보관 약", ["실온", "보관", "약국 문의"], "FAQ형" as const, "보관 실수가 걱정되는 사용자", "보관 이탈 대처"],
      ["개봉한 시럽약 보관 전 적어둘 날짜와 용량", "opened-syrup-storage-date-dose", "시럽약 보관", ["개봉일", "용량", "보관"], "체크리스트형" as const, "아이 시럽약을 관리하는 보호자", "개봉 후 관리"],
      ["여행 후 남은 약을 다시 보관해도 되는지 확인법", "leftover-travel-medicine-storage", "남은 약 보관", ["여행", "유효기간", "상태"], "FAQ형" as const, "여행 후 약을 정리하는 사용자", "남은 약 판단"],
      ["가족별 약 보관함 나누기: 이름표·시간표·주의약", "family-medicine-box-label-schedule", "가족 약 보관함", ["이름표", "시간표", "주의약"], "정보형" as const, "가족 약을 함께 관리하는 사용자", "가족별 분리"],
      ["차 안에 약을 두면 안 되는 이유와 대체 보관법", "car-medicine-storage-risk", "차 안 약 보관", ["고온", "변질", "대체 보관"], "정보형" as const, "차량에 약을 두는 사용자", "차량 보관 위험"],
      ["비상약 파우치 만들 때 빼야 할 약과 넣을 약", "emergency-medicine-pouch-include-exclude", "비상약 파우치", ["넣을 약", "뺄 약", "상담"], "비교형" as const, "외출용 비상약을 준비하는 사용자", "휴대 품목 구분"],
    ],
  },
  {
    category: "근처 약국 활용",
    sourceType: "pharmacy" as const,
    rows: [
      ["근처 약국 후보 3곳을 빠르게 비교하는 기준", "nearby-pharmacy-three-options-compare", "근처 약국 후보", ["거리", "통화", "도착 시간"], "비교형" as const, "검색 결과를 고르는 사용자", "후보 비교"],
      ["약국 지도 검색에서 핀 위치와 실제 입구 확인법", "pharmacy-map-pin-entrance-check", "약국 지도 검색", ["핀 위치", "입구", "건물"], "정보형" as const, "지도 앱을 쓰는 사용자", "지도 오차 줄이기"],
      ["약국 전화 버튼 누르기 전 확인할 이름과 주소", "pharmacy-call-button-name-address", "약국 전화 버튼", ["이름", "주소", "전화"], "체크리스트형" as const, "모바일 검색 사용자", "오전화 방지"],
      ["약국 길찾기 중 경로가 바뀔 때 대체 후보 찾기", "pharmacy-route-change-alternative", "약국 길찾기", ["경로 변경", "대체 후보", "도착 시간"], "문제해결형" as const, "이동 중인 사용자", "이동 중 대안"],
      ["약국 목록에서 같은 이름 약국을 구분하는 법", "same-name-pharmacy-distinguish", "같은 이름 약국", ["주소", "전화번호", "지점"], "문제해결형" as const, "검색 결과가 헷갈리는 사용자", "동명이점 구분"],
      ["주변 약국이 많을 때 상담 목적별로 고르는 법", "many-nearby-pharmacies-purpose-choice", "주변 약국", ["상담 목적", "재고", "접근성"], "비교형" as const, "도심 지역 사용자", "목적별 선택"],
      ["약국 영업 종료 20분 전 방문 판단 기준", "pharmacy-twenty-minutes-before-close", "약국 영업 종료", ["20분 전", "도착 시간", "전화"], "문제해결형" as const, "종료 임박 방문자", "도착 가능성 판단"],
      ["약국 휴무일 정보가 없을 때 확인할 우선순위", "pharmacy-closed-day-unknown-check", "약국 휴무일", ["정보 없음", "전화", "대체"], "체크리스트형" as const, "휴무 정보가 없는 사용자", "휴무 확인"],
      ["약국 리뷰보다 영업 확인을 먼저 봐야 하는 이유", "pharmacy-review-vs-hours-priority", "약국 리뷰", ["영업 확인", "방문 목적", "상담"], "정보형" as const, "리뷰를 참고하는 사용자", "리뷰와 영업 정보 구분"],
      ["약국 검색 결과 저장해둘 때 필요한 세 가지", "save-pharmacy-search-result-three-info", "약국 검색 결과 저장", ["전화번호", "주소", "영업시간"], "체크리스트형" as const, "자주 방문 후보를 저장하는 사용자", "저장 항목"],
    ],
  },
  {
    category: "증상 기록",
    sourceType: "medicine" as const,
    rows: [
      ["기침 증상 메모법: 시간대·가래·열 동반 여부", "cough-symptom-note-time-phlegm-fever", "기침 증상 메모", ["시간대", "가래", "열"], "체크리스트형" as const, "기침 상담을 준비하는 사용자", "증상 기록"],
      ["두통 상담 전 적어둘 위치·강도·반복 패턴", "headache-note-location-intensity-repeat", "두통 상담", ["위치", "강도", "반복"], "체크리스트형" as const, "두통으로 약국을 찾는 사용자", "두통 패턴"],
      ["복통 증상 설명법: 위치·식사·설사 여부", "stomachache-symptom-location-meal-diarrhea", "복통 증상", ["위치", "식사", "설사"], "정보형" as const, "복통으로 상담하는 사용자", "복통 정보"],
      ["피부 발진 사진을 약국 상담에 활용하는 기준", "skin-rash-photo-pharmacy-consult", "피부 발진 사진", ["사진", "부위", "기간"], "정보형" as const, "피부 증상을 설명하는 사용자", "사진 활용"],
      ["알레르기 의심 증상 기록: 음식·환경·복용약", "allergy-suspect-note-food-environment-medicine", "알레르기 의심", ["음식", "환경", "복용약"], "체크리스트형" as const, "알레르기 원인을 찾는 사용자", "원인 기록"],
      ["눈 충혈 상담 전 렌즈·분비물·통증 확인", "red-eye-consult-lens-discharge-pain", "눈 충혈", ["렌즈", "분비물", "통증"], "체크리스트형" as const, "눈 증상 사용자", "안구 증상 구분"],
      ["어지럼 증상일 때 약국에서 말할 정보", "dizziness-pharmacy-info", "어지럼", ["혈압", "복용약", "반복"], "문제해결형" as const, "어지럼을 느끼는 사용자", "위험 신호 확인"],
      ["목 통증 상담 전 열·기침·삼킴 통증 구분", "sore-throat-fever-cough-swallow", "목 통증", ["열", "기침", "삼킴"], "비교형" as const, "목감기 의심 사용자", "동반 증상 구분"],
      ["속 울렁거림 상담 전 먹은 음식과 복용약 기록", "nausea-food-medicine-note", "속 울렁거림", ["먹은 음식", "복용약", "시간"], "체크리스트형" as const, "메스꺼움 증상 사용자", "원인 단서"],
      ["근육통 상담 전 운동·부상·통증 부위 정리", "muscle-pain-exercise-injury-location", "근육통 상담", ["운동", "부상", "통증 부위"], "체크리스트형" as const, "근육통 사용자", "원인 구분"],
    ],
  },
  {
    category: "대상자별 상담",
    sourceType: "medicine" as const,
    rows: [
      ["초등학생 약 복용 전 보호자가 확인할 질문", "elementary-child-medicine-guardian-questions", "초등학생 약", ["보호자", "용량", "학교"], "FAQ형" as const, "초등학생 보호자", "학교 생활 고려"],
      ["청소년 감기약 상담 전 시험·운동 일정 확인", "teen-cold-medicine-exam-sports", "청소년 감기약", ["시험", "운동", "졸림"], "정보형" as const, "청소년과 보호자", "일정 기반 상담"],
      ["직장인 약 복용 전 업무 시간과 졸림 체크", "worker-medicine-work-drowsiness", "직장인 약", ["업무 시간", "졸림", "운전"], "체크리스트형" as const, "직장인", "근무 중 주의"],
      ["고령 부모님 약 상담 전 병원별 처방 정리", "senior-parent-prescription-by-clinic", "고령 부모님 약", ["병원별 처방", "중복", "보호자"], "체크리스트형" as const, "부모님 약을 관리하는 자녀", "처방 정리"],
      ["임신 가능성이 있을 때 약국 상담 전 말할 정보", "possible-pregnancy-pharmacy-info", "임신 가능성 약국 상담", ["임신 가능성", "복용약", "상담"], "정보형" as const, "임신 가능성이 있는 사용자", "민감 정보 전달"],
      ["수유부가 영양제 상담 전 확인할 성분 목록", "breastfeeding-supplement-ingredient-list", "수유부 영양제", ["성분 목록", "수유", "상담"], "체크리스트형" as const, "수유부", "성분 확인"],
      ["운동하는 사람이 진통제 상담 전 말할 부상 정보", "athlete-painkiller-injury-info", "운동 진통제", ["부상", "운동", "통증"], "문제해결형" as const, "운동 후 통증 사용자", "부상 정보"],
      ["야근하는 사람이 피로 영양제 상담 전 볼 기준", "night-worker-fatigue-supplement", "야근 피로 영양제", ["야근", "수면", "카페인"], "정보형" as const, "야근이 잦은 사용자", "피로 상담"],
      ["채식 식단 사용자가 영양제 고를 때 보는 성분", "vegetarian-supplement-ingredient-check", "채식 영양제", ["성분", "비타민B12", "철분"], "비교형" as const, "채식 식단 사용자", "식단 기반 선택"],
      ["반복 야외근무자가 약국에서 준비할 피부 보호품", "outdoor-worker-skin-protection-pharmacy", "야외근무 약국", ["피부 보호", "자외선", "땀"], "체크리스트형" as const, "야외근무자", "근무 환경 대비"],
    ],
  },
  {
    category: "영양제 선택",
    sourceType: "supplement" as const,
    rows: [
      ["영양제 라벨 읽는 순서: 기능성·원료명·섭취량", "supplement-label-order-function-ingredient-dose", "영양제 라벨", ["기능성", "원료명", "섭취량"], "정보형" as const, "영양제 구매자", "라벨 읽기"],
      ["비타민B군 고를 때 피로 문구보다 봐야 할 함량", "vitamin-b-dose-label-check", "비타민B군", ["피로", "함량", "표시"], "비교형" as const, "피로 영양제를 찾는 사용자", "함량 비교"],
      ["철분제 상담 전 빈혈 진단 여부를 말해야 하는 이유", "iron-supplement-anemia-diagnosis", "철분제", ["빈혈", "진단", "상담"], "정보형" as const, "철분제를 고민하는 사용자", "진단 여부"],
      ["칼슘 영양제 선택 전 복용약과 시간 간격 확인", "calcium-supplement-medication-interval", "칼슘 영양제", ["복용약", "시간 간격", "상담"], "체크리스트형" as const, "칼슘 섭취를 고려하는 사용자", "복용 간격"],
      ["밀크씨슬 고를 때 간 건강 표현을 해석하는 법", "milk-thistle-liver-health-label", "밀크씨슬", ["간 건강", "표시", "섭취 주의"], "정보형" as const, "간 건강 영양제를 보는 사용자", "표시 해석"],
      ["콜라겐 제품 비교 전 기대 효과를 점검하는 기준", "collagen-product-expectation-check", "콜라겐", ["제품 비교", "기대 효과", "섭취"], "비교형" as const, "피부 영양제를 찾는 사용자", "기대치 조정"],
      ["홍삼 제품 상담 전 혈압·수면·카페인 확인", "red-ginseng-blood-pressure-sleep-caffeine", "홍삼 제품", ["혈압", "수면", "카페인"], "체크리스트형" as const, "홍삼 구매자", "섭취 전 확인"],
      ["단백질 보충제 선택 전 신장 질환 여부 확인", "protein-supplement-kidney-check", "단백질 보충제", ["신장", "운동", "섭취량"], "정보형" as const, "운동 보충제를 찾는 사용자", "기저질환 확인"],
      ["어린이 영양제 고를 때 당류와 중복 성분 보기", "kids-supplement-sugar-duplicate", "어린이 영양제", ["당류", "중복 성분", "섭취량"], "체크리스트형" as const, "어린이 영양제를 고르는 보호자", "성분 중복"],
      ["부모님 영양제 선물 전 복용약과 질환 확인", "parents-supplement-gift-medication-disease", "부모님 영양제", ["선물", "복용약", "질환"], "문제해결형" as const, "부모님 선물을 고르는 자녀", "선물 전 확인"],
    ],
  },
  {
    category: "계절 세부 건강",
    sourceType: "season" as const,
    rows: [
      ["봄 꽃가루철 약국 상담 전 비염·감기 구분", "spring-pollen-rhinitis-cold-pharmacy", "봄 꽃가루", ["비염", "감기", "상담"], "비교형" as const, "봄철 콧물 사용자", "비염과 감기 구분"],
      ["여름 냉방병 의심 때 약국에서 말할 증상", "summer-air-conditioning-symptom-pharmacy", "냉방병", ["여름", "증상", "상담"], "정보형" as const, "냉방 환경 사용자", "냉방 증상 기록"],
      ["장마철 무좀 상담 전 발 상태를 설명하는 법", "rainy-season-athlete-foot-consult", "장마철 무좀", ["발 상태", "습기", "상담"], "문제해결형" as const, "장마철 피부 증상 사용자", "발 상태 설명"],
      ["가을 건조한 목 증상에 약국에서 확인할 점", "autumn-dry-throat-pharmacy-check", "가을 목 건조", ["목 건조", "기침", "수분"], "정보형" as const, "가을철 목 불편 사용자", "건조와 감기 구분"],
      ["겨울 손 트임 약국 상담 전 피부 갈라짐 확인", "winter-cracked-hand-pharmacy", "겨울 손 트임", ["피부 갈라짐", "보습", "상처"], "문제해결형" as const, "겨울철 손 트임 사용자", "피부 상태 확인"],
      ["독감 예방접종 후 약국에서 물어볼 수 있는 증상", "after-flu-shot-pharmacy-symptoms", "독감 예방접종 후", ["증상", "약국 상담", "주의"], "FAQ형" as const, "예방접종 후 불편감 사용자", "접종 후 상담"],
      ["황사 심한 날 눈·코 증상 완화 상담 기준", "yellow-dust-eye-nose-pharmacy", "황사", ["눈", "코", "마스크"], "체크리스트형" as const, "황사 민감자", "노출 후 관리"],
      ["폭우 뒤 모기 물림과 피부 감염 신호 구분", "after-heavy-rain-mosquito-skin-signal", "폭우 뒤 모기 물림", ["모기", "피부 감염", "부기"], "비교형" as const, "비 온 뒤 야외활동 사용자", "피부 신호 구분"],
      ["한파 외출 전 혈압약 복용자가 확인할 점", "cold-wave-blood-pressure-medicine", "한파 혈압약", ["외출", "혈압약", "상담"], "정보형" as const, "혈압약 복용자", "한파 외출 주의"],
      ["환절기 영양제보다 먼저 확인할 수면·식사 패턴", "season-change-sleep-meal-before-supplement", "환절기 영양제", ["수면", "식사", "피로"], "정보형" as const, "환절기 피로 사용자", "생활 패턴 우선"],
    ],
  },
  {
    category: "약국 이용 기록",
    sourceType: "pharmacy" as const,
    rows: [
      ["약국 방문 기록을 남겨두면 좋은 이유와 항목", "pharmacy-visit-record-items", "약국 방문 기록", ["방문일", "상담 내용", "제품"], "정보형" as const, "반복 방문 사용자", "방문 기록"],
      ["약국 영수증 보관이 필요한 상황과 확인 항목", "pharmacy-receipt-keep-check", "약국 영수증", ["보관", "제품명", "날짜"], "정보형" as const, "구매 기록을 남기는 사용자", "영수증 활용"],
      ["약국에서 산 제품 사진을 안전하게 기록하는 법", "pharmacy-product-photo-record", "약국 제품 사진", ["사진", "성분", "복용법"], "체크리스트형" as const, "제품 정보를 저장하는 사용자", "사진 기록"],
      ["약국 상담 내용을 가족에게 공유할 때 빠질 정보", "share-pharmacy-consult-family", "약국 상담 공유", ["가족", "복용법", "주의"], "문제해결형" as const, "가족 약을 관리하는 사용자", "상담 공유"],
      ["약국 재방문 전 이전 구매 제품을 확인하는 법", "pharmacy-revisit-previous-product", "약국 재방문", ["이전 구매", "제품", "상담"], "체크리스트형" as const, "같은 증상으로 재방문하는 사용자", "이전 기록"],
      ["약국 상담 후 이상 증상이 있으면 기록할 내용", "after-pharmacy-abnormal-symptom-record", "약국 상담 후", ["이상 증상", "시간", "복용량"], "문제해결형" as const, "복용 후 증상을 보는 사용자", "이상 증상 기록"],
      ["약국에서 안내받은 복용법을 캘린더에 넣는 법", "pharmacy-dose-calendar-record", "복용법 캘린더", ["캘린더", "복용 시간", "알림"], "정보형" as const, "복용 알림이 필요한 사용자", "알림 설정"],
      ["약국 제품 비교 기록표: 가격보다 먼저 볼 항목", "pharmacy-product-comparison-record", "약국 제품 비교", ["성분", "함량", "주의"], "비교형" as const, "여러 제품을 비교하는 사용자", "비교 기록"],
      ["약국 전화 문의 내역을 남겨야 하는 경우", "pharmacy-call-record-needed", "약국 전화 문의", ["문의 내역", "재고", "시간"], "FAQ형" as const, "전화 문의가 잦은 사용자", "문의 기록"],
      ["약국 방문 후보를 즐겨찾기에 나누어 저장하는 법", "pharmacy-favorite-list-organization", "약국 즐겨찾기", ["후보", "지역", "영업시간"], "체크리스트형" as const, "여러 지역 약국을 저장하는 사용자", "즐겨찾기 분류"],
    ],
  },
  {
    category: "비교와 판단",
    sourceType: "medicine" as const,
    rows: [
      ["먹는 약과 바르는 약을 비교할 때 물어볼 질문", "oral-vs-topical-medicine-questions", "먹는 약 바르는 약", ["비교", "질문", "피부"], "비교형" as const, "제형 선택이 어려운 사용자", "제형 판단"],
      ["같은 증상 반복 시 새 약보다 상담이 먼저인 이유", "repeat-symptom-consult-before-new-medicine", "반복 증상", ["새 약", "상담", "진료"], "정보형" as const, "증상이 반복되는 사용자", "상담 우선"],
      ["약국에서 추천받은 제품을 집에서 다시 확인하는 법", "pharmacy-recommended-product-recheck", "약국 추천 제품", ["제품 확인", "성분", "복용법"], "체크리스트형" as const, "구매 후 다시 확인하는 사용자", "구매 후 점검"],
      ["가격이 다른 약국 제품을 비교할 때 보는 기준", "pharmacy-product-price-comparison", "약국 제품 가격", ["가격", "함량", "성분"], "비교형" as const, "가격 차이가 궁금한 사용자", "가격보다 성분"],
      ["일반약을 계속 먹어도 되는지 물어볼 시점", "otc-long-use-ask-timing", "일반약 장기 복용", ["기간", "상담", "진료"], "FAQ형" as const, "일반약을 반복 복용하는 사용자", "장기 복용 기준"],
      ["약국 상담과 병원 진료를 나누는 생활 기준", "pharmacy-consult-vs-clinic-life-criteria", "약국 상담 병원 진료", ["생활 기준", "증상", "위험 신호"], "비교형" as const, "어디로 갈지 고민하는 사용자", "방문처 판단"],
      ["약을 바꿔도 되는지 약사에게 물어볼 때", "ask-pharmacist-change-medicine", "약 변경 상담", ["대체", "성분", "복용약"], "FAQ형" as const, "대체 제품을 찾는 사용자", "약 변경 질문"],
      ["제품 포장 문구와 실제 성분을 함께 보는 법", "package-claim-vs-ingredient-check", "제품 포장 문구", ["성분", "문구", "함량"], "정보형" as const, "포장 문구가 헷갈리는 사용자", "표시 해석"],
      ["빠른 효과 문구를 볼 때 확인할 주의사항", "fast-effect-claim-caution", "빠른 효과 문구", ["주의사항", "효과", "상담"], "정보형" as const, "광고 문구를 보는 사용자", "과장 표현 경계"],
      ["약국 제품 선택에서 후기보다 중요한 확인 항목", "pharmacy-product-review-vs-check", "약국 제품 선택", ["후기", "성분", "주의"], "비교형" as const, "후기를 참고하는 사용자", "후기보다 기준"],
    ],
  },
  {
    category: "생활 루틴",
    sourceType: "medicine" as const,
    rows: [
      ["아침 약 복용 루틴 만들기: 물·식사·알림", "morning-medicine-routine-water-meal-alarm", "아침 약 루틴", ["물", "식사", "알림"], "정보형" as const, "아침 복용을 놓치는 사용자", "루틴 설계"],
      ["취침 전 약 복용 시 수면과 알코올 확인", "bedtime-medicine-sleep-alcohol-check", "취침 전 약", ["수면", "알코올", "복용"], "체크리스트형" as const, "밤에 약을 먹는 사용자", "취침 전 주의"],
      ["식후 약을 놓치지 않는 점심시간 알림 설정법", "after-meal-medicine-lunch-alarm", "식후 약", ["점심시간", "알림", "복용"], "문제해결형" as const, "직장인 복용자", "알림 설정"],
      ["운동 전후 약 복용을 약국에 확인해야 하는 경우", "exercise-before-after-medicine-check", "운동 전후 약", ["운동", "복용", "상담"], "FAQ형" as const, "운동하는 사용자", "운동과 복용"],
      ["카페인 많이 마시는 사람이 약국에서 물어볼 점", "caffeine-heavy-user-pharmacy-questions", "카페인 약국 상담", ["카페인", "수면", "영양제"], "FAQ형" as const, "커피를 많이 마시는 사용자", "카페인 확인"],
      ["교대근무자의 약 복용 시간표를 조정하는 기준", "shift-worker-medicine-schedule", "교대근무 약 복용", ["교대근무", "시간표", "수면"], "정보형" as const, "교대근무자", "근무표 기반 복용"],
      ["주말에 복용 루틴이 깨질 때 다시 맞추는 법", "weekend-medicine-routine-reset", "주말 복용 루틴", ["주말", "알림", "복용 누락"], "문제해결형" as const, "주말 일정이 다른 사용자", "루틴 복구"],
      ["가족 공용 알림으로 복용 시간을 챙기는 방법", "family-shared-medicine-alarm", "가족 복용 알림", ["공용 알림", "보호자", "시간"], "정보형" as const, "가족 약을 챙기는 보호자", "공유 알림"],
      ["약 먹는 시간을 바꾸고 싶을 때 약국에 물어볼 점", "change-medicine-time-pharmacy-ask", "약 시간 변경", ["복용 시간", "상담", "간격"], "FAQ형" as const, "일정이 바뀐 사용자", "시간 변경 질문"],
      ["약 복용 체크리스트를 냉장고에 붙일 때 넣을 항목", "medicine-checklist-fridge-items", "약 복용 체크리스트", ["냉장고", "항목", "가족"], "체크리스트형" as const, "가정 복약 관리자", "가시적 체크"],
    ],
  },
] satisfies Array<{
  category: string;
  sourceType: SourceType;
  rows: TopicRow[];
}>;

function flattenTopics() {
  const topics: Topic[] = [];
  CLUSTERS.forEach((cluster) => {
    cluster.rows.forEach((row) => {
      topics.push({
        id: topics.length + 1,
        category: cluster.category,
        sourceType: cluster.sourceType,
        title: row[0],
        slug: row[1],
        mainKeyword: row[2],
        expandedKeywords: row[3],
        searchIntent: row[4],
        targetReader: row[5],
        contentAngle: row[6],
      });
    });
  });
  return topics.slice(0, TITLE_COUNT);
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
    .slice(0, 80);
}

function parseCsvLine(line: string) {
  const cells: string[] = [];
  let current = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];
    if (char === '"' && quoted && next === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      cells.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  cells.push(current);
  return cells;
}

function readJsonArray(filePath: string) {
  if (!fs.existsSync(filePath)) return [];
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8")) as Array<Record<string, unknown>>;
  } catch {
    return [];
  }
}

async function collectExistingTitles(v2Slugs: Set<string>): Promise<ExistingTitle[]> {
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

  for (const fileName of fs.readdirSync(OUTPUT_DIR)) {
    const filePath = path.join(OUTPUT_DIR, fileName);
    if (filePath === CSV_PATH || filePath === JSON_PATH) continue;
    if (fileName.startsWith("title-candidates-") && fileName.endsWith(".csv")) {
      const lines = fs.readFileSync(filePath, "utf8").trim().split(/\r?\n/);
      const header = parseCsvLine(lines[0] ?? "");
      const titleIndex = header.indexOf("title");
      if (titleIndex >= 0) {
        lines.slice(1).forEach((line) => {
          const title = parseCsvLine(line)[titleIndex];
          if (title) existing.push({ title });
        });
      }
    }

    if (fileName.startsWith("blog-campaign-") && fileName.endsWith(".json")) {
      readJsonArray(filePath).forEach((item) => {
        const title = typeof item.title === "string" ? item.title : "";
        const slug = typeof item.slug === "string" ? item.slug : undefined;
        if (title && (!slug || !v2Slugs.has(slug))) existing.push({ title, slug });
      });
    }
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
    data?.forEach((item) => {
      if (!v2Slugs.has(item.slug)) existing.push({ title: item.title, slug: item.slug });
    });
  }

  return existing;
}

function scoreTitle(topic: Topic, nearestSimilarity: number) {
  let score = 90;
  if (topic.title.length >= 18 && topic.title.length <= 44) score += 4;
  if (topic.title.indexOf(topic.mainKeyword) <= 10) score += 3;
  if (topic.expandedKeywords.length >= 3) score += 2;
  if (nearestSimilarity >= 70) score -= 18;
  if (nearestSimilarity >= 55) score -= 8;
  if (/(완치|무조건|100%|치료 보장|특효)/.test(topic.title)) score -= 25;
  return Math.max(0, Math.min(100, score));
}

function hasBatchim(value: string) {
  const last = [...value].at(-1);
  if (!last) return false;
  const code = last.charCodeAt(0);
  if (code < 0xac00 || code > 0xd7a3) return false;
  return (code - 0xac00) % 28 > 0;
}

function withNominative(value: string) {
  return `${value}${hasBatchim(value) ? "이" : "가"}`;
}

function withSubject(value: string) {
  return `${value}${hasBatchim(value) ? "은" : "는"}`;
}

function withObject(value: string) {
  return `${value}${hasBatchim(value) ? "을" : "를"}`;
}

function withConjunction(value: string) {
  return `${value}${hasBatchim(value) ? "과" : "와"}`;
}

function makeSummary(topic: Topic) {
  const [first, second, third] = topic.expandedKeywords;
  return `${withSubject(topic.mainKeyword)} ${first}, ${second}, ${withObject(third)} 함께 확인해야 안전하게 판단할 수 있습니다. 이 글은 ${withNominative(topic.targetReader)} 약국 상담 전 준비할 기준을 단계별로 정리합니다.`;
}

function makeFaq(topic: Topic) {
  const [first, second, third] = topic.expandedKeywords;
  return [
    {
      question: `${withSubject(topic.mainKeyword)} 무엇부터 확인해야 하나요?`,
      answer: `${withObject(first)} 먼저 정리하고 ${withConjunction(second)} ${withObject(third)} 함께 확인하면 약국 상담이 더 정확해집니다.`,
    },
    {
      question: `약국에 전화할 때 어떤 말을 먼저 해야 하나요?`,
      answer: `누가, 언제부터, 어떤 증상으로, 무엇을 이미 복용했는지를 먼저 말한 뒤 필요한 제품이나 상담 가능 여부를 물어보세요.`,
    },
    {
      question: `검색 결과만 보고 바로 방문해도 되나요?`,
      answer: `영업시간, 재고, 상담 가능 여부는 바뀔 수 있어 방문 전 전화 확인을 권장합니다.`,
    },
    {
      question: `병원 진료가 더 필요한 경우는 언제인가요?`,
      answer: `호흡곤란, 심한 통증, 고열 지속, 의식 저하, 반복 구토처럼 일상 대처가 어려운 증상은 진료가 우선입니다.`,
    },
  ];
}

function makeContentHtml(topic: Topic) {
  const source = OFFICIAL_SOURCES[topic.sourceType];
  const [first, second, third] = topic.expandedKeywords;
  return `
<div class="key-takeaways">
  <h3>핵심 요약</h3>
  <ul>
    <li>${topic.mainKeyword}은 ${first}을 먼저 정리해야 상담이 빨라집니다.</li>
    <li>${second}은 검색 결과와 실제 상황이 다를 수 있어 전화 확인이 필요합니다.</li>
    <li>${third}까지 확인하면 약국 방문 후 다시 이동하는 일을 줄일 수 있습니다.</li>
  </ul>
</div>
<p>${makeSummary(topic)}</p>
<p>${topic.contentAngle}은 단순히 제품을 고르는 문제가 아닙니다. 같은 증상처럼 보여도 나이, 복용 중인 약, 생활 일정, 증상 기간에 따라 약국 상담의 방향이 달라집니다.</p>
<h2>1. ${topic.mainKeyword}에서 가장 먼저 볼 기준</h2>
<h3>${first}을 먼저 정리해야 하는 이유</h3>
<p>${first}은 약국 상담의 출발점입니다. 약사는 제한된 정보로 일반의약품, 생활 관리, 병원 진료 필요성을 함께 판단해야 하므로 현재 상황을 짧고 정확하게 말하는 것이 중요합니다.</p>
<p>특히 야간, 주말, 공휴일에는 선택지가 줄어듭니다. 약국오늘에서 근처 약국 후보를 확인한 뒤 전화로 상담 가능 여부를 확인하면 헛걸음을 줄일 수 있습니다.</p>
<h3>${second}을 빠뜨리면 생기는 문제</h3>
<p>${second}을 확인하지 않으면 같은 제품을 다시 사거나, 복용 중인 약과 겹치는 성분을 놓치거나, 실제 영업하지 않는 약국으로 이동할 수 있습니다. 검색 결과는 출발점이고 마지막 확인은 전화와 현장 상담입니다.</p>
<div class="info-box">
  <h3>방문 전 한 문장</h3>
  <p>“${topic.mainKeyword} 때문에 문의드리는데, 지금 ${first}과 ${second} 관련 상담이 가능할까요?”라고 물어보세요.</p>
</div>
<h2>2. 약국 상담 전 준비할 정보</h2>
<h3>증상과 복용 정보를 나누기</h3>
<p>상담 전에는 증상 시작 시점, 반복 여부, 이미 복용한 약, 알레르기 경험을 나눠 적어두면 좋습니다. 가족 약을 대신 사는 경우에는 대상자의 나이와 기저질환 여부도 함께 필요합니다.</p>
<ul class="checklist">
  <li>${first} 관련 현재 상태를 한 줄로 정리합니다.</li>
  <li>${second}이 필요한 이유와 방문 목적을 구분합니다.</li>
  <li>${third}과 관련해 이미 확인한 내용을 적습니다.</li>
  <li>복용 중인 처방약, 일반약, 영양제를 함께 확인합니다.</li>
  <li>증상이 심하거나 오래가면 진료 필요성을 먼저 묻습니다.</li>
</ul>
<h3>정보를 너무 많이 말하지 않는 요령</h3>
<p>전화 상담에서는 30초 안에 핵심만 말하는 것이 좋습니다. “누가, 언제부터, 어떤 증상으로, 무엇을 복용했는지” 순서로 말하면 약국에서도 재고와 상담 가능 여부를 빠르게 확인할 수 있습니다.</p>
<p>메모는 길게 쓰기보다 상담에 필요한 사실만 남기는 편이 낫습니다. 예를 들어 “어제 저녁부터 목이 따갑고 열은 없으며, 혈압약을 매일 복용 중입니다”처럼 시간, 증상, 복용약을 한 문장으로 묶으면 약사가 추가로 확인할 질문을 빠르게 정할 수 있습니다.</p>
<blockquote class="expert-quote">
  <p>좋은 약국 상담은 제품명을 맞히는 과정이 아니라 현재 상황에 맞는 선택 기준과 위험 신호를 확인하는 과정입니다.</p>
  <cite>약국오늘 복약 정보 편집 기준</cite>
</blockquote>
<h2>3. 선택지를 비교하는 표</h2>
<h3>검색 결과와 상담 기준 비교</h3>
<p>약국을 고를 때는 가까움만 보지 말고 실제 이용 가능성을 함께 봐야 합니다. 특히 ${topic.mainKeyword}처럼 상황 정보가 중요한 주제는 아래 기준으로 후보를 좁히면 판단이 쉬워집니다.</p>
<table>
  <thead><tr><th>확인 항목</th><th>왜 중요한가</th><th>확인 방법</th></tr></thead>
  <tbody>
    <tr><td>${first}</td><td>상담 방향을 정합니다.</td><td>증상과 대상을 한 문장으로 말합니다.</td></tr>
    <tr><td>${second}</td><td>방문 가능성을 판단합니다.</td><td>전화로 실제 가능 여부를 확인합니다.</td></tr>
    <tr><td>${third}</td><td>복용 실수를 줄입니다.</td><td>복용약과 생활 상황을 함께 설명합니다.</td></tr>
  </tbody>
</table>
<h3>공식 정보와 현장 정보를 같이 쓰기</h3>
<p>${source.label} 자료는 기본 기준을 확인하는 데 도움이 됩니다. 다만 ${source.note} 약국오늘의 근처 약국 찾기와 전화 확인을 함께 쓰면 검색에서 방문까지의 흐름을 짧게 만들 수 있습니다.</p>
<p>참고: <a href="${source.url}" rel="nofollow noopener noreferrer" target="_blank">${source.label}</a></p>
<h2>4. 자주 하는 실수와 피하는 법</h2>
<h3>제품명만 말하고 대상자 정보를 빼는 실수</h3>
<p>제품명만 말하면 나이, 복용약, 알레르기 여부를 알 수 없습니다. 같은 제품이라도 대상자에 따라 주의가 달라질 수 있으므로 상담 전 기본 정보를 준비해야 합니다.</p>
<div class="warning-box">
  <h3>주의할 신호</h3>
  <p>고열 지속, 호흡곤란, 심한 알레르기 반응, 반복 구토, 의식 저하가 있으면 약국 상담보다 진료가 우선입니다.</p>
</div>
<h3>가장 가까운 약국만 보고 이동하는 실수</h3>
<p>가까운 약국이 항상 가장 빠른 선택은 아닙니다. 통화 연결 여부, 도착 예상 시간, 재고, 상담 가능성을 함께 보아야 실제로 문제를 해결할 수 있습니다.</p>
<h2>5. 약국오늘에서 실행하는 순서</h2>
<h3>검색부터 상담까지 4단계</h3>
<div class="step-cards">
  <div class="step-card"><span class="step-number">1</span><h4>후보 찾기</h4><p>현재 위치나 지역명으로 근처 약국 후보를 확인합니다.</p></div>
  <div class="step-card"><span class="step-number">2</span><h4>상황 정리</h4><p>${first}, ${second}, ${third}을 한 줄씩 적습니다.</p></div>
  <div class="step-card"><span class="step-number">3</span><h4>전화 확인</h4><p>영업 여부와 상담 가능 여부를 먼저 확인합니다.</p></div>
  <div class="step-card"><span class="step-number">4</span><h4>방문 결정</h4><p>도착 시간과 증상 정도를 보고 약국 또는 병원을 선택합니다.</p></div>
</div>
<h3>마무리 기준</h3>
<p>${topic.mainKeyword}은 정보가 많을수록 좋은 것이 아니라 필요한 정보를 빠르게 좁히는 것이 중요합니다. 약국오늘에서 후보를 확인하고, 전화로 실제 가능 여부를 확인한 뒤 방문하세요.</p>
<div class="tip-box">
  <h3>약국오늘 메모</h3>
  <p>이 글은 일반 정보이며 진단이나 처방을 대신하지 않습니다. 임신·수유, 어린이·고령자, 만성질환, 복용 중인 약이 있으면 약사나 의료진 상담을 우선하세요.</p>
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
  if (item.ai_faq.length >= 4) score += 4;
  if (item.content_html.includes("rel=\"nofollow noopener noreferrer\"")) score += 2;
  if (/<script|<h1|style="/i.test(item.content_html)) score -= 20;
  if (/(완치|100%|무조건|특효|치료 보장)/.test(plain)) score -= 20;
  return Math.max(0, Math.min(100, score));
}

async function getLastExternalPublishAt(v2Slugs: Set<string>) {
  let lastTime = 0;

  if (fs.existsSync(V1_JSON_PATH)) {
    readJsonArray(V1_JSON_PATH).forEach((item) => {
      const publishAt = typeof item.publish_at === "string" ? Date.parse(item.publish_at) : 0;
      if (publishAt > lastTime) lastTime = publishAt;
    });
  }

  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (supabaseUrl && serviceKey) {
    const supabase = createClient(supabaseUrl, serviceKey);
    const { data, error } = await supabase
      .from("content_queue")
      .select("slug, publish_at")
      .eq("status", "pending");
    if (error) throw error;
    data?.forEach((item) => {
      if (v2Slugs.has(item.slug)) return;
      const publishAt = Date.parse(item.publish_at);
      if (publishAt > lastTime) lastTime = publishAt;
    });
  }

  if (lastTime > 0) return new Date(lastTime);
  return new Date(Date.now() + HOUR_MS);
}

function getPublishAt(index: number, lastExternalPublishAt: Date) {
  return new Date(lastExternalPublishAt.getTime() + (index + 1) * 5 * HOUR_MS).toISOString();
}

async function buildCampaign() {
  const topics = flattenTopics();
  if (topics.length !== TITLE_COUNT) {
    throw new Error(`Expected ${TITLE_COUNT} topics, got ${topics.length}`);
  }

  const v2Slugs = new Set(topics.map((topic) => slugify(topic.slug)));
  const existing = await collectExistingTitles(v2Slugs);
  const lastExternalPublishAt = await getLastExternalPublishAt(v2Slugs);
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

  topics.forEach((topic, index) => {
    const slug = slugify(topic.slug);
    if (seenSlugs.has(slug)) throw new Error(`Duplicate slug in v2 topics: ${slug}`);
    seenSlugs.add(slug);

    const nearest = existing
      .map((item) => ({ item, score: similarity(topic.title, item.title) }))
      .sort((a, b) => b.score - a.score)[0];
    const nearestScore = nearest?.score ?? 0;
    const titleScore = scoreTitle(topic, nearestScore);
    const duplicateStatus = nearestScore >= 82 ? "fail_duplicate" : "pass";
    const cannibalizationStatus = nearestScore >= 70 ? "review" : "pass";
    if (duplicateStatus !== "pass" || titleScore < MIN_QUALITY_SCORE) {
      throw new Error(`Title gate failed: #${topic.id} ${topic.title} score=${titleScore} similarity=${nearestScore}`);
    }

    rows.push(
      [
        topic.id,
        "pass",
        topic.category,
        "blog",
        topic.searchIntent,
        topic.mainKeyword,
        topic.expandedKeywords.join("|"),
        topic.title,
        titleScore,
        duplicateStatus,
        cannibalizationStatus,
        nearestScore,
        nearest?.item.title ?? "",
        `${topic.contentAngle}; ${topic.targetReader} 대상`,
      ]
        .map(csvEscape)
        .join(","),
    );

    if (index < POST_COUNT) {
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
        publish_at: getPublishAt(index, lastExternalPublishAt),
      };
      const articleScore = Math.min(titleScore, scoreArticle(queueItem));
      if (articleScore < MIN_QUALITY_SCORE) {
        throw new Error(`Article gate failed: #${topic.id} ${topic.title} score=${articleScore}`);
      }
      queueItems.push({ ...queueItem, quality_score: articleScore });
    }
  });

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(CSV_PATH, `${rows.join("\n")}\n`, "utf8");
  fs.writeFileSync(JSON_PATH, `${JSON.stringify(queueItems, null, 2)}\n`, "utf8");
  return queueItems;
}

async function insertCampaign(items: ScoredQueueItem[]) {
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) throw new Error("Supabase env not found for --insert mode.");

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
  console.info(`Generated ${TITLE_COUNT} v2 titles and ${items.length} v2 posts. min_quality_score=${minScore}`);
  console.info(`CSV: ${path.relative(process.cwd(), CSV_PATH)}`);
  console.info(`JSON: ${path.relative(process.cwd(), JSON_PATH)}`);
  console.info(`First v2 publish_at: ${items[0]?.publish_at ?? "none"}`);
  console.info(`Last v2 publish_at: ${items.at(-1)?.publish_at ?? "none"}`);
  if (insert) {
    const result = await insertCampaign(items);
    console.info(`Supabase insert result: inserted=${result.inserted}, skipped=${result.skipped}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
