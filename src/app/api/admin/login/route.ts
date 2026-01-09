import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { password } = body;

        // 하드코딩된 비밀번호 체크 (요청사항: 1234)
        if (password === "1234") {
            const response = NextResponse.json({ success: true });

            // HttpOnly 쿠키 설정
            response.cookies.set("admin_auth", "authenticated", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                path: "/",
                maxAge: 60 * 60 * 24, // 1일
            });

            return response;
        }

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
