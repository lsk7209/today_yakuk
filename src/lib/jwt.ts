import { SignJWT, jwtVerify, type JWTPayload } from "jose";

const getSecret = () => {
    const secret = process.env.JWT_SECRET || process.env.ADMIN_PASSWORD;
    if (!secret) {
        throw new Error("JWT_SECRET or ADMIN_PASSWORD must be set");
    }
    return new TextEncoder().encode(secret);
};

export interface AdminTokenPayload extends JWTPayload {
    role: "admin";
    iat: number;
    exp: number;
}

/**
 * JWT 토큰 생성 (1일 유효)
 */
export async function signAdminToken(): Promise<string> {
    const secret = getSecret();
    const token = await new SignJWT({ role: "admin" })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("24h")
        .sign(secret);
    return token;
}

/**
 * JWT 토큰 검증
 */
export async function verifyAdminToken(token: string): Promise<AdminTokenPayload | null> {
    try {
        const secret = getSecret();
        const { payload } = await jwtVerify(token, secret);

        if (payload.role !== "admin") {
            return null;
        }

        return payload as AdminTokenPayload;
    } catch (error) {
        // Token expired or invalid
        console.error("JWT verification failed:", error);
        return null;
    }
}
