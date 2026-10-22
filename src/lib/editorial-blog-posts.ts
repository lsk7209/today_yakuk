/**
 * Editorial blog posts registry.
 * 10 high-quality local posts with full content, FAQs, and source citations.
 * Rendered statically without DB access.
 */
import type { EditorialBlogPost } from "./editorial-blog-types";
import { post01 } from "./editorial-posts/post-01-medicine-info-check";
import { post02 } from "./editorial-posts/post-02-same-ingredient-compare";
import { post03 } from "./editorial-posts/post-03-pharmacy-stock-inquiry";
import { post04 } from "./editorial-posts/post-04-adverse-reaction-record";
import { post05 } from "./editorial-posts/post-05-storage-label-reading";
import { post06 } from "./editorial-posts/post-06-health-food-info";
import { post07 } from "./editorial-posts/post-07-supplement-overlap-check";
import { post08 } from "./editorial-posts/post-08-medication-schedule";
import { post09 } from "./editorial-posts/post-09-travel-medicine-prep";
import { post10 } from "./editorial-posts/post-10-pharmacy-counseling-record";
import { resolveContentPolicy } from "./content-policy";
import { getEditorialPublicationPolicy } from "./editorial-publication-manifest";

export const EDITORIAL_BLOG_POSTS: EditorialBlogPost[] = [
  post01,
  post02,
  post03,
  post04,
  post05,
  post06,
  post07,
  post08,
  post09,
  post10,
];

export function getEditorialPostBySlug(slug: string): EditorialBlogPost | undefined {
  return EDITORIAL_BLOG_POSTS.find((p) => p.slug === slug);
}

export function resolveEditorialPolicy(post: EditorialBlogPost) {
  return resolveContentPolicy({ ...post, ...getEditorialPublicationPolicy(post.slug) });
}

export function getPublicEditorialPosts(): EditorialBlogPost[] {
  return EDITORIAL_BLOG_POSTS.filter((post) => resolveEditorialPolicy(post).isPublic);
}

export function getPublicEditorialPostBySlug(slug: string): EditorialBlogPost | undefined {
  const post = getEditorialPostBySlug(slug);
  return post && resolveEditorialPolicy(post).isPublic ? post : undefined;
}

export function getAllEditorialSlugs(): string[] {
  return EDITORIAL_BLOG_POSTS.map((p) => p.slug);
}
