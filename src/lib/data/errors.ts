// 공개 페이지용 읽기 실패. "데이터 없음"(null/빈 결과)과 구분되며,
// 던져진 오류는 unstable_cache·ISR이 정상 결과로 캐시하지 않는다.
export class DataReadError extends Error {
  constructor(label: string, cause: unknown) {
    super(`${label}: ${cause instanceof Error ? cause.message : String(cause)}`);
    this.name = "DataReadError";
    this.cause = cause;
  }
}

export function isDataReadError(error: unknown): error is DataReadError {
  return error instanceof DataReadError;
}
