import assert from "node:assert/strict";
import { createClient } from "@libsql/client";
import {
  buildWikiPagePath,
  buildWikiSearchQuery,
  getWikiCatalogType,
  getWikiPageNumber,
  getWikiSearchLimit,
} from "../../src/lib/wiki-catalog";
import {
  buildWikiMedicinePath,
  buildWikiMedicineSlug,
  buildWikiProductPath,
  buildWikiProductSlug,
  isCanonicalWikiSlug,
} from "../../src/lib/wiki-slug";

assert.equal(getWikiCatalogType(null), "supplement");
assert.equal(getWikiCatalogType("supplement"), "supplement");
assert.equal(getWikiCatalogType("medicine"), "medicine");
assert.equal(getWikiCatalogType("unknown"), null);

const medicineSearch = buildWikiSearchQuery("medicine", null, 6);
assert.match(medicineSearch.sql, /FROM medicines/);
assert.match(medicineSearch.sql, /name LIKE \? OR manufacturer LIKE \?/);
assert.deepEqual(medicineSearch.argsFor("%타이레놀%"), ["%타이레놀%", "%타이레놀%", 6]);
assert.doesNotMatch(medicineSearch.sql, /tags|supplements/);

const defaultSearch = buildWikiSearchQuery("supplement", null, 12);
assert.match(defaultSearch.sql, /FROM supplements/);
assert.deepEqual(defaultSearch.argsFor("%비타민%"), ["%비타민%", "%비타민%", 12]);
const categorySearch = buildWikiSearchQuery("supplement", "vitamin", 6);
assert.match(categorySearch.sql, /json_each\(tags\)/);
assert.deepEqual(categorySearch.argsFor("%비타민%"), ["%비타민%", "%비타민%", "vitamin", 6]);

assert.equal(getWikiSearchLimit("-1"), 12);
assert.equal(getWikiSearchLimit("999"), 50);
assert.equal(getWikiPageNumber("2"), 2);
assert.equal(getWikiPageNumber("2junk"), null);
assert.equal(getWikiPageNumber("1000001"), null);
assert.equal(buildWikiPagePath("medicine", "all", 2), "/wiki?type=medicine&page=2");
assert.equal(buildWikiPagePath("supplement", "vitamin", 2), "/wiki?category=vitamin&page=2");
assert.equal(buildWikiPagePath("supplement", "all", 2), "/wiki?page=2");

const item = { id: "6f7c3452-35b8-42ac-b029-728148ea52c1", name: "타이레놀정 500mg" };
assert.match(buildWikiMedicinePath(item), /^\/wiki\/medicine\//);
assert.match(buildWikiProductPath(item), /^\/wiki\/product\//);
for (const slug of [buildWikiMedicineSlug(item), buildWikiProductSlug(item)]) {
  assert.equal(isCanonicalWikiSlug(slug, slug), true);
  assert.equal(isCanonicalWikiSlug(encodeURIComponent(slug), slug), true);
  assert.equal(isCanonicalWikiSlug(item.id, slug), false);
  assert.equal(isCanonicalWikiSlug(`다른이름-${item.id}`, slug), false);
  assert.equal(isCanonicalWikiSlug(`%ZZ${slug}`, slug), false);
}

async function testSearchAgainstSqlite() {
  const db = createClient({ url: ":memory:" });
  try {
    await db.execute("CREATE TABLE medicines (id TEXT PRIMARY KEY, name TEXT, manufacturer TEXT, image_url TEXT)");
    await db.execute("CREATE TABLE supplements (id TEXT PRIMARY KEY, name TEXT, manufacturer TEXT, image_url TEXT, tags TEXT)");
    await db.execute({ sql: "INSERT INTO medicines VALUES (?, ?, ?, ?)", args: ["med-name", "타이레놀정", "한국제약", null] });
    await db.execute({ sql: "INSERT INTO medicines VALUES (?, ?, ?, ?)", args: ["med-maker", "두통정", "타이레놀제약", null] });
    await db.execute({ sql: "INSERT INTO supplements VALUES (?, ?, ?, ?, ?)", args: ["supp-vitamin", "타이레놀 비타민", "건강회사", null, '["vitamin"]'] });
    await db.execute({ sql: "INSERT INTO supplements VALUES (?, ?, ?, ?, ?)", args: ["supp-mineral", "타이레놀 미네랄", "건강회사", null, '["mineral"]'] });

    async function ids(type: "medicine" | "supplement", category: string | null, term: string) {
      const search = buildWikiSearchQuery(type, category, 12);
      const result = await db.execute({ sql: search.sql, args: search.argsFor(`%${term}%`) });
      return result.rows.map((row) => row.id as string).sort();
    }

    assert.deepEqual(await ids("medicine", null, "타이레놀"), ["med-maker", "med-name"]);
    assert.deepEqual(await ids("supplement", null, "타이레놀"), ["supp-mineral", "supp-vitamin"]);
    assert.deepEqual(await ids("supplement", "vitamin", "타이레놀"), ["supp-vitamin"]);
    assert.deepEqual(await ids("medicine", null, "타이레놀' OR 1=1 --"), []);
    assert.deepEqual(await ids("supplement", null, "타이레놀' OR 1=1 --"), []);
  } finally {
    db.close();
  }
}

testSearchAgainstSqlite().then(
  () => console.log("wiki catalog tests passed"),
  (error) => { console.error(error); process.exitCode = 1; },
);
