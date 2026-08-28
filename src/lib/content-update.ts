import { z } from "zod";

const nullableText = (max: number) => z.string().max(max).nullable();

export const contentItemUpdateSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    slug: z.string().trim().min(1).max(200).optional(),
    content_html: nullableText(500_000).optional(),
    ai_summary: nullableText(5_000).optional(),
    publish_at: z
      .string()
      .min(1)
      .refine((value) => Number.isFinite(Date.parse(value)), "Invalid publish_at")
      .optional(),
    status: z.enum(["pending", "review", "published", "failed"]).optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, "At least one update field is required");

export type ContentItemUpdate = z.infer<typeof contentItemUpdateSchema>;

export const CONTENT_ITEM_UPDATE_FIELDS = [
  "title",
  "slug",
  "content_html",
  "ai_summary",
  "publish_at",
  "status",
] as const satisfies readonly (keyof ContentItemUpdate)[];
