import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@libsql/client";
import { isMigrationStaging } from "@/lib/migration-staging";

export const dynamic = "force-dynamic";

function localDatabasePath(url: string): string | null {
  if (!url.startsWith("file:")) return null;
  const filename = url.slice(5);
  if (!filename || filename === ":memory:") return null;
  if (filename.startsWith("//")) {
    try {
      const parsed = new URL(url);
      if (parsed.hostname) return null;
      return fileURLToPath(parsed);
    } catch { return null; }
  }
  return path.resolve(filename);
}

export async function checkReadiness(env?: { TURSO_DATABASE_URL?: string; TURSO_AUTH_TOKEN?: string; MIGRATION_STAGING?: string }): Promise<Response> {
  const config = env ?? {
    TURSO_DATABASE_URL: process.env.TURSO_DATABASE_URL,
    TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN,
    MIGRATION_STAGING: process.env.MIGRATION_STAGING,
  };
  const url = config.TURSO_DATABASE_URL?.trim();
  if (!url) return Response.json({ ok: false }, { status: 503 });

  const staging = isMigrationStaging(config);
  if (staging) {
    const filename = localDatabasePath(url);
    // Runtime fixture is copied explicitly by Dockerfile; do not trace arbitrary env paths.
    if (!filename || !existsSync(/* turbopackIgnore: true */ filename)) return Response.json({ ok: false }, { status: 503 });
  } else if (!config.TURSO_AUTH_TOKEN) {
    return Response.json({ ok: false }, { status: 503 });
  }

  let client;
  try {
    client = createClient({ url, ...(config.TURSO_AUTH_TOKEN ? { authToken: config.TURSO_AUTH_TOKEN } : {}) });
    for (const table of ["pharmacies", "supplements", "ingredients", "medicines", "content_queue"]) {
      await client.execute(`SELECT 1 FROM ${table} LIMIT 1`);
    }
    const sample = await client.execute("SELECT 1 FROM pharmacies LIMIT 1");
    if (sample.rows.length === 0) return Response.json({ ok: false }, { status: 503 });
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false }, { status: 503 });
  } finally {
    await client?.close();
  }
}

export async function GET() {
  return checkReadiness();
}
