// DB 장애 시 빈 사이트맵(200)이나 404 대신 일시 오류(503)를 돌려준다.
// 수집기는 503을 재시도하고, 이전에 읽은 정상 사이트맵 URL을 제거하지 않는다.
export function sitemapUnavailableResponse(): Response {
  return new Response("Sitemap temporarily unavailable", {
    status: 503,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store, max-age=0",
      "Retry-After": "300",
    },
  });
}

export async function withSitemapFailureGuard(handler: () => Promise<Response>): Promise<Response> {
  try {
    return await handler();
  } catch (error) {
    console.error("sitemap generation failed", error);
    return sitemapUnavailableResponse();
  }
}
