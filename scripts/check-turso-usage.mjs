/**
 * Turso org 전체 rows_read 사용량 점검 — 무료 한도 임박 시 경고.
 * 임계 초과하면 exit 1 → GitHub Actions 실패 → repo owner에게 자동 이메일 알림.
 * 실행: TURSO_PLATFORM_TOKEN=... node scripts/check-turso-usage.mjs
 */
const ORG = "lsk7209";
const READ_LIMIT = 500_000_000; // starter 무료 플랜 월 rows_read 한도
const WARN_PCT = 80; // 이 비율 도달 시 경고

const token = process.env.TURSO_PLATFORM_TOKEN;
if (!token) {
  console.error("TURSO_PLATFORM_TOKEN 환경변수가 필요합니다.");
  process.exit(2);
}

const headers = { Authorization: `Bearer ${token}` };
const api = async (path) => {
  const res = await fetch(`https://api.turso.tech${path}`, { headers });
  if (!res.ok) throw new Error(`${path} -> HTTP ${res.status}`);
  return res.json();
};

const { databases } = await api(`/v1/organizations/${ORG}/databases`);
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
    console.warn(`usage 조회 실패: ${db.Name} (${err.message})`);
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
    .map(([n, r]) => `${n}=${r.toLocaleString()}`)
    .join(", "),
);

if (pct >= WARN_PCT) {
  console.error(
    `::error::⚠️ Turso reads ${pct.toFixed(1)}% — 무료 한도(${READ_LIMIT / 1e6}M) 임박! 위 Top 사이트의 폭주 점검 필요.`,
  );
  process.exit(1);
}

console.log(`✅ 정상 (경고 임계 ${WARN_PCT}% 미만)`);
