"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export interface MediaItem {
  id: string;
  filename: string;
  original_name: string;
  mime_type: string;
  size: number;
  url: string;
  storage_path: string;
  alt_text: string | null;
  caption: string | null;
  uploaded_by: string | null;
  created_at: string;
  uploader?: { display_name: string } | null;
}

export interface MediaFilters {
  search?: string;
  type?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedMedia {
  data: MediaItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function getMedia(
  filters: MediaFilters = {}
): Promise<PaginatedMedia> {
  const supabase = await createClient();

  const { search, type, page = 1, limit = 20 } = filters;
  const offset = (page - 1) * limit;

  let query = supabase
    .from("media")
    .select(
      `
      id,
      filename,
      original_name,
      mime_type,
      size,
      url,
      storage_path,
      alt_text,
      caption,
      uploaded_by,
      created_at,
      uploader:profiles!media_uploaded_by_fkey(display_name)
    `,
      { count: "exact" }
    );

  if (search?.trim()) {
    query = query.or(
      `original_name.ilike.%${search}%,alt_text.ilike.%${search}%`
    );
  }

  if (type && type !== "all") {
    query = query.ilike("mime_type", `${type}/%`);
  }

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("Error fetching media:", error);
    return { data: [], total: 0, page, limit, totalPages: 0 };
  }

  const total = count || 0;
  const totalPages = Math.ceil(total / limit);

  // Handle uploader data (Supabase returns array for FK relations)
  const mediaData = (data || []).map((item) => ({
    ...item,
    uploader: Array.isArray(item.uploader) ? item.uploader[0] : item.uploader,
  }));

  return {
    data: mediaData,
    total,
    page,
    limit,
    totalPages,
  };
}

export async function uploadMedia(
  formData: FormData
): Promise<{ error: string | null; media: MediaItem | null }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", media: null };
  }

  const file = formData.get("file") as File;
  if (!file) {
    return { error: "No file provided", media: null };
  }

  // Validate file type
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
  if (!allowedTypes.includes(file.type)) {
    return { error: "Invalid file type. Only images are allowed.", media: null };
  }

  // Validate file size (10MB max)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return { error: "File too large. Maximum size is 10MB.", media: null };
  }

  // Generate unique filename
  const ext = file.name.split(".").pop();
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  const filename = `${timestamp}-${randomStr}.${ext}`;
  const storagePath = `uploads/${user.id}/${filename}`;

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from("media")
    .upload(storagePath, file);

  if (uploadError) {
    console.error("Upload error:", uploadError);
    return { error: uploadError.message, media: null };
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from("media")
    .getPublicUrl(storagePath);

  // Save to database
  const { data: mediaData, error: dbError } = await supabase
    .from("media")
    .insert({
      filename,
      original_name: file.name,
      mime_type: file.type,
      size: file.size,
      url: urlData.publicUrl,
      storage_path: storagePath,
      uploaded_by: user.id,
    })
    .select()
    .single();

  if (dbError) {
    console.error("Database error:", dbError);
    // Try to clean up the uploaded file
    await supabase.storage.from("media").remove([storagePath]);
    return { error: dbError.message, media: null };
  }

  revalidatePath("/media");
  return { error: null, media: mediaData };
}

export async function updateMedia(
  id: string,
  data: { alt_text?: string; caption?: string }
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("media")
    .update({
      alt_text: data.alt_text || null,
      caption: data.caption || null,
    })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/media");
  return { error: null };
}

export async function deleteMedia(
  id: string
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  // Get the storage path first
  const { data: media, error: fetchError } = await supabase
    .from("media")
    .select("storage_path")
    .eq("id", id)
    .single();

  if (fetchError || !media) {
    return { error: "Media not found" };
  }

  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from("media")
    .remove([media.storage_path]);

  if (storageError) {
    console.error("Storage delete error:", storageError);
  }

  // Delete from database
  const { error: dbError } = await supabase
    .from("media")
    .delete()
    .eq("id", id);

  if (dbError) {
    return { error: dbError.message };
  }

  revalidatePath("/media");
  return { error: null };
}

export async function bulkDeleteMedia(
  ids: string[]
): Promise<{ error: string | null; deleted: number }> {
  const supabase = await createClient();

  // Get storage paths
  const { data: mediaItems } = await supabase
    .from("media")
    .select("storage_path")
    .in("id", ids);

  if (mediaItems && mediaItems.length > 0) {
    // Delete from storage
    const paths = mediaItems.map((m) => m.storage_path);
    await supabase.storage.from("media").remove(paths);
  }

  // Delete from database
  const { error, count } = await supabase
    .from("media")
    .delete()
    .in("id", ids);

  if (error) {
    return { error: error.message, deleted: 0 };
  }

  revalidatePath("/media");
  return { error: null, deleted: count || ids.length };
}

