import { NextResponse } from "next/server";
import { signAdminToken } from "@/lib/jwt";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const attempts = new Map<string, { count: number; resetAt: number }>();

export async function POST(request: Request) {
    try {
        const clientId = getClientId(request);
        if (isRateLimited(clientId)) {
            return NextResponse.json(
                { success: false, message: "로그인 시도가 너무 많습니다. 잠시 후 다시 시도해 주세요." },
                { status: 429 }
            );
        }

        const body = await request.json();
        const { password } = body;

        // 환경변수 비밀번호 체크
        const adminPassword = process.env.ADMIN_PASSWORD;
        if (!adminPassword) {
            console.error("ADMIN_PASSWORD is not set in environment variables");
            return NextResponse.json(
                { success: false, message: "Server configuration error" },
                { status: 500 }
            );
        }

        if (password === adminPassword) {
            attempts.delete(clientId);
            // JWT 토큰 생성
            const token = await signAdminToken();

            const response = NextResponse.json({ success: true });

            // HttpOnly JWT 쿠키 설정
            response.cookies.set("admin_token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                path: "/",
                maxAge: 60 * 60 * 24, // 1일
            });

            return response;
        }

        recordFailedAttempt(clientId);
        return NextResponse.json(
            { success: false, message: "비밀번호가 일치하지 않습니다." },
            { status: 401 }
        );
    } catch {
        return NextResponse.json(
            { success: false, message: "처리 중 오류가 발생했습니다." },
            { status: 500 }
        );
    }
}

function getClientId(request: Request) {
    const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    const realIp = request.headers.get("x-real-ip")?.trim();
    return forwardedFor || realIp || "unknown";
}

function isRateLimited(clientId: string) {
    const now = Date.now();
    const current = attempts.get(clientId);
    if (!current) return false;
    if (current.resetAt <= now) {
        attempts.delete(clientId);
        return false;
    }
    return current.count >= MAX_ATTEMPTS;
}

function recordFailedAttempt(clientId: string) {
    const now = Date.now();
    const current = attempts.get(clientId);
    if (!current || current.resetAt <= now) {
        attempts.set(clientId, { count: 1, resetAt: now + WINDOW_MS });
        return;
    }
    attempts.set(clientId, { count: current.count + 1, resetAt: current.resetAt });
}
