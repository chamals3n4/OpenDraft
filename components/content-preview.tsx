"use client";

import { useMemo } from "react";
import { generateHTML } from "@tiptap/html";
import { StarterKit } from "@tiptap/starter-kit";
import { Image as TiptapImage } from "@tiptap/extension-image";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { TextAlign } from "@tiptap/extension-text-align";
import { Typography } from "@tiptap/extension-typography";
import { Highlight } from "@tiptap/extension-highlight";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import type { JSONContent } from "@tiptap/core";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import "./content-preview.scss";

interface ContentPreviewProps {
  title: string;
  excerpt?: string | null;
  body: JSONContent;
  thumbnailUrl?: string | null;
  authorName: string;
  publishedAt?: string | null;
  categoryName?: string | null;
  tags?: Array<{ name: string; slug: string }>;
  isFeatured?: boolean;
}

export function ContentPreview({
  title,
  excerpt,
  body,
  thumbnailUrl,
  authorName,
  publishedAt,
  categoryName,
  tags,
  isFeatured,
}: ContentPreviewProps) {
  const htmlContent = useMemo(() => {
    try {
      return generateHTML(body, [
        StarterKit.configure({
          horizontalRule: false,
        }),
        TextAlign.configure({ types: ["heading", "paragraph"] }),
        TaskList,
        TaskItem.configure({ nested: true }),
        Highlight.configure({ multicolor: true }),
        TiptapImage,
        Typography,
        Superscript,
        Subscript,
      ]);
    } catch (error) {
      console.error("Error generating HTML:", error);
      return "<p>Error rendering content</p>";
    }
  }, [body]);

  return (
    <article className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto max-w-4xl px-6 py-8">
          {categoryName && (
            <Badge variant="secondary" className="mb-4">
              {categoryName}
            </Badge>
          )}

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            {title}
          </h1>

          {excerpt && (
            <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
              {excerpt}
            </p>
          )}

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{authorName}</span>
            {publishedAt && (
              <>
                <span>•</span>
                <time dateTime={publishedAt}>
                  {formatDistanceToNow(new Date(publishedAt), {
                    addSuffix: true,
                  })}
                </time>
              </>
            )}
            {isFeatured && (
              <>
                <span>•</span>
                <Badge variant="secondary" className="text-xs">
                  Featured
                </Badge>
              </>
            )}
          </div>

          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {tags.map((tag) => (
                <Badge key={tag.slug} variant="outline" className="text-xs">
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </header>

      {thumbnailUrl && (
        <div className="w-full aspect-video relative bg-muted overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumbnailUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="container mx-auto max-w-4xl px-6 py-12">
        <div
          className="content-preview"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </div>
    </article>
  );
}
