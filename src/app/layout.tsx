import type { Metadata } from "next";
import localFont from "next/font/local";
import Link from "next/link";
import Script from "next/script";
import { Suspense } from "react";
import "./globals.css";
import { getSiteUrl } from "@/lib/site-url";
import AnalyticsTracker from "@/components/analytics/AnalyticsTracker";
import { JsonLd, buildWebSiteSchema } from "@/components/seo/json-ld";
import {
  DEFAULT_OG_IMAGE_PATH,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
  getAdsenseClientId,
  getGoogleSiteVerifications,
  getGoogleAnalyticsMeasurementId,
  getNaverSiteVerification,
} from "@/lib/site-config";

const siteUrl = getSiteUrl();
const adsenseId = getAdsenseClientId();

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: "swap",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
});

const googleVerifications = getGoogleSiteVerifications();
const naverVerification = getNaverSiteVerification();
const gaId = getGoogleAnalyticsMeasurementId();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: SITE_NAME,
  title: {
    default: `${SITE_NAME} | ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    SITE_NAME,
    "근처약국",
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
    title: `${SITE_NAME} | ${SITE_TAGLINE}`,
    description: "지금 문 연 약국을 빠르게 찾고, 영업 시간과 위치를 한 번에 확인하세요.",
    url: siteUrl,
    siteName: SITE_NAME,
    locale: "ko_KR",
    type: "website",
    images: [
      {
        url: DEFAULT_OG_IMAGE_PATH,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} 대표 이미지`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE_PATH],
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
    google: googleVerifications,
    other: naverVerification ? { "naver-site-verification": naverVerification } : undefined,
  },
  other: {
    "google-adsense-account": adsenseId,
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
        <link
          rel="preconnect"
          href="https://cdn.jsdelivr.net"
          crossOrigin="anonymous"
        />
        {googleVerifications.map((verification) => (
          <meta key={verification} name="google-site-verification" content={verification} />
        ))}
        {naverVerification ? (
          <meta name="naver-site-verification" content={naverVerification} />
        ) : null}
        {adsenseId ? (
          <script
            id="google-adsense"
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
            crossOrigin="anonymous"
          />
        ) : null}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[var(--background)] text-[var(--foreground)]`}
      >
        {gaId ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}');
              `}
            </Script>
          </>
        ) : null}
        {/* WebSite Schema with SearchAction for sitelinks searchbox */}
        <JsonLd
          id="website-schema"
          data={buildWebSiteSchema({
            name: SITE_NAME,
            url: siteUrl,
            description: "실시간 영업 약국 검색 서비스",
            searchUrl: `${siteUrl}/wiki?q={search_term_string}`,
          })}
        />
        <Suspense fallback={null}>
          <AnalyticsTracker />
        </Suspense>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-brand-700 focus:px-4 focus:py-2 focus:text-white focus:text-sm focus:font-bold"
        >
          본문으로 바로가기
        </a>
        <div className="min-h-screen flex flex-col">
          <header className="border-b border-[var(--border)] bg-white/80 backdrop-blur">
            <div className="container flex items-center justify-between py-4">
              <Link href="/" className="flex items-center gap-2 hover:opacity-90">
                <div className="h-10 w-10 rounded-full bg-brand-100 border border-brand-200 flex items-center justify-center text-brand-700 font-semibold">
                  약
                </div>
                <div>
                  <p className="text-lg font-semibold">{SITE_NAME}</p>
                </div>
              </Link>
              <nav className="flex items-center gap-1 text-sm text-[var(--muted)] sm:gap-3">
                <Link href="/" className="inline-flex min-h-11 items-center px-1 hover:text-brand-700">
                  홈
                </Link>
                <Link href="/about" className="inline-flex min-h-11 items-center px-1 hover:text-brand-700">
                  소개
                </Link>
                <Link href="/guide" className="inline-flex min-h-11 items-center px-1 hover:text-brand-700">
                  가이드
                </Link>
                <Link href="/blog" className="inline-flex min-h-11 items-center px-1 hover:text-brand-700">
                  블로그
                </Link>
                <Link href="/wiki" className="relative inline-flex min-h-11 items-center px-1 font-medium text-brand-700 hover:text-brand-800">
                  영양제 정보
                  <span className="absolute -top-1 -right-2 h-1.5 w-1.5 rounded-full bg-red-500" aria-label="New"></span>
                </Link>
              </nav>
            </div>
          </header>
          <main id="main-content" className="flex-1">{children}</main>
          <footer className="border-t border-[var(--border)] bg-white">
            <div className="container py-6 text-sm text-[var(--muted)] flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p>© {new Date().getFullYear()} {SITE_NAME} TodayPharmacy</p>
              <div className="flex gap-4">
                <a className="hover:text-brand-700" href="/about">
                  소개
                </a>
                <a className="hover:text-brand-700" href="/contact">
                  문의
                </a>
                <a className="hover:text-brand-700" href="/terms">
                  이용약관
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
