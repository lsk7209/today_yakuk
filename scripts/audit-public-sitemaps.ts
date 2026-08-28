import {
  PUBLIC_SITEMAP_TYPES,
  fetchBoundedSameOriginText,
  parsePublicSitemapIndex,
  parsePublicUrlSet,
  selectEntriesSince,
  type PublicSitemapEntry,
  type PublicSitemapType,
} from "@/lib/public-sitemap-audit";

type Options = {
  siteUrl: string;
  since: Date;
  types: Set<PublicSitemapType>;
  candidateLimit: number;
  json: boolean;
};

type DatasetAudit = {
  entriesSinceCutoff: number;
  chunksFetched: number;
  candidates: PublicSitemapEntry[];
  interpretation: string;
};

const DEFAULT_TYPES: PublicSitemapType[] = ["supplements", "medicines", "blog"];

function parsePositiveInteger(value: string, name: string) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isSafeInteger(parsed) || parsed < 1 || parsed > 100) {
    throw new Error(`${name} must be an integer between 1 and 100.`);
  }
  return parsed;
}

function parseOptions(argv: string[]): Options {
  const now = new Date();
  const defaultSince = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const options: Options = {
    siteUrl: "https://todaypharm.kr",
    since: defaultSince,
    types: new Set(DEFAULT_TYPES),
    candidateLimit: 12,
    json: false,
  };

  for (const arg of argv) {
    if (arg === "--json") {
      options.json = true;
    } else if (arg.startsWith("--site-url=")) {
      options.siteUrl = arg.slice("--site-url=".length).replace(/\/$/, "");
    } else if (arg.startsWith("--since=")) {
      const raw = arg.slice("--since=".length);
      const normalized = /^\d{4}-\d{2}-\d{2}$/.test(raw) ? `${raw}T00:00:00.000Z` : raw;
      options.since = new Date(normalized);
    } else if (arg.startsWith("--types=")) {
      const requested = arg.slice("--types=".length).split(",").filter(Boolean);
      options.types = new Set(
        requested.map((type) => {
          if (!PUBLIC_SITEMAP_TYPES.includes(type as PublicSitemapType)) {
            throw new Error(`Unknown sitemap type: ${type}`);
          }
          return type as PublicSitemapType;
        }),
      );
    } else if (arg.startsWith("--candidate-limit=")) {
      options.candidateLimit = parsePositiveInteger(
        arg.slice("--candidate-limit=".length),
        "candidate-limit",
      );
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }

  const site = new URL(options.siteUrl);
  if (site.protocol !== "https:") throw new Error("site-url must use HTTPS.");
  if (Number.isNaN(options.since.getTime())) throw new Error("since must be a valid date.");
  if (options.types.size === 0) throw new Error("At least one sitemap type is required.");
  return options;
}

function interpretationFor(type: PublicSitemapType): string {
  if (type === "supplements" || type === "medicines") {
    return "Counts site records created since the cutoff; it does not prove a new regulatory approval or market launch.";
  }
  if (type === "pharmacies") {
    return "Pharmacy lastmod is a sync-touch timestamp, so this is not a count of newly opened pharmacies.";
  }
  return "Blog lastmod can represent publication or a later content update.";
}

async function auditDataset(
  type: PublicSitemapType,
  chunks: { index: number; url: string }[],
  options: Options,
): Promise<DatasetAudit> {
  let entriesSinceCutoff = 0;
  let chunksFetched = 0;
  const candidates: PublicSitemapEntry[] = [];

  for (const chunk of chunks.sort((a, b) => a.index - b.index)) {
    const entries = parsePublicUrlSet(
      await fetchBoundedSameOriginText(
        chunk.url,
        options.siteUrl,
        ["application/xml", "text/xml"],
      ),
      options.siteUrl,
    );
    chunksFetched += 1;
    const recent = selectEntriesSince(entries, options.since);
    entriesSinceCutoff += recent.length;
    candidates.push(...recent.slice(0, Math.max(0, options.candidateLimit - candidates.length)));

    // App sitemaps are ordered newest first. Once a chunk contains an older
    // entry, all later chunks are outside the requested window.
    if (recent.length < entries.length) break;
  }

  return {
    entriesSinceCutoff,
    chunksFetched,
    candidates,
    interpretation: interpretationFor(type),
  };
}

async function main() {
  const options = parseOptions(process.argv.slice(2));
  const indexUrl = `${options.siteUrl}/sitemap-index.xml`;
  const chunks = parsePublicSitemapIndex(
    await fetchBoundedSameOriginText(
      indexUrl,
      options.siteUrl,
      ["application/xml", "text/xml"],
    ),
    options.siteUrl,
  );
  const datasets: Partial<Record<PublicSitemapType, DatasetAudit>> = {};

  for (const type of options.types) {
    const selected = chunks.filter((chunk) => chunk.type === type);
    if (selected.length === 0) throw new Error(`No ${type} sitemap chunks found.`);
    datasets[type] = await auditDataset(type, selected, options);
  }

  const report = {
    observedAt: new Date().toISOString(),
    siteUrl: options.siteUrl,
    cutoff: options.since.toISOString(),
    readOnly: true,
    datasets,
    boundary:
      "Public sitemap evidence only. Exact DB gaps require separate SELECT-only credentials; no DB or API write was attempted.",
  };

  if (options.json) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  console.log(`Public data freshness audit: ${report.siteUrl}`);
  console.log(`Cutoff: ${report.cutoff}`);
  for (const [type, result] of Object.entries(datasets)) {
    if (!result) continue;
    console.log(
      `${type}: ${result.entriesSinceCutoff} entries since cutoff (${result.chunksFetched} chunk(s) fetched)`,
    );
    for (const candidate of result.candidates) {
      console.log(`  - ${candidate.lastModified} ${candidate.loc}`);
    }
    console.log(`  Note: ${result.interpretation}`);
  }
  console.log(report.boundary);
}

main().catch((error) => {
  console.error("[public-sitemap-audit] Failed:", error);
  process.exitCode = 1;
});
