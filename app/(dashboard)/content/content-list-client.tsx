"use client";

import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ContentList } from "./components/content-list";
import { useContents } from "@/hooks/use-content-data";

interface Filters {
  search: string;
  status: string;
  type: string;
  page: number;
  limit: number;
}

export function ContentListClient({ filters }: { filters: Filters }) {
  const { data: contents, isLoading } = useContents(filters);

  return (
    <div className="flex flex-1 flex-col gap-4 px-6 lg:px-10 py-4 pt-0">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Content</h1>
          <p className="text-muted-foreground">
            Manage your posts, pages, and other content.
          </p>
        </div>
        <Link href="/content/new">
          <Button>
            <HugeiconsIcon
              icon={Add01Icon}
              data-icon="inline-start"
              strokeWidth={2}
            />
            New Content
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-4 border rounded-lg"
            >
              <Skeleton className="h-5 w-5 rounded" />
              <div className="flex-1">
                <Skeleton className="h-5 w-48 mb-1" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </div>
      ) : (
        <ContentList
          contents={contents?.data ?? []}
          pagination={{
            total: contents?.total ?? 0,
            page: contents?.page ?? filters.page,
            limit: contents?.limit ?? filters.limit,
            totalPages: contents?.totalPages ?? 0,
          }}
          filters={filters}
        />
      )}
    </div>
  );
}
