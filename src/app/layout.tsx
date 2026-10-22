import type { Metadata } from "next";
import localFont from "next/font/local";
import SiteHeader from "@/components/city-signal/site-header";
import SiteFooter from "@/components/city-signal/site-footer";
import Script from "next/script";
import { Suspense } from "react";
import "./globals.css";
import "./city-signal.css";
import { getSiteUrl } from "@/lib/site-url";
import AnalyticsTracker from "@/components/analytics/AnalyticsTracker";
import CoupangAffiliateBanner from "@/components/affiliate/CoupangAffiliateBanner";
import { JsonLd, buildWebSiteSchema, buildOrganizationSchema } from "@/components/seo/json-ld";
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
const isProductionRuntime = process.env.NODE_ENV === "production";
const adsenseId = isProductionRuntime ? getAdsenseClientId() : "";

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
const gaId = isProductionRuntime ? getGoogleAnalyticsMeasurementId() : "";

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
    "현재 영업 약국",
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
    description: "등록 영업시간 기준으로 문 연 약국을 찾고 전화와 길찾기를 한 번에 확인하세요.",
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        {isProductionRuntime ? (
          <>
            <link rel="preconnect" href="https://www.googletagmanager.com" />
            <link rel="preconnect" href="https://www.google-analytics.com" />
            <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
          </>
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
        {/* WebSite identity schema. SearchAction is intentionally omitted because this site has no matching server-side search URL. */}
        <JsonLd
          id="website-schema"
          data={buildWebSiteSchema({
            name: SITE_NAME,
            url: siteUrl,
            description: "등록 영업시간 기반 약국 검색 및 이용 안내 서비스",
          })}
        />
        {/* Organization Schema — EEAT 신호 */}
        <JsonLd
          id="org-schema"
          data={buildOrganizationSchema({
            name: SITE_NAME,
            url: siteUrl,
            logo: `${siteUrl}/og-image.svg`,
            description: "공공데이터 기반 약국 영업시간 검색 및 이용 가이드 서비스",
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
          <SiteHeader />
          <main id="main-content" className="flex-1">{children}</main>
          <CoupangAffiliateBanner />
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
