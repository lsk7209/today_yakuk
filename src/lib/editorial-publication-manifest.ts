import type { ContentPolicyFields } from "./content-policy";

/** Lightweight release manifest: safe to import from middleware without bundling draft bodies. */
export const EDITORIAL_PUBLICATION_POLICY: Record<string, ContentPolicyFields> = {
  "medicine-info-check-by-name": { publication_status: "draft", index_policy: "noindex", ads_eligible: false, review_status: "needs_review" },
  "same-ingredient-compare-checklist": { publication_status: "draft", index_policy: "noindex", ads_eligible: false, review_status: "needs_review" },
  "pharmacy-stock-inquiry-prep": { publication_status: "draft", index_policy: "noindex", ads_eligible: false, review_status: "needs_review" },
  "adverse-reaction-record-guide": { publication_status: "draft", index_policy: "noindex", ads_eligible: false, review_status: "needs_review" },
  "medicine-storage-label-reading": { publication_status: "draft", index_policy: "noindex", ads_eligible: false, review_status: "needs_review" },
  "health-food-function-info-check": { publication_status: "draft", index_policy: "noindex", ads_eligible: false, review_status: "needs_review" },
  "supplement-overlap-check-method": { publication_status: "draft", index_policy: "noindex", ads_eligible: false, review_status: "needs_review" },
  "medication-schedule-planner": { publication_status: "draft", index_policy: "noindex", ads_eligible: false, review_status: "needs_review" },
  "travel-medicine-prep-guide": { publication_status: "draft", index_policy: "noindex", ads_eligible: false, review_status: "needs_review" },
  "pharmacy-counseling-record-tips": { publication_status: "draft", index_policy: "noindex", ads_eligible: false, review_status: "needs_review" },
};

export function getEditorialPublicationPolicy(slug: string): ContentPolicyFields | undefined {
  return EDITORIAL_PUBLICATION_POLICY[slug];
}

export function isPrivateEditorialSlug(slug: string): boolean {
  const status = getEditorialPublicationPolicy(slug)?.publication_status;
  return Boolean(status && status !== "published");
}
