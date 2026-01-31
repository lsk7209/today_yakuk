
import fs from "fs";
import path from "path";

export function getBlogFeaturedImage(slug: string, title: string): string {
    // 1. Check for AI-generated image in public/blog-images
    const fileName = `${slug}.png`;
    const publicDir = path.join(process.cwd(), "public", "blog-images");
    const filePath = path.join(publicDir, fileName);

    try {
        if (fs.existsSync(filePath)) {
            return `/blog-images/${fileName}`;
        }
    } catch {
        // Error checking file (e.g. permission), fallback to OG
    }

    // 2. Fallback to OG Image API
    return `/api/og?title=${encodeURIComponent(title)}`;
}
