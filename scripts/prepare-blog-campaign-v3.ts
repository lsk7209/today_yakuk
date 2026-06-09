import "dotenv/config";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";
import { getTursoClient } from "../src/lib/turso";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

type SearchIntent = "정보형" | "문제해결형" | "비교형" | "체크리스트형" | "FAQ형";
type SourceType = "pharmacy" | "medicine" | "supplement" | "season";

type Seed = {
  category: string;
  sourceType: SourceType;
  mainKeyword: string;
  title: string;
  slug: string;
  expandedKeywords: [string, string, string];
  searchIntent: SearchIntent;
  targetReader: string;
  contentAngle: string;
};

type Topic = Seed & { id: number };
type ExistingTitle = { title: string; slug?: string };
type FAQ = { question: string; answer: string };
type QueueItem = {
  hpid: null;
  title: string;
  slug: string;
  region: null;
  theme: "blog";
  content_html: string;
  ai_summary: string;
  ai_faq: FAQ[];
  ai_bullets: null;
  ai_cta: null;
  extra_sections: null;
  status: "pending";
  publish_at: string;
};
type ScoredQueueItem = QueueItem & { quality_score: number };

const OUTPUT_DIR = path.join(process.cwd(), "content");
const CSV_PATH = path.join(OUTPUT_DIR, "title-candidates-2026-05-05-v3.csv");
const JSON_PATH = path.join(OUTPUT_DIR, "blog-campaign-2026-05-05-v3.json");
const TITLE_COUNT = 100;
const POST_COUNT = 4;
const HOUR_MS = 60 * 60 * 1000;
const MIN_QUALITY_SCORE = 85;

const OFFICIAL_SOURCES = {
  pharmacy: {
    label: "응급의료포털 E-Gen",
    url: "https://www.e-gen.or.kr/",
    note: "문 여는 약국 정보는 현장 운영 변경과 공휴일 일정에 따라 달라질 수 있습니다.",
  },
  medicine: {
    label: "식품의약품안전처 의약품안전나라",
    url: "https://nedrug.mfds.go.kr/",
    note: "일반의약품도 제품별 성분, 함량, 주의 대상이 다르므로 포장과 설명서를 함께 확인해야 합니다.",
  },
  supplement: {
    label: "식품안전나라 건강기능식품 정보",
    url: "https://www.foodsafetykorea.go.kr/",
    note: "건강기능식품은 질병 치료제가 아니며, 복용약이나 질환이 있으면 전문가 상담이 필요합니다.",
  },
  season: {
    label: "질병관리청 건강정보",
    url: "https://www.kdca.go.kr/",
    note: "계절성 증상은 개인 건강 상태와 동반 증상에 따라 대응 기준이 달라질 수 있습니다.",
  },
} as const;

const SEEDS: Seed[] = [
  ...makeCluster("야간 약국 판단", "pharmacy", [
    ["심야 약국 전화 전 확인할 영업시간과 위치 기준", "late-night-pharmacy-call-hours-location", "심야 약국", ["영업시간", "위치", "전화"], "체크리스트형", "밤에 약국을 찾는 사용자", "출발 전 확인 순서"],
    ["밤 10시 이후 약국 찾을 때 대체 후보 남기는 법", "after-ten-pharmacy-backup-options", "밤 10시 약국", ["대체 후보", "거리", "통화"], "문제해결형", "늦은 시간 이동 중인 사용자", "후보 2곳 이상 확보"],
    ["새벽 약국 검색 결과에서 헛걸음 줄이는 순서", "dawn-pharmacy-search-avoid-wasted-trip", "새벽 약국 검색", ["헛걸음", "전화 확인", "도착 시간"], "체크리스트형", "새벽에 급히 검색하는 사용자", "검색 후 행동 기준"],
    ["심야 약국 도착 전 증상 설명을 짧게 준비하는 법", "late-night-pharmacy-symptom-brief", "심야 약국 상담", ["증상 설명", "복용약", "상담"], "정보형", "심야 상담을 준비하는 사용자", "짧은 설명 문장"],
    ["야간 약국이 멀 때 편의점 상비약과 구분할 기준", "night-pharmacy-vs-convenience-medicine", "야간 약국", ["편의점 상비약", "거리", "증상"], "비교형", "이동 여부를 고민하는 사용자", "약국 방문 필요성 구분"],
    ["아이 열이 날 때 밤 약국 방문 전 확인할 정보", "child-fever-night-pharmacy-check", "아이 열 약국", ["체온", "나이", "복용약"], "체크리스트형", "아이 보호자", "소아 증상 정보 정리"],
    ["야간 약국 전화가 안 될 때 다음 행동 기준", "night-pharmacy-no-answer-next-step", "야간 약국 전화", ["통화 실패", "대체 약국", "진료"], "문제해결형", "전화 연결이 안 되는 사용자", "연결 실패 대안"],
    ["심야 약국 길찾기 전에 건물 입구 확인하는 법", "late-night-pharmacy-entrance-check", "심야 약국 길찾기", ["건물 입구", "주소", "주차"], "정보형", "밤길 이동 사용자", "도착 실패 방지"],
    ["늦은 밤 복용약을 잊었을 때 약국 상담 질문", "missed-dose-late-night-pharmacy-question", "밤 복용약", ["복용 누락", "다음 복용", "상담"], "FAQ형", "복용을 놓친 사용자", "상담 질문 정리"],
    ["야간 약국 방문 전 병원 진료가 우선인 신호", "night-pharmacy-medical-warning-signs", "야간 약국 방문", ["위험 신호", "응급", "상담"], "정보형", "증상 심각도를 고민하는 사용자", "위험 신호 구분"],
  ]),
  ...makeCluster("공휴일 약국 이용", "pharmacy", [
    ["대체공휴일 약국 찾기 전 운영시간 확인 순서", "substitute-holiday-pharmacy-hours-check", "대체공휴일 약국", ["운영시간", "전화", "지역"], "체크리스트형", "연휴 중 약국을 찾는 사용자", "공휴일 운영 확인"],
    ["명절 연휴 약국 후보를 가족 위치별로 나누는 법", "holiday-pharmacy-family-location-options", "명절 연휴 약국", ["가족 위치", "후보", "전화"], "문제해결형", "가족 이동 중인 사용자", "위치별 후보 관리"],
    ["공휴일 약국 목록에서 실제 문 연 곳 고르는 기준", "holiday-open-pharmacy-list-check", "공휴일 약국 목록", ["문 연 약국", "전화 확인", "도착"], "비교형", "검색 결과가 많은 사용자", "목록 판별 기준"],
    ["연휴 전 상비약 점검표: 부족한 약국 품목 찾기", "holiday-medicine-cabinet-restock-list", "연휴 상비약", ["점검표", "부족 품목", "약국"], "체크리스트형", "연휴 전 준비하는 가정", "상비약 보충"],
    ["공휴일 아이 약 준비 전 보호자가 물어볼 질문", "holiday-child-medicine-guardian-questions", "공휴일 아이 약", ["보호자", "용량", "상담"], "FAQ형", "아이 보호자", "소아 약 상담"],
    ["명절 이동 중 약국 검색 결과 저장하는 방법", "holiday-trip-pharmacy-search-save", "명절 약국 검색", ["저장", "전화번호", "주소"], "정보형", "장거리 이동 사용자", "검색 결과 저장"],
    ["공휴일 처방약이 부족할 때 확인할 선택지", "holiday-prescription-shortage-options", "공휴일 처방약", ["처방약", "부족", "진료"], "문제해결형", "처방약이 부족한 사용자", "대체 행동"],
    ["연휴 약국 방문 전 재고 문의를 짧게 하는 법", "holiday-pharmacy-stock-call-script", "연휴 약국 재고", ["재고 문의", "제품명", "성분"], "체크리스트형", "재고 확인이 필요한 사용자", "통화 스크립트"],
    ["공휴일 문 연 약국과 응급실을 구분하는 기준", "holiday-pharmacy-er-decision", "공휴일 문 연 약국", ["응급실", "증상", "약국"], "비교형", "방문처를 고민하는 사용자", "방문처 선택"],
    ["연휴 마지막 날 약국 혼잡을 줄이는 방문 시간", "holiday-last-day-pharmacy-timing", "연휴 약국 방문", ["혼잡", "방문 시간", "전화"], "정보형", "연휴 마지막 날 방문자", "시간대 선택"],
  ]),
  ...makeCluster("복약 실수 예방", "medicine", [
    ["약 먹는 시간을 자주 놓칠 때 기록표 만드는 법", "missed-medicine-time-record-sheet", "약 먹는 시간", ["기록표", "복용 누락", "알림"], "체크리스트형", "복용 시간을 놓치는 사용자", "기록 습관"],
    ["하루 두 번 약 복용 간격을 확인하는 질문", "twice-daily-medicine-interval-question", "하루 두 번 약", ["복용 간격", "질문", "상담"], "FAQ형", "복용 간격이 헷갈리는 사용자", "간격 확인"],
    ["비슷한 알약을 가족끼리 헷갈리지 않게 나누는 법", "similar-pills-family-separate", "비슷한 알약", ["가족", "분리", "라벨"], "문제해결형", "가족 약을 관리하는 사용자", "약 분리"],
    ["아침 약을 공복에 먹어도 되는지 확인할 기준", "morning-medicine-empty-stomach-check", "아침 약", ["공복", "식후", "설명서"], "정보형", "아침 복용자가 많은 사용자", "복용 시점"],
    ["약 봉투에 적힌 식전·식후 문구 읽는 순서", "medicine-bag-before-after-meal", "약 봉투", ["식전", "식후", "복용법"], "정보형", "약 봉투를 확인하는 사용자", "봉투 문구 해석"],
    ["외출 중 약을 못 먹었을 때 상담 전에 볼 항목", "missed-dose-outside-checklist", "외출 중 약", ["복용 누락", "외출", "다음 복용"], "체크리스트형", "외출이 잦은 사용자", "누락 대처"],
    ["약을 나눠 담을 때 원래 포장을 남겨야 하는 이유", "medicine-repack-original-package", "약 나눠 담기", ["원래 포장", "성분", "유효기간"], "정보형", "휴대용 약통 사용자", "포장 보존"],
    ["졸림 있는 약 복용 전 운전 일정을 조정하는 법", "drowsy-medicine-driving-schedule", "졸림 약", ["운전", "일정", "주의"], "문제해결형", "운전 예정 사용자", "생활 일정 조정"],
    ["여러 병원 처방약을 한 약국에 보여줄 때 장점", "multiple-clinic-prescriptions-one-pharmacy", "여러 병원 처방약", ["중복", "약국 상담", "목록"], "정보형", "처방이 여러 개인 사용자", "중복 확인"],
    ["약 복용 후 이상 증상을 시간순으로 적는 방법", "medicine-reaction-timeline-note", "약 이상 증상", ["시간순", "증상", "복용량"], "체크리스트형", "이상 증상을 느낀 사용자", "증상 기록"],
  ]),
  ...makeCluster("가정 상비약 정리", "medicine", [
    ["아이 있는 집 상비약 상자를 위쪽에 두는 기준", "child-home-medicine-box-high-place", "아이 상비약", ["보관 위치", "잠금", "안전"], "체크리스트형", "아이 있는 가정", "보관 위치"],
    ["욕실에 약을 두면 안 되는 이유와 옮길 장소", "bathroom-medicine-storage-risk", "욕실 약 보관", ["습기", "보관 장소", "변질"], "정보형", "약을 욕실에 둔 사용자", "습기 관리"],
    ["해열제와 감기약을 함께 보관할 때 라벨 붙이는 법", "fever-cold-medicine-labeling", "해열제 감기약", ["라벨", "성분", "중복"], "문제해결형", "가정 약장을 정리하는 사용자", "성분 중복 방지"],
    ["유효기간 지난 약을 발견했을 때 분리하는 순서", "expired-medicine-separation-order", "유효기간 지난 약", ["분리", "폐의약품", "약국"], "체크리스트형", "오래된 약을 정리하는 사용자", "폐기 전 분리"],
    ["개봉일이 헷갈리는 시럽약을 다시 확인하는 법", "opened-syrup-date-unclear-check", "시럽약 개봉일", ["개봉일", "보관", "상담"], "FAQ형", "아이 시럽약 관리 보호자", "개봉일 확인"],
    ["상비약 파우치에 설명서 사진을 같이 보관하는 이유", "medicine-pouch-leaflet-photo", "상비약 파우치", ["설명서", "사진", "복용법"], "정보형", "외출용 파우치 사용자", "설명서 보존"],
    ["가족별 약통 색을 나눌 때 실수 줄이는 기준", "family-medicine-box-color-rule", "가족별 약통", ["색상", "이름표", "시간표"], "문제해결형", "가족 약을 나누는 사용자", "구분 체계"],
    ["냉장약을 문쪽에 두지 말아야 하는 이유", "refrigerated-medicine-door-risk", "냉장약", ["문쪽", "온도", "보관"], "정보형", "냉장 보관 약 사용자", "온도 변화"],
    ["여행용 상비약을 귀가 후 다시 정리하는 법", "travel-medicine-after-trip-organize", "여행용 상비약", ["귀가 후", "정리", "유효기간"], "체크리스트형", "여행 후 정리하는 사용자", "복귀 정리"],
    ["집에 남은 처방약을 가족과 나눠 먹으면 안 되는 이유", "leftover-prescription-family-risk", "남은 처방약", ["가족", "처방", "위험"], "정보형", "남은 약을 보관한 사용자", "처방약 공유 금지"],
  ]),
  ...makeCluster("영양제 상담", "supplement", [
    ["영양제 여러 개 먹기 전 중복 성분 찾는 순서", "multiple-supplements-duplicate-ingredient", "영양제 중복 성분", ["중복", "성분표", "섭취량"], "체크리스트형", "영양제를 여러 개 먹는 사용자", "중복 성분"],
    ["비타민D 제품 상담 전 햇빛 노출과 복용량 확인", "vitamin-d-sunlight-dose-check", "비타민D", ["햇빛", "복용량", "상담"], "정보형", "비타민D를 고르는 사용자", "생활 조건"],
    ["오메가3 고를 때 혈액응고 관련 상담이 필요한 경우", "omega3-blood-clotting-consult", "오메가3", ["혈액응고", "복용약", "상담"], "정보형", "오메가3 구매자", "복용약 확인"],
    ["유산균 제품을 바꿀 때 섭취 기간을 기록하는 법", "probiotics-change-record-period", "유산균", ["섭취 기간", "제품 변경", "기록"], "체크리스트형", "유산균 제품을 바꾸는 사용자", "변경 기록"],
    ["마그네슘 영양제 상담 전 설사 여부를 말해야 하는 이유", "magnesium-diarrhea-consult", "마그네슘", ["설사", "함량", "복용약"], "FAQ형", "마그네슘을 고민하는 사용자", "부작용 질문"],
    ["종합비타민과 단일 영양제 차이를 비교하는 기준", "multivitamin-vs-single-supplement", "종합비타민", ["단일 영양제", "성분", "목적"], "비교형", "영양제 구성을 고민하는 사용자", "제품 유형 비교"],
    ["카페인 많은 직장인이 피로 영양제 고를 때 볼 점", "caffeine-worker-fatigue-supplement", "피로 영양제", ["카페인", "수면", "성분"], "정보형", "피로감을 느끼는 직장인", "생활 습관 확인"],
    ["부모님 영양제 선물 전 병원약 목록을 확인하는 이유", "parents-supplement-gift-prescription-list", "부모님 영양제 선물", ["병원약", "선물", "상담"], "체크리스트형", "부모님 선물을 준비하는 자녀", "복용약 확인"],
    ["어린이 젤리 영양제의 당류 표시를 보는 법", "kids-jelly-supplement-sugar-label", "어린이 젤리 영양제", ["당류", "표시", "섭취량"], "정보형", "어린이 영양제 구매자", "당류 표시"],
    ["수면 영양제 문구를 볼 때 약국에서 확인할 질문", "sleep-supplement-pharmacy-questions", "수면 영양제", ["수면", "복용약", "질문"], "FAQ형", "수면 관련 제품을 찾는 사용자", "표현 확인"],
  ]),
  ...makeCluster("증상 설명", "medicine", [
    ["기침이 오래갈 때 기간과 동반 증상 적는 법", "long-cough-duration-symptom-note", "기침 오래갈 때", ["기간", "가래", "열"], "체크리스트형", "기침이 지속되는 사용자", "동반 증상 기록"],
    ["목이 따가울 때 감기와 건조를 나눠 설명하는 기준", "sore-throat-cold-dryness-check", "목 따가움", ["감기", "건조", "기침"], "비교형", "목 증상 사용자", "증상 구분"],
    ["속쓰림 상담 전 식사 시간과 복용약을 적는 법", "heartburn-meal-medicine-note", "속쓰림 상담", ["식사 시간", "복용약", "반복"], "체크리스트형", "속쓰림 사용자", "원인 단서"],
    ["눈 가려움 상담 전 렌즈와 알레르기 이력 확인", "itchy-eye-lens-allergy-history", "눈 가려움", ["렌즈", "알레르기", "분비물"], "정보형", "눈 증상 사용자", "렌즈 여부"],
    ["피부 가려움이 생겼을 때 사진 기록을 남기는 법", "itchy-skin-photo-record", "피부 가려움", ["사진", "부위", "기간"], "체크리스트형", "피부 증상 사용자", "사진 기록"],
    ["두통이 반복될 때 약국 상담보다 진료가 필요한 신호", "repeat-headache-medical-signs", "반복 두통", ["반복", "위험 신호", "진료"], "정보형", "두통이 반복되는 사용자", "위험 신호"],
    ["복통 위치를 설명할 때 오른쪽·왼쪽을 구분하는 법", "stomachache-left-right-location", "복통 위치", ["오른쪽", "왼쪽", "식사"], "문제해결형", "복통으로 상담하는 사용자", "위치 설명"],
    ["알레르기 의심 때 먹은 음식과 약을 시간순으로 적기", "allergy-food-medicine-timeline", "알레르기 의심", ["음식", "복용약", "시간순"], "체크리스트형", "알레르기 원인을 찾는 사용자", "원인 기록"],
    ["어지럼이 있을 때 혈압과 수분 섭취를 확인하는 이유", "dizziness-blood-pressure-water-check", "어지럼", ["혈압", "수분", "복용약"], "정보형", "어지럼을 느끼는 사용자", "생활 정보"],
    ["근육통과 관절통을 약국에서 구분해 말하는 법", "muscle-pain-joint-pain-pharmacy", "근육통 관절통", ["부위", "운동", "통증"], "비교형", "통증 위치가 헷갈리는 사용자", "통증 구분"],
  ]),
  ...makeCluster("대상자별 약국 이용", "medicine", [
    ["임신 초기 약국 상담 전 마지막 생리일을 말해야 하는 이유", "early-pregnancy-pharmacy-last-period", "임신 초기 약국", ["마지막 생리일", "복용약", "상담"], "정보형", "임신 가능성이 있는 사용자", "민감 정보 전달"],
    ["수유 중 감기약 상담 전 아기 월령을 확인하는 법", "breastfeeding-cold-medicine-baby-age", "수유 중 감기약", ["아기 월령", "수유", "복용약"], "체크리스트형", "수유부", "상담 정보"],
    ["고령자 약국 상담 전 낙상 위험을 함께 말하는 이유", "senior-pharmacy-fall-risk-consult", "고령자 약국 상담", ["낙상", "졸림", "복용약"], "정보형", "고령 부모 보호자", "생활 위험"],
    ["초등학생 알약 삼킴이 어려울 때 약국에 물어볼 점", "child-pill-swallowing-pharmacy-question", "초등학생 알약", ["삼킴", "제형", "보호자"], "FAQ형", "초등학생 보호자", "제형 상담"],
    ["운전 직업군이 약 복용 전 졸림 문구를 확인하는 법", "driver-medicine-drowsiness-label", "운전 약 복용", ["졸림", "근무", "주의문구"], "체크리스트형", "운전 직업군", "근무 안전"],
    ["야근 근무자가 약국에서 피로를 상담할 때 말할 정보", "night-shift-fatigue-pharmacy-info", "야근 피로", ["수면", "카페인", "근무"], "정보형", "야근 근무자", "생활 패턴"],
    ["운동 후 통증약 상담 전 부상 순간을 설명하는 법", "exercise-pain-injury-moment-note", "운동 후 통증약", ["부상", "통증 부위", "운동"], "문제해결형", "운동 후 통증 사용자", "부상 설명"],
    ["채식 식단 영양제 상담 전 식단 범위를 말하는 기준", "vegetarian-diet-supplement-consult", "채식 식단 영양제", ["식단 범위", "철분", "비타민B12"], "정보형", "채식 식단 사용자", "식단 범위"],
    ["해외여행 전 복용약 영문명 확인을 약국에 물어보는 법", "travel-medicine-english-name-pharmacy", "해외여행 복용약", ["영문명", "처방약", "여행"], "체크리스트형", "해외여행 준비자", "영문명 확인"],
    ["부모님 약을 대신 살 때 나이와 질환을 정리하는 법", "buy-parents-medicine-age-disease-note", "부모님 약", ["나이", "질환", "복용약"], "체크리스트형", "부모님 약을 대신 사는 자녀", "대리 구매 정보"],
  ]),
  ...makeCluster("지역 검색 활용", "pharmacy", [
    ["서울 야간 약국 검색에서 구별 후보를 나누는 법", "seoul-night-pharmacy-district-options", "서울 야간 약국", ["구별", "후보", "전화"], "정보형", "서울에서 검색하는 사용자", "지역 후보 분리"],
    ["경기 외곽 약국 찾을 때 이동 시간을 먼저 보는 이유", "gyeonggi-outside-pharmacy-travel-time", "경기 외곽 약국", ["이동 시간", "거리", "대체"], "문제해결형", "경기 외곽 사용자", "이동 시간"],
    ["인천 공항 이동 전 약국 후보를 저장하는 기준", "incheon-airport-pharmacy-save-options", "인천 공항 약국", ["공항 이동", "저장", "전화"], "체크리스트형", "공항 이동 사용자", "이동 전 저장"],
    ["부산 해운대 주변 약국을 관광 동선과 함께 보는 법", "busan-haeundae-pharmacy-trip-route", "부산 해운대 약국", ["관광 동선", "거리", "영업"], "정보형", "부산 여행자", "여행 동선"],
    ["대구 도심 약국 검색에서 같은 이름 지점 구분", "daegu-downtown-pharmacy-branch-check", "대구 도심 약국", ["같은 이름", "주소", "지점"], "문제해결형", "대구 도심 사용자", "지점 구분"],
    ["광주 주말 약국 찾을 때 대중교통 시간을 보는 법", "gwangju-weekend-pharmacy-transit-time", "광주 주말 약국", ["대중교통", "주말", "도착"], "정보형", "광주 주말 사용자", "교통 시간"],
    ["대전 연구단지 주변 약국 방문 전 재고 문의 기준", "daejeon-research-complex-pharmacy-stock", "대전 약국 재고", ["재고", "연구단지", "전화"], "체크리스트형", "대전 직장인", "재고 문의"],
    ["울산 산업단지 근무자가 퇴근 전 약국을 찾는 순서", "ulsan-industrial-worker-after-work-pharmacy", "울산 산업단지 약국", ["퇴근 전", "근무", "영업"], "문제해결형", "울산 근무자", "퇴근 동선"],
    ["제주 여행 중 약국 검색 결과를 숙소 기준으로 보는 법", "jeju-travel-pharmacy-hotel-base", "제주 여행 약국", ["숙소", "여행", "전화"], "정보형", "제주 여행자", "숙소 기준"],
    ["세종 주말 약국 찾기 전 행정동을 확인하는 이유", "sejong-weekend-pharmacy-dong-check", "세종 주말 약국", ["행정동", "주말", "검색"], "정보형", "세종 사용자", "지역명 확인"],
  ]),
  ...makeCluster("날씨와 약국 준비", "season", [
    ["폭염 예보 전 약국에서 준비할 수분 보충 품목", "heatwave-pharmacy-hydration-items", "폭염 약국", ["수분 보충", "전해질", "외출"], "체크리스트형", "폭염에 대비하는 사용자", "더위 대비"],
    ["장마철 상처 관리 제품을 약국에서 고를 때 기준", "rainy-season-wound-care-pharmacy", "장마철 상처 관리", ["상처", "습기", "제품"], "정보형", "장마철 상처가 걱정되는 사용자", "습기 대비"],
    ["미세먼지 나쁜 날 약국 방문 전 눈·코 증상 정리", "fine-dust-eye-nose-symptom-note", "미세먼지 약국", ["눈", "코", "마스크"], "체크리스트형", "미세먼지 민감자", "증상 정리"],
    ["한파 출근 전 혈압약 복용자가 약국에 물어볼 점", "cold-wave-commute-blood-pressure-medicine", "한파 혈압약", ["출근", "혈압약", "상담"], "FAQ형", "혈압약 복용자", "한파 상담"],
    ["환절기 감기약 상담 전 알레르기 이력을 확인하는 법", "season-change-cold-medicine-allergy-history", "환절기 감기약", ["알레르기", "감기약", "이력"], "체크리스트형", "환절기 감기 사용자", "이력 확인"],
    ["꽃가루철 비염약 상담 전 졸림 가능성을 묻는 법", "pollen-rhinitis-medicine-drowsiness", "꽃가루 비염약", ["졸림", "비염", "운전"], "정보형", "비염약을 찾는 사용자", "졸림 확인"],
    ["눈 오는 날 약국 방문 전 미끄럼과 이동 시간을 보는 이유", "snowy-day-pharmacy-slip-travel-time", "눈 오는 날 약국", ["미끄럼", "이동 시간", "대체"], "문제해결형", "눈길 이동 사용자", "이동 안전"],
    ["태풍 예보 전 상비약과 처방약을 분리 점검하는 법", "typhoon-before-medicine-check", "태풍 상비약", ["처방약", "상비약", "점검"], "체크리스트형", "태풍 대비 가정", "사전 점검"],
    ["건조주의보 날 목·코 관리 제품을 약국에서 묻는 기준", "dry-alert-throat-nose-pharmacy", "건조주의보 약국", ["목", "코", "보습"], "정보형", "건조 증상 사용자", "건조 대비"],
    ["일교차 큰 날 감기와 알레르기를 구분해 상담하는 법", "big-temperature-gap-cold-allergy", "일교차 감기", ["알레르기", "감기", "증상"], "비교형", "환절기 증상 사용자", "증상 구분"],
  ]),
  ...makeCluster("콘텐츠 신뢰 기준", "pharmacy", [
    ["약국 정보가 틀렸을 때 수정 요청을 남기는 방법", "pharmacy-info-correction-request", "약국 정보 수정", ["수정 요청", "주소", "영업시간"], "정보형", "틀린 정보를 발견한 사용자", "정정 경로"],
    ["약국오늘 데이터 출처를 확인하고 활용하는 기준", "todaypharm-data-source-check", "약국오늘 데이터", ["공공데이터", "출처", "한계"], "정보형", "서비스 신뢰도를 확인하는 사용자", "출처 안내"],
    ["광고가 있는 약국 정보 사이트에서 먼저 봐야 할 항목", "ad-supported-pharmacy-site-check", "약국 정보 사이트", ["광고", "정보", "출처"], "비교형", "광고성 정보를 경계하는 사용자", "정보 우선순위"],
    ["약국 검색 결과와 실제 현장이 다를 때 확인할 순서", "pharmacy-search-result-field-difference", "약국 검색 결과", ["현장 차이", "전화", "정정"], "문제해결형", "정보가 다른 경험을 한 사용자", "차이 대응"],
    ["약국 이용 글에서 의료 조언과 일반 정보를 구분하는 법", "pharmacy-article-medical-info-boundary", "약국 이용 글", ["일반 정보", "의료 조언", "상담"], "정보형", "건강 글을 읽는 사용자", "정보 경계"],
    ["약국 영업시간 표시를 볼 때 공휴일 예외를 확인하는 이유", "pharmacy-hours-holiday-exception", "약국 영업시간 표시", ["공휴일", "예외", "전화"], "체크리스트형", "영업시간을 보는 사용자", "예외 확인"],
    ["지도앱과 약국오늘 정보를 함께 비교하는 기준", "map-app-todaypharm-compare", "지도앱 약국 정보", ["지도앱", "약국오늘", "전화"], "비교형", "여러 서비스를 비교하는 사용자", "정보 비교"],
    ["약국 전화번호가 바뀐 것 같을 때 확인할 곳", "pharmacy-phone-number-changed-check", "약국 전화번호", ["전화번호", "수정 요청", "공공데이터"], "문제해결형", "전화 연결이 안 되는 사용자", "전화번호 확인"],
    ["약국 목록 페이지에서 광고보다 먼저 봐야 할 정보", "pharmacy-list-before-ad-check", "약국 목록 페이지", ["광고", "영업시간", "전화"], "정보형", "검색 결과를 읽는 사용자", "정보 판별"],
    ["건강 정보 글을 읽은 뒤 약국 상담으로 이어가는 법", "health-article-to-pharmacy-consult", "건강 정보 글", ["약국 상담", "질문", "출처"], "체크리스트형", "블로그 글을 읽는 사용자", "상담 연결"],
  ]),
];

function makeCluster(
  category: string,
  sourceType: SourceType,
  rows: Array<[string, string, string, [string, string, string], SearchIntent, string, string]>,
): Seed[] {
  return rows.map(([title, slug, mainKeyword, expandedKeywords, searchIntent, targetReader, contentAngle]) => ({
    category,
    sourceType,
    title,
    slug,
    mainKeyword,
    expandedKeywords,
    searchIntent,
    targetReader,
    contentAngle,
  }));
}

function flattenTopics() {
  return SEEDS.map((seed, index) => ({ ...seed, id: index + 1 }));
}

function tokens(value: string) {
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((token) => token.length > 1);
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

function hasBatchim(value: string) {
  const last = [...value].at(-1);
  if (!last) return false;
  const code = last.charCodeAt(0);
  if (code < 0xac00 || code > 0xd7a3) return false;
  return (code - 0xac00) % 28 > 0;
}

function withSubject(value: string) {
  return `${value}${hasBatchim(value) ? "은" : "는"}`;
}

function withNominative(value: string) {
  return `${value}${hasBatchim(value) ? "이" : "가"}`;
}

function withObject(value: string) {
  return `${value}${hasBatchim(value) ? "을" : "를"}`;
}

function withConjunction(value: string) {
  return `${value}${hasBatchim(value) ? "과" : "와"}`;
}

function joinWithObject(values: [string, string, string]) {
  const [first, second, third] = values;
  return `${first}, ${second}, ${withObject(third)}`;
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

async function collectExistingTitles(v3Slugs: Set<string>): Promise<ExistingTitle[]> {
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
        if (title && (!slug || !v3Slugs.has(slug))) existing.push({ title, slug });
      });
    }
  }

  try {
    const db = getTursoClient();
    const result = await db.execute("SELECT title, slug FROM content_queue WHERE status IN ('published', 'pending', 'review')");
    result.rows.forEach((row) => {
      if (!v3Slugs.has(String(row.slug))) existing.push({ title: String(row.title), slug: String(row.slug) });
    });
  } catch { /* ok if DB not available */ }
  return existing;
}

function scoreTitle(topic: Topic, nearestSimilarity: number) {
  let score = 90;
  if (topic.title.length >= 18 && topic.title.length <= 44) score += 4;
  if (topic.title.indexOf(topic.mainKeyword) <= 10) score += 3;
  if (topic.expandedKeywords.length >= 3) score += 2;
  if (nearestSimilarity >= 70) score -= 18;
  if (nearestSimilarity >= 55) score -= 8;
  if (/(완치|무조건|100%|치료 보장|특효|최고|기적)/.test(topic.title)) score -= 25;
  return Math.max(0, Math.min(100, score));
}

function makeSummary(topic: Topic) {
  return `${withObject(topic.mainKeyword)} 확인할 때는 ${joinWithObject(topic.expandedKeywords)} 함께 봐야 헛걸음을 줄이고 복용 실수를 예방할 수 있습니다. 이 글은 ${withNominative(topic.targetReader)} 약국 상담 전 정리할 기준을 단계별로 안내합니다.`;
}

function makeFaq(topic: Topic): FAQ[] {
  const [first, second, third] = topic.expandedKeywords;
  return [
    {
      question: `${withSubject(topic.mainKeyword)} 무엇부터 확인해야 하나요?`,
      answer: `${withObject(first)} 먼저 정리하고 ${withConjunction(second)} ${withObject(third)} 함께 확인하면 약국 상담과 방문 판단이 쉬워집니다.`,
    },
    {
      question: "약국 방문 전 꼭 전화해야 하나요?",
      answer: "영업시간, 재고, 상담 가능 여부는 현장 사정에 따라 달라질 수 있으므로 출발 전 전화 확인을 권장합니다.",
    },
    {
      question: "검색 결과와 현장 정보가 다르면 어떻게 하나요?",
      answer: "약국명, 주소, 확인한 시간을 메모한 뒤 문의 페이지로 정정 요청을 남기면 운영자가 공공데이터와 공개 정보를 함께 확인합니다.",
    },
    {
      question: "병원 진료가 먼저 필요한 경우는 언제인가요?",
      answer: "호흡곤란, 의식 저하, 심한 통증, 고열 지속, 반복 구토처럼 일상 대응이 어려운 증상은 약국보다 의료기관 진료가 우선입니다.",
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
    <li>${withSubject(topic.mainKeyword)} ${withObject(first)} 먼저 정리하면 판단이 빨라집니다.</li>
    <li>${withSubject(second)} 검색 결과만으로 확정하기 어렵기 때문에 전화 확인이 필요합니다.</li>
    <li>${third}까지 함께 확인하면 약국 방문 후 다시 이동하는 일을 줄일 수 있습니다.</li>
  </ul>
</div>
<p>${makeSummary(topic)}</p>
<p>${withSubject(topic.contentAngle)} 단순히 가까운 장소나 익숙한 제품을 고르는 문제가 아닙니다. 같은 상황처럼 보여도 나이, 복용 중인 약, 이동 시간, 증상 기간에 따라 약국 상담의 방향이 달라질 수 있습니다.</p>
<h2>1. ${topic.mainKeyword}에서 먼저 볼 기준</h2>
<h3>${withObject(first)} 먼저 정리하는 이유</h3>
<p>${withSubject(first)} 약국 상담의 출발점입니다. 약사는 제한된 정보 안에서 일반의약품, 생활 관리, 병원 진료 필요성을 함께 판단해야 하므로 현재 상황을 짧고 정확하게 말하는 것이 중요합니다.</p>
<p>약국오늘에서 후보를 찾은 뒤 바로 이동하기보다 전화로 영업 여부와 상담 가능 여부를 확인하세요. 특히 야간, 주말, 공휴일에는 운영 시간이 평소와 달라질 수 있습니다.</p>
<h3>${withObject(second)} 빠뜨리면 생기는 문제</h3>
<p>${withObject(second)} 확인하지 않으면 실제 영업하지 않는 약국으로 이동하거나, 복용 중인 약과 겹치는 성분을 놓치거나, 필요한 제품이 없는 곳으로 갈 수 있습니다. 검색 결과는 출발점이고 마지막 확인은 전화와 현장 상담입니다.</p>
<div class="info-box">
  <h3>방문 전 한 문장</h3>
  <p>“${topic.mainKeyword} 때문에 문의드리는데, 지금 ${withConjunction(first)} ${second} 관련 상담이 가능할까요?”라고 물어보세요.</p>
</div>
<h2>2. 약국 상담 전 준비할 정보</h2>
<h3>상황과 복용 정보를 나누기</h3>
<p>상담 전에는 증상 시작 시점, 반복 여부, 이미 복용한 약, 알레르기 경험을 나눠 적어두면 좋습니다. 가족 약을 대신 사는 경우에는 대상자의 나이와 기저질환 여부도 함께 필요합니다.</p>
<ul class="checklist">
  <li>${first} 관련 현재 상태를 한 줄로 정리합니다.</li>
  <li>${withNominative(second)} 필요한 이유와 방문 목적을 구분합니다.</li>
  <li>${withConjunction(third)} 관련해 이미 확인한 내용을 적습니다.</li>
  <li>복용 중인 처방약, 일반약, 영양제를 함께 확인합니다.</li>
  <li>증상이 심하거나 오래가면 진료 필요성을 먼저 묻습니다.</li>
</ul>
<h3>전화 상담을 짧게 끝내는 요령</h3>
<p>전화 상담에서는 30초 안에 핵심만 말하는 것이 좋습니다. “누가, 언제부터, 어떤 상황으로, 무엇을 이미 확인했는지” 순서로 말하면 약국에서도 재고와 상담 가능 여부를 빠르게 확인할 수 있습니다.</p>
<p>메모는 길게 쓰기보다 상담에 필요한 사실만 남기는 편이 낫습니다. 예를 들어 “어제 저녁부터 목이 따갑고 열은 없으며, 혈압약을 매일 복용 중입니다”처럼 시간, 증상, 복용약을 한 문장으로 묶으면 추가 질문을 줄일 수 있습니다.</p>
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
    <tr><td>${first}</td><td>상담 방향을 정합니다.</td><td>현재 상태를 한 문장으로 말합니다.</td></tr>
    <tr><td>${second}</td><td>방문 가능성을 판단합니다.</td><td>전화로 실제 가능 여부를 확인합니다.</td></tr>
    <tr><td>${third}</td><td>복용 실수와 재방문을 줄입니다.</td><td>복용약과 생활 상황을 함께 설명합니다.</td></tr>
  </tbody>
</table>
<h3>공식 정보와 현장 정보를 같이 쓰기</h3>
<p>${source.label} 자료는 기본 기준을 확인하는 데 도움이 됩니다. 다만 ${source.note} 약국오늘의 근처 약국 찾기와 전화 확인을 함께 쓰면 검색에서 방문까지의 흐름을 짧게 만들 수 있습니다.</p>
<p>참고: <a href="${source.url}" rel="nofollow noopener noreferrer" target="_blank">${source.label}</a></p>
<h2>4. 자주 하는 실수와 피하는 법</h2>
<h3>제품명이나 장소명만 보고 결정하는 실수</h3>
<p>제품명이나 장소명만으로는 대상자 정보, 복용약, 알레르기 여부, 실제 영업 여부를 알 수 없습니다. 같은 제품이라도 대상자에 따라 주의가 달라질 수 있으므로 상담 전 기본 정보를 준비해야 합니다.</p>
<div class="warning-box">
  <h3>주의할 신호</h3>
  <p>고열 지속, 호흡곤란, 심한 알레르기 반응, 반복 구토, 의식 저하가 있으면 약국 상담보다 진료가 우선입니다.</p>
</div>
<h3>가장 가까운 후보만 보고 이동하는 실수</h3>
<p>가까운 약국이 항상 가장 빠른 선택은 아닙니다. 통화 연결 여부, 도착 예상 시간, 재고, 상담 가능성을 함께 보아야 실제로 문제를 해결할 수 있습니다.</p>
<h2>5. 약국오늘에서 실행하는 순서</h2>
<h3>검색부터 상담까지 4단계</h3>
<div class="step-cards">
  <div class="step-card"><span class="step-number">1</span><h4>후보 찾기</h4><p>현재 위치나 지역명으로 근처 약국 후보를 확인합니다.</p></div>
  <div class="step-card"><span class="step-number">2</span><h4>상황 정리</h4><p>${joinWithObject(topic.expandedKeywords)} 한 줄씩 적습니다.</p></div>
  <div class="step-card"><span class="step-number">3</span><h4>전화 확인</h4><p>영업 여부와 상담 가능 여부를 먼저 확인합니다.</p></div>
  <div class="step-card"><span class="step-number">4</span><h4>방문 결정</h4><p>도착 시간과 증상 정도를 보고 약국 또는 병원을 선택합니다.</p></div>
</div>
<h3>마무리 기준</h3>
<p>${withSubject(topic.mainKeyword)} 정보가 많을수록 좋은 것이 아니라 필요한 정보를 빠르게 좁히는 것이 중요합니다. 약국오늘에서 후보를 확인하고, 전화로 실제 가능 여부를 확인한 뒤 방문하세요.</p>
<div class="tip-box">
  <h3>약국오늘 메모</h3>
  <p>이 글은 일반 정보이며 진단이나 처방을 대신하지 않습니다. 임신·수유, 어린이·고령자, 만성질환, 복용 중인 약이 있으면 약사나 의료진 상담을 우선하세요.</p>
</div>`.trim();
}

function scoreArticle(item: QueueItem) {
  const plain = stripHtml(item.content_html);
  const searchableText = `${plain} ${item.ai_summary} ${JSON.stringify(item.ai_faq)}`;
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
  if (item.content_html.includes('rel="nofollow noopener noreferrer"')) score += 2;
  if (/<script|<h1|style="/i.test(item.content_html)) score -= 20;
  if (/(완치|100%|무조건|특효|치료 보장|최고|기적)/.test(searchableText)) score -= 20;
  if (/(약국는|위치은|위치을|확인를|순서이|방지이|방지을|코은|코을|피부은|피부을|마스크이|마스크을|재고은|재고을|기침를|겨울 건조증는|대비이|직장인가|가정가|복용 실수을|오복용)/.test(searchableText)) {
    score -= 30;
  }
  return Math.max(0, Math.min(100, score));
}

async function getLastExternalPublishAt(v3Slugs: Set<string>) {
  let lastTime = 0;
  for (const fileName of fs.readdirSync(OUTPUT_DIR)) {
    if (!fileName.startsWith("blog-campaign-") || !fileName.endsWith(".json")) continue;
    const filePath = path.join(OUTPUT_DIR, fileName);
    if (filePath === JSON_PATH) continue;
    readJsonArray(filePath).forEach((item) => {
      const publishAt = typeof item.publish_at === "string" ? Date.parse(item.publish_at) : 0;
      if (publishAt > lastTime) lastTime = publishAt;
    });
  }
  try {
    const db = getTursoClient();
    const result = await db.execute({ sql: "SELECT slug, publish_at FROM content_queue WHERE status = 'pending'", args: [] });
    result.rows.forEach((row) => {
      if (v3Slugs.has(String(row.slug))) return;
      const publishAt = Date.parse(String(row.publish_at));
      if (publishAt > lastTime) lastTime = publishAt;
    });
  } catch { /* ok if DB not available */ }
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
  const v3Slugs = new Set(topics.map((topic) => slugify(topic.slug)));
  const existing = await collectExistingTitles(v3Slugs);
  const lastExternalPublishAt = await getLastExternalPublishAt(v3Slugs);
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
    if (seenSlugs.has(slug)) throw new Error(`Duplicate slug in v3 topics: ${slug}`);
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
  const db = getTursoClient();
  const slugs = items.map((item) => item.slug);
  const placeholders = slugs.map(() => "?").join(", ");
  const existingResult = await db.execute({ sql: `SELECT slug FROM content_queue WHERE slug IN (${placeholders})`, args: slugs });
  const existingSlugs = new Set(existingResult.rows.map((r) => String(r.slug)));
  const freshItems = items
    .filter((item) => !existingSlugs.has(item.slug))
    .map(({ quality_score: _qualityScore, ...item }) => item);
  if (!freshItems.length) return { inserted: 0, skipped: items.length };
  const statements = freshItems.map((item) => ({
    sql: `INSERT INTO content_queue (hpid, title, slug, region, theme, content_html, ai_summary, ai_faq, ai_bullets, ai_cta, extra_sections, status, publish_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      item.hpid,
      item.title,
      item.slug,
      item.region,
      item.theme,
      item.content_html,
      item.ai_summary,
      JSON.stringify(item.ai_faq),
      item.ai_bullets !== null ? JSON.stringify(item.ai_bullets) : null,
      item.ai_cta,
      item.extra_sections !== null ? JSON.stringify(item.extra_sections) : null,
      item.status,
      item.publish_at,
    ],
  }));
  await db.batch(statements, "write");
  return { inserted: freshItems.length, skipped: items.length - freshItems.length };
}

async function main() {
  const insert = process.argv.includes("--insert");
  const items = await buildCampaign();
  const minScore = Math.min(...items.map((item) => item.quality_score));
  console.info(`Generated ${TITLE_COUNT} v3 titles and ${items.length} v3 posts. min_quality_score=${minScore}`);
  console.info(`CSV: ${path.relative(process.cwd(), CSV_PATH)}`);
  console.info(`JSON: ${path.relative(process.cwd(), JSON_PATH)}`);
  console.info(`First v3 publish_at: ${items[0]?.publish_at ?? "none"}`);
  console.info(`Last v3 publish_at: ${items.at(-1)?.publish_at ?? "none"}`);
  if (insert) {
    const result = await insertCampaign(items);
    console.info(`Supabase insert result: inserted=${result.inserted}, skipped=${result.skipped}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
