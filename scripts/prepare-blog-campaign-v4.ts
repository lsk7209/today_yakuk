import "dotenv/config";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

type SearchIntent = "정보형" | "문제해결형" | "비교형" | "체크리스트형" | "FAQ형";
type SourceType = "pharmacy" | "medicine" | "supplement" | "season";

type Cluster = {
  category: string;
  sourceType: SourceType;
  mainKeyword: string;
  baseSlug: string;
  targetReader: string;
  contentAngle: string;
  keywordSets: [string, string, string][];
};

type Topic = {
  id: number;
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
const CSV_PATH = path.join(OUTPUT_DIR, "title-candidates-2026-05-05-v4.csv");
const JSON_PATH = path.join(OUTPUT_DIR, "blog-campaign-2026-05-05-v4.json");
const TITLE_COUNT = 200;
const HOUR_MS = 60 * 60 * 1000;
const MIN_QUALITY_SCORE = 85;
const HOURS_BETWEEN_POSTS = 5;

const INTENTS: SearchIntent[] = ["체크리스트형", "문제해결형", "FAQ형", "정보형", "비교형"];
const SLUG_PARTS = [
  "order",
  "mistake",
  "question",
  "checklist",
  "criteria",
  "memo",
  "comparison",
  "call",
  "faq",
  "precheck",
] as const;

const OFFICIAL_SOURCES = {
  pharmacy: {
    label: "응급의료포털 E-Gen",
    url: "https://www.e-gen.or.kr/",
    note: "문 여는 약국 정보는 공공 데이터와 현장 사정이 달라질 수 있어 출발 전 전화 확인이 필요합니다.",
  },
  medicine: {
    label: "식품의약품안전처 의약품안전나라",
    url: "https://nedrug.mfds.go.kr/",
    note: "의약품 성분과 주의 사항은 제품별로 다르므로 포장, 설명서, 약사 상담을 함께 확인해야 합니다.",
  },
  supplement: {
    label: "식품안전나라 건강기능식품 정보",
    url: "https://www.foodsafetykorea.go.kr/",
    note: "건강기능식품은 질병 치료 목적이 아니며 복용 중인 약이나 질환이 있으면 전문가 상담이 필요합니다.",
  },
  season: {
    label: "질병관리청 건강정보",
    url: "https://www.kdca.go.kr/",
    note: "계절성 건강 문제는 개인 상태와 동반 증상에 따라 대응 기준이 달라질 수 있습니다.",
  },
} as const;

const CLUSTERS: Cluster[] = [
  {
    category: "약국 상담 준비",
    sourceType: "pharmacy",
    mainKeyword: "약국 전화 문의",
    baseSlug: "pharmacy-call-question",
    targetReader: "전화로 헛걸음을 줄이려는 사용자",
    contentAngle: "통화 전 확인 문장 정리",
    keywordSets: [
      ["영업 여부", "상담 가능", "도착 시간"],
      ["재고 확인", "제품명", "대체 선택"],
      ["조제 가능", "처방전", "마감 시간"],
      ["증상 설명", "복용약", "알레르기"],
      ["위치 확인", "건물 입구", "주차"],
      ["통화 연결", "대체 후보", "거리"],
      ["공휴일 운영", "야간 시간", "전화번호"],
      ["어린이 약", "나이", "체중"],
      ["고령자 상담", "복용 목록", "주의 신호"],
      ["문의 메모", "확인 시각", "방문 결정"],
    ],
  },
  {
    category: "복약 상담",
    sourceType: "medicine",
    mainKeyword: "복약 상담 질문지",
    baseSlug: "medicine-consult-question-sheet",
    targetReader: "약국 상담을 준비하는 사용자",
    contentAngle: "질문을 미리 정리하는 방식",
    keywordSets: [
      ["현재 증상", "복용약", "상담 순서"],
      ["알레르기 이력", "부작용 경험", "제품 선택"],
      ["처방약", "일반약", "영양제"],
      ["복용 시간", "식사 관계", "주의 문구"],
      ["대상자 나이", "기저질환", "생활 일정"],
      ["증상 기간", "반복 여부", "진료 필요성"],
      ["약 봉투", "성분명", "중복 확인"],
      ["임신 수유", "민감 정보", "상담 표현"],
      ["운전 일정", "졸림 가능성", "업무 시간"],
      ["상담 결과", "메모 보관", "다음 질문"],
    ],
  },
  {
    category: "복용 관리",
    sourceType: "medicine",
    mainKeyword: "복용 시간 기록",
    baseSlug: "medicine-time-record",
    targetReader: "복용 시간을 자주 놓치는 사용자",
    contentAngle: "시간표와 기록 습관 만들기",
    keywordSets: [
      ["아침 복용", "저녁 복용", "알림"],
      ["식전 식후", "취침 시간", "약 봉투"],
      ["빠뜨린 약", "기록표", "상담 질문"],
      ["교대근무", "수면 시간", "복용 간격"],
      ["외출 일정", "휴대 약", "물"],
      ["가족 확인", "이름표", "체크 표시"],
      ["처방 변경", "새 약", "이전 약"],
      ["복용 후 증상", "시간대", "메모"],
      ["중복 복용", "달력", "분리 보관"],
      ["약사 상담", "현재 일정", "조정 기준"],
    ],
  },
  {
    category: "약 라벨 해석",
    sourceType: "medicine",
    mainKeyword: "약 봉투 확인",
    baseSlug: "medicine-bag-label-check",
    targetReader: "약 봉투 문구가 헷갈리는 사용자",
    contentAngle: "라벨을 상담 질문으로 바꾸는 기준",
    keywordSets: [
      ["식전 식후", "복용 횟수", "복용 간격"],
      ["취침 복용", "졸림 문구", "운전 일정"],
      ["성분명", "제품명", "중복 성분"],
      ["주의 문구", "금기 대상", "알레르기"],
      ["조제일", "복용 기간", "남은 약"],
      ["보관 방법", "실온 냉장", "습기"],
      ["가루약", "시럽약", "복용 도구"],
      ["어린이 용량", "체중", "보호자 메모"],
      ["처방 변경", "이전 봉투", "확인 질문"],
      ["복약 안내", "전화 상담", "재방문 기준"],
    ],
  },
  {
    category: "가정 상비약",
    sourceType: "medicine",
    mainKeyword: "상비약 점검표",
    baseSlug: "home-medicine-check-sheet",
    targetReader: "집 상비약을 정리하려는 사용자",
    contentAngle: "가정용 점검표 만들기",
    keywordSets: [
      ["유효기간", "개봉일", "폐기 분리"],
      ["해열제", "소화제", "상처 용품"],
      ["어린이 약", "보관 위치", "잠금"],
      ["냉장 보관", "실온 보관", "습기"],
      ["가족 이름표", "복용 시간", "분리함"],
      ["여행 후 정리", "남은 약", "재고"],
      ["설명서 보관", "제품 사진", "성분명"],
      ["비상 연락처", "약국 전화", "응급 기준"],
      ["계절 용품", "마스크", "보습제"],
      ["월별 점검", "체크리스트", "구매 메모"],
    ],
  },
  {
    category: "가족 복약 관리",
    sourceType: "medicine",
    mainKeyword: "가족 약 정리",
    baseSlug: "family-medicine-organize",
    targetReader: "가족 약을 함께 관리하는 사용자",
    contentAngle: "사람별 약을 섞지 않는 구조",
    keywordSets: [
      ["이름표", "복용 시간", "보관함"],
      ["부모님 약", "처방 목록", "상담 메모"],
      ["아이 약", "체중", "보호자 확인"],
      ["영양제", "처방약", "중복 성분"],
      ["외출용 파우치", "설명서", "복용 도구"],
      ["색상 구분", "가족별 칸", "주의 약"],
      ["약 봉투 사진", "성분명", "재방문"],
      ["복용 알림", "달력", "체크 표시"],
      ["남은 약", "폐기", "재고 파악"],
      ["상담 질문", "대상자 정보", "생활 일정"],
    ],
  },
  {
    category: "어린이 약 상담",
    sourceType: "medicine",
    mainKeyword: "어린이 약 상담",
    baseSlug: "child-medicine-consult",
    targetReader: "어린이 약을 준비하는 보호자",
    contentAngle: "나이와 체중을 먼저 말하는 상담",
    keywordSets: [
      ["나이", "체중", "증상 기간"],
      ["해열제", "체온 기록", "복용 간격"],
      ["시럽약", "개봉일", "보관"],
      ["가루약", "복용 거부", "상담 질문"],
      ["알레르기", "이전 반응", "주의 문구"],
      ["등원 전", "복용 시간", "졸림"],
      ["밤 증상", "전화 확인", "진료 신호"],
      ["보호자 메모", "복용약", "기저질환"],
      ["형제 약", "이름표", "분리 보관"],
      ["병원 처방", "약국 설명", "재확인"],
    ],
  },
  {
    category: "고령자 약 상담",
    sourceType: "medicine",
    mainKeyword: "고령자 약 상담",
    baseSlug: "senior-medicine-consult",
    targetReader: "부모님 약을 대신 챙기는 보호자",
    contentAngle: "복용 목록과 생활 위험을 함께 전하기",
    keywordSets: [
      ["복용 목록", "처방약", "영양제"],
      ["낙상 위험", "졸림", "밤 화장실"],
      ["혈압약", "당뇨약", "식사 시간"],
      ["기억력", "복용 알림", "가족 확인"],
      ["약 봉투", "사진", "성분명"],
      ["부작용 의심", "증상 시간", "메모"],
      ["재방문", "남은 약", "처방 변경"],
      ["보관 위치", "습기", "손 닿는 곳"],
      ["대리 구매", "나이", "질환 정보"],
      ["응급 신호", "진료 우선", "전화 상담"],
    ],
  },
  {
    category: "임신 수유 상담",
    sourceType: "medicine",
    mainKeyword: "임신 수유 약 상담",
    baseSlug: "pregnancy-breastfeeding-medicine",
    targetReader: "임신 또는 수유 중 약을 고민하는 사용자",
    contentAngle: "민감 정보를 안전하게 전달하기",
    keywordSets: [
      ["임신 주수", "마지막 생리", "복용약"],
      ["수유 중", "아기 월령", "복용 시간"],
      ["감기 증상", "열", "기침"],
      ["소화 불편", "속쓰림", "식사"],
      ["알레르기", "콧물", "졸림"],
      ["피부 증상", "연고", "사용 부위"],
      ["영양제", "엽산", "철분"],
      ["처방약", "병원 상담", "약국 질문"],
      ["야간 증상", "전화 문의", "진료 신호"],
      ["복용 기록", "제품명", "상담 메모"],
    ],
  },
  {
    category: "생활 안전",
    sourceType: "medicine",
    mainKeyword: "운전 약 복용 주의",
    baseSlug: "driving-medicine-caution",
    targetReader: "운전이나 기계 작업을 앞둔 사용자",
    contentAngle: "졸림과 업무 일정을 함께 판단하기",
    keywordSets: [
      ["졸림 문구", "운전 일정", "복용 시간"],
      ["감기약", "콧물약", "업무 시작"],
      ["알레르기약", "집중력", "대체 시간"],
      ["수면 보조", "다음 날", "출근"],
      ["근무표", "교대근무", "상담 질문"],
      ["음주 여부", "복용약", "주의 문구"],
      ["장거리 운전", "휴게 시간", "복용 기록"],
      ["어지러움", "혈압", "수분"],
      ["전화 상담", "제품명", "성분명"],
      ["위험 신호", "진료 우선", "방문 결정"],
    ],
  },
  {
    category: "알레르기 상담",
    sourceType: "medicine",
    mainKeyword: "알레르기 의심 상담",
    baseSlug: "allergy-suspect-consult",
    targetReader: "알레르기 증상을 정리하려는 사용자",
    contentAngle: "음식, 약, 환경 변화를 시간순으로 보기",
    keywordSets: [
      ["음식 기록", "복용약", "증상 시간"],
      ["두드러기", "가려움", "호흡"],
      ["콧물", "눈 가려움", "꽃가루"],
      ["새 제품", "화장품", "피부 반응"],
      ["약 복용 후", "발진", "상담 질문"],
      ["어린이 반응", "나이", "보호자 메모"],
      ["응급 신호", "호흡곤란", "진료"],
      ["사진 기록", "부위", "반복 여부"],
      ["알레르기약", "졸림", "운전"],
      ["환경 변화", "청소", "반려동물"],
    ],
  },
  {
    category: "피부 증상",
    sourceType: "medicine",
    mainKeyword: "피부 불편 기록",
    baseSlug: "skin-symptom-pharmacy",
    targetReader: "피부 불편으로 약국 상담을 준비하는 사용자",
    contentAngle: "사진과 부위 기록으로 상담을 구체화하기",
    keywordSets: [
      ["가려움", "부위", "사진"],
      ["발진", "반복 여부", "새 제품"],
      ["상처", "습윤밴드", "소독"],
      ["건조함", "보습제", "사용 횟수"],
      ["벌레 물림", "붓기", "통증"],
      ["햇볕 노출", "선크림", "열감"],
      ["마스크 자극", "입 주변", "교체 주기"],
      ["아이 피부", "나이", "보호자 메모"],
      ["연고 사용", "기간", "주의 문구"],
      ["진료 신호", "고름", "열"],
    ],
  },
  {
    category: "소화 증상",
    sourceType: "medicine",
    mainKeyword: "속 불편 기록",
    baseSlug: "digestion-symptom-pharmacy",
    targetReader: "속 불편 증상을 정리하려는 사용자",
    contentAngle: "식사와 증상 시간을 분리해 말하기",
    keywordSets: [
      ["속쓰림", "식사 시간", "반복"],
      ["더부룩함", "복용약", "생활 습관"],
      ["설사", "수분", "동반 증상"],
      ["변비", "식이섬유", "복용 기간"],
      ["복통 위치", "오른쪽", "왼쪽"],
      ["구토", "음식 기록", "진료 신호"],
      ["소화제", "성분명", "중복 확인"],
      ["위산", "야식", "수면"],
      ["여행 중", "물갈이", "상비약"],
      ["아이 복통", "나이", "체온"],
    ],
  },
  {
    category: "감기 증상",
    sourceType: "medicine",
    mainKeyword: "감기 증상 메모",
    baseSlug: "cold-symptom-pharmacy",
    targetReader: "감기 증상으로 약국을 찾는 사용자",
    contentAngle: "증상 조합을 짧게 설명하기",
    keywordSets: [
      ["열", "기침", "증상 기간"],
      ["콧물", "졸림", "운전"],
      ["목 통증", "건조", "가래"],
      ["몸살", "복용약", "휴식"],
      ["아이 감기", "체온", "해열제"],
      ["고령자 감기", "기저질환", "진료 신호"],
      ["임신 수유", "민감 정보", "상담 질문"],
      ["감기약", "성분명", "중복 확인"],
      ["밤 기침", "수면", "전화 문의"],
      ["독감 의심", "고열", "병원 기준"],
    ],
  },
  {
    category: "호흡기·감각 증상",
    sourceType: "medicine",
    mainKeyword: "눈코목 증상 메모",
    baseSlug: "eye-nose-throat-pharmacy",
    targetReader: "눈, 코, 목 증상을 함께 겪는 사용자",
    contentAngle: "부위별 증상을 나눠 말하기",
    keywordSets: [
      ["눈 가려움", "렌즈", "분비물"],
      ["코막힘", "콧물", "졸림"],
      ["목 따가움", "건조", "기침"],
      ["미세먼지", "마스크", "세척"],
      ["알레르기", "꽃가루", "반복"],
      ["겨울 건조", "보습", "실내 습도"],
      ["아이 증상", "나이", "보호자 메모"],
      ["운전 일정", "졸림 문구", "복용 시간"],
      ["증상 순서", "발생 시간", "사진"],
      ["진료 신호", "통증", "시야 변화"],
    ],
  },
  {
    category: "계절성 건강",
    sourceType: "season",
    mainKeyword: "계절 건강 약국 준비",
    baseSlug: "seasonal-health-pharmacy",
    targetReader: "계절 변화에 맞춰 약국 준비를 하려는 사용자",
    contentAngle: "날씨와 생활 조건에 따라 준비물 나누기",
    keywordSets: [
      ["폭염", "수분 보충", "외출"],
      ["장마", "습기", "상처 관리"],
      ["한파", "혈압약", "출근"],
      ["미세먼지", "눈 코", "마스크"],
      ["꽃가루", "비염", "졸림"],
      ["큰 일교차", "감기", "알레르기"],
      ["자외선", "피부", "선크림"],
      ["건조주의보", "목 코", "보습"],
      ["태풍", "상비약", "처방약"],
      ["휴가철", "여행 약", "보관"],
    ],
  },
  {
    category: "지역 약국 이용",
    sourceType: "pharmacy",
    mainKeyword: "지역 이동 약국 찾기",
    baseSlug: "local-travel-pharmacy-search",
    targetReader: "이동 중 약국을 찾아야 하는 사용자",
    contentAngle: "동선 기준으로 후보를 나누는 방식",
    keywordSets: [
      ["서울 환승", "역 주변", "전화 확인"],
      ["경기 외곽", "이동 시간", "대체 후보"],
      ["인천 공항", "출국 전", "상비약"],
      ["부산 해운대", "관광 동선", "영업시간"],
      ["대구 도심", "주소 확인", "주차"],
      ["광주 주말", "대중교통", "마감"],
      ["대전 연구단지", "퇴근 후", "재고"],
      ["울산 산업단지", "근무표", "야간"],
      ["제주 여행", "숙소 기준", "전화번호"],
      ["세종 행정동", "동 이름", "검색어"],
    ],
  },
  {
    category: "여행 약국 준비",
    sourceType: "medicine",
    mainKeyword: "휴가 여행 약국 준비",
    baseSlug: "vacation-travel-pharmacy",
    targetReader: "여행 전 약과 약국 정보를 준비하는 사용자",
    contentAngle: "출발 전 준비와 현지 확인 분리",
    keywordSets: [
      ["상비약", "숙소 위치", "전화번호"],
      ["아이 동반", "체온계", "해열제"],
      ["부모님 동행", "처방약", "복용 목록"],
      ["해외여행", "영문명", "처방전"],
      ["장거리 운전", "졸림", "복용 시간"],
      ["물갈이", "소화제", "수분"],
      ["벌레 물림", "상처 용품", "보관"],
      ["해변 여행", "자외선", "피부"],
      ["산행", "근육통", "파스"],
      ["귀가 후", "남은 약", "정리"],
    ],
  },
  {
    category: "건강기능식품 상담",
    sourceType: "supplement",
    mainKeyword: "영양제 약국 상담",
    baseSlug: "supplement-pharmacy-consult",
    targetReader: "영양제를 고르기 전 상담하려는 사용자",
    contentAngle: "성분보다 복용 목적과 현재 약을 먼저 보기",
    keywordSets: [
      ["중복 성분", "복용약", "제품 라벨"],
      ["비타민D", "햇빛", "복용 시간"],
      ["오메가3", "혈액응고", "수술 예정"],
      ["유산균", "제품 변경", "기록 기간"],
      ["마그네슘", "설사", "용량"],
      ["종합비타민", "단일 성분", "목적"],
      ["철분", "식사", "변비"],
      ["칼슘", "비타민D", "복용 간격"],
      ["수면 제품", "졸림", "운전"],
      ["부모님 선물", "처방약", "질환"],
    ],
  },
  {
    category: "약국 정보 신뢰",
    sourceType: "pharmacy",
    mainKeyword: "약국 정보 확인법",
    baseSlug: "pharmacy-info-verification",
    targetReader: "검색 결과의 신뢰도를 확인하려는 사용자",
    contentAngle: "지도 정보와 현장 확인을 나누는 기준",
    keywordSets: [
      ["영업시간", "공휴일 예외", "전화 확인"],
      ["주소", "건물명", "입구"],
      ["전화번호", "변경 가능성", "정정 요청"],
      ["재고 정보", "제품명", "대체 선택"],
      ["공공데이터", "업데이트 시점", "현장 차이"],
      ["광고 구분", "정보 출처", "우선순위"],
      ["지도앱", "약국오늘", "비교 기준"],
      ["목록 페이지", "상세 페이지", "문의 버튼"],
      ["오류 제보", "확인 시각", "운영자 검토"],
      ["의료 정보", "일반 정보", "상담 경계"],
    ],
  },
];

function makeTitle(mainKeyword: string, expandedKeywords: [string, string, string], variant: number) {
  const [first, second, third] = expandedKeywords;
  const patterns = [
    `${mainKeyword} ${first} 확인 순서`,
    `${mainKeyword} ${second} 실수 줄이는 법`,
    `${mainKeyword} ${third} 상담 질문`,
    `${mainKeyword} ${first}·${second} 체크리스트`,
    `${mainKeyword} ${second} 기준과 주의점`,
    `${mainKeyword} ${third} 메모 작성법`,
    `${mainKeyword} ${first} 비교 기준`,
    `${mainKeyword} ${second} 전화 문의법`,
    `${mainKeyword} ${third} FAQ`,
    `${mainKeyword} ${first} 방문 전 점검`,
  ];
  return patterns[variant];
}

function flattenTopics() {
  return CLUSTERS.flatMap((cluster) =>
    cluster.keywordSets.map((expandedKeywords, index) => ({
      id: 0,
      category: cluster.category,
      sourceType: cluster.sourceType,
      mainKeyword: cluster.mainKeyword,
      title: makeTitle(cluster.mainKeyword, expandedKeywords, index),
      slug: `${cluster.baseSlug}-${SLUG_PARTS[index]}`,
      expandedKeywords,
      searchIntent: INTENTS[index % INTENTS.length],
      targetReader: cluster.targetReader,
      contentAngle: cluster.contentAngle,
    })),
  ).map((topic, index) => ({ ...topic, id: index + 1 }));
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

function parseCsvLine(line: string) {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];
    if (char === '"' && inQuotes && next === '"') {
      current += '"';
      index += 1;
      continue;
    }
    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
      continue;
    }
    current += char;
  }
  values.push(current);
  return values;
}

function readJsonArray(filePath: string): Array<Record<string, unknown>> {
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as Array<Record<string, unknown>>;
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
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function collectExistingTitles(v4Slugs: Set<string>): Promise<ExistingTitle[]> {
  const existing: ExistingTitle[] = [];
  const staticBlogDir = path.join(process.cwd(), "src", "app", "blog");
  if (fs.existsSync(staticBlogDir)) {
    fs.readdirSync(staticBlogDir, { withFileTypes: true }).forEach((file) => {
      if (!file.isDirectory() || file.name.startsWith("[")) return;
      const pagePath = path.join(staticBlogDir, file.name, "page.tsx");
      if (!fs.existsSync(pagePath)) return;
      const source = fs.readFileSync(pagePath, "utf8");
      const match = source.match(/const\s+metaTitle\s*=\s*"([^"]+)"/);
      existing.push({ title: match?.[1] ?? file.name.replace(/-/g, " "), slug: file.name });
    });
  }

  fs.readdirSync(OUTPUT_DIR).forEach((fileName) => {
    const filePath = path.join(OUTPUT_DIR, fileName);
    if (filePath === CSV_PATH || filePath === JSON_PATH) return;
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
        if (title && (!slug || !v4Slugs.has(slug))) existing.push({ title, slug });
      });
    }
  });

  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (supabaseUrl && serviceKey) {
    const supabase = createClient(supabaseUrl, serviceKey);
    const { data, error } = await supabase.from("content_queue").select("title, slug");
    if (error) throw error;
    data?.forEach((item) => {
      if (item.title && !v4Slugs.has(item.slug)) existing.push({ title: item.title, slug: item.slug });
    });
  }

  const byTitle = new Map<string, ExistingTitle>();
  existing.forEach((item) => {
    byTitle.set(item.title.replace(/\s*\|\s*약국오늘\s*$/i, "").replace(/\s+/g, " ").trim(), item);
  });
  return [...byTitle.values()];
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
  return `${withSubject(topic.mainKeyword)} ${joinWithObject(topic.expandedKeywords)} 순서대로 확인하면 약국 상담과 방문 판단이 쉬워집니다. 이 글은 ${withNominative(topic.targetReader)} 출발 전 정리할 기준을 단계별로 안내합니다.`;
}

function makeFaq(topic: Topic): FAQ[] {
  const [first, second, third] = topic.expandedKeywords;
  return [
    {
      question: `${withSubject(topic.mainKeyword)} 무엇부터 정리해야 하나요?`,
      answer: `${withObject(first)} 먼저 적고 ${withConjunction(second)} ${withObject(third)} 이어서 확인하면 상담 질문이 분명해집니다.`,
    },
    {
      question: "약국 방문 전에 전화 확인이 필요한가요?",
      answer: "영업 여부, 재고, 상담 가능 시간은 현장 사정에 따라 바뀔 수 있어 출발 전 전화 확인이 안전합니다.",
    },
    {
      question: "제품명만 알고 있어도 상담할 수 있나요?",
      answer: "제품명도 도움이 되지만 대상자 나이, 증상 시작 시점, 복용 중인 약을 함께 말해야 더 정확한 안내를 받을 수 있습니다.",
    },
    {
      question: "병원 진료가 먼저 필요한 신호는 무엇인가요?",
      answer: "호흡곤란, 의식 저하, 고열 지속, 심한 통증, 반복 구토처럼 일상 대응이 어려운 증상은 약국보다 진료가 우선입니다.",
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
    <li>${withSubject(topic.mainKeyword)} ${withObject(first)} 먼저 적으면 상담 질문이 분명해집니다.</li>
    <li>${withSubject(second)} 현장 사정에 따라 달라질 수 있어 출발 전 통화로 확인해야 합니다.</li>
    <li>${withObject(third)} 함께 준비하면 닫힌 약국 앞에서 다시 후보를 찾는 시간을 줄일 수 있습니다.</li>
  </ul>
</div>
<p>${makeSummary(topic)}</p>
<p>${withSubject(topic.contentAngle)} 거리만 보고 움직이는 방식보다 안정적입니다. 대상자, 증상 시작 시점, 복용 중인 약, 이동 가능 시간을 나누어 보면 약국에서 확인해야 할 질문이 짧아집니다.</p>
<h2>1. ${topic.mainKeyword}에서 먼저 확인할 기준</h2>
<h3>${withObject(first)} 먼저 정리하는 이유</h3>
<p>${withSubject(first)} 상담의 방향을 정하는 핵심 정보입니다. 약사는 제한된 정보 안에서 일반의약품, 생활 관리, 병원 진료 필요성을 함께 판단해야 하므로 현재 상황을 짧고 정확하게 말하는 것이 좋습니다.</p>
<p>약국오늘에서 후보를 찾은 뒤 바로 이동하기보다 전화로 영업 여부와 상담 가능 여부를 확인하세요. 야간, 주말, 공휴일에는 운영 시간이 평소와 달라질 수 있습니다.</p>
<h3>${withObject(second)} 빠뜨리면 생기는 문제</h3>
<p>${withObject(second)} 빠뜨리면 실제 영업하지 않는 약국으로 이동하거나, 필요한 제품이 없는 곳으로 갈 수 있습니다. 검색 결과는 후보를 좁히는 출발점이고 마지막 확인은 전화와 현장 상담입니다.</p>
<div class="info-box">
  <h3>방문 전 한 문장</h3>
  <p>“${topic.mainKeyword} 때문에 문의드리는데, 지금 ${withConjunction(first)} ${second} 관련 상담이 가능할까요?”라고 물어보세요.</p>
</div>
<h2>2. 약국 상담 전에 준비할 정보</h2>
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
<h2>3. 선택지를 비교할 때 보는 표</h2>
<h3>검색 결과와 실제 방문 가능성 비교</h3>
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
  if (h3Count >= 8) score += 4;
  if (richCount >= 5) score += 4;
  if (item.ai_faq.length >= 4) score += 4;
  if (item.content_html.includes('rel="nofollow noopener noreferrer"')) score += 2;
  if (/<script|<h1|style="/i.test(item.content_html)) score -= 20;
  if (/(완치|100%|무조건|특효|치료 보장|최고|기적)/.test(searchableText)) score -= 20;
  return Math.max(0, Math.min(100, score));
}

async function getLastExternalPublishAt(v4Slugs: Set<string>) {
  let lastTime = 0;
  fs.readdirSync(OUTPUT_DIR).forEach((fileName) => {
    if (!fileName.startsWith("blog-campaign-") || !fileName.endsWith(".json")) return;
    const filePath = path.join(OUTPUT_DIR, fileName);
    if (filePath === JSON_PATH) return;
    readJsonArray(filePath).forEach((item) => {
      const publishAt = typeof item.publish_at === "string" ? Date.parse(item.publish_at) : 0;
      if (publishAt > lastTime) lastTime = publishAt;
    });
  });

  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (supabaseUrl && serviceKey) {
    const supabase = createClient(supabaseUrl, serviceKey);
    const { data, error } = await supabase.from("content_queue").select("slug, publish_at").eq("status", "pending");
    if (error) throw error;
    data?.forEach((item) => {
      if (v4Slugs.has(item.slug)) return;
      const publishAt = Date.parse(item.publish_at);
      if (publishAt > lastTime) lastTime = publishAt;
    });
  }
  if (lastTime > 0) return new Date(lastTime);
  return new Date(Date.now() + HOUR_MS);
}

function getPublishAt(index: number, lastExternalPublishAt: Date) {
  return new Date(lastExternalPublishAt.getTime() + (index + 1) * HOURS_BETWEEN_POSTS * HOUR_MS).toISOString();
}

async function buildCampaign() {
  const topics = flattenTopics();
  if (topics.length !== TITLE_COUNT) throw new Error(`Expected ${TITLE_COUNT} topics, got ${topics.length}`);
  const v4Slugs = new Set(topics.map((topic) => slugify(topic.slug)));
  const existing = await collectExistingTitles(v4Slugs);
  const lastExternalPublishAt = await getLastExternalPublishAt(v4Slugs);
  const seenSlugs = new Set<string>();
  const seenTitles = new Set<string>();
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
    const normalizedTitle = topic.title.replace(/\s+/g, " ").trim();
    if (seenSlugs.has(slug)) throw new Error(`Duplicate slug in v4 topics: ${slug}`);
    if (seenTitles.has(normalizedTitle)) throw new Error(`Duplicate title in v4 topics: ${normalizedTitle}`);
    seenSlugs.add(slug);
    seenTitles.add(normalizedTitle);

    const nearest = existing
      .map((item) => ({ item, score: similarity(topic.title, item.title) }))
      .sort((a, b) => b.score - a.score)[0];
    const nearestScore = nearest?.score ?? 0;
    const titleScore = scoreTitle(topic, nearestScore);
    const duplicateStatus = nearestScore >= 82 ? "fail_duplicate" : "pass";
    const cannibalizationStatus = nearestScore >= 70 ? "fail_cannibalization" : "pass";
    if (duplicateStatus !== "pass" || cannibalizationStatus !== "pass" || titleScore < MIN_QUALITY_SCORE) {
      throw new Error(
        `Title gate failed: #${topic.id} ${topic.title} score=${titleScore} similarity=${nearestScore} nearest=${nearest?.item.title ?? "none"}`,
      );
    }

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
    const articleScore = scoreArticle(queueItem);
    const qualityScore = Math.min(titleScore, articleScore);
    if (qualityScore < MIN_QUALITY_SCORE) {
      throw new Error(`Content gate failed: #${topic.id} ${topic.slug} score=${qualityScore}`);
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
        qualityScore,
        duplicateStatus,
        cannibalizationStatus,
        nearestScore,
        nearest?.item.title ?? "",
        "신규 v4 장기 예약 캠페인",
      ].map(csvEscape).join(","),
    );
    queueItems.push({ ...queueItem, quality_score: qualityScore });
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
  const { data: existing, error: existingError } = await supabase.from("content_queue").select("slug").in("slug", slugs);
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
  console.info(`Generated ${TITLE_COUNT} v4 titles and ${items.length} v4 posts. min_quality_score=${minScore}`);
  console.info(`CSV: ${path.relative(process.cwd(), CSV_PATH)}`);
  console.info(`JSON: ${path.relative(process.cwd(), JSON_PATH)}`);
  console.info(`First v4 publish_at: ${items[0]?.publish_at ?? "none"}`);
  console.info(`Last v4 publish_at: ${items.at(-1)?.publish_at ?? "none"}`);
  if (insert) {
    const result = await insertCampaign(items);
    console.info(`Supabase insert result: inserted=${result.inserted}, skipped=${result.skipped}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
