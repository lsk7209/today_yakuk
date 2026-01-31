import { NextResponse } from "next/server";

interface ApiSuccessResponse<T = unknown> {
    success: true;
    data: T;
    message?: string;
}

interface ApiErrorResponse {
    success: false;
    message: string;
    code?: string;
}

type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * 성공 응답 생성
 */
export function successResponse<T>(data: T, message?: string, status = 200) {
    const body: ApiSuccessResponse<T> = {
        success: true,
        data,
        ...(message && { message }),
    };
    return NextResponse.json(body, { status });
}

/**
 * 에러 응답 생성
 */
export function errorResponse(
    message: string,
    status = 500,
    code?: string
) {
    const body: ApiErrorResponse = {
        success: false,
        message,
        ...(code && { code }),
    };
    return NextResponse.json(body, { status });
}

/**
 * 일반적인 에러 응답들
 */
export const ApiErrors = {
    badRequest: (message = "잘못된 요청입니다.") => errorResponse(message, 400, "BAD_REQUEST"),
    unauthorized: (message = "인증이 필요합니다.") => errorResponse(message, 401, "UNAUTHORIZED"),
    forbidden: (message = "접근 권한이 없습니다.") => errorResponse(message, 403, "FORBIDDEN"),
    notFound: (message = "리소스를 찾을 수 없습니다.") => errorResponse(message, 404, "NOT_FOUND"),
    serverError: (message = "서버 오류가 발생했습니다.") => errorResponse(message, 500, "SERVER_ERROR"),
};

export type { ApiResponse, ApiSuccessResponse, ApiErrorResponse };
