"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import slugify from "slugify";

export interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  _count?: { contents: number };
}

export interface TagFormState {
  error: string | null;
  success: boolean;
  message?: string;
}

export async function getTags(): Promise<Tag[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tags")
    .select("id, name, slug, created_at")
    .order("name");

  if (error) {
    console.error("Error fetching tags:", error);
    return [];
  }

  const tagsWithCounts = await Promise.all(
    (data || []).map(async (tag) => {
      const { count } = await supabase
        .from("content_tags")
        .select("*", { count: "exact", head: true })
        .eq("tag_id", tag.id);

      return {
        ...tag,
        _count: { contents: count || 0 },
      };
    })
  );

  return tagsWithCounts;
}

export async function createTag(
  _prevState: TagFormState,
  formData: FormData
): Promise<TagFormState> {
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const slugInput = formData.get("slug") as string;

  if (!name?.trim()) {
    return { error: "Name is required", success: false };
  }

  const slug =
    slugInput?.trim() ||
    slugify(name, { lower: true, strict: true, trim: true });

  const { error } = await supabase.from("tags").insert({
    name: name.trim(),
    slug,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "A tag with this slug already exists", success: false };
    }
    return { error: error.message, success: false };
  }

  revalidatePath("/tags");
  revalidatePath("/content");
  return { error: null, success: true, message: "Tag created successfully" };
}

export async function updateTag(
  _prevState: TagFormState,
  formData: FormData
): Promise<TagFormState> {
  const supabase = await createClient();

  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const slugInput = formData.get("slug") as string;

  if (!id) {
    return { error: "Tag ID is required", success: false };
  }

  if (!name?.trim()) {
    return { error: "Name is required", success: false };
  }

  const slug =
    slugInput?.trim() ||
    slugify(name, { lower: true, strict: true, trim: true });

  const { error } = await supabase
    .from("tags")
    .update({
      name: name.trim(),
      slug,
    })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") {
      return { error: "tag with this slug already exists", success: false };
    }
    return { error: error.message, success: false };
  }

  revalidatePath("/tags");
  revalidatePath("/content");
  return { error: null, success: true, message: "Tag updated successfully" };
}

export async function deleteTag(
  id: string
): Promise<{ error: string | null; success: boolean }> {
  const supabase = await createClient();

  await supabase.from("content_tags").delete().eq("tag_id", id);

  const { error } = await supabase.from("tags").delete().eq("id", id);

  if (error) {
    return { error: error.message, success: false };
  }

  revalidatePath("/tags");
  revalidatePath("/content");
  return { error: null, success: true };
}
