export type AnalyticsEventName =
  | "pharmacy_search_submitted"
  | "pharmacy_results_loaded"
  | "pharmacy_detail_view"
  | "pharmacy_contact_intent"
  | "pharmacy_directions_intent"
  | "content_to_nearby_click";

type AnalyticsParam = string | number | boolean;

const EVENT_PARAM_ALLOWLIST: Record<AnalyticsEventName, readonly string[]> = {
  pharmacy_search_submitted: ["search_mode", "source_surface"],
  pharmacy_results_loaded: [
    "search_mode",
    "source_surface",
    "result_count_bucket",
    "radius_km",
  ],
  pharmacy_detail_view: ["pharmacy_id", "source_surface", "opening_status"],
  pharmacy_contact_intent: [
    "pharmacy_id",
    "source_surface",
    "opening_status",
    "result_rank",
  ],
  pharmacy_directions_intent: [
    "pharmacy_id",
    "source_surface",
    "opening_status",
    "result_rank",
    "map_provider",
  ],
  content_to_nearby_click: ["source_surface", "cta_placement"],
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function bucketResultCount(count: number): string {
  if (!Number.isFinite(count) || count <= 0) return "0";
  if (count <= 3) return "1-3";
  if (count <= 10) return "4-10";
  if (count <= 20) return "11-20";
  return "21+";
}

export function normalizeAnalyticsPage(value: unknown): string {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) return "/";

  try {
    const url = new URL(raw, "https://todaypharm.kr");
    return (url.pathname || "/").slice(0, 500);
  } catch {
    return "/";
  }
}

export function normalizeAnalyticsReferrer(value: unknown): string | null {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) return null;

  try {
    const url = new URL(raw, "https://todaypharm.kr");
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    const host = raw.startsWith("/") ? "" : url.hostname;
    return `${host}${url.pathname || "/"}`.slice(0, 500);
  } catch {
    return null;
  }
}

export function buildAnalyticsPayload(
  eventName: AnalyticsEventName,
  params: Record<string, AnalyticsParam | null | undefined>,
) {
  const allowed = new Set(EVENT_PARAM_ALLOWLIST[eventName]);
  const safeParams: Record<string, AnalyticsParam> = {};

  for (const [key, value] of Object.entries(params)) {
    if (!allowed.has(key) || value == null) continue;
    if (typeof value === "number" && !Number.isFinite(value)) continue;
    safeParams[key] = typeof value === "string" ? value.slice(0, 80) : value;
  }

  return { eventName, params: safeParams };
}

export function trackAnalyticsEvent(
  eventName: AnalyticsEventName,
  params: Record<string, AnalyticsParam | null | undefined>,
) {
  if (typeof window === "undefined") return;
  const payload = buildAnalyticsPayload(eventName, params);

  if (typeof window.gtag === "function") {
    window.gtag("event", payload.eventName, payload.params);
    return;
  }

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: payload.eventName, ...payload.params });
}
