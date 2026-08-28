export type HighlightRule = Readonly<{
  pattern: RegExp;
  className: string;
}>;

export function escapeHtmlText(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function highlightSafeText(value: string, rules: readonly HighlightRule[]): string {
  return rules.reduce(
    (html, rule) =>
      html.replace(
        rule.pattern,
        (match) => `<strong class="${escapeHtmlText(rule.className)}">${match}</strong>`,
      ),
    escapeHtmlText(value),
  );
}
