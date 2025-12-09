export default function ContactPage() {
  return (
    <div className="container py-12 space-y-6">
      <h1 className="text-3xl font-bold">문의하기</h1>
      <p className="text-[var(--muted)]">
        서비스 제안, 데이터 수정 요청, 제휴 문의는 아래 연락처로 남겨주세요. 최대한 빠르게 회신드리겠습니다.
      </p>
      <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm space-y-4">
        <div>
          <p className="text-sm font-semibold text-brand-700">이메일</p>
          <p className="text-[var(--muted)]">support@todayyakuk.com</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-brand-700">운영 시간</p>
          <p className="text-[var(--muted)]">평일 10:00 ~ 18:00 (KST)</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-brand-700">응답 가이드</p>
          <p className="text-[var(--muted)]">
            데이터 정정 요청 시 약국명, 주소, 변경 내용을 함께 적어주시면 더 빠르게 반영됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}

