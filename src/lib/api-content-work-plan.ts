export type ApiContentCandidate = {
  kind: "new" | "changed";
  routeType: "pharmacy_detail" | "wiki_medicine" | "wiki_supplement";
  entityId: string;
  title: string;
  missingFields: string;
  reviewRequirement: string;
};

export type ApiContentReadiness = "ready_for_review" | "source_fields_required";
export type ApiContentPriority = "P1" | "P2" | "HOLD";

export type ApiContentWorkItem = ApiContentCandidate & {
  readiness: ApiContentReadiness;
  priority: ApiContentPriority;
  workType: "create_or_refresh_detail" | "refresh_existing_detail" | "review_existing_wiki" | "fill_source_fields";
};

export function planApiContentWork(candidate: ApiContentCandidate): ApiContentWorkItem {
  if (candidate.missingFields) {
    return { ...candidate, readiness: "source_fields_required", priority: "HOLD", workType: "fill_source_fields" };
  }

  if (candidate.routeType === "pharmacy_detail") {
    return {
      ...candidate,
      readiness: "ready_for_review",
      priority: candidate.kind === "new" ? "P1" : "P2",
      workType: candidate.kind === "new" ? "create_or_refresh_detail" : "refresh_existing_detail",
    };
  }

  return { ...candidate, readiness: "ready_for_review", priority: "P2", workType: "review_existing_wiki" };
}

const priorityOrder: Record<ApiContentPriority, number> = { P1: 0, P2: 1, HOLD: 2 };

export function sortApiContentWork(items: ApiContentWorkItem[]): ApiContentWorkItem[] {
  return [...items].sort((a, b) =>
    priorityOrder[a.priority] - priorityOrder[b.priority]
    || a.routeType.localeCompare(b.routeType)
    || a.entityId.localeCompare(b.entityId),
  );
}
