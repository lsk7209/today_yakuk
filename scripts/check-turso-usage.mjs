import { pathToFileURL } from "node:url";

// Operational alert budget, not a claim about the account's subscription plan.
export function readConfig(env) {
  const readLimit = Number(env.TURSO_READ_LIMIT || 500_000_000);
  const warnPct = Number(env.TURSO_WARN_PCT || 80);
  if (!Number.isSafeInteger(readLimit) || readLimit <= 0 || !Number.isFinite(warnPct) || warnPct <= 0 || warnPct > 100) {
    throw new Error("Invalid Turso alert budget configuration.");
  }
  return { readLimit, warnPct, failOnWarn: env.FAIL_ON_TURSO_USAGE_WARN === "1" };
}

export function parseReads(body) {
  // Live responses use usage; the published API also documents total.
  // A present but invalid usage object must not fall back to another value.
  const database = body?.database;
  const reads = (database && Object.hasOwn(database, "usage") ? database.usage : database?.total)?.rows_read;
  if (typeof reads !== "number" || !Number.isSafeInteger(reads) || reads < 0) {
    throw new Error("Invalid Turso database usage: rows_read is missing or invalid.");
  }
  return reads;
}

export async function checkUsage({ env = process.env, fetchImpl = fetch, log = console } = {}) {
  const { readLimit, warnPct, failOnWarn } = readConfig(env);
  if (!env.TURSO_PLATFORM_TOKEN) {
    throw new Error("TURSO_PLATFORM_TOKEN is not set; usage is unknown.");
  }
  const api = async (path) => {
    let res;
    try {
      res = await fetchImpl(`https://api.turso.tech${path}`, {
        headers: { Authorization: `Bearer ${env.TURSO_PLATFORM_TOKEN}` },
        signal: AbortSignal.timeout(30_000),
      });
    } catch {
      throw new Error("Turso API request failed or timed out; usage is unknown.");
    }
    if (!res.ok) throw new Error(`Turso API returned HTTP ${res.status}; usage is unknown.`);
    try { return await res.json(); } catch { throw new Error("Invalid Turso API JSON; usage is unknown."); }
  };

  const body = await api("/v1/organizations/lsk7209/databases");
  const databases = body?.databases;
  if (!Array.isArray(databases) || databases.some(db => typeof db?.Name !== "string" || !db.Name.trim()) || new Set(databases.map(db => db.Name)).size !== databases.length) {
    throw new Error("Invalid Turso database list; usage is unknown.");
  }
  let totalReads = 0;
  const perDb = [];
  for (const db of databases) {
    const reads = parseReads(await api(`/v1/organizations/lsk7209/databases/${encodeURIComponent(db.Name)}/usage`));
    totalReads += reads;
    if (!Number.isSafeInteger(totalReads)) throw new Error("Turso total reads exceed safe integer range.");
    perDb.push([db.Name, reads]);
  }
  // Report totals only after every database has been successfully validated.
  perDb.sort((a, b) => b[1] - a[1]);
  const pct = (totalReads / readLimit) * 100;
  log.log(`Turso reads: ${totalReads.toLocaleString()} / alert budget ${readLimit.toLocaleString()} (${pct.toFixed(1)}%)`);
  log.log("Top 5:", perDb.slice(0, 5).map(([name, reads]) => `${name}=${reads.toLocaleString()}`).join(", "));
  if (pct >= warnPct) {
    log.warn(`::warning::Turso reads are at ${pct.toFixed(1)}% of the configured alert budget. Review high-usage sites.`);
    if (failOnWarn) throw new Error("Turso usage warning promoted to failure by FAIL_ON_TURSO_USAGE_WARN=1.");
  } else {
    log.log(`Usage is below warning threshold (${warnPct}%).`);
  }
  return { totalReads, perDb };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try { await checkUsage(); } catch (err) {
    console.error(`::error::${err.message}`);
    process.exitCode = 1;
  }
}
