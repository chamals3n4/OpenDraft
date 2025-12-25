"use client";

import { useSearchParams } from "next/navigation";
import { ContentPreview } from "@/components/content-preview";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import Link from "next/link";
import { useMemo, Suspense } from "react";

function ContentPreviewPageContent() {
  const searchParams = useSearchParams();

  const title = searchParams.get("title") || "";
  const excerpt = searchParams.get("excerpt");
  const bodyJson = searchParams.get("body");
  const thumbnailUrl = searchParams.get("thumbnailUrl");
  const authorName = searchParams.get("authorName") || "Author";
  const categoryName = searchParams.get("categoryName");
  const tagsJson = searchParams.get("tags");
  const isFeatured = searchParams.get("isFeatured") === "true";

  const body = useMemo(() => {
    if (!bodyJson) return { type: "doc", content: [] };
    try {
      return JSON.parse(bodyJson);
    } catch {
      return { type: "doc", content: [] };
    }
  }, [bodyJson]);

  const tags = useMemo(() => {
    if (!tagsJson) return [];
    try {
      return JSON.parse(tagsJson);
    } catch {
      return [];
    }
  }, [tagsJson]);

  const backUrl = searchParams.get("back") || "/content";

  return (
    <div className="relative">
      <div className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="container mx-auto max-w-7xl px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
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
              <div className="h-6 w-px bg-border" />
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-sm font-medium text-muted-foreground">
                  Preview Mode
                </span>
              </div>
            </div>
            <Badge variant="outline" className="text-xs">
              This is how your post will appear to readers
            </Badge>
          </div>
        </div>
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
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-muted-foreground">Loading preview...</div>
        </div>
      }
    >
      <ContentPreviewPageContent />
    </Suspense>
  );
}
