
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function inspectProduct() {
    // Find the specific product we updated
    const { data: products, error } = await supabase
        .from("supplements")
        .select("id, name, tags, ai_summary")
        .eq("id", "a3551de0-fec5-4bd2-8480-557814872574") // ID from debug output
        .single();

    if (error) {
        console.error("Error:", error);
        return;
    }

    const p = products;
    console.log("Inspecting specific product:");
    console.log(`- Name: ${p.name}`);
    console.log(`  Tags: ${JSON.stringify(p.tags)}`);
}

inspectProduct();
