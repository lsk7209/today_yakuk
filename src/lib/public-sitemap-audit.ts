import { XMLParser } from "fast-xml-parser";

export const PUBLIC_SITEMAP_TYPES = [
  "pharmacies",
  "supplements",
  "medicines",
  "blog",
] as const;

export type PublicSitemapType = (typeof PUBLIC_SITEMAP_TYPES)[number];

export type PublicSitemapChunk = {
  type: PublicSitemapType;
  index: number;
  url: string;
};

export type PublicSitemapEntry = {
  loc: string;
  lastModified: string;
};

const parser = new XMLParser({
  ignoreAttributes: false,
  parseTagValue: false,
  processEntities: false,
  trimValues: true,
});

function asArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

function requireSameOriginUrl(raw: unknown, siteUrl: string): URL {
  if (typeof raw !== "string" || !raw.trim()) {
    throw new Error("Sitemap entry is missing a URL.");
  }

  const base = new URL(siteUrl);
  const url = new URL(raw.trim(), base);
  if (url.protocol !== "https:" || url.origin !== base.origin) {
    throw new Error(`Refusing cross-origin or non-HTTPS sitemap URL: ${url.href}`);
  }
  return url;
}

function hasOwn(value: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(value, key);
}

export async function fetchBoundedSameOriginText(
  rawUrl: string,
  siteUrl: string,
  allowedContentTypes: readonly string[],
  maxBytes = 5_000_000,
): Promise<string> {
  const url = requireSameOriginUrl(rawUrl, siteUrl);
  const response = await fetch(url, {
    headers: { "user-agent": "todaypharm-read-only-content-audit/1.0" },
    redirect: "manual",
    signal: AbortSignal.timeout(15_000),
  });

  if (response.status >= 300 && response.status < 400) {
    throw new Error(`Refusing redirect from ${url.href} (${response.status}).`);
  }
  if (!response.ok) throw new Error(`GET ${url.href} failed (${response.status}).`);
  requireSameOriginUrl(response.url || url.href, siteUrl);

  const contentType = (response.headers.get("content-type") || "").toLowerCase();
  if (!allowedContentTypes.some((allowed) => contentType.includes(allowed))) {
    throw new Error(`Unexpected content-type for ${url.href}: ${contentType || "missing"}.`);
  }

  const declaredLength = Number.parseInt(response.headers.get("content-length") || "", 10);
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    throw new Error(`Response from ${url.href} exceeds ${maxBytes} bytes.`);
  }
  if (!response.body) throw new Error(`Response from ${url.href} has no body.`);

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      throw new Error(`Response from ${url.href} exceeds ${maxBytes} bytes.`);
    }
    chunks.push(value);
  }

  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}

export function parsePublicSitemapIndex(
  xml: string,
  siteUrl: string,
): PublicSitemapChunk[] {
  const parsed = parser.parse(xml) as {
    sitemapindex?: { sitemap?: { loc?: string } | { loc?: string }[] };
  };
  if (!parsed || typeof parsed !== "object" || !hasOwn(parsed, "sitemapindex")) {
    throw new Error("Expected a sitemapindex XML root.");
  }
  if (!parsed.sitemapindex || typeof parsed.sitemapindex !== "object") {
    return [];
  }

  const chunks: PublicSitemapChunk[] = [];
  for (const item of asArray(parsed.sitemapindex?.sitemap)) {
    const url = requireSameOriginUrl(item?.loc, siteUrl);
    const match = url.pathname.match(
      /^\/sitemap\/(pharmacies|supplements|medicines|blog)-(\d+)\.xml$/,
    );
    if (!match) continue;

    chunks.push({
      type: match[1] as PublicSitemapType,
      index: Number.parseInt(match[2], 10),
      url: url.href,
    });
  }

  return chunks.sort((a, b) =>
    a.type === b.type ? a.index - b.index : a.type.localeCompare(b.type),
  );
}

export function parsePublicUrlSet(
  xml: string,
  siteUrl: string,
): PublicSitemapEntry[] {
  const parsed = parser.parse(xml) as {
    urlset?:
      | string
      | null
      | { url?: { loc?: string; lastmod?: string } | { loc?: string; lastmod?: string }[] };
  };
  if (!parsed || typeof parsed !== "object" || !hasOwn(parsed, "urlset")) {
    throw new Error("Expected a urlset XML root.");
  }
  if (parsed.urlset === "" || parsed.urlset === null || parsed.urlset === undefined) {
    return [];
  }
  if (typeof parsed.urlset !== "object") {
    throw new Error("Invalid urlset XML structure.");
  }

  return asArray(parsed.urlset.url).map((item) => {
    const url = requireSameOriginUrl(item?.loc, siteUrl);
    const lastModified = typeof item?.lastmod === "string" ? item.lastmod.trim() : "";
    if (!lastModified || Number.isNaN(Date.parse(lastModified))) {
      throw new Error(`Invalid lastmod for ${url.href}`);
    }
    return { loc: url.href, lastModified };
  });
}

export function selectEntriesSince(
  entries: PublicSitemapEntry[],
  cutoff: Date,
): PublicSitemapEntry[] {
  const cutoffTime = cutoff.getTime();
  if (Number.isNaN(cutoffTime)) throw new Error("Invalid cutoff date.");
  return entries.filter((entry) => Date.parse(entry.lastModified) >= cutoffTime);
}
