"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

type AdFormat = "auto" | "rectangle" | "horizontal" | "vertical" | "fluid";

interface AdSlotProps {
  slotId: string;
  format?: AdFormat;
  className?: string;
  style?: React.CSSProperties;
  layoutKey?: string;
}

export default function AdSlot({
  slotId,
  format = "auto",
  className = "",
  style,
  layoutKey,
}: AdSlotProps) {
  const adRef = useRef<HTMLModElement>(null);
  const initialized = useRef(false);

  const pubId = process.env.NEXT_PUBLIC_ADSENSE_PUB_ID ||
    process.env.NEXT_PUBLIC_ADSENSE_ID ||
    "ca-pub-3050601904412736";

  useEffect(() => {
    if (initialized.current) return;
    if (!adRef.current) return;
    if (process.env.NODE_ENV !== "production") return;

    try {
      initialized.current = true;
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // 광고 로드 실패 무시
    }
  }, []);

  if (process.env.NODE_ENV !== "production") {
    return (
      <div
        className={`bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-xs text-gray-400 ${className}`}
        style={{ minHeight: 90, ...style }}
      >
        [광고 영역 — {format} / slot:{slotId}]
      </div>
    );
  }

  return (
    <ins
      ref={adRef}
      className={`adsbygoogle ${className}`}
      style={{ display: "block", ...style }}
      data-ad-client={pubId}
      data-ad-slot={slotId}
      data-ad-format={format}
      data-full-width-responsive="true"
      {...(layoutKey ? { "data-ad-layout-key": layoutKey } : {})}
    />
  );
}

/** 블로그 본문 상단 — 수평 배너 */
export function AdSlotTop({ className = "" }: { className?: string }) {
  const slotId = process.env.NEXT_PUBLIC_ADSENSE_SLOT_TOP || "";
  if (!slotId) return null;
  return (
    <AdSlot
      slotId={slotId}
      format="horizontal"
      className={`my-6 ${className}`}
      style={{ minHeight: 90 }}
    />
  );
}

/** 블로그 본문 하단 — 직사각형 */
export function AdSlotBottom({ className = "" }: { className?: string }) {
  const slotId = process.env.NEXT_PUBLIC_ADSENSE_SLOT_BOTTOM || "";
  if (!slotId) return null;
  return (
    <AdSlot
      slotId={slotId}
      format="rectangle"
      className={`my-8 ${className}`}
      style={{ minHeight: 250 }}
    />
  );
}

/** 인피드 광고 — 목록 중간 삽입 */
export function AdSlotInFeed({ className = "" }: { className?: string }) {
  const slotId = process.env.NEXT_PUBLIC_ADSENSE_SLOT_INFEED || "";
  if (!slotId) return null;
  return (
    <AdSlot
      slotId={slotId}
      format="fluid"
      layoutKey="-ef+6k-30-ac+ty"
      className={`my-4 ${className}`}
    />
  );
}
