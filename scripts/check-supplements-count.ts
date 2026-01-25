import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config();

import { createClient } from "@supabase/supabase-js";

// Supabase Setup
const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Error: Missing Supabase environment variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  console.log("🔍 Checking 'supplements' table count...");
  
  const { count, error } = await supabase
    .from("supplements")
    .select("*", { count: "exact", head: true });

  if (error) {
    console.error("❌ Error fetching count:", error);
    return;
  }

  console.log(`✅ Total Supplements in DB: ${count}`);
}

main().catch(console.error);
