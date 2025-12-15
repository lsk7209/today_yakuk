"use client";

import { Phone, Navigation } from "lucide-react";
import Link from "next/link";

type StickyFabProps = {
  tel?: string | null;
  mapUrl: string;
};

export function StickyFab({ tel, mapUrl }: StickyFabProps) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex gap-3 sm:hidden">
      {tel && (
        <a
          href={`tel:${tel}`}
          className="flex items-center gap-2 bg-brand-600 text-white px-6 py-3 rounded-full shadow-lg font-semibold hover:bg-brand-700 transition-colors"
          aria-label="전화 걸기"
        >
          <Phone className="h-5 w-5" />
          <span>전화 걸기</span>
        </a>
      )}
      <Link
        href={mapUrl}
        target="_blank"
        className="flex items-center gap-2 bg-white text-brand-600 border-2 border-brand-600 px-6 py-3 rounded-full shadow-lg font-semibold hover:bg-brand-50 transition-colors"
        aria-label="길 찾기"
      >
        <Navigation className="h-5 w-5" />
        <span>길 찾기</span>
      </Link>
    </div>
  );
}

