import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAdminToken } from "@/lib/jwt";

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    // Admin PAGE or API protection
    if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
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
            { status: 401 }
        );
    }
    // Redirect to Login for Page requests
    return NextResponse.redirect(new URL("/admin/login", request.url));
}

export const config = {
    matcher: ["/admin/:path*", "/api/admin/:path*"],
};

