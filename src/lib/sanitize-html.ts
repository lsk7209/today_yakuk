import sanitizeHtml from "sanitize-html";

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [...sanitizeHtml.defaults.allowedTags, "img"],
  allowedAttributes: {
    "*": ["class", "title", "aria-label", "aria-describedby", "role"],
    a: ["href", "name", "target", "rel"],
    img: ["src", "srcset", "sizes", "alt", "title", "width", "height", "loading", "decoding"],
    ol: ["start"],
    li: ["value"],
    td: ["colspan", "rowspan"],
    th: ["colspan", "rowspan", "scope"],
    time: ["datetime"],
    data: ["value"],
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedSchemesByTag: {
    img: ["http", "https"],
  },
  allowProtocolRelative: false,
  enforceHtmlBoundary: true,
  transformTags: {
    a: (tagName, attribs) => {
      const safeAttributes = { ...attribs };
      if (safeAttributes.target === "_blank") {
        safeAttributes.rel = "nofollow noopener noreferrer";
      }
      return { tagName, attribs: safeAttributes };
    },
  },
};

export function sanitizeTrustedHtml(html: string | null | undefined) {
  if (!html) return "";
  return sanitizeHtml(html, SANITIZE_OPTIONS);
}
