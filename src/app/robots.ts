import { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

const siteUrl = getSiteUrl();

// 봇이 쿼리파라미터 조합(?q=, ?page= 등)과 API를 무한 크롤하면
// Turso reads가 폭주하므로 차단 (정적 콘텐츠 경로는 그대로 허용)
const CRAWL_BLOCK = ["/admin", "/api/", "/*?"];

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
        allow: "/",
        disallow: CRAWL_BLOCK,
      },
      {
        userAgent: "*",
        allow: "/",
        disallow: CRAWL_BLOCK,
      },
    ],
    sitemap: [`${siteUrl}/sitemap.xml`],
    host: siteUrl,
  };
}
