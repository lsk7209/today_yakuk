import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config();
import { getTursoClient } from "../src/lib/turso";

const db = getTursoClient();

async function main() {
  console.log("🔍 Checking 'supplements' table count...");
  const result = await db.execute("SELECT COUNT(*) as count FROM supplements");
  const count = Number(result.rows[0]?.count ?? 0);
  console.log(`✅ Total Supplements in DB: ${count}`);
}

main().catch(console.error);
