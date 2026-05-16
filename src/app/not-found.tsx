import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "페이지를 찾을 수 없습니다",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="container py-24 text-center space-y-6">
      <p className="text-7xl font-black text-brand-200">404</p>
      <h1 className="text-2xl font-bold text-gray-900">페이지를 찾을 수 없습니다</h1>
      <p className="text-gray-500">
        요청하신 페이지가 삭제되었거나 주소가 변경되었습니다.
      </p>
      <div className="flex justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center rounded-full bg-brand-700 text-white px-6 py-3 text-sm font-bold hover:bg-brand-800 transition-colors"
        >
          홈으로 돌아가기
        </Link>
        <Link
          href="/blog"
          className="inline-flex items-center rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          블로그 보기
        </Link>
      </div>
    </div>
  );
}
