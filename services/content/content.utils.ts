import slugify from "slugify";
import type {
  ContentInput,
  ContentData,
  ContentStatus,
  ContentType,
  ContentVisibility,
} from "./content.types";

export function generateSlug(title: string, customSlug?: string): string {
  if (customSlug?.trim()) {
    return customSlug.trim();
  }
  return slugify(title, { lower: true, strict: true, trim: true });
}

export function determinePublishedAt(status: ContentStatus): string | null {
  return status === "published" ? new Date().toISOString() : null;
}

export function parseFormData(formData: FormData): ContentInput {
  const title = formData.get("title") as string;
  const slugInput = formData.get("slug") as string;

  return {
    id: formData.get("id") as string | null,
    title,
    slug: slugInput,
    bodyJson: formData.get("body") as string,
    type: (formData.get("type") as ContentType) || "post",
    status: (formData.get("status") as ContentStatus) || "draft",
    visibility: (formData.get("visibility") as ContentVisibility) || "public",
    excerpt: formData.get("excerpt") as string | null,
    categoryId: formData.get("categoryId") as string | null,
    thumbnailUrl: formData.get("thumbnailUrl") as string | null,
    isFeatured: formData.get("isFeatured") === "true",
    allowComments: formData.get("allowComments") !== "false",
    scheduledAt: formData.get("scheduledAt") as string | null,
    bodyIsEmpty: formData.get("bodyIsEmpty") === "true",
    tagIds:
      (formData.get("tagIds") as string)?.split(",").filter(Boolean) || [],
    seoData: {
      metaTitle: formData.get("metaTitle") as string | null,
      metaDescription: formData.get("metaDescription") as string | null,
      ogImageUrl: formData.get("ogImageUrl") as string | null,
      canonicalUrl: formData.get("canonicalUrl") as string | null,
    },
  };
}

export function buildContentData(
  input: ContentInput,
  body: unknown,
  userId: string
): ContentData {
  const slug = generateSlug(input.title, input.slug);
  const publishedAt = determinePublishedAt(input.status);

  return {
    title: input.title.trim(),
    slug,
    body,
    body_format: "tiptap-json",
    type: input.type,
    status: input.status,
    visibility: input.visibility,
    excerpt: input.excerpt?.trim() || null,
    category_id: input.categoryId || null,
    thumbnail_url: input.thumbnailUrl || null,
    is_featured: input.isFeatured,
    allow_comments: input.allowComments,
    author_id: userId,
    published_at: publishedAt,
    scheduled_at:
      input.status === "scheduled" && input.scheduledAt
        ? input.scheduledAt
        : null,
    updated_at: new Date().toISOString(),
  };
}
