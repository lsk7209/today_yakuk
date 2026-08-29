import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAdminToken } from "@/lib/jwt";

// 봇이 검색(?q=) 등 쿼리파라미터 URL을 대량 크롤하면 supplements/pharmacies LIKE
// 풀스캔으로 Turso reads가 폭주한다. robots.txt에 공개한 검증된 페이지네이션과
// 위키 카테고리 상태만 통과시키고, 나머지 봇 쿼리는 Edge에서 403 차단한다.
const BOT_UA =
  /bot|crawl|spider|slurp|Googlebot|bingbot|Bytespider|GPTBot|ClaudeBot|PerplexityBot|OAI-SearchBot|YandexBot|Baiduspider|DuckDuckBot|Yeti|Daumoa/i;
const MAX_CRAWLER_PAGE = 10_000;
const SAFE_WIKI_CATEGORY = /^[a-z0-9-]{1,32}$/;

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
    return category === null || SAFE_WIKI_CATEGORY.test(category);
  }

  if (/^\/wiki\/tag\/[^/]+$/.test(url.pathname)) {
    return keys.length === 1 && keys[0] === "page";
  }

  return false;
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isAdmin =
    pathname.startsWith("/admin") || pathname.startsWith("/api/admin");

  // 검색/API 쿼리는 계속 차단하되, robots.txt가 허용한 검증된 탐색 상태는 통과시킨다.
  // admin 경로는 아래 인증이 별도 처리하므로 제외한다.
  if (!isAdmin && request.nextUrl.search) {
    const ua = request.headers.get("user-agent") || "";
    if (BOT_UA.test(ua) && !isSafeCrawlerQuery(request.nextUrl)) {
      return new NextResponse("Forbidden", { status: 403 });
    }
  }

  // Admin PAGE or API protection
  if (isAdmin) {
    // Exclude Login Paths
    if (pathname === "/admin/login" || pathname === "/api/admin/login") {
      return NextResponse.next();
    }

    // Check JWT Token from Cookie
    const token = request.cookies.get("admin_token")?.value;

    if (!token) {
      return handleUnauthorized(request, pathname);
    }

    // Verify JWT Token
    const payload = await verifyAdminToken(token);
    if (!payload) {
      // Token invalid or expired - clear cookie and redirect
      const response = handleUnauthorized(request, pathname);
      response.cookies.delete("admin_token");
      return response;
    }
  }

  return NextResponse.next();
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
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/api/wiki/:path*",
    "/api/nearby/:path*",
    "/wiki/:path*",
    "/blog/:path*",
  ],
};
