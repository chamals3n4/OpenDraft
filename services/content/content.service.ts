import type { createClient } from "@/utils/supabase/server";
import type {
  ContentData,
  ContentFilters,
  PaginatedContents,
  ContentStatus,
  ContentVisibility,
} from "./content.types";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

export async function createContent(
  supabase: SupabaseClient,
  data: ContentData
): Promise<{ id: string; error: string | null }> {
  const { data: result, error } = await supabase
    .from("contents")
    .insert(data)
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { id: "", error: "A content with this slug already exists" };
    }
    return { id: "", error: error.message };
  }

  return { id: result.id, error: null };
}

export async function updateContent(
  supabase: SupabaseClient,
  id: string,
  data: ContentData
): Promise<{ error: string | null }> {
  const { error } = await supabase.from("contents").update(data).eq("id", id);

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}

export async function findContentById(supabase: SupabaseClient, id: string) {
  const { data: content, error } = await supabase
    .from("contents")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !content) {
    return null;
  }

  return content;
}

export async function deleteContentById(
  supabase: SupabaseClient,
  id: string
): Promise<{ error: string | null }> {
  const { error } = await supabase.from("contents").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}

export async function findContentsWithFilters(
  supabase: SupabaseClient,
  filters: ContentFilters
): Promise<PaginatedContents> {
  const { search, status, type, page = 1, limit = 10 } = filters;
  const offset = (page - 1) * limit;

  let query = supabase.from("contents").select(
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
    `,
    { count: "exact" }
  );

  if (search?.trim()) {
    query = query.or(`title.ilike.%${search}%,slug.ilike.%${search}%`);
  }

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  if (type && type !== "all") {
    query = query.eq("type", type);
  }

  const { data, error, count } = await query
    .order("updated_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("Error fetching contents:", error);
    return { data: [], total: 0, page, limit, totalPages: 0 };
  }

  const total = count || 0;
  const totalPages = Math.ceil(total / limit);

  const normalizedData = (data ?? []).map((item) => ({
    ...item,
    profiles: Array.isArray(item.profiles) ? item.profiles[0] ?? null : null,
  }));

  return {
    data: normalizedData,
    total,
    page,
    limit,
    totalPages,
  };
}

export async function bulkDeleteContentsByIds(
  supabase: SupabaseClient,
  ids: string[]
): Promise<{ error: string | null; deleted: number }> {
  const { error, count } = await supabase
    .from("contents")
    .delete()
    .in("id", ids);

  if (error) {
    return { error: error.message, deleted: 0 };
  }

  return { error: null, deleted: count || ids.length };
}

export async function bulkUpdateContentStatus(
  supabase: SupabaseClient,
  ids: string[],
  status: ContentStatus
): Promise<{ error: string | null; updated: number }> {
  const updateData: { status: ContentStatus; published_at?: string | null } = {
    status,
  };

  if (status === "published") {
    updateData.published_at = new Date().toISOString();
  }

  const { error, count } = await supabase
    .from("contents")
    .update(updateData)
    .in("id", ids);

  if (error) {
    return { error: error.message, updated: 0 };
  }

  return { error: null, updated: count || ids.length };
}

export async function updateContentStatusById(
  supabase: SupabaseClient,
  id: string,
  status: ContentStatus
): Promise<{ error: string | null }> {
  const updateData: { status: ContentStatus; published_at?: string | null } = {
    status,
  };

  if (status === "published") {
    updateData.published_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("contents")
    .update(updateData)
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}

export async function updateContentVisibilityById(
  supabase: SupabaseClient,
  id: string,
  visibility: ContentVisibility
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("contents")
    .update({ visibility })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}
