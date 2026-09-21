import assert from "node:assert/strict";
import { test } from "node:test";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { checkUsage, parseReads, readConfig } from "./check-turso-usage.mjs";

const usage = (rows_read) => ({ database: { usage: { rows_read } } });
function fixture(responses, overrides = {}) {
  const messages = [];
  const calls = [];
  return {
    messages, calls,
    options: {
      env: { TURSO_PLATFORM_TOKEN: "fixture-secret", ...overrides },
      log: { log: (...args) => messages.push(args.join(" ")), warn: (...args) => messages.push(args.join(" ")) },
      fetchImpl: async (url, options) => {
        calls.push(url);
        assert.ok(options.signal instanceof AbortSignal);
        const body = responses.shift();
        if (body instanceof Error) throw body;
        if (body?.status) return { ok: false, status: body.status };
        return { ok: true, json: async () => { if (body === "invalid-json") throw new Error("private body"); return body; } };
      },
    },
  };
}

test("current API schema preserves reads and true zero; malformed values never become zero", () => {
  assert.equal(parseReads(usage(0)), 0);
  assert.equal(parseReads(usage(855066914)), 855066914);
  assert.equal(parseReads({ database: { total: { rows_read: 12 } } }), 12);
  assert.throws(() => parseReads({ database: { usage: null, total: { rows_read: 12 } } }));
  for (const bad of [null, {}, { total: { rows_read: 100 } }, usage(undefined), usage(null), usage("0"), usage(-1), usage(1.5), usage(Infinity), usage(Number.MAX_SAFE_INTEGER + 1)]) {
    assert.throws(() => parseReads(bad));
  }
});

test("all database values are aggregated and valid zero remains visible", async () => {
  const f = fixture([{ databases: [{ Name: "a" }, { Name: "b" }] }, usage(0), usage(2)]);
  const result = await checkUsage(f.options);
  assert.equal(result.totalReads, 2);
  assert.deepEqual(result.perDb, [["b", 2], ["a", 0]]);
  assert.equal(f.calls.length, 3);
});

test("malformed or duplicate database lists fail before totals", async () => {
  for (const body of [null, {}, { databases: {} }, { databases: [null] }, { databases: [{ Name: "" }] }, { databases: [{ Name: "a" }, { Name: "a" }] }]) {
    const f = fixture([body]);
    await assert.rejects(checkUsage(f.options), /database list/);
    assert.deepEqual(f.messages, []);
  }
});

test("partial failures and HTTP authentication errors cannot publish a green partial total", async () => {
  for (const failure of [{ status: 401 }, { status: 403 }, { status: 404 }, { status: 500 }, {}, new Error("fixture-secret"), "invalid-json"]) {
    const f = fixture([{ databases: [{ Name: "a" }, { Name: "b" }] }, usage(100), failure]);
    await assert.rejects(checkUsage(f.options), err => !err.message.includes("fixture-secret"));
    assert.deepEqual(f.messages, []);
  }
});

test("missing token fails without making a request", async () => {
  const f = fixture([], { TURSO_PLATFORM_TOKEN: "" });
  await assert.rejects(checkUsage(f.options), /not set/);
  assert.equal(f.calls.length, 0);
});

test("alert threshold retains remote warn-only default and explicit fail mode", async () => {
  for (const fail of [false, true]) {
    const f = fixture([{ databases: [{ Name: "a" }] }, usage(80)], { TURSO_READ_LIMIT: "100", TURSO_WARN_PCT: "80", FAIL_ON_TURSO_USAGE_WARN: fail ? "1" : "0" });
    if (fail) await assert.rejects(checkUsage(f.options), /promoted to failure/);
    else assert.equal((await checkUsage(f.options)).totalReads, 80);
    assert.match(f.messages.join("\n"), /::warning::/);
    assert.doesNotMatch(f.messages.join("\n"), /free limit/);
  }
});

test("invalid budgets and unsafe totals fail", async () => {
  assert.deepEqual(readConfig({}), { readLimit: 500000000, warnPct: 80, failOnWarn: false });
  for (const env of [{ TURSO_READ_LIMIT: "0" }, { TURSO_READ_LIMIT: "-1" }, { TURSO_READ_LIMIT: "NaN" }, { TURSO_WARN_PCT: "0" }, { TURSO_WARN_PCT: "101" }, { TURSO_WARN_PCT: "Infinity" }]) assert.throws(() => readConfig(env));
  const f = fixture([{ databases: [{ Name: "a" }, { Name: "b" }] }, usage(Number.MAX_SAFE_INTEGER), usage(1)]);
  await assert.rejects(checkUsage(f.options), /safe integer/);
  assert.deepEqual(f.messages, []);
});

test("CLI fails missing credentials without exposing inherited token values", () => {
  const result = spawnSync(process.execPath, [fileURLToPath(new URL("./check-turso-usage.mjs", import.meta.url))], {
    encoding: "utf8", timeout: 5000,
    env: { ...process.env, TURSO_PLATFORM_TOKEN: "", TURSO_READ_LIMIT: "", TURSO_WARN_PCT: "" },
  });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /::error::TURSO_PLATFORM_TOKEN is not set/);
});
