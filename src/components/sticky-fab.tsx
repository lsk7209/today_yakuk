"use client";

import { Phone, Navigation } from "lucide-react";
import Link from "next/link";

type StickyFabProps = {
  tel?: string | null;
  mapUrl: string;
};

export function StickyFab({ tel, mapUrl }: StickyFabProps) {
  return (
    <div className="city-mobile-actions fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex gap-3 sm:hidden">
      {tel && (
        <a
          href={`tel:${tel}`}
          className="city-button city-button-dark whitespace-nowrap"
          aria-label="전화 걸기"
        >
          <Phone className="h-5 w-5 shrink-0" />
          <span>전화 걸기</span>
        </a>
      )}
      <Link
        href={mapUrl}
        target="_blank"
        className="city-button city-button-secondary whitespace-nowrap"
        aria-label="길 찾기"
      >
        <Navigation className="h-5 w-5 shrink-0" />
        <span>길 찾기</span>
      </Link>
    </div>
  );
}

