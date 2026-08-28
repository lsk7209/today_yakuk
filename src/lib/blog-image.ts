import fs from "fs";
import path from "path";

/**
 * 블로그 대표 이미지 URL 반환
 * 우선순위:
 * 1. DB에 저장된 image_url
 * 2. 로컬 public/blog-images 폴더
 * 3. OG Image API (fallback)
 */
export function getBlogFeaturedImage(
    slug: string,
    title: string,
    imageUrl?: string | null
): string {
    // 1. DB에 저장된 image URL 우선 사용
    if (imageUrl) {
        return imageUrl;
    }

    // 2. Check for AI-generated image in public/blog-images
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

    // 3. Fallback to OG Image API
    return `/api/og?title=${encodeURIComponent(title)}`;
}
