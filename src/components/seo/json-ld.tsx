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

// ================== Schema Builders ==================

export interface ArticleSchemaProps {
  headline: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified?: string;
  authorName?: string;
  publisherName?: string;
  publisherLogo?: string;
  image?: string;
}

export function buildArticleSchema({
  headline,
  description,
  url,
  datePublished,
  dateModified,
  authorName = "약국오늘",
  publisherName = "약국오늘",
  publisherLogo = "/favicon.ico",
  image,
}: ArticleSchemaProps) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    url,
    datePublished,
    dateModified: dateModified || datePublished,
    author: {
      "@type": "Organization",
      name: authorName,
    },
    publisher: {
      "@type": "Organization",
      name: publisherName,
      logo: {
        "@type": "ImageObject",
        url: publisherLogo,
      },
    },
    ...(image && {
      image: {
        "@type": "ImageObject",
        url: image,
      },
    }),
  };
}

export interface FAQItem {
  question: string;
  answer: string;
}

export function buildFAQSchema(items: FAQItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export interface WebSiteSchemaProps {
  name: string;
  url: string;
  description?: string;
  searchUrl?: string;
}

export function buildWebSiteSchema({
  name,
  url,
  description,
  searchUrl,
}: WebSiteSchemaProps) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    url,
    ...(description && { description }),
    ...(searchUrl && {
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: searchUrl,
        },
        "query-input": "required name=search_term_string",
      },
    }),
  };
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function buildBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// ================== HowTo Schema ==================

export interface HowToStep {
  name: string;
  text: string;
  image?: string;
  url?: string;
}

export interface HowToSchemaProps {
  name: string;
  description: string;
  totalTime?: string; // ISO 8601 duration, e.g., "PT5M" for 5 minutes
  steps: HowToStep[];
  image?: string;
}

export function buildHowToSchema({
  name,
  description,
  totalTime,
  steps,
  image,
}: HowToSchemaProps) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    description,
    ...(totalTime && { totalTime }),
    ...(image && { image }),
    step: steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.name,
      text: step.text,
      ...(step.image && { image: step.image }),
      ...(step.url && { url: step.url }),
    })),
  };
}

// ================== Organization Schema ==================

export interface OrganizationSchemaProps {
  name: string;
  url: string;
  logo?: string;
  description?: string;
  contactEmail?: string;
}

export function buildOrganizationSchema({
  name,
  url,
  logo,
  description,
  contactEmail,
}: OrganizationSchemaProps) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url,
    ...(logo && { logo: { "@type": "ImageObject", url: logo } }),
    ...(description && { description }),
    ...(contactEmail && {
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer service",
        email: contactEmail,
        availableLanguage: "Korean",
      },
    }),
  };
}

// ================== ItemList Schema ==================

export interface ItemListItem {
  name: string;
  url: string;
  description?: string;
  image?: string;
}

export interface ItemListSchemaProps {
  name: string;
  description?: string;
  items: ItemListItem[];
}

export function buildItemListSchema({
  name,
  description,
  items,
}: ItemListSchemaProps) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    ...(description && { description }),
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: item.url,
      ...(item.description && { description: item.description }),
      ...(item.image && { image: item.image }),
    })),
  };
}

