/**
 * 에러 핸들링 유틸리티
 */

export type ErrorContext = {
  operation: string;
  details?: Record<string, unknown>;
};

/**
 * 구조화된 에러 로깅
 */
export function logError(
  error: unknown,
  context: ErrorContext,
  options?: { silent?: boolean },
): void {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;

  const logData = {
    ...context,
    error: errorMessage,
    stack: errorStack,
    timestamp: new Date().toISOString(),
  };

  if (!options?.silent) {
    console.error(`[${context.operation}]`, logData);
  }

  // 프로덕션 환경에서는 에러 추적 서비스(Sentry 등)로 전송 가능
  // if (process.env.NODE_ENV === 'production') {
  //   Sentry.captureException(error, { extra: logData });
  // }
}

/**
 * Supabase 에러인지 확인
 */
export function isSupabaseError(error: unknown): error is { code?: string; message?: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    ("code" in error || "message" in error)
  );
}

/**
 * Supabase 테이블 누락 에러인지 확인
 */
export function isMissingTableError(error: unknown): boolean {
  return isSupabaseError(error) && error.code === "PGRST205";
}

/**
 * 사용자 친화적인 에러 메시지 생성
 */
export function getUserFriendlyErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) {
    // 개발 환경에서는 상세한 에러 메시지 제공
    if (process.env.NODE_ENV === "development") {
      return `${fallback}: ${error.message}`;
    }
  }

  if (isSupabaseError(error)) {
    if (isMissingTableError(error)) {
      return "데이터베이스 테이블이 아직 준비되지 않았습니다. 잠시 후 다시 시도해주세요.";
    }
    if (error.message) {
      return `${fallback}: ${error.message}`;
    }
  }

  return fallback;
}

