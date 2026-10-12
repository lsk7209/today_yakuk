export type WikiCatalogType = "supplement" | "medicine";

export function getWikiCatalogType(value: string | null | undefined): WikiCatalogType | null {
  if (!value || value === "supplement") return "supplement";
  if (value === "medicine") return "medicine";
  return null;
}

export function getWikiPageNumber(value: string | null | undefined): number | null {
  if (!value) return 1;
  if (!/^[1-9]\d*$/.test(value)) return null;
  const page = Number(value);
  return Number.isSafeInteger(page) && page <= 1_000_000 ? page : null;
}

export function getWikiSearchLimit(value: string | null): number {
  if (!value || !/^[1-9]\d*$/.test(value)) return 12;
  return Math.min(Number(value), 50);
}

export function buildWikiPagePath(type: WikiCatalogType, category: string, page: number): string {
  const params = new URLSearchParams();
  if (type === "medicine") params.set("type", "medicine");
  if (type === "supplement" && category !== "all") params.set("category", category);
  params.set("page", String(page));
  return `/wiki?${params}`;
}

export function buildWikiSearchQuery(type: WikiCatalogType, category: string | null, limit: number) {
  if (type === "medicine") {
    return {
      sql: `SELECT id, name, manufacturer, image_url FROM medicines
            WHERE name LIKE ? OR manufacturer LIKE ? ORDER BY name, id LIMIT ?`,
      argsFor: (like: string) => [like, like, limit],
    };
  }
  if (category && category !== "all") {
    return {
      sql: `SELECT id, name, manufacturer, image_url, tags FROM supplements
            WHERE (name LIKE ? OR manufacturer LIKE ?)
            AND tags IS NOT NULL AND EXISTS (SELECT 1 FROM json_each(tags) WHERE value = ?)
            LIMIT ?`,
      argsFor: (like: string) => [like, like, category, limit],
    };
  }
  return {
    sql: `SELECT id, name, manufacturer, image_url, tags FROM supplements
          WHERE name LIKE ? OR manufacturer LIKE ? LIMIT ?`,
    argsFor: (like: string) => [like, like, limit],
  };
}
