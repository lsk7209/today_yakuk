import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAdminToken } from "@/lib/jwt";
import { isMigrationStaging, isStagingMutation } from "@/lib/migration-staging";

// 봇이 검색(?q=) 등 쿼리파라미터 URL을 대량 크롤하면 supplements/pharmacies LIKE
// 풀스캔으로 Turso reads가 폭주한다. robots.txt에 공개한 검증된 페이지네이션과
// 위키 카테고리 상태만 통과시키고, 나머지 봇 쿼리는 Edge에서 403 차단한다.
const BOT_UA =
  /bot|crawl|spider|slurp|Googlebot|bingbot|Bytespider|GPTBot|ClaudeBot|PerplexityBot|OAI-SearchBot|YandexBot|Baiduspider|DuckDuckBot|Yeti|Daumoa/i;
const MAX_CRAWLER_PAGE = 10_000;
const SAFE_WIKI_CATEGORIES = new Set([
  "all",
  "probiotics",
  "vitamin-c",
  "omega3",
  "eye",
  "fatigue",
  "immune",
  "bone",
]);

function isValidCrawlerPage(value: string | null) {
  if (!value || !/^[1-9]\d*$/.test(value)) return false;
  const page = Number(value);
  return Number.isSafeInteger(page) && page >= 1 && page <= MAX_CRAWLER_PAGE;
}

export function isSafeCrawlerQuery(url: URL) {
  const entries = Array.from(url.searchParams.entries());
  if (entries.length === 0) return true;

  const keys = entries.map(([key]) => key);
  if (new Set(keys).size !== keys.length) return false;

  const page = url.searchParams.get("page");
  if (page !== null && !isValidCrawlerPage(page)) return false;

  if (url.pathname === "/blog") {
    return keys.length === 1 && keys[0] === "page";
  }

  if (url.pathname === "/wiki") {
    if (!keys.every((key) => key === "category" || key === "page")) return false;
    const category = url.searchParams.get("category");
    return category === null || SAFE_WIKI_CATEGORIES.has(category);
  }

  return false;
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const staging = isMigrationStaging();
  const finish = (response: NextResponse) => {
    if (staging) response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    return response;
  };
  if (staging && isStagingMutation(request.method, pathname)) {
    return finish(NextResponse.json({ error: "Unavailable in staging" }, { status: 403 }));
  }
  const isAdmin =
    pathname.startsWith("/admin") || pathname.startsWith("/api/admin");

  if (staging && pathname !== "/" && pathname.endsWith("/")) {
    const url = new URL(request.url);
    url.pathname = pathname.replace(/\/+$/, "");
    return finish(NextResponse.redirect(url, 308));
  }

  // 검색/API 쿼리는 계속 차단하되, robots.txt가 허용한 검증된 탐색 상태는 통과시킨다.
  // admin 경로는 아래 인증이 별도 처리하므로 제외한다.
  const crawlerGuarded = ["/api/wiki", "/api/nearby", "/wiki", "/blog"]
    .some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  if (!isAdmin && crawlerGuarded && request.nextUrl.search) {
    const ua = request.headers.get("user-agent") || "";
    if (BOT_UA.test(ua) && !isSafeCrawlerQuery(request.nextUrl)) {
      return finish(new NextResponse("Forbidden", { status: 403 }));
    }
  }

  // Admin PAGE or API protection
  if (isAdmin) {
    // Exclude Login Paths
    if (pathname === "/admin/login" || pathname === "/api/admin/login") {
      return finish(NextResponse.next());
    }

    // Check JWT Token from Cookie
    const token = request.cookies.get("admin_token")?.value;

    if (!token) {
      return finish(handleUnauthorized(request, pathname));
    }

    // Verify JWT Token
    const payload = await verifyAdminToken(token);
    if (!payload) {
      // Token invalid or expired - clear cookie and redirect
      const response = handleUnauthorized(request, pathname);
      response.cookies.delete("admin_token");
      return finish(response);
    }
  }

  return finish(NextResponse.next());
}

function handleUnauthorized(request: NextRequest, pathname: string) {
  // Return 401 for API requests
  if (pathname.startsWith("/api/")) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }
  // Redirect to Login for Page requests
  return NextResponse.redirect(new URL("/admin/login", request.url));
}

export const config = {
  matcher: ["/:path*"],
};
