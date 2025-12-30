import type { createClient } from "@/utils/supabase/server";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

export async function findAllCategories(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, description, parent_id")
    .order("name");

  if (error) {
    return [];
  }

  return data;
}
