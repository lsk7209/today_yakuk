export type PublicationStatus = "published" | "draft" | "quarantined" | "retired" | "merged";
export type IndexPolicy = "index" | "noindex";
export type ReviewStatus = "unreviewed" | "needs_review" | "verified";

export type ContentPolicyFields = {
  status?: string | null;
  publication_status?: PublicationStatus | null;
  index_policy?: IndexPolicy | null;
  ads_eligible?: boolean | number | null;
  review_status?: ReviewStatus | null;
  reviewed_content_hash?: string | null;
  content_hash?: string | null;
  reviewer_id?: string | null;
  source_count?: number | null;
  replacement_url?: string | null;
};

export type ResolvedContentPolicy = {
  publicationStatus: PublicationStatus;
  indexPolicy: IndexPolicy;
  adsEligible: boolean;
  reviewStatus: ReviewStatus;
  isPublic: boolean;
  isIndexable: boolean;
  canServeAds: boolean;
  needsReReview: boolean;
  replacementUrl: string | null;
};

/**
 * Compatibility rule: legacy `status=published` stays public and indexable when
 * the additive policy columns have not been backfilled yet. New records still
 * default to draft/needs_review/ads off in the schema migration.
 */
export function resolveContentPolicy(fields: ContentPolicyFields): ResolvedContentPolicy {
  const legacyPublished = fields.status === "published";
  const publicationStatus = fields.publication_status ?? (legacyPublished ? "published" : "draft");
  const reviewStatus = fields.review_status ?? (legacyPublished ? "unreviewed" : "needs_review");
  const indexPolicy = fields.index_policy ?? (legacyPublished ? "index" : "noindex");
  const isPublic = publicationStatus === "published";
  const needsReReview = Boolean(
    fields.reviewed_content_hash &&
    fields.content_hash &&
    fields.reviewed_content_hash !== fields.content_hash,
  );
  const adsEligible = fields.ads_eligible === true || fields.ads_eligible === 1;

  return {
    publicationStatus,
    indexPolicy,
    adsEligible,
    reviewStatus,
    isPublic,
    isIndexable: isPublic && indexPolicy === "index",
    canServeAds:
      isPublic &&
      adsEligible &&
      reviewStatus === "verified" &&
      Boolean(fields.reviewer_id) &&
      Number(fields.source_count ?? 0) > 0 &&
      Boolean(fields.content_hash) &&
      fields.content_hash === fields.reviewed_content_hash &&
      !needsReReview,
    needsReReview,
    replacementUrl: fields.replacement_url ?? null,
  };
}
