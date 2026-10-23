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

/**
 * 정적 라우트(src/app/blog/<slug>/page.tsx)로 존재하는 글의 공개 정책.
 * 목록에 없는 슬러그는 기존처럼 공개로 취급한다. noindex 메타만으로는 비공개가 아니므로
 * proxy.ts가 비공개 슬러그를 관리자 미리보기 외에는 404로 응답한다.
 */
export const STATIC_BLOG_PUBLICATION_POLICY: Record<string, ContentPolicyFields> = {
  "supplement-label-reading-guide": { publication_status: "draft", index_policy: "noindex", ads_eligible: false, review_status: "needs_review" },
  "supplement-additives-label-guide": { publication_status: "draft", index_policy: "noindex", ads_eligible: false, review_status: "needs_review" },
  "data-update-2026-08": { publication_status: "draft", index_policy: "noindex", ads_eligible: false, review_status: "needs_review" },
};

/** 편집 글과 정적 글을 합쳐 공개 여부를 판단하는 단일 진입점. */
export function isPrivateBlogSlug(slug: string): boolean {
  const policy = STATIC_BLOG_PUBLICATION_POLICY[slug] ?? EDITORIAL_PUBLICATION_POLICY[slug];
  return Boolean(policy?.publication_status && policy.publication_status !== "published");
}
