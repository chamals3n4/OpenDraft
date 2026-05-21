"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getDashboardStats,
  getRecentContent,
} from "@/app/(dashboard)/dashboard-actions";

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: getDashboardStats,
    staleTime: 60 * 1000,
  });
}

export function useRecentContent(limit = 5) {
  return useQuery({
    queryKey: ["recent-content", limit],
    queryFn: () => getRecentContent(limit),
    staleTime: 60 * 1000,
  });
}
