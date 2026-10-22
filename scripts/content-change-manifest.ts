import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

type RecordState = {
  content_id: string;
  content: string;
  publication_status: string;
  index_policy: string;
  ads_eligible: boolean;
  review_status: string;
  replacement_url?: string;
};

type Change = {
  content_id: string;
  url: string;
  before_status: string;
  after_status: string;
  before_index_policy: string;
  after_index_policy: string;
  before_ads_policy: string;
  after_ads_policy: string;
  action: string;
  reason: string;
  replacement_url: string;
  source_content_hash: string;
  review_status: string;
  before_review_status?: string;
  before_replacement_url?: string;
  decision_at: string;
};

const args = new Set(process.argv.slice(2));
const valueArg = (name: string) => process.argv.slice(2).find((arg) => arg.startsWith(`${name}=`))?.slice(name.length + 1);
const manifestPath = valueArg("--manifest");
const snapshotPath = valueArg("--snapshot");
const outputPath = valueArg("--output");
const apply = args.has("--apply");
const rollback = args.has("--rollback");
const environment = valueArg("--environment") || "dry-run";

if (!manifestPath || !snapshotPath) throw new Error("--manifest and --snapshot are required");
if ((apply || rollback) && environment !== "copy") throw new Error("Writes are allowed only with --environment=copy");
if ((apply || rollback) && !outputPath) throw new Error("--output is required for copy writes");

function parseCsv(input: string): Change[] {
  const rows: string[][] = [];
  let row: string[] = [], cell = "", quoted = false;
  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    if (char === '"' && quoted && input[i + 1] === '"') { cell += '"'; i += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === "," && !quoted) { row.push(cell); cell = ""; }
    else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && input[i + 1] === "\n") i += 1;
      row.push(cell); if (row.some(Boolean)) rows.push(row); row = []; cell = "";
    } else cell += char;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  const [headers, ...data] = rows;
  return data.map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] || ""])) as Change);
}

const digest = (content: string) => crypto.createHash("sha256").update(content).digest("hex");
const changes = parseCsv(fs.readFileSync(path.resolve(manifestPath), "utf8"));
const records = JSON.parse(fs.readFileSync(path.resolve(snapshotPath), "utf8")) as RecordState[];
const byId = new Map(records.map((record) => [record.content_id, record]));
const seen = new Set<string>();
const results: Array<Record<string, unknown>> = [];
const validated: Array<{ change: Change; record: RecordState; desiredStatus: string }> = [];

for (const change of changes) {
  if (seen.has(change.content_id)) throw new Error(`Duplicate manifest content_id: ${change.content_id}`);
  seen.add(change.content_id);
  const record = byId.get(change.content_id);
  if (!record) { results.push({ content_id: change.content_id, status: "missing" }); continue; }
  if (digest(record.content) !== change.source_content_hash) {
    results.push({ content_id: change.content_id, status: "conflict", reason: "content_hash_changed" });
    continue;
  }
  const expectedStatus = rollback ? change.after_status : change.before_status;
  const desiredStatus = rollback ? change.before_status : change.after_status;
  if (record.publication_status === desiredStatus) {
    results.push({ content_id: change.content_id, status: "already_applied" });
    continue;
  }
  if (record.publication_status !== expectedStatus) {
    results.push({ content_id: change.content_id, status: "conflict", reason: "state_changed" });
    continue;
  }
  validated.push({ change, record, desiredStatus });
  results.push({ content_id: change.content_id, status: apply || rollback ? "validated" : "would_apply" });
}

const blocking = results.some((result) => result.status === "missing" || result.status === "conflict");
if ((apply || rollback) && blocking) {
  throw new Error("Manifest preflight failed; no output was written and no records were changed");
}
if (apply || rollback) {
  for (const { change, record, desiredStatus } of validated) {
    record.publication_status = desiredStatus;
    record.index_policy = rollback ? change.before_index_policy : change.after_index_policy;
    record.ads_eligible = (rollback ? change.before_ads_policy : change.after_ads_policy) === "true";
    record.review_status = rollback ? (change.before_review_status || "unreviewed") : change.review_status;
    const replacement = rollback ? change.before_replacement_url : change.replacement_url;
    if (replacement) record.replacement_url = replacement;
    else delete record.replacement_url;
  }
  for (const result of results) if (result.status === "validated") result.status = "applied";
  fs.writeFileSync(path.resolve(outputPath!), `${JSON.stringify(records, null, 2)}\n`, "utf8");
}
const summary = results.reduce<Record<string, number>>((acc, result) => {
  const status = String(result.status); acc[status] = (acc[status] || 0) + 1; return acc;
}, {});
console.log(JSON.stringify({ mode: rollback ? "rollback" : apply ? "apply-copy" : "dry-run", environment, summary, results }, null, 2));
