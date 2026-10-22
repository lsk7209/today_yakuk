/**
 * Editorial blog post types for local content registry.
 * These posts are rendered statically without DB access.
 */

export interface EditorialSection {
  id: string;
  title: string;
  content: string; // Plain text content (rendered as paragraphs)
}

export interface EditorialFAQ {
  question: string;
  answer: string;
}

export interface EditorialSource {
  name: string;
  url: string;
  description: string;
}

export interface EditorialInternalLink {
  title: string;
  href: string;
}

export interface EditorialBlogPost {
  slug: string;
  title: string;
  description: string;
  tag: string;
  publishedAt: string; // ISO date string
  updatedAt: string;
  imagePath: string; // relative path under /blog-images/
  sections: EditorialSection[];
  faqs: EditorialFAQ[];
  sources: EditorialSource[];
  internalLinks: EditorialInternalLink[];
  relatedSlugs: string[];
  /** Explicit, independent release controls. Missing fields resolve fail-closed as draft/noindex/ads-off. */
  publication_status?: "published" | "draft" | "quarantined" | "retired" | "merged";
  index_policy?: "index" | "noindex";
  ads_eligible?: boolean;
  review_status?: "unreviewed" | "needs_review" | "verified";
  reviewed_content_hash?: string;
  content_hash?: string;
  reviewer_id?: string;
  source_count?: number;
}
