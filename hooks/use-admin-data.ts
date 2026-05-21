"use client";

import { useQuery } from "@tanstack/react-query";
import { getCategories } from "@/app/(dashboard)/categories/actions";
import { getTags } from "@/app/(dashboard)/tags/actions";
import { getMedia } from "@/app/(dashboard)/media/actions";
import { getProfile } from "@/app/(dashboard)/profile/actions";
import { createClient } from "@/utils/supabase/client";

export function useCategoriesAdmin() {
  return useQuery({
    queryKey: ["admin-categories"],
    queryFn: getCategories,
    staleTime: 5 * 60 * 1000,
  });
}

export function useTagsAdmin() {
  return useQuery({
    queryKey: ["admin-tags"],
    queryFn: getTags,
    staleTime: 5 * 60 * 1000,
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useMedia(filters: Record<string, any> = {}) {
  return useQuery({
    queryKey: ["media", filters],
    queryFn: () => getMedia(filters),
    staleTime: 30 * 1000,
  });
}

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
    staleTime: 60 * 1000,
  });
}

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return data;
    },
    staleTime: 30 * 1000,
  });
}
