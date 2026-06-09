import { createClient, type Client } from "@libsql/client";

let _client: Client | null = null;

export function getTursoClient(): Client {
  if (_client) return _client;

  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
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
