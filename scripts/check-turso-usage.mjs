/**
 * Checks organization-wide Turso rows_read usage and fails only when usage
 * exceeds the warning threshold. Missing or under-scoped platform tokens are
 * configuration gaps, so scheduled runs should report them without creating
 * repeated failure notifications.
 */
const ORG = "lsk7209";
const READ_LIMIT = 500_000_000;
const WARN_PCT = 80;

const token = process.env.TURSO_PLATFORM_TOKEN;
if (!token) {
  console.log("::notice::Skipping Turso usage monitor. TURSO_PLATFORM_TOKEN is not set.");
  process.exit(0);
}

const headers = { Authorization: `Bearer ${token}` };

const api = async (path) => {
  const res = await fetch(`https://api.turso.tech${path}`, { headers });
  if (!res.ok) {
    const error = new Error(`${path} -> HTTP ${res.status}`);
    error.status = res.status;
    throw error;
  }
  return res.json();
};

let databases = [];
try {
  ({ databases } = await api(`/v1/organizations/${ORG}/databases`));
} catch (err) {
  if (err.status === 401 || err.status === 403) {
    console.log(
      `::notice::Skipping Turso usage monitor. TURSO_PLATFORM_TOKEN cannot access org "${ORG}" (${err.message}).`,
    );
    process.exit(0);
  }
  throw err;
}

let totalReads = 0;
const perDb = [];

for (const db of databases) {
  try {
    const usage = await api(
      `/v1/organizations/${ORG}/databases/${db.Name}/usage`,
    );
    const reads = usage?.total?.rows_read ?? 0;
    totalReads += reads;
    perDb.push([db.Name, reads]);
  } catch (err) {
    console.warn(`usage lookup failed: ${db.Name} (${err.message})`);
  }
}

perDb.sort((a, b) => b[1] - a[1]);
const pct = (totalReads / READ_LIMIT) * 100;

console.log(
  `Turso reads: ${totalReads.toLocaleString()} / ${READ_LIMIT.toLocaleString()} (${pct.toFixed(1)}%)`,
);
console.log(
  "Top 5:",
  perDb
    .slice(0, 5)
    .map(([name, reads]) => `${name}=${reads.toLocaleString()}`)
    .join(", "),
);

if (pct >= WARN_PCT) {
  console.error(
    `::error::Turso reads are at ${pct.toFixed(1)}% of the free limit (${READ_LIMIT / 1e6}M). Review high-usage sites.`,
  );
  process.exit(1);
}

console.log(`Usage is below warning threshold (${WARN_PCT}%).`);
