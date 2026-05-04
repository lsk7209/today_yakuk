import { getSiteUrl } from "@/lib/site-url";

// Generated IndexNow Key (must match the file in /public)
const INDEXNOW_KEY = "889f81d86d6a4225b29f9e8324545082";
const INDEXNOW_ENDPOINTS = [
    { name: "IndexNow", url: "https://api.indexnow.org/indexnow" },
    { name: "Bing", url: "https://www.bing.com/indexnow" },
    { name: "Naver", url: "https://searchadvisor.naver.com/indexnow" },
    { name: "Yandex", url: "https://yandex.com/indexnow" },
] as const;

interface IndexNowPayload {
    host: string;
    key: string;
    keyLocation?: string;
    urlList: string[];
}

/**
 * Submits URLs to IndexNow-compatible endpoints.
 * This notifies supported search engines that these URLs have been added, updated, or deleted.
 * 
 * @param urls Array of absolute URLs to submit
 * @returns Promise<boolean> True if submission was successful
 */
export async function submitToIndexNow(urls: string[]): Promise<boolean> {
    const siteUrl = getSiteUrl();
    const host = new URL(siteUrl).hostname; // Extract 'www.todaypharm.kr' or 'todaypharm.kr'

    if (!urls.length) return false;

    const payload: IndexNowPayload = {
        host,
        key: INDEXNOW_KEY,
        urlList: urls,
    };

    const results = await Promise.allSettled(
        INDEXNOW_ENDPOINTS.map(async (endpoint) => {
            console.info(`[IndexNow] Submitting ${urls.length} URLs to ${endpoint.name}...`);
            const response = await fetch(endpoint.url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json; charset=utf-8",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok && response.status !== 202) {
                throw new Error(`${endpoint.name}: ${response.status} ${response.statusText}`);
            }

            console.info(`[IndexNow] ${endpoint.name} accepted URLs. status=${response.status}`);
            return endpoint.name;
        }),
    );

    const failures = results.filter((result): result is PromiseRejectedResult => result.status === "rejected");
    failures.forEach((failure) => console.error("[IndexNow] Submission failed:", failure.reason));
    return failures.length < results.length;
}
