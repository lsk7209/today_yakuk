"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { canRequestAds, isAdsenseServingEnabled } from "@/lib/ad-policy";

export function AdsenseScript({ clientId, pageEligible = false }: { clientId: string; pageEligible?: boolean }) {
  const pathname = usePathname() ?? "/";
  if (!clientId || !isAdsenseServingEnabled() || !canRequestAds(pathname, pageEligible)) return null;

  return (
    <Script
      id="google-adsense"
      async
      strategy="afterInteractive"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
      crossOrigin="anonymous"
    />
  );
}
