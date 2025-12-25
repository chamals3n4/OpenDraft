"use server";

import { createClient } from "@/utils/supabase/server";

export interface DashboardStats {
  totalPosts: number;
  published: number;
  drafts: number;
  scheduled: number;
  categories: number;
  tags: number;
}

export interface RecentContent {
  id: string;
  title: string;
  status: string;
  type: string;
  updated_at: string;
  author: { display_name: string } | null;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();

  const [
    { count: totalPosts },
    { count: published },
    { count: drafts },
    { count: scheduled },
    { count: categories },
    { count: tags },
  ] = await Promise.all([
    supabase.from("contents").select("*", { count: "exact", head: true }),
    supabase
      .from("contents")
      .select("*", { count: "exact", head: true })
      .eq("status", "published"),
    supabase
      .from("contents")
      .select("*", { count: "exact", head: true })
      .eq("status", "draft"),
    supabase
      .from("contents")
      .select("*", { count: "exact", head: true })
      .eq("status", "scheduled"),
    supabase.from("categories").select("*", { count: "exact", head: true }),
    supabase.from("tags").select("*", { count: "exact", head: true }),
  ]);

  return {
    totalPosts: totalPosts || 0,
    published: published || 0,
    drafts: drafts || 0,
    scheduled: scheduled || 0,
    categories: categories || 0,
    tags: tags || 0,
  };
}

export async function getRecentContent(limit = 5): Promise<RecentContent[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("contents")
    .select(
      `
      id,
      title,
      status,
      type,
      updated_at,
      author:profiles!contents_author_id_fkey(display_name)
    `
    )
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching recent content:", error);
    return [];
  }

  return (data || []).map((item) => ({
    ...item,
    author: Array.isArray(item.author) ? item.author[0] : item.author,
  }));
}
