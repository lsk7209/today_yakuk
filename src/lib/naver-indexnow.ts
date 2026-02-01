import { getSiteUrl } from "@/lib/site-url";

// Generated IndexNow Key (must match the file in /public)
const INDEXNOW_KEY = "889f81d86d6a4225b29f9e8324545082";
const INDEXNOW_ENDPOINT = "https://searchadvisor.naver.com/indexnow";

interface IndexNowPayload {
    host: string;
    key: string;
    keyLocation?: string;
    urlList: string[];
}

/**
 * Submits URLs to Naver IndexNow API.
 * This notifies the search engine that these URLs have been added, updated, or deleted.
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

    try {
        console.info(`[IndexNow] Submitting ${urls.length} URLs to Naver...`);
        const response = await fetch(INDEXNOW_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=utf-8",
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            console.error(
                `[IndexNow] Failed to submit. Status: ${response.status} ${response.statusText}`
            );
            return false;
        }

        console.info(`[IndexNow] Successfully submitted URLs.`);
        return true;

    } catch (error) {
        console.error("[IndexNow] Exception during submission:", error);
        return false;
    }
}
