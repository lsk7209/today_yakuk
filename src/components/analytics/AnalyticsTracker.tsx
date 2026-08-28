"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  normalizeAnalyticsReferrer,
  trackAnalyticsEvent,
} from "@/lib/client-analytics";

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const lastDetailPath = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname) return;
    if (process.env.NODE_ENV === "production") {
      fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page: pathname,
          referrer: normalizeAnalyticsReferrer(document.referrer),
        }),
      }).catch(() => {});
    }

    if (lastDetailPath.current === pathname) return;
    lastDetailPath.current = pathname;

    if (pathname.startsWith("/pharmacy/")) {
      const context = document.querySelector<HTMLElement>("[data-pharmacy-id]");
      const pharmacyId = context?.dataset.pharmacyId || pathname.split("/").filter(Boolean).at(-1);
      if (pharmacyId) {
        trackAnalyticsEvent("pharmacy_detail_view", {
          pharmacy_id: pharmacyId,
          source_surface: "pharmacy_detail",
          opening_status: context?.dataset.openingStatus,
        });
      }
    }
  }, [pathname]);

  useEffect(() => {
    function handleActionClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest<HTMLAnchorElement>("a[href]");
      if (!anchor) return;

      if (anchor.dataset.analyticsEvent === "content_to_nearby_click") {
        trackAnalyticsEvent("content_to_nearby_click", {
          source_surface: anchor.dataset.sourceSurface,
          cta_placement: anchor.dataset.ctaPlacement,
        });
        return;
      }

      const context = anchor.closest<HTMLElement>("[data-pharmacy-id]");
      const pharmacyId = anchor.dataset.pharmacyId || context?.dataset.pharmacyId;
      if (!pharmacyId) return;

      const href = anchor.getAttribute("href") || "";
      const sourceSurface = anchor.dataset.sourceSurface || context?.dataset.sourceSurface || "unknown";
      const openingStatus = anchor.dataset.openingStatus || context?.dataset.openingStatus;
      const rankText = anchor.dataset.resultRank || context?.dataset.resultRank;
      const resultRank = rankText ? Number.parseInt(rankText, 10) : undefined;

      if (href.startsWith("tel:")) {
        trackAnalyticsEvent("pharmacy_contact_intent", {
          pharmacy_id: pharmacyId,
          source_surface: sourceSurface,
          opening_status: openingStatus,
          result_rank: resultRank,
        });
        return;
      }

      if (href.includes("map.naver.com") || href.includes("map.kakao.com")) {
        trackAnalyticsEvent("pharmacy_directions_intent", {
          pharmacy_id: pharmacyId,
          source_surface: sourceSurface,
          opening_status: openingStatus,
          result_rank: resultRank,
          map_provider: href.includes("map.kakao.com") ? "kakao" : "naver",
        });
      }
    }

    document.addEventListener("click", handleActionClick, true);
    document.documentElement.dataset.analyticsReady = "true";
    return () => {
      document.removeEventListener("click", handleActionClick, true);
      delete document.documentElement.dataset.analyticsReady;
    };
  }, []);

  return null;
}
