import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";

async function main() {
  const statements: Array<{sql:string;args:number[]}> = [];
  const fixture = Array.from({length:1501}, (_,i)=>({hpid:`p${String(i).padStart(6,"0")}`,updated_at:"2026-01-02"}));
  const cache = new Map<string,Promise<unknown>>();
  const routeModule = {exports:{} as {getPharmacySitemapChunk:(offset:number,limit:number)=>Promise<typeof fixture>}};
  const code = ts.transpileModule(fs.readFileSync("src/lib/data/pharmacies.ts","utf8"), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  const requireMock = (name:string) => {
    if(name==="server-only") return {};
    if(name==="@/lib/turso") return {getTursoClient:()=>({execute:async(statement:{sql:string;args:number[]})=>{statements.push(statement);return {rows:fixture.slice(statement.args[1],statement.args[1]+statement.args[0])};}}),parseJson:()=>{throw new Error("Sitemap should not parse unused hours");}};
    if(name==="@/lib/db-read-cache")return {cacheDbRead:(key:readonly string[],load:()=>Promise<unknown>)=>{assert.equal(key[1],"sitemap-hpid-v2");const id=JSON.stringify(key);if(!cache.has(id))cache.set(id,load());return cache.get(id);}};
    if(name==="@/lib/pharmacy-indexability")return {PHARMACY_INDEXABLE_WHERE:"WHERE fixture_eligibility"};
    return {};
  };
  vm.runInNewContext(`(function(require,module,exports){${code}\n})`)(requireMock,routeModule,routeModule.exports);
  const first=await routeModule.exports.getPharmacySitemapChunk(0,1000);
  await routeModule.exports.getPharmacySitemapChunk(0,1000);
  const second=await routeModule.exports.getPharmacySitemapChunk(1000,1000);
  assert.equal(statements.length,2);
  for(const statement of statements){assert.match(statement.sql,/SELECT hpid, updated_at\s+FROM pharmacies/);assert.match(statement.sql,/WHERE fixture_eligibility/);assert.match(statement.sql,/ORDER BY hpid ASC/);assert.doesNotMatch(statement.sql,/ORDER BY updated_at|SELECT.*operating_hours/);}
  assert.equal(JSON.stringify(statements.map(s=>s.args)),JSON.stringify([[1000,0],[1000,1000]]));
  assert.equal(JSON.stringify([...first,...second]),JSON.stringify(fixture));
  assert.equal(new Set([...first,...second].map(r=>r.hpid)).size,1501);
  assert.match(fs.readFileSync("src/app/sitemap/[id]/route.ts","utf8"), /\["sitemap-entries-hpid-v2", id\]/);
  console.log("Pharmacy sitemap projection/order/cache-key/pagination contract PASS; network/productionSQL0.");
}
main().catch(error=>{console.error(error);process.exitCode=1;});
