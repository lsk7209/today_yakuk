import React from "react";

type JsonLdProps<T extends Record<string, unknown>> = {
  /** JSON-LD object (already structured as schema.org JSON) */
  data: T;
  /** Optional stable id for the <script> tag */
  id?: string;
};

/**
 * Reusable JSON-LD injector (Server Component).
 * - Avoids duplicating dangerouslySetInnerHTML blocks across pages
 * - Keeps schema injection consistent and reviewable
 */
export function JsonLd<T extends Record<string, unknown>>({ data, id }: JsonLdProps<T>) {
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}


