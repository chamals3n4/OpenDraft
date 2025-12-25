"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export interface SiteSettings {
  site_name: string;
  site_description: string;
  site_logo: string;
  site_favicon: string;
  site_url: string;
  posts_per_page: number;
  comments_enabled: boolean;
  comments_moderation: boolean;
  social_twitter: string;
  social_facebook: string;
  social_instagram: string;
  social_github: string;
}

export interface SettingsFormState {
  error: string | null;
  success: boolean;
  message?: string;
}

const defaultSettings: SiteSettings = {
  site_name: "My Blog",
  site_description: "A blog built with OpenDraft",
  site_logo: "",
  site_favicon: "",
  site_url: "",
  posts_per_page: 10,
  comments_enabled: false,
  comments_moderation: true,
  social_twitter: "",
  social_facebook: "",
  social_instagram: "",
  social_github: "",
};

export async function getSettings(): Promise<SiteSettings> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("settings")
    .select("key, value")
    .in("key", Object.keys(defaultSettings));

  if (error) {
    console.error("Error fetching settings:", error);
    return defaultSettings;
  }

  const settings = { ...defaultSettings };
  for (const row of data || []) {
    if (row.key in settings) {
      (settings as Record<string, unknown>)[row.key] = row.value;
    }
  }

  return settings;
}

export async function getSetting<K extends keyof SiteSettings>(
  key: K
): Promise<SiteSettings[K]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("settings")
    .select("value")
    .eq("key", key)
    .single();

  if (error || !data) {
    return defaultSettings[key];
  }

  return data.value as SiteSettings[K];
}

export async function updateSettings(
  _prevState: SettingsFormState,
  formData: FormData
): Promise<SettingsFormState> {
  const supabase = await createClient();

  const settingsToUpdate: Partial<SiteSettings> = {
    site_name: formData.get("site_name") as string,
    site_description: formData.get("site_description") as string,
    site_logo: formData.get("site_logo") as string,
    site_favicon: formData.get("site_favicon") as string,
    site_url: formData.get("site_url") as string,
    posts_per_page: parseInt(formData.get("posts_per_page") as string) || 10,
    comments_enabled: formData.get("comments_enabled") === "true",
    comments_moderation: formData.get("comments_moderation") === "true",
    social_twitter: formData.get("social_twitter") as string,
    social_facebook: formData.get("social_facebook") as string,
    social_instagram: formData.get("social_instagram") as string,
    social_github: formData.get("social_github") as string,
  };

  if (!settingsToUpdate.site_name?.trim()) {
    return { error: "Site name is required", success: false };
  }

  const upsertPromises = Object.entries(settingsToUpdate).map(
    async ([key, value]) => {
      const { error } = await supabase.from("settings").upsert(
        {
          key,
          value,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "key" }
      );

      if (error) {
        console.error(`Error updating setting ${key}:`, error);
        return { key, error };
      }
      return { key, error: null };
    }
  );

  const results = await Promise.all(upsertPromises);
  const errors = results.filter((r) => r.error);

  if (errors.length > 0) {
    return {
      error: `Failed to update: ${errors.map((e) => e.key).join(", ")}`,
      success: false,
    };
  }

  revalidatePath("/settings");
  revalidatePath("/");
  return {
    error: null,
    success: true,
    message: "Settings saved successfully",
  };
}
