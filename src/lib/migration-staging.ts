export function isMigrationStaging(env?: { MIGRATION_STAGING?: string }): boolean {
  return (env ? env.MIGRATION_STAGING : process.env.MIGRATION_STAGING) === "1";
}

export function isStagingMutation(method: string, pathname: string): boolean {
  const normalizedPath = pathname.replace(/\/+$/, "") || "/";
  if (["/admin", "/api/admin"].some((prefix) => normalizedPath === prefix || normalizedPath.startsWith(`${prefix}/`))) {
    return true;
  }
  if (normalizedPath === "/api/revalidate") return true;
  return method !== "GET" && method !== "HEAD" && method !== "OPTIONS";
}
