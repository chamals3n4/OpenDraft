"use client";

import { ContentForm } from "../components/content-form";
import { useCategories, useTags } from "@/hooks/use-content-data";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  authorName: string;
}

export function NewContentClient({ authorName }: Props) {
  const { data: categories, isLoading: catLoading } = useCategories();
  const { data: tags, isLoading: tagsLoading } = useTags();

  if (catLoading || tagsLoading) {
    return (
      <div className="flex flex-1 flex-col px-6 lg:px-10 py-4 pt-0 gap-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col px-6 lg:px-10 py-4 pt-0">
      <ContentForm
        categories={categories ?? []}
        tags={tags ?? []}
        authorName={authorName}
      />
    </div>
  );
}
