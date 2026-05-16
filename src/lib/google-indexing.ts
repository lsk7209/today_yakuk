import { google } from "googleapis";

// 환경변수에서 Service Account 정보 로드
// 실제 서비스 키 JSON 파일의 내용을 문자열로 저장하거나, 개별 필드를 사용
const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const SERVICE_ACCOUNT_KEY = process.env.GOOGLE_SERVICE_ACCOUNT_KEY
    ? process.env.GOOGLE_SERVICE_ACCOUNT_KEY.replace(/\\n/g, "\n")
    : undefined;

const SCOPES = [
    "https://www.googleapis.com/auth/indexing",
    "https://www.googleapis.com/auth/webmasters",
];

/**
 * Google Indexing API를 사용하여 URL의 업데이트를 알립니다.
 * @param url 색인을 요청할 URL (예: https://todaypharm.kr/pharmacy/123456)
 * @param type 요청 타입 ("URL_UPDATED" | "URL_DELETED")
 */
export async function requestIndexing(
    url: string,
    type: "URL_UPDATED" | "URL_DELETED" = "URL_UPDATED"
) {
    if (!SERVICE_ACCOUNT_EMAIL || !SERVICE_ACCOUNT_KEY) {
        console.warn(
            "[Indexing] Service Account 설정이 없습니다. 색인 요청을 건너뜁니다."
        );
        return false;
    }

    try {
        const jwtClient = new google.auth.JWT({
            email: SERVICE_ACCOUNT_EMAIL,
            key: SERVICE_ACCOUNT_KEY,
            scopes: SCOPES,
        });

        const indexing = google.indexing({
            version: "v3",
            auth: jwtClient,
        });

        const res = await indexing.urlNotifications.publish({
            requestBody: {
                url,
                type,
            },
        });

        if (res.status === 200) {
            console.info(`[Indexing] 성공: ${url} (${type})`);
            return true;
        } else {
            console.error(
                `[Indexing] 실패: ${res.status} ${res.statusText}`,
                res.data
            );
            return false;
        }
    } catch (error) {
        console.error("[Indexing] 예외 발생:", error);
        return false;
    }
}

/**
 * GSC에 사이트맵을 제출합니다. 신규 컨텐츠 발행 후 호출하세요.
 * @param siteUrl GSC에 등록된 속성 URL (예: https://www.todaypharm.kr)
 * @param sitemapUrl 제출할 사이트맵 URL (예: https://www.todaypharm.kr/sitemap-index.xml)
 */
export async function submitSitemapToGSC(siteUrl: string, sitemapUrl: string): Promise<boolean> {
    if (!SERVICE_ACCOUNT_EMAIL || !SERVICE_ACCOUNT_KEY) {
        console.warn("[GSC Sitemap] Service Account 설정이 없습니다. 사이트맵 제출을 건너뜁니다.");
        return false;
    }

    try {
        const jwtClient = new google.auth.JWT({
            email: SERVICE_ACCOUNT_EMAIL,
            key: SERVICE_ACCOUNT_KEY,
            scopes: SCOPES,
        });

        const webmasters = google.webmasters({ version: "v3", auth: jwtClient });
        await webmasters.sitemaps.submit({ siteUrl, feedpath: sitemapUrl });
        console.info(`[GSC Sitemap] 제출 성공: ${sitemapUrl}`);
        return true;
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        // 이미 제출된 사이트맵이거나 권한 부족 시 경고만 출력
        console.warn(`[GSC Sitemap] 제출 실패 (무시 가능): ${msg}`);
        return false;
    }
}

/**
 * URL의 현재 색인 상태를 조회합니다.
 */
export async function getIndexingStatus(url: string) {
    if (!SERVICE_ACCOUNT_EMAIL || !SERVICE_ACCOUNT_KEY) {
        return null;
    }

    try {
        const jwtClient = new google.auth.JWT({
            email: SERVICE_ACCOUNT_EMAIL,
            key: SERVICE_ACCOUNT_KEY,
            scopes: SCOPES,
        });

        const indexing = google.indexing({
            version: "v3",
            auth: jwtClient,
        });

        const res = await indexing.urlNotifications.getMetadata({
            url,
        });

        return res.data;
    } catch (error) {
        console.error("[Indexing] 상태 조회 실패:", error);
        return null;
    }
}
