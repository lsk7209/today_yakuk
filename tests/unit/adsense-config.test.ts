import assert from "node:assert/strict";
import { evaluateAdsenseSetup } from "../../src/lib/adsense-setup-check";
import { canRequestAds, getAdsenseState, isAdExcludedPath } from "../../src/lib/ad-policy";
import { getAdsenseClientId } from "../../src/lib/site-config";

const NEW_ID = "ca-pub-1111111111111111";
const ADS_TXT = "google.com, pub-1111111111111111, DIRECT, f08c47fec0942fa0\n";

function withEnv(env: Record<string, string | undefined>, fn: () => void) {
  const keys = ["NEXT_PUBLIC_ADSENSE_PUB_ID", "NEXT_PUBLIC_ADSENSE_ID", "NEXT_PUBLIC_ADSENSE_SERVING_ENABLED"];
  const saved = Object.fromEntries(keys.map((k) => [k, process.env[k]]));
  keys.forEach((k) => delete process.env[k]);
  Object.entries(env).forEach(([k, v]) => v !== undefined && (process.env[k] = v));
  try {
    fn();
  } finally {
    keys.forEach((k) => (saved[k] === undefined ? delete process.env[k] : (process.env[k] = saved[k])));
  }
}

function run(name: string, fn: () => void) {
  fn();
  console.log(`PASS ${name}`);
}

run("13. no publisher ID -> empty ID, disabled state, no legacy fallback or fake ID", () => {
  withEnv({}, () => {
    assert.equal(getAdsenseClientId(), "");
    assert.equal(getAdsenseState(), "disabled");
  });
  withEnv({ NEXT_PUBLIC_ADSENSE_PUB_ID: "ca-pub-123" }, () => {
    assert.equal(getAdsenseClientId(), "", "malformed ID is rejected rather than emitted");
    assert.equal(getAdsenseState(), "disabled");
  });
});

run("14. disabled and verification states never allow ad serving", async () => {
  withEnv({ NEXT_PUBLIC_ADSENSE_PUB_ID: NEW_ID }, () => {
    assert.equal(getAdsenseState(), "verification");
  });
  withEnv({ NEXT_PUBLIC_ADSENSE_SERVING_ENABLED: "true" }, () => {
    assert.equal(getAdsenseState(), "disabled", "serving flag alone is not enough without an ID");
  });
  withEnv({ NEXT_PUBLIC_ADSENSE_PUB_ID: NEW_ID, NEXT_PUBLIC_ADSENSE_SERVING_ENABLED: "true" }, () => {
    assert.equal(getAdsenseState(), "serving");
  });
});

run("15. excluded paths stay excluded even when serving is on; pages default to ineligible", () => {
  for (const path of ["/pharmacy/A1", "/wiki/x", "/nearby", "/contact", "/privacy", "/terms", "/admin", "/api/x"]) {
    assert.equal(isAdExcludedPath(path), true, path);
    assert.equal(canRequestAds(path, true), false, path);
  }
  assert.equal(canRequestAds("/blog/x"), false, "pageEligible defaults to false");
  assert.equal(canRequestAds("/blog/x", true), true);
});

run("setup check: ads.txt/ID consistency", () => {
  const base = { rawClientId: NEW_ID, servingEnabled: false, adsTxt: ADS_TXT, slotIds: [] };
  assert.deepEqual(evaluateAdsenseSetup(base).errors, []);
  assert.equal(evaluateAdsenseSetup({ ...base, rawClientId: "" }).state, "disabled");
  assert.equal(evaluateAdsenseSetup({ ...base, rawClientId: "pub-1111111111111111" }).errors.length, 1);

  const mismatch = "google.com, pub-2222222222222222, DIRECT, f08c47fec0942fa0\n";
  const verification = evaluateAdsenseSetup({ ...base, adsTxt: mismatch });
  assert.equal(verification.errors.length, 0, "verification only warns on a missing ads.txt entry");
  assert.ok(verification.warnings.length >= 2);
  const serving = evaluateAdsenseSetup({ ...base, servingEnabled: true, adsTxt: mismatch });
  assert.equal(serving.state, "serving");
  assert.ok(serving.errors.length >= 1, "serving requires a matching ads.txt entry");

  assert.ok(evaluateAdsenseSetup({ ...base, adsTxt: "google.com, ca-pub-1111111111111111, DIRECT\n" }).errors.length >= 1);
});
