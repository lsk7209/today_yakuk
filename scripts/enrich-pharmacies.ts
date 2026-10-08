import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import type { Client, InStatement, ResultSet } from "@libsql/client";
import { getRequiredTursoClient, parseJson } from "../src/lib/turso";
import { PHARMACY_INDEXABLE_PREDICATE } from "../src/lib/pharmacy-indexability";
import {
  buildPharmacyIntelligenceReport,
  type RawExternalPlaceData,
} from "../src/lib/pharmacy-intelligence";
import type { Pharmacy } from "../src/types/pharmacy";

const MOBILE_USER_AGENTS = [
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (Linux; Android 14; SM-S928N Build/UP1A.231005.007) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.6478.122 Mobile Safari/537.36",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 16_7_8 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.165 Mobile Safari/537.36",
  "Mozilla/5.0 (Linux; Android 13; SM-A546S) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/25.0 Chrome/121.0.0.0 Mobile Safari/537.36",
];

const ALL_PROVINCES = [
  "서울특별시",
  "경기",
  "부산광역시",
  "대구광역시",
  "인천광역시",
  "광주광역시",
  "대전광역시",
  "울산광역시",
  "세종특별자치시",
  "강원특별자치도",
  "충청북도",
  "충청남도",
  "전라북도",
  "전라남도",
  "경상북도",
  "경상남도",
  "제주특별자치도",
];

export class CircuitBreakerError extends Error {
  public readonly statusCode?: number;
  public readonly reason: string;

  constructor(reason: string, statusCode?: number) {
    super(`[CircuitBreaker] ${reason}`);
    this.name = "CircuitBreakerError";
    this.reason = reason;
    this.statusCode = statusCode;
  }
}

export function pickRandomMobileUserAgent(randomFn: () => number = Math.random): string {
  const index = Math.floor(randomFn() * MOBILE_USER_AGENTS.length);
  return MOBILE_USER_AGENTS[index] ?? MOBILE_USER_AGENTS[0]!;
}

export function computeJitterDelayMs(
  minMs = 1500,
  maxMs = 3200,
  randomFn: () => number = Math.random,
): number {
  return Math.floor(minMs + randomFn() * (maxMs - minMs));
}

export async function sleepWithJitter(minMs = 1500, maxMs = 3200): Promise<number> {
  const ms = computeJitterDelayMs(minMs, maxMs);
  await new Promise((resolve) => setTimeout(resolve, ms));
  return ms;
}

export async function withDbRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  baseDelayMs = 400,
): Promise<T> {
  let attempt = 0;
  let lastError: unknown;
  while (attempt <= maxRetries) {
    try {
      return await operation();
    } catch (err) {
      lastError = err;
      if (attempt === maxRetries) break;
      const backoff = baseDelayMs * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, backoff));
      attempt += 1;
    }
  }
  throw lastError;
}

export function detectSecurityChallenge(status: number, html: string): CircuitBreakerError | null {
  if (status === 403 || status === 429) {
    return new CircuitBreakerError(`HTTP ${status} 차단 응답 감지`, status);
  }
  const lower = html.toLowerCase();
  const isShortChallengePage = html.length < 50000 && lower.includes("ncaptcha");
  if (
    isShortChallengePage ||
    lower.includes('id="captcha_form"') ||
    html.includes("보안 확인을 완료해 주세요") ||
    html.includes("비정상적인 접근이 감지") ||
    html.includes("자동화된 요청으로 감지")
  ) {
    return new CircuitBreakerError("보안 확인(CAPTCHA) 페이지 감지", status);
  }
  return null;
}

export async function fetchWithAntiBan(
  url: string,
  options: {
    timeoutMs?: number;
    maxRetries?: number;
    fetchImpl?: typeof fetch;
  } = {},
): Promise<string> {
  const timeoutMs = options.timeoutMs ?? 15000;
  const maxRetries = options.maxRetries ?? 2;
  const fetchFn = options.fetchImpl ?? fetch;

  let attempt = 0;
  let lastError: unknown;

  while (attempt <= maxRetries) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetchFn(url, {
        headers: {
          "User-Agent": pickRandomMobileUserAgent(),
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
          "Cache-Control": "no-cache",
        },
        signal: controller.signal,
      });

      const text = await response.text();
      const breaker = detectSecurityChallenge(response.status, text);
      if (breaker) {
        throw breaker;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} on ${url}`);
      }

      return text;
    } catch (err) {
      if (err instanceof CircuitBreakerError) {
        throw err;
      }
      lastError = err;
      if (attempt === maxRetries) break;
      await sleepWithJitter(1500, 2800);
      attempt += 1;
    } finally {
      clearTimeout(timer);
    }
  }

  throw lastError;
}

function normalizeNameForMatch(name: string): string {
  return name.replace(/\s+/g, "").replace(/[()[\]·.-]/g, "").trim();
}

function extractJsonAfterMarker(html: string, marker: string): Record<string, unknown> | null {
  const startIdx = html.indexOf(marker);
  if (startIdx === -1) return null;
  const openBraceIdx = html.indexOf("{", startIdx + marker.length);
  if (openBraceIdx === -1) return null;

  let depth = 0;
  let inString = false;
  let isEscaped = false;

  for (let i = openBraceIdx; i < html.length; i += 1) {
    const ch = html[i]!;
    if (inString) {
      if (isEscaped) {
        isEscaped = false;
      } else if (ch === "\\") {
        isEscaped = true;
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }

    if (ch === '"') {
      inString = true;
    } else if (ch === "{") {
      depth += 1;
    } else if (ch === "}") {
      depth -= 1;
      if (depth === 0) {
        const rawJson = html.slice(openBraceIdx, i + 1);
        try {
          return JSON.parse(rawJson) as Record<string, unknown>;
        } catch {
          return null;
        }
      }
    }
  }
  return null;
}

function extractApolloJsonFromSearch(html: string): Record<string, unknown> | null {
  return (
    extractJsonAfterMarker(html, "naver.search.ext.loc.salt.__APOLLO_STATE__ =") ??
    extractJsonAfterMarker(html, "__APOLLO_STATE__ =")
  );
}

function extractApolloJsonFromPlaceDetail(html: string): Record<string, unknown> | null {
  return extractJsonAfterMarker(html, "window.__APOLLO_STATE__ =");
}

function extractDirectPlaceIdFromSearchHtml(html: string): string | null {
  const patterns = [
    /place\.naver\.com\/pharmacy\/(\d{6,13})/,
    /m\.place\.naver\.com\/pharmacy\/(\d{6,13})/,
    /place\.naver\.com\/place\/(\d{6,13})/,
    /m\.place\.naver\.com\/place\/(\d{6,13})/,
    /"PlaceListBusinessesItem:(\d{6,13})"/,
    /"PlaceSummary:(\d{6,13})"/,
  ];
  for (const regex of patterns) {
    const match = html.match(regex);
    if (match?.[1]) return match[1];
  }
  return null;
}

function parseReviewCount(val: unknown): number {
  if (typeof val === "number" && Number.isFinite(val)) return val;
  if (typeof val === "string") {
    const cleaned = val.replace(/[^0-9]/g, "");
    return cleaned ? Number(cleaned) : 0;
  }
  return 0;
}

const DOMAIN_SPECIALTY_KEYWORDS: Array<{ pattern: RegExp; tag: string }> = [
  { pattern: /동물약국|동물의약품|심장사상충/, tag: "동물의약품 취급" },
  { pattern: /온누리상품권|지역화폐|제로페이/, tag: "지역화폐·상품권" },
  { pattern: /소아과|어린이|시럽/, tag: "소아 처방 조제" },
  { pattern: /영양제|비타민|유산균|건강기능식품/, tag: "맞춤 영양제 상담" },
  { pattern: /안과|점안액|인공눈물/, tag: "안과·외용제 처방" },
  { pattern: /피부과|연고/, tag: "피부과 처방 조제" },
];

function asArray<T>(val: unknown): T[] {
  return Array.isArray(val) ? (val as T[]) : [];
}

export function parseExternalPlaceFromStates(
  pharmacy: Pharmacy,
  searchState: Record<string, unknown> | null,
  detailState?: Record<string, unknown> | null,
  fallbackPlaceId?: string | null,
): RawExternalPlaceData {
  const targetNorm = normalizeNameForMatch(pharmacy.name);
  const candidates: Array<Record<string, unknown>> = [];

  if (searchState) {
    for (const [key, value] of Object.entries(searchState)) {
      if (
        (key.startsWith("PlaceListBusinessesItem:") || key.startsWith("PlaceSummary:")) &&
        value &&
        typeof value === "object"
      ) {
        candidates.push(value as Record<string, unknown>);
      }
    }
  }

  const matchedItem =
    candidates.find((c) => {
      const n = typeof c.normalizedName === "string" ? normalizeNameForMatch(c.normalizedName) : "";
      const name = typeof c.name === "string" ? normalizeNameForMatch(c.name) : "";
      return n === targetNorm || name === targetNorm || (n && (n.includes(targetNorm) || targetNorm.includes(n)));
    }) ?? candidates[0];

  const placeId =
    (typeof matchedItem?.id === "string" ? matchedItem.id : undefined) ??
    (fallbackPlaceId || undefined);

  if (!placeId) {
    return { matched: false };
  }

  let visitorReviewCount = parseReviewCount(matchedItem?.visitorReviewCount);
  let blogReviewCount = parseReviewCount(matchedItem?.blogCafeReviewCount);
  const hasNPay = Boolean(matchedItem?.hasNPay);
  const hasWheelchairEntrance = Boolean(matchedItem?.hasWheelchairEntrance);

  let votedUserCount = 0;
  const votedKeywords: Array<{ label: string; count: number }> = [];
  const busStops: NonNullable<RawExternalPlaceData["busStops"]> = [];
  const facilities: string[] = [];
  let parkingInfo: string | null = null;
  let regularClosedDays: string | null = null;
  const specialtySet = new Set<string>();

  if (detailState) {
    const detailBase = detailState[`PlaceDetailBase:${placeId}`] as
      | {
          visitorReviewsTotal?: number | string;
          conveniences?: unknown;
        }
      | undefined;
    if (visitorReviewCount === 0 && detailBase?.visitorReviewsTotal != null) {
      visitorReviewCount = parseReviewCount(detailBase.visitorReviewsTotal);
    }

    // 1. Voted Keywords
    const statsObj = detailState[`VisitorReviewStatsResult:${placeId}`] as
      | {
          analysis?: {
            votedKeyword?: {
              userCount?: number;
              details?: unknown;
            };
          };
          visitorReviewsTotal?: number;
        }
      | undefined;

    if (visitorReviewCount === 0 && typeof statsObj?.visitorReviewsTotal === "number") {
      visitorReviewCount = statsObj.visitorReviewsTotal;
    }

    const vk = statsObj?.analysis?.votedKeyword;
    if (vk) {
      votedUserCount = typeof vk.userCount === "number" ? vk.userCount : 0;
      for (const d of asArray<{ displayName?: string; count?: number }>(vk.details)) {
        if (typeof d?.displayName === "string" && typeof d?.count === "number" && d.count > 0) {
          votedKeywords.push({ label: d.displayName, count: d.count });
        }
      }
    }

function collectInnerRouteNames(
  node: unknown,
  detailState: Record<string, unknown>,
  out: string[],
  visited = new Set<unknown>(),
): void {
  if (!node || typeof node !== "object" || visited.has(node)) return;
  visited.add(node);

  if (Array.isArray(node)) {
    for (const item of node) {
      collectInnerRouteNames(item, detailState, out, visited);
    }
    return;
  }

  const obj = node as Record<string, unknown>;
  if (typeof obj.__ref === "string") {
    const refTarget = detailState[obj.__ref];
    if (obj.__ref.startsWith("InnerRoute:") && refTarget && typeof refTarget === "object") {
      const rName = (refTarget as { name?: unknown }).name;
      if (typeof rName === "string" && rName.trim() && !out.includes(rName.trim())) {
        out.push(rName.trim());
      }
      return;
    }
    if (refTarget) {
      collectInnerRouteNames(refTarget, detailState, out, visited);
    }
  }

  if (typeof obj.name === "string" && obj.__typename === "InnerRoute") {
    if (!out.includes(obj.name.trim())) {
      out.push(obj.name.trim());
    }
  }

  for (const val of Object.values(obj)) {
    if (val && typeof val === "object") {
      collectInnerRouteNames(val, detailState, out, visited);
    }
  }
}

    // 2. Bus Stations & Routes (Evergreen Transit Info)
    for (const [key, val] of Object.entries(detailState)) {
      if (key.startsWith("BusStation:") && val && typeof val === "object") {
        const station = val as {
          name?: string;
          displayCode?: string | null;
          walkTime?: number;
          walkingDistance?: number;
          innerRoutes?: unknown;
        };
        if (typeof station.name === "string" && typeof station.walkTime === "number") {
          const routeNames: string[] = [];
          collectInnerRouteNames(station.innerRoutes, detailState, routeNames);
          busStops.push({
            name: station.name,
            code: station.displayCode ?? null,
            walkMinutes: station.walkTime,
            walkMeters:
              typeof station.walkingDistance === "number"
                ? station.walkingDistance
                : station.walkTime * 65,
            routes: routeNames.slice(0, 8),
          });
        }
      }
    }

    // 3. Regular closed days & facilities (Strictly exclude ephemeral holiday notices or images)
    for (const conv of asArray<string>(detailBase?.conveniences)) {
      if (typeof conv === "string" && conv.trim()) {
        facilities.push(conv.trim());
      }
    }

    const rootQuery = detailState.ROOT_QUERY as Record<string, unknown> | undefined;
    if (rootQuery && typeof rootQuery === "object") {
      for (const [rqKey, rqVal] of Object.entries(rootQuery)) {
        if (rqKey.startsWith("pharmacy(") && rqVal && typeof rqVal === "object") {
          const pData = rqVal as {
            newBusinessHours?: unknown;
            informationTab?: {
              parkingInfo?: { description?: string | null } | null;
              keywordList?: unknown;
            };
            fsasReviews?: {
              total?: number;
            };
          };
          if (blogReviewCount === 0 && typeof pData.fsasReviews?.total === "number") {
            blogReviewCount = pData.fsasReviews.total;
          }
          const hoursArr = asArray<{ comingRegularClosedDays?: string | null }>(pData.newBusinessHours);
          const rawClosed = hoursArr[0]?.comingRegularClosedDays;
          if (typeof rawClosed === "string" && rawClosed.includes("매주")) {
            regularClosedDays = rawClosed.trim();
          }
          const pDesc = pData.informationTab?.parkingInfo?.description;
          if (typeof pDesc === "string" && pDesc.trim()) {
            parkingInfo = pDesc.trim();
          }
          for (const kw of asArray<string>(pData.informationTab?.keywordList)) {
            if (typeof kw === "string") {
              for (const rule of DOMAIN_SPECIALTY_KEYWORDS) {
                if (rule.pattern.test(kw)) specialtySet.add(rule.tag);
              }
            }
          }
        }
      }
    }

    // 4. Extract domain specialty tags from text snippets without storing raw review text or any images
    for (const [key, val] of Object.entries(detailState)) {
      if (key.startsWith("FsasReview:") && val && typeof val === "object") {
        const rev = val as { title?: string; contents?: string };
        const text = `${rev.title ?? ""} ${rev.contents ?? ""}`;
        for (const rule of DOMAIN_SPECIALTY_KEYWORDS) {
          if (rule.pattern.test(text)) {
            specialtySet.add(rule.tag);
          }
        }
      }
    }
  }

  return {
    matched: true,
    placeId,
    visitorReviewCount,
    blogReviewCount,
    votedUserCount,
    votedKeywords,
    busStops: busStops.sort((a, b) => a.walkMinutes - b.walkMinutes).slice(0, 4),
    facilities,
    parkingInfo,
    hasNPay,
    hasWheelchairEntrance,
    regularClosedDays,
    specialtyKeywords: Array.from(specialtySet),
  };
}

export async function fetchExternalPlaceData(pharmacy: Pharmacy): Promise<RawExternalPlaceData> {
  const query = [pharmacy.province, pharmacy.city, pharmacy.name].filter(Boolean).join(" ");
  const searchUrl = `https://m.search.naver.com/search.naver?query=${encodeURIComponent(query)}`;
  const searchHtml = await fetchWithAntiBan(searchUrl);
  const searchState = extractApolloJsonFromSearch(searchHtml);
  const directPlaceId = extractDirectPlaceIdFromSearchHtml(searchHtml);

  const initial = parseExternalPlaceFromStates(pharmacy, searchState, null, directPlaceId);
  if (!initial.matched || !initial.placeId) {
    return { matched: false };
  }

  await sleepWithJitter(1500, 3200);

  const detailUrl = `https://m.place.naver.com/pharmacy/${initial.placeId}/home`;
  const detailHtml = await fetchWithAntiBan(detailUrl);
  const detailState = extractApolloJsonFromPlaceDetail(detailHtml);

  return parseExternalPlaceFromStates(pharmacy, searchState, detailState, initial.placeId);
}

export type CategoryStatRow = {
  province: string;
  total: number;
  enriched: number;
  skipped: number;
  pending: number;
};

export async function getEnrichmentStats(db: Client): Promise<CategoryStatRow[]> {
  const res = await withDbRetry(() =>
    db.execute(`
      SELECT
        COALESCE(province, '기타') AS province,
        COUNT(*) AS total,
        SUM(CASE WHEN enriched_at IS NOT NULL THEN 1 ELSE 0 END) AS enriched,
        SUM(CASE WHEN enriched_at IS NULL AND skipped_at IS NOT NULL THEN 1 ELSE 0 END) AS skipped,
        SUM(CASE WHEN enriched_at IS NULL AND skipped_at IS NULL THEN 1 ELSE 0 END) AS pending
      FROM pharmacies
      WHERE ${PHARMACY_INDEXABLE_PREDICATE}
      GROUP BY COALESCE(province, '기타')
      ORDER BY total DESC, province ASC
    `),
  );

  return res.rows.map((r) => ({
    province: String(r.province),
    total: Number(r.total ?? 0),
    enriched: Number(r.enriched ?? 0),
    skipped: Number(r.skipped ?? 0),
    pending: Number(r.pending ?? 0),
  }));
}

export function formatStatsTable(stats: CategoryStatRow[]): string {
  const lines: string[] = [];
  const header = `| ${"카테고리 (시·도)".padEnd(14)} | ${"전체 건수".padStart(8)} | ${"보완 완료".padStart(8)} | ${"미매칭 제외".padStart(9)} | ${"잔여 대기".padStart(8)} | ${"진행률".padStart(7)} |`;
  const divider = `|${"-".repeat(18)}|${"-".repeat(11)}|${"-".repeat(11)}|${"-".repeat(13)}|${"-".repeat(11)}|${"-".repeat(9)}|`;
  lines.push(header);
  lines.push(divider);

  let sumTotal = 0;
  let sumEnriched = 0;
  let sumSkipped = 0;
  let sumPending = 0;

  for (const row of stats) {
    sumTotal += row.total;
    sumEnriched += row.enriched;
    sumSkipped += row.skipped;
    sumPending += row.pending;
    const rate = row.total > 0 ? `${((row.enriched / row.total) * 100).toFixed(1)}%` : "0.0%";
    lines.push(
      `| ${row.province.padEnd(14)} | ${String(row.total).padStart(8)} | ${String(row.enriched).padStart(8)} | ${String(row.skipped).padStart(9)} | ${String(row.pending).padStart(8)} | ${rate.padStart(7)} |`,
    );
  }

  const totalRate = sumTotal > 0 ? `${((sumEnriched / (sumTotal || 1)) * 100).toFixed(1)}%` : "0.0%";
  lines.push(divider);
  lines.push(
    `| ${"전체 합계".padEnd(14)} | ${String(sumTotal).padStart(8)} | ${String(sumEnriched).padStart(8)} | ${String(sumSkipped).padStart(9)} | ${String(sumPending).padStart(8)} | ${totalRate.padStart(7)} |`,
  );

  return lines.join("\n");
}

export async function selectCategoryBalancedBatch(
  db: Client,
  limit: number,
): Promise<Pharmacy[]> {
  const categoriesRes = await withDbRetry(() =>
    db.execute(`
      SELECT DISTINCT province
      FROM pharmacies
      WHERE ${PHARMACY_INDEXABLE_PREDICATE}
        AND enriched_at IS NULL
        AND skipped_at IS NULL
        AND province IS NOT NULL
      ORDER BY province ASC
    `),
  );

  const provinces = categoriesRes.rows.map((r) => String(r.province));
  if (provinces.length === 0) return [];

  const perProvinceQuota = Math.max(2, Math.ceil(limit / provinces.length) + 1);
  const buckets = new Map<string, Pharmacy[]>();

  for (const prov of provinces) {
    const rowsRes: ResultSet = await withDbRetry(() =>
      db.execute({
        sql: `
          SELECT *
          FROM pharmacies
          WHERE ${PHARMACY_INDEXABLE_PREDICATE}
            AND enriched_at IS NULL
            AND skipped_at IS NULL
            AND province = ?
          ORDER BY updated_at DESC, hpid ASC
          LIMIT ?
        `,
        args: [prov, perProvinceQuota],
      }),
    );

    const mapped: Pharmacy[] = rowsRes.rows.map((row) => ({
      id: String(row.id ?? row.hpid),
      hpid: String(row.hpid),
      name: String(row.name),
      address: String(row.address),
      tel: row.tel ? String(row.tel) : undefined,
      latitude: row.latitude != null ? Number(row.latitude) : null,
      longitude: row.longitude != null ? Number(row.longitude) : null,
      operating_hours: parseJson(row.operating_hours as string | null, null),
      province: row.province ? String(row.province) : null,
      city: row.city ? String(row.city) : null,
      updated_at: row.updated_at ? String(row.updated_at) : null,
    }));

    buckets.set(prov, mapped);
  }

  // Round-robin across categories for balanced sampling
  const selected: Pharmacy[] = [];
  let cursor = 0;
  while (selected.length < limit) {
    let addedInPass = false;
    for (const prov of provinces) {
      const list = buckets.get(prov) ?? [];
      if (cursor < list.length) {
        selected.push(list[cursor]!);
        addedInPass = true;
        if (selected.length >= limit) break;
      }
    }
    if (!addedInPass) break;
    cursor += 1;
  }

  return selected;
}

async function ensureSeedDataIfEmpty(db: Client): Promise<void> {
  const countRes = await withDbRetry(() =>
    db.execute("SELECT COUNT(*) AS count FROM pharmacies"),
  );
  const currentCount = Number(countRes.rows[0]?.count ?? 0);
  if (currentCount > 0) return;

  console.log("[Seed] 로컬 DB가 비어 있어 공개 API(todaypharm.kr)에서 전국 17개 시·도 약국 데이터를 균등 시딩합니다...");
  const statements: InStatement[] = [];

  for (const province of ALL_PROVINCES) {
    try {
      const url = `https://todaypharm.kr/api/pharmacies?province=${encodeURIComponent(province)}&limit=35&offset=0`;
      const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
      if (!res.ok) continue;
      const body = (await res.json()) as { items?: Array<Record<string, unknown>> };
      for (const item of body.items ?? []) {
        if (!item.hpid || !item.name || !item.address) continue;
        statements.push({
          sql: `
            INSERT INTO pharmacies (
              id, hpid, name, address, tel, latitude, longitude, operating_hours, province, city, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(hpid) DO NOTHING
          `,
          args: [
            String(item.id ?? item.hpid),
            String(item.hpid),
            String(item.name),
            String(item.address),
            item.tel ? String(item.tel) : null,
            item.latitude != null ? Number(item.latitude) : null,
            item.longitude != null ? Number(item.longitude) : null,
            item.operating_hours ? JSON.stringify(item.operating_hours) : null,
            item.province ? String(item.province) : province,
            item.city ? String(item.city) : null,
            item.updated_at ? String(item.updated_at) : new Date().toISOString(),
          ],
        });
      }
    } catch (err) {
      console.warn(`[Seed] ${province} 시딩 중 경고:`, err);
    }
  }

  if (statements.length > 0) {
    await withDbRetry(() => db.batch(statements, "write"));
    console.log(`[Seed] 전국 17개 시·도 약국 ${statements.length}건 시딩 완료.`);
  }
}

async function runCli() {
  const args = process.argv.slice(2);
  const statsOnly = args.includes("--stats");
  const limitArg = args.find((a) => a.startsWith("--limit="));
  const limit = limitArg ? Math.max(1, Number(limitArg.split("=")[1])) : 60;

  const db = getRequiredTursoClient();
  await ensureSeedDataIfEmpty(db);

  if (statsOnly) {
    const stats = await getEnrichmentStats(db);
    console.log("\n📊 [약국 인텔리전스 리포트 카테고리별 보완 현황]");
    console.log(formatStatsTable(stats));
    return;
  }

  const candidates = await selectCategoryBalancedBatch(db, limit);
  console.log(`\n🚀 [Enrich Batch] 총 ${candidates.length}건 카테고리 균등 샘플링 배치 시작 (요청 limit=${limit})`);

  let enrichedCount = 0;
  let skippedCount = 0;

  const peerCache = new Map<string, Pharmacy[]>();

  for (let i = 0; i < candidates.length; i += 1) {
    const pharmacy = candidates[i]!;
    const regionKey = `${pharmacy.province ?? ""}:${pharmacy.city ?? ""}`;

    try {
      if (i > 0) {
        await sleepWithJitter(1500, 3200);
      }

      const externalData = await fetchExternalPlaceData(pharmacy);
      const nowIso = new Date().toISOString();

      if (!externalData.matched) {
        await withDbRetry(() =>
          db.execute({
            sql: "UPDATE pharmacies SET skipped_at = ? WHERE hpid = ?",
            args: [nowIso, pharmacy.hpid],
          }),
        );
        skippedCount += 1;
        console.log(
          `[${i + 1}/${candidates.length}] SKIP (${pharmacy.province} ${pharmacy.city}) ${pharmacy.name} -> 미매칭 SkippedAt 마킹`,
        );
        continue;
      }

      let peers = peerCache.get(regionKey);
      if (!peers && pharmacy.province) {
        const peerRes = await withDbRetry(() =>
          db.execute({
            sql: "SELECT operating_hours FROM pharmacies WHERE province = ? LIMIT 100",
            args: [pharmacy.province!],
          }),
        );
        peers = peerRes.rows.map((r) => ({
          hpid: "",
          name: "",
          address: "",
          operating_hours: parseJson(r.operating_hours as string | null, null),
        }));
        peerCache.set(regionKey, peers);
      }

      const report = buildPharmacyIntelligenceReport(pharmacy, externalData, peers);

      await withDbRetry(() =>
        db.execute({
          sql: `
            UPDATE pharmacies
            SET intelligence_report = ?, enriched_at = ?, skipped_at = NULL
            WHERE hpid = ?
          `,
          args: [JSON.stringify(report), nowIso, pharmacy.hpid],
        }),
      );

      enrichedCount += 1;
      console.log(
        `[${i + 1}/${candidates.length}] OK   (${pharmacy.province} ${pharmacy.city}) ${pharmacy.name} -> 키워드 ${report.keywordAnalysis.topKeywords.length}개 / 정류장 ${report.visitGuide.transitStops.length}곳 보완 완료`,
      );
    } catch (err) {
      if (err instanceof CircuitBreakerError) {
        console.error(
          `\n🛑 [서킷 브레이커 작동] ${err.message} — 안전을 위해 배치를 즉시 중단합니다.`,
        );
        break;
      }
      console.error(`[${i + 1}/${candidates.length}] ERR  ${pharmacy.name}:`, err);
    }
  }

  const finalStats = await getEnrichmentStats(db);
  const cumulativeEnriched = finalStats.reduce((sum, r) => sum + r.enriched, 0);

  console.log("\n============================================================");
  console.log(
    `✅ 배치 완료 요약: 이번 배치 보완 ${enrichedCount}건 | 미매칭 제외 ${skippedCount}건 | 누적 보완 총수 ${cumulativeEnriched}건`,
  );
  console.log("============================================================");
  console.log(formatStatsTable(finalStats));
}

if (require.main === module) {
  runCli().catch((err) => {
    console.error("Enrichment batch failed:", err);
    process.exitCode = 1;
  });
}
