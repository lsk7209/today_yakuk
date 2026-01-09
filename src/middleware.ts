import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    // Admin 경로 보호
    if (request.nextUrl.pathname.startsWith("/admin")) {
        // 로그인 페이지는 제외
        if (request.nextUrl.pathname === "/admin/login") {
            return NextResponse.next();
        }

        // 쿠키 확인 (간단한 인증)
        const authCookie = request.cookies.get("admin_auth");

        // 쿠키가 없거나 값이 올바르지 않으면 로그인 페이지로 리다이렉트
        // (보안 강화 시 JWT 검증 등으로 교체 가능)
        if (!authCookie || authCookie.value !== "authenticated") {
            const loginUrl = new URL("/admin/login", request.url);
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*"],
};
