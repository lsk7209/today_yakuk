import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import ts from "typescript";
import { createElement } from "react";
import * as jsxRuntime from "react/jsx-runtime";
import { renderToStaticMarkup } from "react-dom/server";

const source = fs.readFileSync(path.join(process.cwd(), "src/app/blog/pregnancy-pharmacy-guide/page.tsx"), "utf8");
const compiled = ts.transpileModule(source, {
  reportDiagnostics: true,
  compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
});
assert.equal(compiled.diagnostics?.filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error).length, 0);

const pageExports = { default: () => createElement("div"), metadata: { alternates: { canonical: "" } } };
vm.runInNewContext(compiled.outputText, {
  exports: pageExports,
  require(id: string) {
    if (id === "react/jsx-runtime") return jsxRuntime;
    if (id === "next/link") return { __esModule: true, default: "a" };
    if (id === "@/lib/seo") return { buildArticleJsonLd: ({ title, description, slug, dateModified }: Record<string, string>) => ({ "@type": "BlogPosting", headline: title, description, url: slug, dateModified }) };
    if (id.endsWith("/AdSlot")) return { AdSlotTop: () => null, AdSlotBottom: () => null };
    throw new Error(`Unexpected pregnancy article dependency: ${id}`);
  },
});

const html = renderToStaticMarkup(createElement(pageExports.default));
const visible = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "");
const schemas = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
  .map((match) => JSON.parse(match[1]));
const faq = schemas.find((schema) => schema["@type"] === "FAQPage");
const article = schemas.find((schema) => schema["@type"] === "BlogPosting");

assert.equal(pageExports.metadata.alternates.canonical, "/blog/pregnancy-pharmacy-guide");
assert.equal(article?.dateModified, "2026-10-23");
assert.ok(faq?.mainEntity?.length >= 3);
for (const question of faq.mainEntity) {
  assert.ok(visible.includes(question.name), `Missing visible FAQ question: ${question.name}`);
  assert.ok(visible.includes(question.acceptedAnswer.text), `Missing visible FAQ answer: ${question.name}`);
}
assert.equal(schemas.some((schema) => schema["@type"] === "HowTo"), false);
for (const url of [
  "https://mfds.go.kr/brd/m_211/view.do?seq=14981",
  "https://www.hira.or.kr/ra/medi/form.do?pgmid=HIRAA030029000000",
  "https://nedrug.mfds.go.kr/pbp/CCBAJ01/getList",
]) assert.ok(html.includes(url.replace(/&/g, "&amp;")), `Missing official source: ${url}`);
assert.match(visible, /전문가 검토.*미완료/);
assert.match(visible, /DUR.*지정.*성분/);
assert.match(visible, /조회.*안전.*보장/);
assert.match(visible, /약국 방문을 기다리지 말고 산부인과 또는 응급의료기관에 즉시 연락/);
for (const claim of [
  /38(?:\.5)?도|24시간/, /400~600|27 mg|1,500~2,000|10,000 IU|하루 2L/,
  /아세트아미노펜|슈도에페드린|락툴로오스|폴리에틸렌글리콜|아목시실린|클래블라네이트/,
  /수유 직후|모유 분비가 적은 시간대|모든 약에는|\.apos;|안전 등급|1등급|2등급/,
]) assert.doesNotMatch(html, claim);
console.log("PASS pregnancy article medical copy, source links, and visible schema parity");
