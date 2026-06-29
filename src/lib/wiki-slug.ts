const UUID_PATTERN =
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;

export interface WikiSlugEntity {
  id: string;
  name: string;
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function extractWikiEntityId(routeId: string): string {
  const decoded = safeDecode(routeId);
  const matches = decoded.match(UUID_PATTERN);
  const uuid = matches?.[matches.length - 1];
  return uuid ? uuid.toLowerCase() : decoded;
}

export function slugifyWikiName(name: string): string {
  const slug = name
    .normalize("NFKC")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^0-9a-z가-힣ㄱ-ㅎㅏ-ㅣ]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/^-+|-+$/g, "");

  return slug || "item";
}

export function buildWikiProductSlug(item: WikiSlugEntity): string {
  return `${slugifyWikiName(item.name)}-${item.id}`;
}

export function buildWikiMedicineSlug(item: WikiSlugEntity): string {
  return `${slugifyWikiName(item.name)}-${item.id}`;
}

export function buildWikiProductPath(item: WikiSlugEntity): string {
  return `/wiki/product/${buildWikiProductSlug(item)}`;
}

export function buildWikiMedicinePath(item: WikiSlugEntity): string {
  return `/wiki/medicine/${buildWikiMedicineSlug(item)}`;
}
