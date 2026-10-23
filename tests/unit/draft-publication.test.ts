import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { NextRequest } from "next/server";
import { proxy } from "@/proxy";
import { signAdminToken } from "@/lib/jwt";
import { isPrivateBlogSlug } from "@/lib/editorial-publication-manifest";

let failed = 0;
async function run(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    console.log(`ok - ${name}`);
  } catch (error) {
    failed++;
    console.error(`not ok - ${name}`);
    console.error(error);
  }
}

const DRAFTS = [
  "supplement-label-reading-guide",
  "supplement-additives-label-guide",
  "data-update-2026-08",
  "medicine-info-check-by-name",
];
const req = (path: string, cookie?: string) =>
  new NextRequest(`https://todaypharm.kr${path}`, cookie ? { headers: { cookie } } : undefined);

async function main() {
  process.env.JWT_SECRET = "test-secret-for-draft-publication";

  await run("초안 슬러그는 직접 URL에서 404 (슬래시 유무 포함)", async () => {
    for (const slug of DRAFTS) {
      assert.equal(isPrivateBlogSlug(slug), true, slug);
      assert.equal((await proxy(req(`/blog/${slug}`))).status, 404, slug);
      assert.equal((await proxy(req(`/blog/${slug}/`))).status, 404, slug);
      assert.equal((await proxy(req(`/blog/${slug}`, "admin_token=invalid"))).status, 404, slug);
    }
  });

  await run("정상 게시 글은 영향받지 않는다", async () => {
    for (const slug of ["pregnancy-pharmacy-guide", "night-pharmacy-checklist", "some-db-post"]) {
      assert.equal(isPrivateBlogSlug(slug), false, slug);
      const res = await proxy(req(`/blog/${slug}`));
      assert.notEqual(res.status, 404, slug);
    }
  });

  await run("승인된 미리보기(관리자 토큰)는 접근 가능하되 noindex·no-store", async () => {
    const token = await signAdminToken();
    const res = await proxy(req("/blog/data-update-2026-08", `admin_token=${token}`));
    assert.notEqual(res.status, 404);
    assert.equal(res.headers.get("x-robots-tag"), "noindex, nofollow");
    assert.match(res.headers.get("cache-control") ?? "", /no-store/);
  });

  await run("목록·사이트맵·피드 소스에 비공개 슬러그가 섞이지 않는다", async () => {
    const files = [
      "src/lib/sitemap-content.ts",
      "src/app/blog/page.tsx",
      "src/app/rss.xml/route.ts",
      "src/app/feed.xml/route.ts",
      "src/app/wiki/page.tsx",
    ];
    for (const file of files) {
      const full = path.join(process.cwd(), file);
      if (!fs.existsSync(full)) continue;
      const source = fs.readFileSync(full, "utf8");
      for (const slug of DRAFTS.slice(0, 3)) {
        assert.equal(source.includes(slug), false, `${file} lists private slug ${slug}`);
      }
    }
  });

  if (failed > 0) {
    process.exitCode = 1;
    throw new Error(`${failed} test(s) failed`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
