"use client";

import { useMedia } from "@/hooks/use-admin-data";
import { MediaGrid } from "./media-grid";
import { Skeleton } from "@/components/ui/skeleton";

interface Filters {
  search: string;
  type: string;
  page: number;
  limit: number;
}

export function MediaClient({ filters }: { filters: Filters }) {
  const { data: media, isLoading } = useMedia(filters);

  return (
    <div className="flex flex-1 flex-col gap-4 px-6 lg:px-10 py-4 pt-0">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Media Library</h1>
        <p className="text-muted-foreground">
          Upload and manage your images and files.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="aspect-square rounded-lg" />
          ))}
        </div>
      ) : (
        <MediaGrid
          media={media?.data ?? []}
          pagination={{
            total: media?.total ?? 0,
            page: media?.page ?? filters.page,
            limit: media?.limit ?? filters.limit,
            totalPages: media?.totalPages ?? 0,
          }}
          filters={filters}
        />
      )}
    </div>
  );
}
