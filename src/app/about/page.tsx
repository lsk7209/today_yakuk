export default function AboutPage() {
  return (
    <div className="container py-12 space-y-6">
      <h1 className="text-3xl font-bold">오늘약국 소개</h1>
      <p className="text-[var(--muted)]">
        오늘약국은 야간·주말·공휴일에도 문 연 약국을 빠르게 찾도록 돕는 서비스입니다. 공공데이터와
        위치 정보를 활용해 신뢰도 높은 정보를 제공하며, 모바일 사용성을 우선으로 설계했습니다.
      </p>
      <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm space-y-3">
        <h2 className="text-xl font-semibold">우리가 추구하는 것</h2>
        <ul className="list-disc list-inside text-[var(--muted)] space-y-1">
          <li>사용자가 길을 헤매지 않고 약국을 찾을 수 있는 지도·검색 경험</li>
          <li>야간·주말 영업 여부를 빠르게 확인할 수 있는 필터와 상태 배지</li>
          <li>광고보다 콘텐츠를 우선하는 깔끔한 인터페이스</li>
        </ul>
      </div>
    </div>
  );
}

