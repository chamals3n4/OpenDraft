"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getCategories,
  getTags,
  getContents,
  getContent,
} from "@/app/(dashboard)/content/actions";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    staleTime: 5 * 60 * 1000, // categories rarely change
  });
}

export function useTags() {
  return useQuery({
    queryKey: ["tags"],
    queryFn: getTags,
    staleTime: 5 * 60 * 1000, // tags rarely change
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useContents(filters: Record<string, any> = {}) {
  return useQuery({
    queryKey: ["contents", filters],
    queryFn: () => getContents(filters),
    staleTime: 30 * 1000,
  });
}

export function useContent(id: string) {
  return useQuery({
    queryKey: ["content", id],
    queryFn: () => getContent(id),
    staleTime: 30 * 1000,
    enabled: !!id,
  });
}
