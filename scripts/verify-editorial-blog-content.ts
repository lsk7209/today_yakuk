import fs from "node:fs";
import path from "node:path";

import { EDITORIAL_BLOG_POSTS } from "../src/lib/editorial-blog-posts";
import { resolveEditorialPolicy } from "../src/lib/editorial-blog-posts";
import { EDITORIAL_PUBLICATION_POLICY } from "../src/lib/editorial-publication-manifest";

const EXPECTED_COUNT = 10;
const MIN_TEXT_LENGTH = 1200;
const MIN_SECTIONS = 4;
const MIN_FAQS = 3;
const EXPECTED_PUBLIC_COUNT = 0;
const root = process.cwd();
const errors: string[] = [];

function assert(condition: boolean, message: string): void {
  if (!condition) errors.push(message);
}

const slugs = EDITORIAL_BLOG_POSTS.map((post) => post.slug);
const titles = EDITORIAL_BLOG_POSTS.map((post) => post.title);
const existingStaticSlugs = fs
  .readdirSync(path.join(root, "src", "app", "blog"), { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && !entry.name.startsWith("["))
  .map((entry) => entry.name);
const knownSlugs = new Set([...slugs, ...existingStaticSlugs]);

assert(EDITORIAL_BLOG_POSTS.length === EXPECTED_COUNT, `expected ${EXPECTED_COUNT} posts, got ${EDITORIAL_BLOG_POSTS.length}`);
assert(new Set(slugs).size === slugs.length, "editorial slugs must be unique");
assert(new Set(titles).size === titles.length, "editorial titles must be unique");
assert(Object.keys(EDITORIAL_PUBLICATION_POLICY).length === EXPECTED_COUNT, "editorial release manifest must cover every draft");
assert(slugs.every((slug) => EDITORIAL_PUBLICATION_POLICY[slug]), "every editorial slug needs explicit release policy");
assert(EDITORIAL_BLOG_POSTS.filter((post) => resolveEditorialPolicy(post).isPublic).length === EXPECTED_PUBLIC_COUNT, `expected ${EXPECTED_PUBLIC_COUNT} reviewed public editorial posts`);
assert(!slugs.some((slug) => existingStaticSlugs.includes(slug)), "editorial slug overlaps an existing static route");

for (const post of EDITORIAL_BLOG_POSTS) {
  const text = [
    post.title,
    post.description,
    ...post.sections.flatMap((section) => [section.title, section.content]),
    ...post.faqs.flatMap((faq) => [faq.question, faq.answer]),
  ].join(" ");
  const sectionIds = post.sections.map((section) => section.id);
  const imageFile = path.join(root, "public", post.imagePath.replace(/^\//, ""));

  assert(post.sections.length >= MIN_SECTIONS, `${post.slug}: needs >=${MIN_SECTIONS} sections`);
  assert(new Set(sectionIds).size === sectionIds.length, `${post.slug}: section ids must be unique`);
  assert(post.faqs.length >= MIN_FAQS, `${post.slug}: needs >=${MIN_FAQS} FAQs`);
  assert(text.replace(/\s+/g, "").length >= MIN_TEXT_LENGTH, `${post.slug}: text is below ${MIN_TEXT_LENGTH} chars`);
  assert(post.sources.length >= 2, `${post.slug}: needs at least two official sources`);
  assert(post.sources.every((source) => source.url.startsWith("https://")), `${post.slug}: source URLs must use HTTPS`);
  const policy = resolveEditorialPolicy(post);
  assert(!policy.canServeAds || policy.reviewStatus === "verified", `${post.slug}: ads require verified review`);
  assert(!policy.isIndexable || policy.isPublic, `${post.slug}: indexable content must be public`);
  assert(post.internalLinks.length >= 2, `${post.slug}: needs at least two internal links`);
  assert(post.internalLinks.every((link) => link.href.startsWith("/")), `${post.slug}: internal links must be site-relative`);
  assert(post.relatedSlugs.every((slug) => knownSlugs.has(slug)), `${post.slug}: unknown related slug`);
  assert(fs.existsSync(imageFile), `${post.slug}: image is missing (${post.imagePath})`);

  if (fs.existsSync(imageFile)) {
    const svg = fs.readFileSync(imageFile, "utf8");
    assert(/<svg\b/.test(svg), `${post.slug}: image is not SVG`);
    assert(/width="1200"/.test(svg) && /height="630"/.test(svg), `${post.slug}: SVG must be 1200x630`);
    assert(!/<script\b|(?:href|xlink:href)="https?:\/\//i.test(svg), `${post.slug}: SVG must not contain scripts or remote references`);
  }
}

assert(new Set(EDITORIAL_BLOG_POSTS.map((post) => post.imagePath)).size === EXPECTED_COUNT, "image paths must be unique");

const listSource = fs.readFileSync(path.join(root, "src", "app", "blog", "page.tsx"), "utf8");
const detailSource = fs.readFileSync(path.join(root, "src", "app", "blog", "[slug]", "page.tsx"), "utf8");
const sitemapSource = fs.readFileSync(path.join(root, "src", "app", "sitemap.ts"), "utf8");
const middlewareSource = fs.readFileSync(path.join(root, "src", "middleware.ts"), "utf8");
assert(listSource.includes("getPublicEditorialPosts") && listSource.includes("CURATED_POSTS"), "blog list does not use public editorial policy");
assert(detailSource.includes("getPublicEditorialPostBySlug") && detailSource.includes("EditorialArticle"), "detail route does not enforce public editorial policy");
assert(detailSource.includes("generateStaticParams") && detailSource.includes("getPublicEditorialPosts"), "editorial static params do not enforce public policy");
assert(detailSource.includes("pageEligible={resolveEditorialPolicy(post).canServeAds}"), "editorial ads do not enforce ad policy");
assert(sitemapSource.includes("getPublicEditorialPosts") && sitemapSource.includes("isIndexable"), "sitemap does not enforce editorial index policy");
assert(middlewareSource.includes("isPrivateEditorialSlug") && middlewareSource.includes('status: 404'), "middleware does not return an explicit 404 for private editorial slugs");

if (errors.length > 0) {
  console.error(`EDITORIAL_CONTENT_VERIFY_FAILED (${errors.length})`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`EDITORIAL_CONTENT_VERIFY_PASS posts=${EXPECTED_COUNT} images=${EXPECTED_COUNT} minText=${MIN_TEXT_LENGTH}`);
  console.log(slugs.join("\n"));
}
