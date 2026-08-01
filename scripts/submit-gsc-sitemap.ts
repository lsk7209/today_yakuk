import path from "path";
import { google } from "googleapis";
import { getSiteUrl } from "../src/lib/site-url";

type SearchConsoleSite = {
  siteUrl?: string | null;
  permissionLevel?: string | null;
};

const credentialsPath =
  process.env.GSC_CREDENTIALS_PATH ||
  process.env.GOOGLE_APPLICATION_CREDENTIALS ||
  "D:/env/gsc_credentials.json";

const siteUrl = getSiteUrl();
const sitemapUrl = `${siteUrl}/sitemap-index.xml`;
const host = new URL(siteUrl).hostname;
const preferredProperties = [`sc-domain:${host}`, `${siteUrl}/`];
const statusOnly = process.argv.includes("--status-only");

function pickProperty(sites: SearchConsoleSite[]) {
  for (const candidate of preferredProperties) {
    const match = sites.find((site) => site.siteUrl === candidate);
    if (match?.siteUrl) return match.siteUrl;
  }

  const sameHost = sites.find((site) => site.siteUrl?.includes(host));
  return sameHost?.siteUrl || preferredProperties[0];
}

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: path.resolve(credentialsPath),
    scopes: ["https://www.googleapis.com/auth/webmasters"],
  });
  const searchconsole = google.searchconsole({ version: "v1", auth });

  const sitesResponse = await searchconsole.sites.list();
  const sites = sitesResponse.data.siteEntry || [];
  const property = pickProperty(sites);

  if (!statusOnly) {
    await searchconsole.sitemaps.submit({
      siteUrl: property,
      feedpath: sitemapUrl,
    });
  }

  const sitemapResponse = await searchconsole.sitemaps.get({
    siteUrl: property,
    feedpath: sitemapUrl,
  });

  const sitemap = sitemapResponse.data;
  console.log(
    JSON.stringify(
      {
        property,
        sitemap: sitemap.path,
        lastSubmitted: sitemap.lastSubmitted,
        lastDownloaded: sitemap.lastDownloaded,
        isPending: sitemap.isPending,
        errors: sitemap.errors,
        warnings: sitemap.warnings,
        type: sitemap.type,
        contents: sitemap.contents,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[GSC Sitemap] ${message}`);
  process.exit(1);
});
