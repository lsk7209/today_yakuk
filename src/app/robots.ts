import { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

const siteUrl = getSiteUrl();

// 봇이 쿼리파라미터 조합(?q=, ?page= 등)과 API를 무한 크롤하면
// Turso reads가 폭주하므로 차단 (정적 콘텐츠 경로는 그대로 허용)
const CRAWL_BLOCK = ["/admin", "/api/", "/wiki/tag/*?page=", "/*?"];
// /wiki?type=medicine(1페이지)는 noindex 지시를 읽을 수 있도록 수집을 허용한다.
// $로 정확히 일치할 때만 열어 두어 &page=N 조합의 대량 수집은 계속 막는다.
const CRAWL_ALLOW = ["/", "/*?page=", "/wiki?category=", "/wiki?type=medicine$"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "Bytespider",
        disallow: "/",
      },
      {
        userAgent: [
          "Yeti",
          "Daumoa",
          "GPTBot",
          "ClaudeBot",
          "PerplexityBot",
          "OAI-SearchBot",
          "Google-Extended",
          "anthropic-ai",
        ],
        allow: CRAWL_ALLOW,
        disallow: CRAWL_BLOCK,
      },
      {
        userAgent: "*",
        allow: CRAWL_ALLOW,
        disallow: CRAWL_BLOCK,
      },
    ],
    sitemap: [`${siteUrl}/sitemap.xml`],
  };
}
