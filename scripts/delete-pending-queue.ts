import "dotenv/config";
import path from "path";
import dotenv from "dotenv";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
import { getRequiredTursoClient } from "../src/lib/turso";

const db = getRequiredTursoClient();

async function deletePending() {
    console.log("Checking for pending items...");
    const result = await db.execute({
        sql: "SELECT id, title FROM content_queue WHERE status = 'pending'",
        args: [],
    });

    if (!result.rows.length) {
        console.log("No pending items found.");
        return;
    }

    console.log(`Found ${result.rows.length} pending items. Deleting...`);

    await db.execute({
        sql: "DELETE FROM content_queue WHERE status = 'pending' AND publish_at < ?",
        args: [new Date().toISOString()],
    });

    console.log("Successfully deleted all pending items.");
}

deletePending().catch(console.error);
