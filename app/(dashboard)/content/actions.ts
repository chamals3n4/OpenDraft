"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import {
  parseFormData,
  buildContentData,
} from "@/services/content/content.utils";
import {
  validateContent,
  parseBody,
} from "@/services/content/content.validator";
import {
  createContent,
  updateContent,
  deleteContentById,
  findContentById,
  findContentsWithFilters,
  bulkDeleteContentsByIds,
  bulkUpdateContentStatus,
  updateContentStatusById,
  updateContentVisibilityById,
} from "@/services/content/content.service";
import {
  syncContentTags,
  findTagsByContentId,
  findAllTags,
  createNewTag,
} from "@/services/content/tag.service";
import {
  upsertSeoMeta,
  findSeoByContentId,
} from "@/services/content/seo.service";
import { findAllCategories } from "@/services/content/category.service";

export type {
  ContentType,
  ContentStatus,
  ContentVisibility,
  ContentFilters,
  PaginatedContents,
} from "@/services/content/content.types";

import type {
  ContentStatus,
  ContentVisibility,
} from "@/services/content/content.types";

export interface ContentFormState {
  error: string | null;
  success: boolean;
  contentId?: string;
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

  const input = parseFormData(formData);

  const validation = validateContent(input);
  if (!validation.valid) {
    return { error: validation.errors.join(". "), success: false };
  }

  const { body, error: bodyError } = parseBody(input.bodyJson);
  if (bodyError) {
    return { error: bodyError, success: false };
  }

  const contentData = buildContentData(input, body, user.id);

  let contentId = input.id;
  if (input.id) {
    const { error } = await updateContent(supabase, input.id, contentData);
    if (error) {
      return { error, success: false };
    }
  } else {
    const { id, error } = await createContent(supabase, contentData);
    if (error) {
      return { error, success: false };
    }
    contentId = id;
  }

  if (contentId) {
    await syncContentTags(supabase, contentId, input.tagIds);
    await upsertSeoMeta(supabase, contentId, input.seoData);
  }

  revalidatePath("/content");
  return { error: null, success: true, contentId: contentId || undefined };
}

export async function deleteContent(
  id: string
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const result = await deleteContentById(supabase, id);
  revalidatePath("/content");
  return result;
}

export async function getContent(id: string) {
  const supabase = await createClient();

  const content = await findContentById(supabase, id);
  if (!content) {
    return null;
  }

  const tagIds = await findTagsByContentId(supabase, id);
  const seoMeta = await findSeoByContentId(supabase, id);

  return {
    ...content,
    tag_ids: tagIds,
    seo_meta: seoMeta,
  };
}

export async function getContents(filters = {}) {
  const supabase = await createClient();
  return await findContentsWithFilters(supabase, filters);
}

export async function bulkDeleteContents(ids: string[]) {
  const supabase = await createClient();
  const result = await bulkDeleteContentsByIds(supabase, ids);
  revalidatePath("/content");
  return result;
}

export async function bulkUpdateStatus(ids: string[], status: ContentStatus) {
  const supabase = await createClient();
  const result = await bulkUpdateContentStatus(supabase, ids, status);
  revalidatePath("/content");
  return result;
}

export async function updateContentStatus(id: string, status: ContentStatus) {
  const supabase = await createClient();
  const result = await updateContentStatusById(supabase, id, status);
  revalidatePath("/content");
  return result;
}

export async function updateContentVisibility(
  id: string,
  visibility: ContentVisibility
) {
  const supabase = await createClient();
  const result = await updateContentVisibilityById(supabase, id, visibility);
  revalidatePath("/content");
  return result;
}

export async function getCategories() {
  const supabase = await createClient();
  return await findAllCategories(supabase);
}

export async function getTags() {
  const supabase = await createClient();
  return await findAllTags(supabase);
}

export async function createTag(name: string) {
  const supabase = await createClient();
  return await createNewTag(supabase, name);
}
