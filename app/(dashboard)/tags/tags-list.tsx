"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";
import { TagSheet } from "./tag-sheet";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon } from "@hugeicons/core-free-icons";
import type { Tag } from "./actions";

interface TagsListProps {
  tags: Tag[];
}

export function TagsList({ tags }: TagsListProps) {
  const [editTag, setEditTag] = useState<Tag | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const handleEdit = (tag: Tag) => {
    setEditTag(tag);
    setEditOpen(true);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Tags</h1>
          <p className="text-muted-foreground">
            Label your content with tags for better discoverability.
          </p>
        </div>
        <TagSheet
          trigger={
            <Button>
              <HugeiconsIcon icon={Add01Icon} strokeWidth={2} />
              Add Tag
            </Button>
          }
        />
      </div>

      <div className="bg-card border rounded-xl">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Posts</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tags && tags.length > 0 ? (
              tags.map((tag) => (
                <TableRow key={tag.id}>
                  <TableCell>
                    <div className="font-medium">{tag.name}</div>
                  </TableCell>
                  <TableCell>
                    <code className="text-sm bg-muted px-1.5 py-0.5 rounded">
                      {tag.slug}
                    </code>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {tag._count?.contents || 0}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDistanceToNow(new Date(tag.created_at), {
                      addSuffix: true,
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(tag)}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12">
                  <p className="text-muted-foreground">No tags found</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Create your first tag to label content.
                  </p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <TagSheet tag={editTag} open={editOpen} onOpenChange={setEditOpen} />
    </>
  );
}
