import { createHash } from 'node:crypto';

export type ReviewableContent = {
  slug: string; title: string; hpid?: string | null; image_url?: string | null; content_html?: string | null; ai_summary?: string | null;
  ai_faq?: unknown; ai_bullets?: unknown; ai_cta?: string | null; extra_sections?: unknown;
};
export type PublicationReview = {
  slug: string; digest: string; reviewer: string; scope: string; reviewed_at: string; sources: string[];
};
const normalize = (value: unknown) => {
  if (typeof value !== 'string') return value ?? null;
  try { return JSON.parse(value); } catch { return value; }
};
// Bind all rendered generated fields, rather than a mutable publish date/status.
export function contentReviewDigest(item: ReviewableContent): string {
  return createHash('sha256').update(JSON.stringify([
    item.slug, item.title, item.hpid ?? null, item.image_url ?? null, item.content_html ?? null, item.ai_summary ?? null,
    normalize(item.ai_faq), normalize(item.ai_bullets), item.ai_cta ?? null, normalize(item.extra_sections),
  ])).digest('hex');
}
export function hasPublicationReview(item: ReviewableContent, reviews: PublicationReview[], now = Date.now()): boolean {
  const digest = contentReviewDigest(item);
  return reviews.some(review => review.slug === item.slug && review.digest === digest &&
    Boolean(review.reviewer.trim()) && Boolean(review.scope.trim()) &&
    Number.isFinite(Date.parse(review.reviewed_at)) && Date.parse(review.reviewed_at) <= now &&
    Array.isArray(review.sources) && review.sources.length > 0 && review.sources.every(source => {
      try { return new URL(source).protocol === 'https:'; } catch { return false; }
    }));
}
