"use client";

import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import type { JSONContent } from "@tiptap/core";
import { Badge } from "@/components/ui/badge";
import "./content-preview.scss";

interface ContentPreviewProps {
  title: string;
  excerpt?: string | null;
  body: JSONContent;
  thumbnailUrl?: string | null;
  authorName: string;
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
  categoryName,
  tags,
  isFeatured,
}: ContentPreviewProps) {
  // Generate HTML from TipTap JSON
  const htmlContent = generateHTML(body, [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3, 4],
      },
    }),
    Image.configure({
      inline: false,
    }),
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: "editor-link",
      },
    }),
  ]);

  return (
    <article className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <header className="mb-8">
        {categoryName && (
          <Badge variant="secondary" className="text-xs mb-3">
            {categoryName}
          </Badge>
        )}

        <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
          {title}
        </h1>

        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
          <span className="font-medium">{authorName}</span>
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
          <div className="flex flex-wrap gap-2 mb-6">
            {tags.map((tag) => (
              <Badge key={tag.slug} variant="outline" className="text-xs">
                {tag.name}
              </Badge>
            ))}
          </div>
        )}
      </header>

      {/* Thumbnail */}
      {thumbnailUrl && (
        <div className="mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumbnailUrl}
            alt={title}
            className="w-full max-w-md mx-auto h-auto rounded-lg"
          />
        </div>
      )}

      {/* Excerpt */}
      {excerpt && (
        <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
          {excerpt}
        </p>
      )}

      {/* Content */}
      <div
        className="content-preview prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </article>
  );
}
