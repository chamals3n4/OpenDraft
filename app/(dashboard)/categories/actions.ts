"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import slugify from "slugify";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parent_id: string | null;
  created_at: string;
  parent?: { name: string } | null;
  _count?: { contents: number };
}

export interface CategoryFormState {
  error: string | null;
  success: boolean;
  message?: string;
}

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .select(
      `
      id,
      name,
      slug,
      description,
      parent_id,
      created_at,
      parent:categories!categories_parent_id_fkey(name)
    `
    )
    .order("name");

  if (error) {
    console.error("Error fetching categories:", error);
    return [];
  }

  const categoriesWithCounts = await Promise.all(
    (data || []).map(async (category) => {
      const { count } = await supabase
        .from("contents")
        .select("*", { count: "exact", head: true })
        .eq("category_id", category.id);

      const parentData = Array.isArray(category.parent)
        ? category.parent[0]
        : category.parent;

      return {
        ...category,
        parent: parentData || null,
        _count: { contents: count || 0 },
      };
    })
  );

  return categoriesWithCounts;
}

export async function createCategory(
  _prevState: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> {
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const slugInput = formData.get("slug") as string;
  const description = formData.get("description") as string | null;
  const parentId = formData.get("parentId") as string | null;

  if (!name?.trim()) {
    return { error: "Name is required", success: false };
  }

  const slug =
    slugInput?.trim() ||
    slugify(name, { lower: true, strict: true, trim: true });

  const { error } = await supabase.from("categories").insert({
    name: name.trim(),
    slug,
    description: description?.trim() || null,
    parent_id: parentId || null,
  });

  if (error) {
    if (error.code === "23505") {
      return {
        error: "category with this slug already exists",
        success: false,
      };
    }
    return { error: error.message, success: false };
  }

  revalidatePath("/categories");
  revalidatePath("/content");
  return {
    error: null,
    success: true,
    message: "Category created successfully",
  };
}

export async function updateCategory(
  _prevState: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> {
  const supabase = await createClient();

  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const slugInput = formData.get("slug") as string;
  const description = formData.get("description") as string | null;
  const parentId = formData.get("parentId") as string | null;

  if (!id) {
    return { error: "Category ID is required", success: false };
  }

  if (!name?.trim()) {
    return { error: "Name is required", success: false };
  }

  if (parentId === id) {
    return { error: "Category cannot be its own parent", success: false };
  }

  const slug =
    slugInput?.trim() ||
    slugify(name, { lower: true, strict: true, trim: true });

  const { error } = await supabase
    .from("categories")
    .update({
      name: name.trim(),
      slug,
      description: description?.trim() || null,
      parent_id: parentId || null,
    })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") {
      return {
        error: "category with this slug already exists",
        success: false,
      };
    }
    return { error: error.message, success: false };
  }

  revalidatePath("/categories");
  revalidatePath("/content");
  return {
    error: null,
    success: true,
    message: "Category updated successfully",
  };
}

export async function deleteCategory(
  id: string
): Promise<{ error: string | null; success: boolean }> {
  const supabase = await createClient();

  // check if category has content
  const { count } = await supabase
    .from("contents")
    .select("*", { count: "exact", head: true })
    .eq("category_id", id);

  if (count && count > 0) {
    return {
      error: `Cannot delete category with ${count} content item(s)`,
      success: false,
    };
  }

  // check if category has children
  const { count: childCount } = await supabase
    .from("categories")
    .select("*", { count: "exact", head: true })
    .eq("parent_id", id);

  if (childCount && childCount > 0) {
    return {
      error: `Cannot delete category with ${childCount} sub-categories`,
      success: false,
    };
  }

  const { error } = await supabase.from("categories").delete().eq("id", id);

  if (error) {
    return { error: error.message, success: false };
  }

  revalidatePath("/categories");
  revalidatePath("/content");
  return { error: null, success: true };
}
