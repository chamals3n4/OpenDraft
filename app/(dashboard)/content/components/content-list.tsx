"use client";

import { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Edit02Icon,
  Delete02Icon,
  Search01Icon,
  CheckmarkCircle02Icon,
  Cancel01Icon,
  Settings02Icon,
} from "@hugeicons/core-free-icons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  deleteContent,
  bulkDeleteContents,
  bulkUpdateStatus,
} from "../actions";
import { toast } from "sonner";
import { ContentQuickEditDialog } from "./quick-edit";

interface Content {
  id: string;
  title: string;
  slug: string;
  type: string;
  status: string;
  visibility: string;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  author_id: string;
  profiles: {
    display_name: string;
  } | null;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface Filters {
  search?: string;
  status?: string;
  type?: string;
  page?: number;
  limit?: number;
}

interface ContentListProps {
  contents: Content[];
  pagination: Pagination;
  filters: Filters;
}

const statusColors: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  draft: "secondary",
  pending_review: "outline",
  scheduled: "outline",
  published: "default",
  archived: "destructive",
};

const typeLabels: Record<string, string> = {
  post: "Post",
  page: "Page",
  documentation: "Docs",
  product: "Product",
  landing_page: "Landing",
};

export function ContentList({
  contents,
  pagination,
  filters,
}: ContentListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [searchValue, setSearchValue] = useState(filters.search);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [quickEditContent, setQuickEditContent] = useState<Content | null>(
    null
  );
  const [quickEditOpen, setQuickEditOpen] = useState(false);

  const allSelected =
    contents.length > 0 && selectedIds.size === contents.length;
  const someSelected =
    selectedIds.size > 0 && selectedIds.size < contents.length;

  const updateFilters = (updates: Partial<Filters>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== "all" && value !== "") {
        params.set(key, String(value));
      } else {
        params.delete(key);
      }
    });

    // Reset to page 1 when filters change (except for page itself)
    if (!("page" in updates)) {
      params.delete("page");
    }

    startTransition(() => {
      router.push(`/content?${params.toString()}`);
    });
  };

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== filters.search) {
        updateFilters({ search: searchValue });
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue]);

  const handleDelete = async () => {
    if (!deleteTargetId) return;

    const result = await deleteContent(deleteTargetId);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Content deleted successfully");
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(deleteTargetId);
        return next;
      });
      router.refresh();
    }

    setDeleteDialogOpen(false);
    setDeleteTargetId(null);
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(contents.map((c) => c.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;

    if (
      !confirm(`Are you sure you want to delete ${selectedIds.size} item(s)?`)
    ) {
      return;
    }

    const result = await bulkDeleteContents(Array.from(selectedIds));
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(`Deleted ${result.deleted} item(s)`);
      setSelectedIds(new Set());
      router.refresh();
    }
  };

  const handleBulkPublish = async () => {
    if (selectedIds.size === 0) return;

    const result = await bulkUpdateStatus(Array.from(selectedIds), "published");
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(`Published ${result.updated} item(s)`);
      setSelectedIds(new Set());
      router.refresh();
    }
  };

  const handleBulkDraft = async () => {
    if (selectedIds.size === 0) return;

    const result = await bulkUpdateStatus(Array.from(selectedIds), "draft");
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(`Moved ${result.updated} item(s) to draft`);
      setSelectedIds(new Set());
      router.refresh();
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1 sm:max-w-sm">
          <HugeiconsIcon
            icon={Search01Icon}
            strokeWidth={2}
            className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
          />
          <Input
            placeholder="Search..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex gap-2">
          <Select
            value={filters.status}
            onValueChange={(value) => {
              if (value !== null) {
                updateFilters({ status: value });
              }
            }}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue>
                {!filters.status || filters.status === "all"
                  ? "All Status"
                  : filters.status.replace("_", " ")}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="pending_review">Pending</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.type}
            onValueChange={(value) => {
              if (value !== null) {
                updateFilters({ type: value });
              }
            }}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue>
                {!filters.type || filters.type === "all"
                  ? "All Type"
                  : filters.type.replace("_", " ")}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="post">Post</SelectItem>
              <SelectItem value="page">Page</SelectItem>
              <SelectItem value="documentation">Docs</SelectItem>
              <SelectItem value="product">Product</SelectItem>
              <SelectItem value="landing_page">Landing</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 bg-muted rounded-lg">
          <span className="text-sm font-medium">
            {selectedIds.size} selected
          </span>
          <div className="flex flex-wrap gap-2 flex-1">
            <Button size="sm" variant="outline" onClick={handleBulkPublish}>
              <HugeiconsIcon
                icon={CheckmarkCircle02Icon}
                strokeWidth={2}
                className="size-4"
              />
              <span className="ml-1.5">Publish</span>
            </Button>
            <Button size="sm" variant="outline" onClick={handleBulkDraft}>
              <HugeiconsIcon
                icon={Edit02Icon}
                strokeWidth={2}
                className="size-4"
              />
              <span className="ml-1.5">Draft</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-destructive hover:text-destructive"
              onClick={handleBulkDelete}
            >
              <HugeiconsIcon
                icon={Delete02Icon}
                strokeWidth={2}
                className="size-4"
              />
              <span className="ml-1.5">Delete</span>
            </Button>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSelectedIds(new Set())}
            className="sm:ml-auto"
          >
            <HugeiconsIcon
              icon={Cancel01Icon}
              strokeWidth={2}
              className="size-4"
            />
            <span className="ml-1.5">Clear</span>
          </Button>
        </div>
      )}

      {/* Results info */}
      <div className="text-sm text-muted-foreground">
        Showing {contents.length} of {pagination.total} results
        {filters.search && ` for "${filters.search}"`}
      </div>

      {/* Content List */}
      {contents.length === 0 ? (
        <div className="bg-card border rounded-xl p-12 text-center">
          <p className="text-muted-foreground mb-4">
            {filters.search ||
            filters.status !== "all" ||
            filters.type !== "all"
              ? "No content matches your filters"
              : "No content yet"}
          </p>
          {!filters.search &&
            filters.status === "all" &&
            filters.type === "all" && (
              <Link href="/content/new">
                <Button>Create your first content</Button>
              </Link>
            )}
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block bg-card border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-4 py-3 w-12">
                    <Checkbox
                      checked={allSelected || someSelected}
                      onCheckedChange={() => toggleSelectAll()}
                    />
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-sm">
                    Title
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-sm">
                    Type
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-sm">
                    Author
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-sm">
                    Updated
                  </th>
                  <th className="px-4 py-3 text-right">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {contents.map((content) => (
                  <tr
                    key={content.id}
                    className={`group hover:bg-muted/30 transition-colors ${
                      selectedIds.has(content.id) ? "bg-muted/50" : ""
                    }`}
                  >
                    <td className="px-4 py-3">
                      <Checkbox
                        checked={selectedIds.has(content.id)}
                        onCheckedChange={() => toggleSelect(content.id)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/content/${content.id}/edit`}
                        className="font-medium hover:underline block"
                      >
                        {content.title}
                      </Link>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        /{content.slug}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-muted-foreground">
                        {typeLabels[content.type] || content.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {content.profiles?.display_name || "Unknown"}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(content.updated_at), {
                        addSuffix: true,
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => {
                            setQuickEditContent(content);
                            setQuickEditOpen(true);
                          }}
                          title="Quick Edit"
                        >
                          <HugeiconsIcon
                            icon={Settings02Icon}
                            strokeWidth={2}
                            className="size-4"
                          />
                        </Button>
                        <Link href={`/content/${content.id}/edit`}>
                          <Button variant="ghost" size="icon-sm">
                            <HugeiconsIcon
                              icon={Edit02Icon}
                              strokeWidth={2}
                              className="size-4"
                            />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => {
                            setDeleteTargetId(content.id);
                            setDeleteDialogOpen(true);
                          }}
                          title="Delete"
                        >
                          <HugeiconsIcon
                            icon={Delete02Icon}
                            strokeWidth={2}
                            className="size-4"
                          />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-3">
            {contents.map((content) => (
              <div
                key={content.id}
                className={`bg-card border rounded-lg p-4 space-y-3 ${
                  selectedIds.has(content.id) ? "ring-2 ring-primary" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <Checkbox
                      checked={selectedIds.has(content.id)}
                      onCheckedChange={() => toggleSelect(content.id)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/content/${content.id}/edit`}
                        className="font-medium hover:underline block truncate"
                      >
                        {content.title}
                      </Link>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        /{content.slug}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => {
                        setQuickEditContent(content);
                        setQuickEditOpen(true);
                      }}
                      title="Quick Edit"
                    >
                      <HugeiconsIcon
                        icon={Settings02Icon}
                        strokeWidth={2}
                        className="size-4"
                      />
                    </Button>
                    <Link href={`/content/${content.id}/edit`}>
                      <Button variant="ghost" size="icon-sm">
                        <HugeiconsIcon
                          icon={Edit02Icon}
                          strokeWidth={2}
                          className="size-4"
                        />
                      </Button>
                    </Link>

                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => {
                        setDeleteTargetId(content.id);
                        setDeleteDialogOpen(true);
                      }}
                      title="Delete"
                    >
                      <HugeiconsIcon
                        icon={Delete02Icon}
                        strokeWidth={2}
                        className="size-4"
                      />
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <span>{typeLabels[content.type] || content.type}</span>
                  <span>•</span>
                  <span>{content.profiles?.display_name || "Unknown"}</span>
                  <span>•</span>
                  <span>
                    {formatDistanceToNow(new Date(content.updated_at), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1 || isPending}
              onClick={() => updateFilters({ page: pagination.page - 1 })}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages || isPending}
              onClick={() => updateFilters({ page: pagination.page + 1 })}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Quick Edit Dialog */}
      <ContentQuickEditDialog
        content={quickEditContent}
        open={quickEditOpen}
        onOpenChange={setQuickEditOpen}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete content?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              selected content.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
