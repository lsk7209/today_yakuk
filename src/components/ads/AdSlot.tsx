"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { canRequestAds, isAdsenseServingEnabled } from "@/lib/ad-policy";

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
  pageEligible?: boolean;
}

export default function AdSlot({
  slotId,
  format = "auto",
  className = "",
  style,
  layoutKey,
  pageEligible = false,
}: AdSlotProps) {
  const adRef = useRef<HTMLModElement>(null);
  const initialized = useRef(false);
  const pathname = usePathname() ?? "/";

  const pubId = process.env.NEXT_PUBLIC_ADSENSE_PUB_ID ||
    process.env.NEXT_PUBLIC_ADSENSE_ID ||
    "ca-pub-3050601904412736";
  const servingAllowed = isAdsenseServingEnabled() && canRequestAds(pathname, pageEligible);

  useEffect(() => {
    if (initialized.current) return;
    if (!adRef.current) return;
    if (process.env.NODE_ENV !== "production" || !servingAllowed) return;

    try {
      initialized.current = true;
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // 광고 로드 실패 무시
    }
  }, [servingAllowed]);

  if (!servingAllowed) return null;

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
    <>
      <Script
        id="adsense-serving-script"
        async
        strategy="afterInteractive"
        crossOrigin="anonymous"
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${pubId}`}
      />
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
    </>
  );
}

/** 블로그 본문 상단 — 수평 배너 */
export function AdSlotTop({ className = "", pageEligible = false }: { className?: string; pageEligible?: boolean }) {
  const slotId = process.env.NEXT_PUBLIC_ADSENSE_SLOT_TOP || "";
  if (!slotId) return null;
  return (
    <AdSlot
      slotId={slotId}
      format="horizontal"
      className={`my-6 ${className}`}
      style={{ minHeight: 90 }}
      pageEligible={pageEligible}
    />
  );
}

/** 블로그 본문 하단 — 직사각형 */
export function AdSlotBottom({ className = "", pageEligible = false }: { className?: string; pageEligible?: boolean }) {
  const slotId = process.env.NEXT_PUBLIC_ADSENSE_SLOT_BOTTOM || "";
  if (!slotId) return null;
  return (
    <AdSlot
      slotId={slotId}
      format="rectangle"
      className={`my-8 ${className}`}
      style={{ minHeight: 250 }}
      pageEligible={pageEligible}
    />
  );
}

/** 인피드 광고 — 목록 중간 삽입 */
export function AdSlotInFeed({ className = "", pageEligible = false }: { className?: string; pageEligible?: boolean }) {
  const slotId = process.env.NEXT_PUBLIC_ADSENSE_SLOT_INFEED || "";
  if (!slotId) return null;
  return (
    <AdSlot
      slotId={slotId}
      format="fluid"
      layoutKey="-ef+6k-30-ac+ty"
      className={`my-4 ${className}`}
      style={{ minHeight: 180 }}
      pageEligible={pageEligible}
    />
  );
}
