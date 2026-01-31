import "dotenv/config";
import path from "path";
import dotenv from "dotenv";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Supabase 환경 변수가 없습니다.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function deletePending() {
    console.log("Checking for pending items...");
    const { data: pending, error: fetchError } = await supabase
        .from("content_queue")
        .select("id, title")
        .eq("status", "pending");

    if (fetchError) {
        console.error("Error fetching pending items:", fetchError);
        return;
    }

    if (!pending || pending.length === 0) {
        console.log("No pending items found.");
        return;
    }

    console.log(`Found ${pending.length} pending items. Deleting...`);

    const { error: deleteError } = await supabase
        .from("content_queue")
        .delete()
        .eq("status", "pending")
        .lt("publish_at", new Date().toISOString());

    if (deleteError) {
        console.error("Error deleting pending items:", deleteError);
    } else {
        console.log("Successfully deleted all pending items.");
    }
}

deletePending().catch(console.error);
