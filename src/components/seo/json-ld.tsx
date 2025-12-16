import React from "react";

type JsonLdProps = {
  /** JSON-LD object or array. Will be JSON.stringify'd into a <script type="application/ld+json" /> */
  data: unknown;
  /** Optional stable id for the <script> tag */
  id?: string;
};

function safeJsonStringify(value: unknown): string {
  // Prevent "</script" from breaking out of the tag in edge cases
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

/**
 * Reusable JSON-LD injector (Server Component).
 * - Avoids duplicating dangerouslySetInnerHTML blocks across pages
 * - Keeps schema injection consistent and reviewable
 */
export function JsonLd({ data, id }: JsonLdProps) {
  return (
    <script
      id={id}
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: safeJsonStringify(data) }}
    />
  );
}


