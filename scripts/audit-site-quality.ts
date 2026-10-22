import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import { createClient } from "@libsql/client";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const dbUrl = process.env.TURSO_DATABASE_URL;
const dbToken = process.env.TURSO_AUTH_TOKEN;
if (!dbUrl || !dbToken) throw new Error("Read-only audit requires Turso environment variables.");

const outputDir = path.resolve(process.cwd(), "docs/site-quality");
fs.mkdirSync(outputDir, { recursive: true });
const db = createClient({ url: dbUrl, authToken: dbToken });
const site = "https://todaypharm.kr";

const csv = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""').replace(/[\r\n]+/g, " ")}"`;
const line = (values: unknown[]) => values.map(csv).join(",");
const hash = (value: string) => crypto.createHash("sha256").update(value).digest("hex");
const text = (value: unknown) => String(value ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
const normalize = (value: string) => value.toLowerCase().replace(/\d+/g, "#").replace(/[^\p{L}\p{N}]+/gu, " ").trim();
const wikiSlug = (name: unknown, id: unknown) => `${String(name || "item").normalize("NFKC").toLowerCase().replace(/&/g, " and ").replace(/[^0-9a-z가-힣ㄱ-ㅎㅏ-ㅣ]+/g, "-").replace(/-{2,}/g, "-").replace(/^-+|-+$/g, "").slice(0, 80).replace(/^-+|-+$/g, "") || "item"}-${id}`;
const jsonCount = (value: unknown) => {
  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    return Array.isArray(parsed) ? parsed.length : parsed && typeof parsed === "object" ? Object.keys(parsed).length : 0;
  } catch { return 0; }
};

const RISK_PATTERNS = [
  /약사.{0,8}(검수|검증|추천)/g,
  /의사.{0,8}(검수|검증|추천)/g,
  /전문가.{0,8}(검수|검증|인증)/g,
  /처방전.{0,20}(3일|유효기간|사용기간)/g,
  /(임산부|영유아|어린이|소아).{0,30}(복용량|용량|안전|간격)/g,
  /\b\d+(?:\.\d+)?%/g,
  /(치료|예방).{0,12}(효과|효능)/g,
];

async function all(sql: string) {
  return (await db.execute(sql)).rows;
}

async function main() {
  const [content, pharmacies, supplements, medicines] = await Promise.all([
    all("SELECT * FROM content_queue ORDER BY slug"),
    all("SELECT hpid,name,address,tel,operating_hours,province,city,updated_at FROM pharmacies ORDER BY hpid"),
    all("SELECT id,product_report_no,name,manufacturer,nutrition_facts,additives,ai_summary,tags,created_at FROM supplements ORDER BY id"),
    all("SELECT id,item_seq,name,manufacturer,efficacy,use_method,warning_general,warning_usage,interactions,side_effects,storage_method,created_at,updated_at FROM medicines ORDER BY id"),
  ]);

  const inventory: string[] = [line([
    "entity_id","url","route_type","title","content_source","publication_status","review_status","robots_policy","ads_eligible","canonical","sitemap_included","updated_at","content_hash","author_id","reviewer_id","source_count","medical_risk","duplicate_cluster","missing_fields","traffic_status","proposed_action","reason","evidence_location",
  ])];
  const decisions: string[] = [line(["entity_id","url","decision","score","reason","duplicate_cluster","medical_risk","publication_status","index_policy","ads_eligible","review_status","replacement_url","evidence_location"])];
  const claims: string[] = [line(["url","location","original_claim","risk","source_name","source_url","source_date","accessed_at","support_status","professional_review_needed","proposed_revision","final_status"])];

  const duplicateCounts = new Map<string, number>();
  for (const row of content) {
    const body = text(row.content_html || row.ai_summary);
    const cluster = hash(normalize(body));
    duplicateCounts.set(cluster, (duplicateCounts.get(cluster) || 0) + 1);
  }

  const appDir = path.resolve(process.cwd(), "src/app");
  const staticPages: string[] = [];
  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name === "page.tsx" && !full.includes("[")) staticPages.push(full);
    }
  };
  walk(appDir);
  const staticSitemapRoutes = new Set(["/", "/about", "/contact", "/privacy", "/terms", "/nearby", "/wiki", "/guide", "/blog"]);
  for (const file of staticPages) {
    const relative = path.relative(appDir, path.dirname(file)).replace(/\\/g, "/");
    const route = relative === "" ? "/" : `/${relative}`;
    const source = fs.readFileSync(file, "utf8");
    const visible = text(source);
    const riskMatches = RISK_PATTERNS.flatMap((pattern) => [...source.matchAll(pattern)].map((m) => m[0]));
    const isBlog = route.startsWith("/blog/");
    const decision = riskMatches.length ? "HOLD" : isBlog ? "REWRITE" : "KEEP";
    const reason = riskMatches.length ? "source-code medical/institutional/numeric claim candidate" : isBlog ? "static article requires source-by-source editorial review" : "core service or policy route";
    inventory.push(line([`static:${route}`,`${site}${route}`,isBlog ? "blog_static" : "static_page",route,"app-router source","published",isBlog ? "unreviewed" : "code_reviewed",riskMatches.length ? "review_required" : "index",false,`${site}${route}`,staticSitemapRoutes.has(route),fs.statSync(file).mtime.toISOString(),hash(source),"repository","",0,riskMatches.length ? "candidate" : "low","","source-review", "unverified",decision,reason,path.relative(process.cwd(), file).replace(/\\/g, "/")]));
    if (isBlog) decisions.push(line([`static:${route}`,`${site}${route}`,decision,Math.max(0,60-riskMatches.length*15),reason,"",riskMatches.length ? "candidate" : "not_detected","published",riskMatches.length ? "review_required" : "index",false,"unreviewed","",path.relative(process.cwd(), file).replace(/\\/g, "/")]));
    for (const claim of riskMatches) claims.push(line([`${site}${route}`,path.relative(process.cwd(), file).replace(/\\/g, "/"),claim,"review_required","","","","2026-09-12","source_verification_pending",/임산부|영유아|어린이|소아|복용량|용량/.test(claim),"remove or rewrite only after primary-source verification","HOLD"]));
  }

  for (const row of content) {
    const body = text(row.content_html || row.ai_summary);
    const cluster = hash(normalize(body));
    const duplicateCount = duplicateCounts.get(cluster) || 1;
    const status = String(row.status || "pending");
    const publication = String(row.publication_status || (status === "published" ? "published" : "draft"));
    const review = String(row.review_status || (status === "published" ? "unreviewed" : "needs_review"));
    const index = String(row.index_policy || (status === "published" ? "index" : "noindex"));
    const riskMatches = RISK_PATTERNS.flatMap((pattern) => [...body.matchAll(pattern)].map((m) => m[0]));
    const missing = [!row.title && "title", !body && "body", !row.slug && "slug", Number(row.source_count || 0) < 1 && "sources", !row.reviewer_id && "reviewer"].filter(Boolean).join("|");
    let decision = "REWRITE";
    let reason = "legacy published content requires source and editorial review";
    if (publication !== "published") { decision = "HOLD"; reason = "not publicly published"; }
    else if (riskMatches.length) { decision = "HOLD"; reason = "unverified medical/institutional/numeric claim candidate"; }
    else if (duplicateCount > 1) { decision = "MERGE"; reason = "exact normalized body duplicate cluster"; }
    else if (body.length >= 1200 && Number(row.source_count || 0) > 0) { decision = "KEEP"; reason = "substantive body with recorded source; manual review still required"; }
    const score = Math.min(100, Math.round(body.length / 80) + Math.min(25, Number(row.source_count || 0) * 5) - riskMatches.length * 15 - (duplicateCount > 1 ? 20 : 0));
    const url = `${site}/blog/${row.slug}`;
    inventory.push(line([row.id,url,"blog_dynamic",row.title,"turso.content_queue",publication,review,index,row.ads_eligible === 1,url,publication === "published" && index === "index",row.updated_at,hash(body),"unrecorded",row.reviewer_id || "",row.source_count || 0,riskMatches.length ? "candidate" : "not_detected",duplicateCount > 1 ? cluster : "",missing,"unverified",decision,reason,"read-only Turso metadata/content audit"]));
    decisions.push(line([row.id,url,decision,score,reason,duplicateCount > 1 ? cluster : "",riskMatches.length ? "candidate" : "not_detected",publication,index,row.ads_eligible === 1,review,row.replacement_url || "","read-only Turso audit"]));
    for (const claim of riskMatches) claims.push(line([url,"body",claim,"review_required","","","","2026-09-12","source_verification_pending",/임산부|영유아|어린이|소아|복용량|용량/.test(claim),"remove or rewrite only after primary-source verification","HOLD"]));
  }

  for (const row of pharmacies) {
    const hoursCount = jsonCount(row.operating_hours);
    const missing = [!row.address && "address", !row.tel && "tel", !hoursCount && "hours"].filter(Boolean).join("|");
    const url = `${site}/pharmacy/${row.hpid}`;
    inventory.push(line([row.hpid,url,"pharmacy_detail",row.name,"turso.pharmacies","published","data_review_pending",missing ? "noindex_candidate" : "index",false,url,false,row.updated_at,hash(text(`${row.name}|${row.address}|${row.tel}|${row.operating_hours}`)),"public_data","","1","low","",missing,"unverified",missing ? "REWRITE" : "KEEP",missing ? "missing operational fields" : "usable public-data record","read-only Turso metadata audit; coordinates excluded"]));
  }

  for (const row of supplements) {
    const dataCount = jsonCount(row.nutrition_facts) + jsonCount(row.tags) + (row.ai_summary ? 1 : 0);
    const missing = [!row.manufacturer && "manufacturer", !jsonCount(row.nutrition_facts) && "nutrition", !row.ai_summary && "summary"].filter(Boolean).join("|");
    const url = `${site}/wiki/product/${wikiSlug(row.name, row.id)}`;
    inventory.push(line([row.id,url,"wiki_supplement",row.name,"turso.supplements","published","unreviewed",dataCount ? "index_candidate" : "noindex_candidate",false,url,dataCount > 0,row.created_at,hash(text(`${row.product_report_no}|${row.name}|${row.manufacturer}|${row.nutrition_facts}|${row.ai_summary}`)),"public_data","","1","medium","",missing,"unverified",dataCount ? "REWRITE" : "HOLD",dataCount ? "needs type/source/value review" : "insufficient product fields","read-only Turso metadata audit"]));
  }

  for (const row of medicines) {
    const body = text([row.efficacy,row.use_method,row.warning_general,row.warning_usage,row.interactions,row.side_effects,row.storage_method].join(" "));
    const missing = [!row.manufacturer && "manufacturer", !row.efficacy && "efficacy", !row.warning_general && "warning"].filter(Boolean).join("|");
    const url = `${site}/wiki/medicine/${wikiSlug(row.name, row.id)}`;
    inventory.push(line([row.id,url,"wiki_medicine",row.name,"turso.medicines","published","unreviewed",body.length > 200 ? "index_candidate" : "noindex_candidate",false,url,body.length > 200,row.updated_at || row.created_at,hash(body),"public_data","","1","high","",missing,"unverified",body.length > 200 ? "REWRITE" : "HOLD","medical source content requires type and display review","read-only Turso metadata audit"]));
  }

  fs.writeFileSync(path.join(outputDir, "URL_INVENTORY.csv"), `${inventory.join("\n")}\n`, "utf8");
  fs.writeFileSync(path.join(outputDir, "CONTENT_DECISIONS.csv"), `${decisions.join("\n")}\n`, "utf8");
  fs.writeFileSync(path.join(outputDir, "CLAIM_REVIEW.csv"), `${claims.join("\n")}\n`, "utf8");
  console.log(JSON.stringify({ content: content.length, staticPages: staticPages.length, pharmacies: pharmacies.length, supplements: supplements.length, medicines: medicines.length, inventoryRows: inventory.length - 1, decisions: decisions.length - 1, claimCandidates: claims.length - 1 }, null, 2));
}

main().finally(() => db.close()).catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
