import { unstable_cache } from "next/cache";

export const DB_READ_REVALIDATE_SECONDS = 3600;

export async function cacheDbRead<T>(
  keyParts: readonly string[],
  query: () => Promise<T>,
  revalidate = DB_READ_REVALIDATE_SECONDS,
): Promise<T> {
  try {
    return await unstable_cache(query, ["db-read", ...keyParts], { revalidate })();
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("incrementalCache missing")
    ) {
      return query();
    }
    throw error;
  }
}
