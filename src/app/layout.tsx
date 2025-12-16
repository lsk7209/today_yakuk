import type { Metadata } from "next";
import Script from "next/script";
import localFont from "next/font/local";
import Link from "next/link";
import "./globals.css";
import { getSiteUrl } from "@/lib/site-url";

const siteUrl = getSiteUrl();

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION;
const naverVerification = process.env.NEXT_PUBLIC_NAVER_VERIFICATION;
const gaId = process.env.NEXT_PUBLIC_GA_ID || "";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "오늘약국 | 실시간 영업 약국 검색",
    template: "%s | 오늘약국",
  },
  // Naver는 description이 너무 길면 잘릴 수 있어 80자 내로 유지 (상세 맥락은 본문/구조화 데이터로 보완)
  description: "지금 문 연 약국을 빠르게 찾고 영업시간·위치를 확인하세요.",
  keywords: [
    "오늘약국",
    "실시간 약국",
    "영업 약국 찾기",
    "야간 약국",
    "주말 약국",
    "24시 약국",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "오늘약국 | 실시간 영업 약국 검색",
    description:
      "지금 문 연 약국을 빠르게 찾고, 영업 시간과 위치를 한 번에 확인하세요.",
    url: siteUrl,
    siteName: "오늘약국",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "오늘약국 | 실시간 영업 약국 검색",
    description: "지금 문 연 약국을 빠르게 찾고 영업시간·위치를 확인하세요.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  verification: {
    google: googleVerification,
    other: naverVerification ? { "naver-site-verification": naverVerification } : undefined,
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        {gaId ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}');
              `}
            </Script>
          </>
        ) : null}
        <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3050601904412736"
          strategy="afterInteractive"
          crossOrigin="anonymous"
          async
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[var(--background)] text-[var(--foreground)]`}
      >
        <div className="min-h-screen flex flex-col">
          <header className="border-b border-[var(--border)] bg-white/80 backdrop-blur">
            <div className="container flex items-center justify-between py-4">
              <Link href="/" className="flex items-center gap-2 hover:opacity-90">
                <div className="h-10 w-10 rounded-full bg-brand-100 border border-brand-200 flex items-center justify-center text-brand-700 font-semibold">
                  약
                </div>
                <div>
                  <p className="text-lg font-semibold">오늘약국</p>
                </div>
              </Link>
              <nav className="flex items-center gap-4 text-sm text-[var(--muted)]">
                <Link href="/" className="hover:text-brand-700">
                  홈
                </Link>
                <Link href="/about" className="hover:text-brand-700">
                  소개
                </Link>
              <Link href="/guide" className="hover:text-brand-700">
                가이드
              </Link>
              <Link href="/blog" className="hover:text-brand-700">
                블로그
              </Link>
              </nav>
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="border-t border-[var(--border)] bg-white">
            <div className="container py-6 text-sm text-[var(--muted)] flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p>© {new Date().getFullYear()} 오늘약국 TodayPharmacy</p>
              <div className="flex gap-4">
                <a className="hover:text-brand-700" href="/about">
                  소개
                </a>
                <a className="hover:text-brand-700" href="/contact">
                  문의
                </a>
                <a className="hover:text-brand-700" href="/privacy">
                  개인정보 처리방침
                </a>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
