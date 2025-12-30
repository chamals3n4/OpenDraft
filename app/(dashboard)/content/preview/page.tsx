"use client";

import { useSearchParams } from "next/navigation";
import { ContentPreview } from "@/components/content-preview";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import Link from "next/link";
import { useMemo, Suspense } from "react";

function ContentPreviewPageContent() {
  const searchParams = useSearchParams();
  const previewId = searchParams.get("id");

  // Try to get preview data from sessionStorage first (new approach)
  const previewData = useMemo(() => {
    if (typeof window === "undefined" || !previewId) return null;
    try {
      const stored = sessionStorage.getItem(`preview-${previewId}`);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      // Fall back to URL params
    }
    return null;
  }, [previewId]);

  // Parse body from URL params if not in previewData
  const bodyFromParams = useMemo(() => {
    if (previewData?.body) return previewData.body;
    const bodyJson = searchParams.get("body");
    if (!bodyJson) return { type: "doc", content: [] };
    try {
      return JSON.parse(bodyJson);
    } catch {
      return { type: "doc", content: [] };
    }
  }, [previewData, searchParams]);

  // Parse tags from URL params if not in previewData
  const tagsFromParams = useMemo(() => {
    if (previewData?.tags) return previewData.tags;
    const tagsJson = searchParams.get("tags");
    if (!tagsJson) return [];
    try {
      return JSON.parse(tagsJson);
    } catch {
      return [];
    }
  }, [previewData, searchParams]);

  // Fallback to URL params if no preview data in storage
  const title = previewData?.title || searchParams.get("title") || "";
  const excerpt = previewData?.excerpt || searchParams.get("excerpt");
  const body = bodyFromParams;
  const thumbnailUrl = previewData?.thumbnailUrl || searchParams.get("thumbnailUrl");
  const authorName = previewData?.authorName || searchParams.get("authorName") || "Author";
  const categoryName = previewData?.categoryName || searchParams.get("categoryName");
  const tags = tagsFromParams;
  const isFeatured = previewData?.isFeatured || searchParams.get("isFeatured") === "true";

  const backUrl = searchParams.get("back") || "/content";

  return (
    <div className="flex flex-1 flex-col px-6 lg:px-10 py-4 pt-0">
      <div className="mb-4">
        <Link href={backUrl}>
          <Button variant="ghost" size="sm">
            <HugeiconsIcon
              icon={ArrowLeft01Icon}
              strokeWidth={2}
              className="size-4 mr-2"
            />
            Back to Editor
          </Button>
        </Link>
      </div>

      <ContentPreview
        title={title}
        excerpt={excerpt}
        body={body}
        thumbnailUrl={thumbnailUrl}
        authorName={authorName}
        categoryName={categoryName}
        tags={tags}
        isFeatured={isFeatured}
      />
    </div>
  );
}

export default function ContentPreviewPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-muted-foreground">Loading preview...</div>
        </div>
      }
    >
      <ContentPreviewPageContent />
    </Suspense>
  );
}
