import assert from "node:assert/strict";
import robots from "../../src/app/robots";

type Rule = { allow?: string | string[]; disallow?: string | string[]; userAgent?: string | string[] };

const REGEX_SPECIALS = new Set([".", "+", "?", "^", "$", "{", "}", "(", ")", "|", "[", "]", "\\"]);

function escapeLiteral(segment: string): string {
  return [...segment].map((ch) => (REGEX_SPECIALS.has(ch) ? String.fromCharCode(92) + ch : ch)).join("");
}

function toRegex(pattern: string): RegExp {
  const anchored = pattern.endsWith("$");
  const raw = anchored ? pattern.slice(0, -1) : pattern;
  const body = raw.split("*").map(escapeLiteral).join(".*");
  return new RegExp(`^${body}${anchored ? "$" : ""}`);
}

// Google의 해석: 일치하는 규칙 중 가장 긴 패턴이 이기고, 길이가 같으면 allow가 이긴다.
function isAllowed(path: string): boolean {
  const rules = robots().rules as Rule[];
  const rule = rules.find((r) => r.userAgent === "*")!;
  const list = (v?: string | string[]) => (v === undefined ? [] : Array.isArray(v) ? v : [v]);
  let best = { len: -1, allow: true };
  for (const [patterns, allow] of [[list(rule.allow), true], [list(rule.disallow), false]] as const) {
    for (const pattern of patterns) {
      if (toRegex(pattern).test(path) && (pattern.length > best.len || (pattern.length === best.len && allow))) {
        best = { len: pattern.length, allow };
      }
    }
  }
  return best.allow;
}

const cases: Array<[string, boolean, string]> = [
  ["/", true, "home"],
  ["/pharmacy/A1100001", true, "pharmacy detail"],
  ["/서울/종로구", true, "region list"],
  ["/서울/종로구?page=2", true, "region pagination"],
  ["/blog/night-pharmacy-3steps", true, "blog article"],
  ["/blog?page=2", true, "blog pagination"],
  ["/wiki", true, "wiki list"],
  ["/wiki?category=vitamin", true, "wiki category"],
  ["/wiki?category=vitamin&page=2", true, "wiki category pagination"],
  ["/wiki?type=medicine", true, "medicine list (noindex must be readable)"],
  ["/wiki?type=medicine&page=2", false, "medicine pagination stays blocked (DB cost)"],
  ["/wiki/tag/비타민?page=2", false, "tag pagination blocked"],
  ["/nearby?q=종로", false, "search query URLs blocked"],
  ["/pharmacy/A1?utm_source=x", false, "tracking parameter variants blocked"],
  ["/admin", false, "admin"],
  ["/api/pharmacies?province=서울", false, "api"],
];

for (const [path, expected, label] of cases) {
  assert.equal(isAllowed(path), expected, `${label}: ${path}`);
}
console.log(`PASS 17. robots.txt result matches the crawl policy table (${cases.length} URL types)`);
