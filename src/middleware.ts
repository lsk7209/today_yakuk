import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    // Admin PAGE or API protection
    if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
        // Exclude Login Paths
        if (pathname === "/admin/login" || pathname === "/api/admin/login") {
            return NextResponse.next();
        }

        // Check Auth Cookie
        const authCookie = request.cookies.get("admin_auth");
        const isAuthenticated = authCookie?.value === "authenticated";

        if (!isAuthenticated) {
            // Return 401 for API requests
            if (pathname.startsWith("/api/")) {
                return NextResponse.json(
                    { success: false, message: "Unauthorized" },
                    { status: 401 }
                );
            }
            // Redirect to Login for Page requests
            return NextResponse.redirect(new URL("/admin/login", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*", "/api/admin/:path*"],
};
