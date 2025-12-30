import type { createClient } from "@/utils/supabase/server";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

export async function findAllTags(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("tags")
    .select("id, name, slug")
    .order("name");

  if (error) {
    return [];
  }

  return data;
}

export async function createNewTag(
  supabase: SupabaseClient,
  name: string
): Promise<{ id: string; name: string; slug: string } | null> {
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

export async function syncContentTags(
  supabase: SupabaseClient,
  contentId: string,
  tagIds: string[]
): Promise<void> {
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
}

export async function findTagsByContentId(
  supabase: SupabaseClient,
  contentId: string
): Promise<string[]> {
  const { data: contentTags } = await supabase
    .from("content_tags")
    .select("tag_id")
    .eq("content_id", contentId);

  return (contentTags ?? []).map((ct) => ct.tag_id);
}
