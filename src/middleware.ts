import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAdminToken } from "@/lib/jwt";

// 봇이 검색(?q=) 등 쿼리파라미터 URL을 대량 크롤하면 supplements/pharmacies LIKE
// 풀스캔으로 Turso reads가 폭주하므로, 봇의 쿼리스트링 요청을 Edge에서 403 차단.
// 정상 사용자는 통과한다.
const BOT_UA =
  /bot|crawl|spider|slurp|Googlebot|bingbot|Bytespider|GPTBot|ClaudeBot|PerplexityBot|OAI-SearchBot|YandexBot|Baiduspider|DuckDuckBot|Yeti|Daumoa/i;

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isAdmin =
    pathname.startsWith("/admin") || pathname.startsWith("/api/admin");

  // 봇의 쿼리파라미터(검색/필터) 요청 차단 — LIKE 풀스캔 폭주 방지.
  // admin 경로는 아래 인증이 별도 처리하므로 제외.
  if (!isAdmin && request.nextUrl.search) {
    const ua = request.headers.get("user-agent") || "";
    if (BOT_UA.test(ua)) {
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
