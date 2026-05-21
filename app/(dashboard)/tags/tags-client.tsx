"use client";

import { useTagsAdmin } from "@/hooks/use-admin-data";
import { TagsList } from "./tags-list";
import { Skeleton } from "@/components/ui/skeleton";

export function TagsClient() {
  const { data: tags, isLoading } = useTagsAdmin();

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0 px-6 lg:px-10">
        <Skeleton className="h-8 w-48 mb-4" />
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 px-6 lg:px-10">
      <TagsList tags={tags ?? []} />
    </div>
  );
}
