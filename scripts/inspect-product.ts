
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function inspectProduct() {
    // Find products that HAVE tags
    const { data: products, error } = await supabase
        .from("supplements")
        .select("id, name, tags, ai_summary")
        .not("tags", "is", null)
        .limit(10);

    if (error) {
        console.error("Error:", error);
        return;
    }

    if (!products || products.length === 0) {
        console.log("No products found with tags.");
        return;
    }

    console.log(`Found ${products.length} products with tags:`);
    products.forEach(p => {
        console.log(`- ID: ${p.id} | Name: ${p.name}`);
        console.log(`  Tags: ${JSON.stringify(p.tags)}`);
    });
}

inspectProduct();
