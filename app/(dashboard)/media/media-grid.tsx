"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Delete02Icon,
  Search01Icon,
  Upload04Icon,
  CheckmarkCircle02Icon,
  Cancel01Icon,
  Copy01Icon,
  Image01Icon,
} from "@hugeicons/core-free-icons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  uploadMedia,
  deleteMedia,
  updateMedia,
  bulkDeleteMedia,
  type MediaItem,
} from "./actions";
import { toast } from "sonner";

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface Filters {
  search: string;
  type: string;
  page: number;
  limit: number;
}

interface MediaGridProps {
  media: MediaItem[];
  pagination: Pagination;
  filters: Filters;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MediaGrid({ media, pagination, filters }: MediaGridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [searchValue, setSearchValue] = useState(filters.search);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isUploading, setIsUploading] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [editAltText, setEditAltText] = useState("");
  const [editCaption, setEditCaption] = useState("");

  const updateFilters = (updates: Partial<Filters>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== "all" && value !== "") {
        params.set(key, String(value));
      } else {
        params.delete(key);
      }
    });

    if (!("page" in updates)) {
      params.delete("page");
    }

    startTransition(() => {
      router.push(`/media?${params.toString()}`);
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchValue });
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);

      const result = await uploadMedia(formData);
      if (result.error) {
        toast.error(`Failed to upload ${file.name}: ${result.error}`);
      } else {
        toast.success(`Uploaded ${file.name}`);
      }
    }

    setIsUploading(false);
    router.refresh();

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this file?")) return;

    const result = await deleteMedia(id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("File deleted");
      router.refresh();
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;

    if (
      !confirm(`Are you sure you want to delete ${selectedIds.size} file(s)?`)
    ) {
      return;
    }

    const result = await bulkDeleteMedia(Array.from(selectedIds));
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(`Deleted ${result.deleted} file(s)`);
      setSelectedIds(new Set());
      router.refresh();
    }
  };

  const openMediaDetails = (item: MediaItem) => {
    setSelectedMedia(item);
    setEditAltText(item.alt_text || "");
    setEditCaption(item.caption || "");
  };

  const handleSaveDetails = async () => {
    if (!selectedMedia) return;

    const result = await updateMedia(selectedMedia.id, {
      alt_text: editAltText,
      caption: editCaption,
    });

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Updated successfully");
      setSelectedMedia(null);
      router.refresh();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="space-y-4">
      {/* Search, Filters, Upload */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <HugeiconsIcon
              icon={Search01Icon}
              strokeWidth={2}
              className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
            />
            <Input
              placeholder="Search files..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button type="submit" variant="secondary" disabled={isPending}>
            Search
          </Button>
        </form>

        <div className="flex gap-2">
          <Select
            value={filters.type}
            onValueChange={(value) => {
              if (value !== null) {
                updateFilters({ type: value });
              }
            }}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue>Type</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="image">Images</SelectItem>
            </SelectContent>
          </Select>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleUpload}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <HugeiconsIcon icon={Upload04Icon} strokeWidth={2} />
            {isUploading ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
          <span className="text-sm font-medium">
            {selectedIds.size} selected
          </span>
          <Button
            size="sm"
            variant="outline"
            className="text-destructive hover:text-destructive"
            onClick={handleBulkDelete}
          >
            <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
            Delete
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSelectedIds(new Set())}
            className="ml-auto"
          >
            <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
            Clear
          </Button>
        </div>
      )}

      {/* Results info */}
      <div className="text-sm text-muted-foreground">
        {pagination.total} file{pagination.total !== 1 ? "s" : ""}
        {filters.search && ` matching "${filters.search}"`}
      </div>

      {/* Media Grid */}
      {media.length === 0 ? (
        <div className="bg-card border rounded-xl p-12 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <HugeiconsIcon
              icon={Image01Icon}
              strokeWidth={2}
              className="size-6 text-muted-foreground"
            />
          </div>
          <p className="text-muted-foreground mb-4">
            {filters.search
              ? "No files match your search"
              : "No files uploaded yet"}
          </p>
          {!filters.search && (
            <Button onClick={() => fileInputRef.current?.click()}>
              <HugeiconsIcon icon={Upload04Icon} strokeWidth={2} />
              Upload your first file
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {media.map((item) => (
            <div
              key={item.id}
              className={`group relative bg-card border rounded-lg overflow-hidden cursor-pointer transition-all hover:ring-2 hover:ring-primary/50 ${
                selectedIds.has(item.id) ? "ring-2 ring-primary" : ""
              }`}
            >
              {/* Checkbox */}
              <div className="absolute top-2 left-2 z-10">
                <Checkbox
                  checked={selectedIds.has(item.id)}
                  onCheckedChange={() => toggleSelect(item.id)}
                  className="bg-background/80 backdrop-blur"
                />
              </div>

              {/* Image */}
              <div
                className="aspect-square relative bg-muted"
                onClick={() => openMediaDetails(item)}
              >
                <Image
                  src={item.url}
                  alt={item.alt_text || item.original_name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                />
              </div>

              {/* Info */}
              <div className="p-2">
                <p className="text-xs font-medium truncate">
                  {item.original_name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(item.size)}
                </p>
              </div>

              {/* Quick actions on hover */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <Button
                  size="icon-sm"
                  variant="secondary"
                  className="bg-background/80 backdrop-blur"
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(item.url);
                  }}
                >
                  <HugeiconsIcon icon={Copy01Icon} strokeWidth={2} />
                </Button>
                <Button
                  size="icon-sm"
                  variant="secondary"
                  className="bg-background/80 backdrop-blur text-destructive hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(item.id);
                  }}
                >
                  <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
                </Button>
              </div>
            </div>
          ))}
        </div>
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

      {/* Media Details Dialog */}
      <Dialog
        open={!!selectedMedia}
        onOpenChange={(open) => !open && setSelectedMedia(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Media Details</DialogTitle>
          </DialogHeader>
          {selectedMedia && (
            <div className="grid gap-4 md:grid-cols-2">
              {/* Preview */}
              <div className="aspect-square relative bg-muted rounded-lg overflow-hidden">
                <Image
                  src={selectedMedia.url}
                  alt={selectedMedia.alt_text || selectedMedia.original_name}
                  fill
                  className="object-contain"
                />
              </div>

              {/* Details */}
              <div className="space-y-4">
                <div>
                  <p className="font-medium">{selectedMedia.original_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(selectedMedia.size)} •{" "}
                    {selectedMedia.mime_type}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Uploaded{" "}
                    {formatDistanceToNow(new Date(selectedMedia.created_at), {
                      addSuffix: true,
                    })}
                  </p>
                </div>

                {/* URL */}
                <Field>
                  <FieldLabel>URL</FieldLabel>
                  <div className="flex gap-2">
                    <Input
                      value={selectedMedia.url}
                      readOnly
                      className="flex-1 text-xs"
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => copyToClipboard(selectedMedia.url)}
                    >
                      <HugeiconsIcon icon={Copy01Icon} strokeWidth={2} />
                    </Button>
                  </div>
                </Field>

                {/* Alt Text */}
                <Field>
                  <FieldLabel>Alt Text</FieldLabel>
                  <Input
                    value={editAltText}
                    onChange={(e) => setEditAltText(e.target.value)}
                    placeholder="Describe this image..."
                  />
                </Field>

                {/* Caption */}
                <Field>
                  <FieldLabel>Caption</FieldLabel>
                  <Textarea
                    value={editCaption}
                    onChange={(e) => setEditCaption(e.target.value)}
                    placeholder="Optional caption..."
                    rows={2}
                  />
                </Field>

                <div className="flex gap-2">
                  <Button onClick={handleSaveDetails} className="flex-1">
                    <HugeiconsIcon
                      icon={CheckmarkCircle02Icon}
                      strokeWidth={2}
                    />
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    className="text-destructive hover:text-destructive"
                    onClick={() => {
                      handleDelete(selectedMedia.id);
                      setSelectedMedia(null);
                    }}
                  >
                    <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
