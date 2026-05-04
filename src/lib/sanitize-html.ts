const BLOCKED_TAGS =
  /<\s*(script|style|iframe|object|embed|link|meta|base|form|input|button|textarea|select|option|svg|math)\b[\s\S]*?<\s*\/\s*\1\s*>/gi;
const BLOCKED_SELF_CLOSING_TAGS =
  /<\s*(script|style|iframe|object|embed|link|meta|base|form|input|button|textarea|select|option|svg|math)\b[^>]*\/?\s*>/gi;
const EVENT_HANDLER_ATTRIBUTES = /\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;
const STYLE_ATTRIBUTES = /\s+style\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;
const DANGEROUS_URL_ATTRIBUTES =
  /\s+(href|src|xlink:href|formaction)\s*=\s*(["'])\s*(?:javascript|vbscript|data:text\/html)[\s\S]*?\2/gi;
const DANGEROUS_UNQUOTED_URL_ATTRIBUTES =
  /\s+(href|src|xlink:href|formaction)\s*=\s*(?:javascript|vbscript|data:text\/html)[^\s>]*/gi;

export function sanitizeTrustedHtml(html: string | null | undefined) {
  if (!html) return "";

  return html
    .replace(BLOCKED_TAGS, "")
    .replace(BLOCKED_SELF_CLOSING_TAGS, "")
    .replace(EVENT_HANDLER_ATTRIBUTES, "")
    .replace(STYLE_ATTRIBUTES, "")
    .replace(DANGEROUS_URL_ATTRIBUTES, ' $1="#"')
    .replace(DANGEROUS_UNQUOTED_URL_ATTRIBUTES, ' $1="#"');
}
