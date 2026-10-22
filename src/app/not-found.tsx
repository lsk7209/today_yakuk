import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "페이지를 찾을 수 없습니다",
  alternates: { canonical: null },
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default function NotFound() {
  return (
    <div className="city-page py-24 space-y-6">
      <p className="city-eyebrow">404 / LOST YOUR WAY?</p>
      <p className="city-empty-art" aria-hidden="true">404.</p>
      <h1 className="city-display-medium">페이지를 찾을 수 없습니다</h1>
      <p className="text-gray-500">
        요청하신 페이지가 삭제되었거나 주소가 변경되었습니다.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/"
          className="city-button"
        >
          홈으로 돌아가기
        </Link>
        <Link
          href="/blog"
          className="city-button city-button-secondary"
        >
          블로그 보기
        </Link>
      </div>
    </div>
  );
}
