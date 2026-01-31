
import path from "path";
import dotenv from "dotenv";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
import { generateBlogPost } from "../src/lib/gemini-blog";

async function test() {
    console.log("Generating sample blog post with Rich Content...");
    const topic = "겨울철 비타민D 부족 증상과 약국 영양제 추천";
    const post = await generateBlogPost(topic);

    if (post) {
        console.log("\n--- Generated Title ---");
        console.log(post.title);
        console.log("\n--- Generated HTML Content ---");
        require("fs").writeFileSync("test-blog-output.html", post.content_html);
        console.log("HTML saved to test-blog-output.html");
    } else {
        console.error("Failed to generate post");
    }
}

test();
