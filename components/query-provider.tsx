"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data stays fresh for 60s — back navigation within this
            // window is instant with no refetch and no loading spinner.
            staleTime: 60 * 1000,
            // Keep unused data in cache for 5 minutes.
            gcTime: 5 * 60 * 1000,
            // Don't refetch on window focus (avoid unnecessary loads).
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
