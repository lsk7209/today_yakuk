import fs from "node:fs";
import path from "node:path";
import {
  fetchBoundedSameOriginText,
  parsePublicSitemapIndex,
  parsePublicUrlSet,
  type PublicSitemapEntry,
} from "@/lib/public-sitemap-audit";

type Options = {
  siteUrl: string;
  slug: string;
  title: string;
  pageSize: number;
  delayMs: number;
};

function parseInteger(value: string, name: string, min: number, max: number): number {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isSafeInteger(parsed) || parsed < min || parsed > max) {
    throw new Error(`${name} must be an integer between ${min} and ${max}.`);
  }
  return parsed;
}

function parseOptions(argv: string[]): Options {
  const values = new Map<string, string>();
  for (const arg of argv) {
    const match = arg.match(/^--([a-z-]+)=(.+)$/);
    if (!match) throw new Error(`Unknown option: ${arg}`);
    values.set(match[1], match[2]);
  }

  const slug = values.get("slug")?.trim();
  const title = values.get("title")?.trim();
  if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
    throw new Error("slug is required and must contain only lowercase letters, numbers, and hyphens.");
  }
  if (!title) throw new Error("title is required.");

  const siteUrl = (values.get("site-url") || "https://todaypharm.kr").replace(/\/$/, "");
  const site = new URL(siteUrl);
  if (site.protocol !== "https:") throw new Error("site-url must use HTTPS.");

  return {
    siteUrl,
    slug,
    title,
    pageSize: parseInteger(values.get("page-size") || "12", "page-size", 1, 100),
    delayMs: parseInteger(values.get("delay-ms") || "100", "delay-ms", 0, 5_000),
  };
}

function normalize(value: string): string {
  return value.normalize("NFC").replace(/\s+/g, " ").trim();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function declaresTargetSlug(source: string, slug: string): boolean {
  const escaped = escapeRegExp(slug);
  return new RegExp(
    `\\bslug\\s*[:=]\\s*["'](?:/blog/)?${escaped}["']`,
  ).test(source);
}

function wait(delayMs: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, delayMs));
}

function parseRenderedPublishedCount(html: string): number {
  const prefix = '전체 \\",\\"';
  const suffix = '\\",\\"개 글 중';
  const start = html.indexOf(prefix);
  if (start < 0) throw new Error("Could not find the published-content count on /blog.");
  const valueStart = start + prefix.length;
  const end = html.indexOf(suffix, valueStart);
  if (end < 0) throw new Error("Could not parse the published-content count on /blog.");
  return parseInteger(html.slice(valueStart, end).replace(/,/g, ""), "published count", 0, 1_000_000);
}

async function main() {
  const options = parseOptions(process.argv.slice(2));
  const root = process.cwd();
  const blogRoot = path.join(root, "src", "app", "blog");
  const targetRoute = `/blog/${options.slug}`;
  const targetUrl = new URL(targetRoute, options.siteUrl).href;
  const normalizedTitle = normalize(options.title);

  const staticRouteFiles = fs
    .readdirSync(blogRoot, { withFileTypes: true })
    .filter(
      (entry) =>
        entry.isDirectory() &&
        entry.name !== "[slug]" &&
        entry.name !== options.slug &&
        fs.existsSync(path.join(blogRoot, entry.name, "page.tsx")),
    )
    .map((entry) => path.join(blogRoot, entry.name, "page.tsx"));
  const staticRegistry = fs.readFileSync(path.join(blogRoot, "page.tsx"), "utf8");
  const localSources = [staticRegistry, ...staticRouteFiles.map((file) => fs.readFileSync(file, "utf8"))];

  const campaignFiles = fs
    .readdirSync(path.join(root, "content"))
    .filter((name) => /^blog-campaign-.*\.json$/.test(name));
  const campaignEntries = campaignFiles.flatMap((name) =>
    JSON.parse(fs.readFileSync(path.join(root, "content", name), "utf8")) as Array<{
      slug?: string;
      title?: string;
    }>,
  );

  const sitemapIndexUrl = `${options.siteUrl}/sitemap-index.xml`;
  const sitemapIndex = parsePublicSitemapIndex(
    await fetchBoundedSameOriginText(
      sitemapIndexUrl,
      options.siteUrl,
      ["application/xml", "text/xml"],
    ),
    options.siteUrl,
  );
  const blogChunks = sitemapIndex.filter((chunk) => chunk.type === "blog");
  if (blogChunks.length === 0) throw new Error("No public blog sitemap chunks found.");

  const publicEntries: PublicSitemapEntry[] = [];
  for (const chunk of blogChunks) {
    const entries = parsePublicUrlSet(
      await fetchBoundedSameOriginText(
        chunk.url,
        options.siteUrl,
        ["application/xml", "text/xml"],
      ),
      options.siteUrl,
    );
    publicEntries.push(...entries);
  }

  const firstPageHtml = await fetchBoundedSameOriginText(
    `${options.siteUrl}/blog`,
    options.siteUrl,
    ["text/html"],
    2_000_000,
  );
  const renderedPublishedEntries = parseRenderedPublishedCount(firstPageHtml);
  const pagesToFetch = Math.ceil(
    Math.max(publicEntries.length, renderedPublishedEntries) / options.pageSize,
  );
  const publicTitleMatchPages: number[] = [];
  for (let page = 1; page <= pagesToFetch; page += 1) {
    const pageUrl = page === 1 ? `${options.siteUrl}/blog` : `${options.siteUrl}/blog?page=${page}`;
    const html =
      page === 1
        ? firstPageHtml
        : await fetchBoundedSameOriginText(
            pageUrl,
            options.siteUrl,
            ["text/html"],
            2_000_000,
          );
    if (normalize(html).includes(normalizedTitle)) publicTitleMatchPages.push(page);
    if (page < pagesToFetch && options.delayMs > 0) await wait(options.delayMs);
  }

  const result = {
    observedAt: new Date().toISOString(),
    readOnly: true,
    target: { slug: options.slug, title: options.title, route: targetRoute },
    localStatic: {
      comparedRouteFiles: staticRouteFiles.length,
      comparedRegistry: "src/app/blog/page.tsx",
      slugMatchesExcludingTarget: localSources.filter((source) =>
        declaresTargetSlug(source, options.slug),
      ).length,
      titleMatchesExcludingTarget: localSources.filter((source) => normalize(source).includes(normalizedTitle)).length,
    },
    localCampaigns: {
      files: campaignFiles.length,
      entries: campaignEntries.length,
      slugMatches: campaignEntries.filter((item) => item.slug === options.slug).length,
      titleMatches: campaignEntries.filter((item) => normalize(item.title || "") === normalizedTitle).length,
    },
    publishedPublicCoverage: {
      sitemapIndexUrl,
      sitemapChunksFetched: blogChunks.length,
      sitemapEntries: publicEntries.length,
      slugMatches: publicEntries.filter((entry) => entry.loc === targetUrl).length,
      renderedPublishedEntries,
      listingPagesFetched: pagesToFetch,
      titleMatchPages: publicTitleMatchPages,
    },
    boundary:
      "Public sitemap and rendered blog pagination were read sequentially. No production DB credential or write was used; the target draft route itself was excluded from local route comparison.",
  };

  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error("[content-duplicate-audit] Failed:", error);
  process.exitCode = 1;
});
