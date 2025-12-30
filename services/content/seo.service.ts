import type { createClient } from "@/utils/supabase/server";
import type { SeoInput } from "./content.types";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

export async function upsertSeoMeta(
  supabase: SupabaseClient,
  contentId: string,
  seoData: SeoInput
): Promise<void> {
  const seoRecord = {
    content_id: contentId,
    meta_title: seoData.metaTitle?.trim() || null,
    meta_description: seoData.metaDescription?.trim() || null,
    og_image_url: seoData.ogImageUrl || null,
    canonical_url: seoData.canonicalUrl?.trim() || null,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("seo_meta")
    .upsert(seoRecord, { onConflict: "content_id" });

  if (error) {
    console.error("SEO meta error:", error);
  }
}

export async function findSeoByContentId(
  supabase: SupabaseClient,
  contentId: string
) {
  const { data: seoMeta } = await supabase
    .from("seo_meta")
    .select("*")
    .eq("content_id", contentId)
    .single();

  return seoMeta || null;
}
