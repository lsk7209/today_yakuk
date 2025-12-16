"use client";

import * as React from "react";

function formatSeoulHHMM(date: Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

type Props = {
  /**
   * 서버에서 렌더 시점의 시간을 넘겨주면,
   * 초기 하이드레이션에서 “현재 시간”이 비어 보이지 않습니다.
   */
  initialIso?: string;
  className?: string;
};

export function SeoulNowBadge({ initialIso, className }: Props) {
  const [now, setNow] = React.useState<Date | null>(() => {
    if (!initialIso) return null;
    const d = new Date(initialIso);
    return Number.isNaN(d.getTime()) ? null : d;
  });

  React.useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const text = now ? formatSeoulHHMM(now) : "—";

  return (
    <span
      className={
        className ??
        "text-sm font-bold text-gray-700 bg-gray-100 px-3 py-1.5 rounded-full"
      }
      aria-label={`현재 시간(KST) ${text}`}
      title="현재 시간(KST)"
    >
      현재 {text}
    </span>
  );
}


