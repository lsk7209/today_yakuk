/**
 * Returns the canonical origin used by metadata, sitemaps, feeds, and JSON-LD.
 *
 * Production is the apex domain. Normalize legacy www or http inputs so a
 * stale environment variable cannot leak a redirected host into crawl signals.
 */
export function getSiteUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL || "").trim();
  const normalized = (raw || "https://todaypharm.kr").replace(/\/$/, "");

  if (normalized === "https://www.todaypharm.kr") return "https://todaypharm.kr";
  if (normalized === "http://www.todaypharm.kr") return "https://todaypharm.kr";
  if (normalized === "http://todaypharm.kr") return "https://todaypharm.kr";

  return normalized;
}
