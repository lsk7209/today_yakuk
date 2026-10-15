import { createClient, type Client } from "@libsql/client";

let _client: Client | null = null;

export function getTursoClient(): Client {
  if (_client) return _client;

  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    // 운영 런타임에서 더미 클라이언트를 쓰면 빈 결과가 정상 응답(404·빈 사이트맵)으로 캐시된다.
    if (process.env.NODE_ENV === "production" && process.env.NEXT_PHASE !== "phase-production-build") {
      throw new Error("TURSO_DATABASE_URL and TURSO_AUTH_TOKEN are required at production runtime.");
    }
    console.warn("Turso 환경 변수가 설정되지 않았습니다. 더미 클라이언트를 반환합니다.");
    return {
      execute: async () => ({ rows: [], columns: [], rowsAffected: 0, lastInsertRowid: undefined }),
      batch: async () => [],
      transaction: async () => ({
        execute: async () => ({ rows: [], columns: [], rowsAffected: 0, lastInsertRowid: undefined }),
        commit: async () => {},
        rollback: async () => {},
      }),
      close: () => {},
    } as unknown as Client;
  }

  _client = createClient({ url, authToken });
  return _client;
}

// 테스트에서 DB 대상을 바꿔 장애·복구를 재현할 때만 사용한다.
export function resetTursoClientForTest() {
  _client = null;
}

export function getRequiredTursoClient(): Client {
  if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
    throw new Error("TURSO_DATABASE_URL and TURSO_AUTH_TOKEN are required for database jobs.");
  }

  return getTursoClient();
}

export function assertExpectedRowsAffected(
  results: Array<{ rowsAffected: number }>,
  expected: number,
  operation: string,
) {
  const actual = results.reduce((sum, result) => sum + result.rowsAffected, 0);
  if (actual !== expected) {
    throw new Error(`${operation} affected ${actual} row(s); expected ${expected}.`);
  }
}

/** JSON 텍스트 필드를 파싱, 실패 시 fallback 반환 */
export function parseJson<T>(value: unknown, fallback: T): T {
  if (value == null) return fallback;
  if (typeof value !== "string") return value as T;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}
