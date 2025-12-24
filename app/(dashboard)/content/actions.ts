"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import type { JSONContent } from "@tiptap/core";

export type ContentType =
  | "post"
  | "page"
  | "documentation"
  | "product"
  | "landing_page";
export type ContentStatus =
  | "draft"
  | "pending_review"
  | "scheduled"
  | "published"
  | "archived";
export type ContentVisibility = "public" | "private" | "members_only";

export interface ContentFormState {
  error: string | null;
  success: boolean;
  contentId?: string;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function saveContent(
  _prevState: ContentFormState,
  formData: FormData
): Promise<ContentFormState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", success: false };
  }

  // Basic fields
  const id = formData.get("id") as string | null;
  const title = formData.get("title") as string;
  const slugInput = formData.get("slug") as string;
  const bodyJson = formData.get("body") as string;
  const type = (formData.get("type") as ContentType) || "post";
  const status = (formData.get("status") as ContentStatus) || "draft";
  const visibility =
    (formData.get("visibility") as ContentVisibility) || "public";
  const excerpt = formData.get("excerpt") as string | null;
  const categoryId = formData.get("categoryId") as string | null;
  const thumbnailUrl = formData.get("thumbnailUrl") as string | null;
  const isFeatured = formData.get("isFeatured") === "true";
  const allowComments = formData.get("allowComments") !== "false";
  const scheduledAt = formData.get("scheduledAt") as string | null;
  
  // Tags (comma-separated IDs)
  const tagIds = (formData.get("tagIds") as string)?.split(",").filter(Boolean) || [];
  
  // SEO fields
  const metaTitle = formData.get("metaTitle") as string | null;
  const metaDescription = formData.get("metaDescription") as string | null;
  const ogImageUrl = formData.get("ogImageUrl") as string | null;
  const canonicalUrl = formData.get("canonicalUrl") as string | null;

  if (!title?.trim()) {
    return { error: "Title is required", success: false };
  }

  let body: JSONContent;
  try {
    body = JSON.parse(bodyJson);
  } catch {
    return { error: "Invalid content format", success: false };
  }

  const slug = slugInput?.trim() || generateSlug(title);

  // Determine published_at based on status
  let publishedAt = null;
  if (status === "published") {
    publishedAt = new Date().toISOString();
  }

  const contentData = {
    title: title.trim(),
    slug,
    body,
    body_format: "tiptap-json",
    type,
    status,
    visibility,
    excerpt: excerpt?.trim() || null,
    category_id: categoryId || null,
    thumbnail_url: thumbnailUrl || null,
    is_featured: isFeatured,
    allow_comments: allowComments,
    author_id: user.id,
    published_at: publishedAt,
    scheduled_at: status === "scheduled" && scheduledAt ? scheduledAt : null,
    updated_at: new Date().toISOString(),
  };

  let contentId = id;

  if (id) {
    // Update existing content
    const { error } = await supabase
      .from("contents")
      .update(contentData)
      .eq("id", id);

    if (error) {
      return { error: error.message, success: false };
    }
  } else {
    // Create new content
    const { data, error } = await supabase
      .from("contents")
      .insert(contentData)
      .select("id")
      .single();

    if (error) {
      if (error.code === "23505") {
        return {
          error: "A content with this slug already exists",
          success: false,
        };
      }
      return { error: error.message, success: false };
    }
    contentId = data.id;
  }

  // Handle tags
  if (contentId) {
    // Delete existing tags
    await supabase.from("content_tags").delete().eq("content_id", contentId);

    // Insert new tags
    if (tagIds.length > 0) {
      const tagInserts = tagIds.map((tagId) => ({
        content_id: contentId,
        tag_id: tagId,
      }));
      await supabase.from("content_tags").insert(tagInserts);
    }

    // Handle SEO meta
    const seoData = {
      content_id: contentId,
      meta_title: metaTitle?.trim() || null,
      meta_description: metaDescription?.trim() || null,
      og_image_url: ogImageUrl || null,
      canonical_url: canonicalUrl?.trim() || null,
      updated_at: new Date().toISOString(),
    };

    // Upsert SEO meta
    const { error: seoError } = await supabase
      .from("seo_meta")
      .upsert(seoData, { onConflict: "content_id" });

    if (seoError) {
      console.error("SEO meta error:", seoError);
    }
  }

  revalidatePath("/content");
  return { error: null, success: true, contentId: contentId || undefined };
}

export async function deleteContent(
  id: string
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  const { error } = await supabase.from("contents").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/content");
  return { error: null };
}

export async function getContent(id: string) {
  const supabase = await createClient();

  // Get content with tags and SEO
  const { data: content, error } = await supabase
    .from("contents")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !content) {
    return null;
  }

  // Get tags for this content
  const { data: contentTags } = await supabase
    .from("content_tags")
    .select("tag_id")
    .eq("content_id", id);

  // Get SEO meta
  const { data: seoMeta } = await supabase
    .from("seo_meta")
    .select("*")
    .eq("content_id", id)
    .single();

  return {
    ...content,
    tag_ids: contentTags?.map((ct) => ct.tag_id) || [],
    seo_meta: seoMeta || null,
  };
}

export async function getContents() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("contents")
    .select(
      `
      id,
      title,
      slug,
      type,
      status,
      visibility,
      created_at,
      updated_at,
      published_at,
      author_id,
      profiles!contents_author_id_fkey (
        display_name
      )
    `
    )
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error fetching contents:", error);
    return [];
  }

  return data;
}

export async function getCategories() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, description, parent_id")
    .order("name");

  if (error) {
    return [];
  }

  return data;
}

export async function getTags() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tags")
    .select("id, name, slug")
    .order("name");

  if (error) {
    return [];
  }

  return data;
}

// Create a new tag on the fly
export async function createTag(name: string): Promise<{ id: string; name: string; slug: string } | null> {
  const supabase = await createClient();

  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const { data, error } = await supabase
    .from("tags")
    .insert({ name: name.trim(), slug })
    .select("id, name, slug")
    .single();

  if (error) {
    console.error("Error creating tag:", error);
    return null;
  }

  return data;
}
