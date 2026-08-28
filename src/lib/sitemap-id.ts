export type SitemapDataType = "pharmacies" | "supplements" | "medicines" | "blog";

export function parseSitemapId(id: string) {
  const match = /^(pharmacies|supplements|medicines|blog)-(0|[1-9]\d{0,3})$/.exec(id);
  if (!match) return null;
  return {
    type: match[1] as SitemapDataType,
    index: Number.parseInt(match[2], 10),
  };
}
