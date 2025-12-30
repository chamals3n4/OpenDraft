"use client";

import { useActionState, useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Image01Icon,
  Loading03Icon,
  Calendar03Icon,
  Search01Icon,
  Settings02Icon,
  ArrowDown01Icon,
  Cancel01Icon,
  EyeIcon,
} from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import slugify from "slugify";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ContentEditor } from "@/components/content-editor";
import {
  saveContent,
  createTag,
  type ContentFormState,
  type ContentType,
  type ContentStatus,
  type ContentVisibility,
} from "../actions";
import { uploadMedia } from "../../media/actions";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parent_id: string | null;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
}

interface SeoMeta {
  meta_title: string | null;
  meta_description: string | null;
  og_image_url: string | null;
  canonical_url: string | null;
}

interface ContentFormProps {
  content?: {
    id: string;
    title: string;
    slug: string;
    body: any;
    type: ContentType;
    status: ContentStatus;
    visibility: ContentVisibility;
    excerpt: string | null;
    category_id: string | null;
    thumbnail_url: string | null;
    is_featured: boolean;
    allow_comments: boolean;
    scheduled_at: string | null;
    tag_ids: string[];
    seo_meta: SeoMeta | null;
  };
  categories: Category[];
  tags: Tag[];
  authorName: string;
}

const initialState: ContentFormState = {
  error: null,
  success: false,
};

function SettingsSection({
  title,
  icon,
  children,
  defaultOpen = false,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <Collapsible defaultOpen={defaultOpen} className="group/section">
      <div className="bg-card border rounded-lg overflow-hidden">
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-2">
              {icon}
              <h3 className="font-medium text-sm">{title}</h3>
            </div>
            <HugeiconsIcon
              icon={ArrowDown01Icon}
              strokeWidth={2}
              className="size-4 text-muted-foreground transition-transform duration-200 group-data-[open]/section:rotate-180"
            />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-4 border-t pt-4">{children}</div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

export function ContentForm({
  content,
  categories,
  tags: initialTags,
  authorName,
}: ContentFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  // Restore form state from sessionStorage if available (when returning from preview)
  const getStoredState = (key: string, defaultValue: any) => {
    if (typeof window === "undefined") return defaultValue;
    try {
      const stored = sessionStorage.getItem(`content-form-${key}`);
      if (stored) {
        sessionStorage.removeItem(`content-form-${key}`); // Clear after reading
        return JSON.parse(stored);
      }
    } catch (e) {
      // Ignore errors
    }
    return defaultValue;
  };

  const [editorContent, setEditorContent] = useState<any>(
    getStoredState("body", content?.body || null)
  );
  const [title, setTitle] = useState(
    getStoredState("title", content?.title || "")
  );
  const [slug, setSlug] = useState(getStoredState("slug", content?.slug || ""));
  const [type, setType] = useState<ContentType>(
    getStoredState("type", content?.type || "post")
  );
  const [status, setStatus] = useState<ContentStatus>(
    getStoredState("status", content?.status || "draft")
  );
  const [visibility, setVisibility] = useState<ContentVisibility>(
    getStoredState("visibility", content?.visibility || "public")
  );
  const [excerpt, setExcerpt] = useState(
    getStoredState("excerpt", content?.excerpt || "")
  );
  const [categoryId, setCategoryId] = useState(
    getStoredState("categoryId", content?.category_id || "")
  );
  const [thumbnailUrl, setThumbnailUrl] = useState(
    getStoredState("thumbnailUrl", content?.thumbnail_url || "")
  );
  const [isFeatured, setIsFeatured] = useState(
    getStoredState("isFeatured", content?.is_featured || false)
  );
  const [allowComments, setAllowComments] = useState(
    getStoredState("allowComments", content?.allow_comments ?? true)
  );
  const [scheduledAt, setScheduledAt] = useState(
    getStoredState("scheduledAt", content?.scheduled_at || "")
  );

  const [availableTags, setAvailableTags] = useState<Tag[]>(initialTags);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    getStoredState("selectedTagIds", content?.tag_ids || [])
  );
  const [tagInput, setTagInput] = useState("");
  const [isCreatingTag, setIsCreatingTag] = useState(false);

  const [metaTitle, setMetaTitle] = useState(
    content?.seo_meta?.meta_title || ""
  );
  const [metaDescription, setMetaDescription] = useState(
    content?.seo_meta?.meta_description || ""
  );
  const [ogImageUrl, setOgImageUrl] = useState(
    content?.seo_meta?.og_image_url || ""
  );
  const [canonicalUrl, setCanonicalUrl] = useState(
    content?.seo_meta?.canonical_url || ""
  );

  // If editing existing content, allow slug editing by default
  const [slugEditable, setSlugEditable] = useState(!!content?.slug);

  const handleFormAction = async (
    prevState: ContentFormState,
    formData: FormData
  ): Promise<ContentFormState> => {
    formData.set("body", JSON.stringify(editorContent));
    // Check if TipTap content is empty
    const isBodyEmpty =
      !editorContent ||
      !editorContent.type ||
      editorContent.type !== "doc" ||
      !Array.isArray(editorContent.content) ||
      editorContent.content.length === 0 ||
      (editorContent.content.length === 1 &&
        editorContent.content[0]?.type === "paragraph" &&
        (!editorContent.content[0]?.content ||
          editorContent.content[0]?.content.length === 0));
    formData.set("bodyIsEmpty", String(isBodyEmpty));
    formData.set("type", type);
    formData.set("status", status);
    formData.set("visibility", visibility);
    formData.set("categoryId", categoryId);
    formData.set("isFeatured", String(isFeatured));
    formData.set("allowComments", String(allowComments));
    formData.set("tagIds", selectedTagIds.join(","));
    formData.set("scheduledAt", scheduledAt);
    formData.set("metaTitle", metaTitle);
    formData.set("metaDescription", metaDescription);
    formData.set("ogImageUrl", ogImageUrl);
    formData.set("canonicalUrl", canonicalUrl);
    if (content?.id) {
      formData.set("id", content.id);
    }

    const result = await saveContent(prevState, formData);

    if (result.success) {
      toast.success(content?.id ? "Content updated!" : "Content created!");
      router.push("/content");
    } else if (result.error) {
      toast.error(result.error);
    }

    return result;
  };

  const [, formAction, isPending] = useActionState(
    handleFormAction,
    initialState
  );

  const handleEditorChange = useCallback((content: any) => {
    setEditorContent(content);
  }, []);

  // Featured image upload state
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const handleThumbnailUpload = async (file: File) => {
    setIsUploadingThumbnail(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const result = await uploadMedia(formData);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (result.media?.url) {
        setThumbnailUrl(result.media.url);
        toast.success("Image uploaded successfully");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setIsUploadingThumbnail(false);
    }
  };

  const handleThumbnailFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("Image must be less than 10MB");
      return;
    }

    handleThumbnailUpload(file);
  };

  const handleThumbnailDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleThumbnailUpload(file);
    } else {
      toast.error("Please drop an image file");
    }
  };

  const handleThumbnailDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleThumbnailClick = () => {
    thumbnailInputRef.current?.click();
  };

  const handleAddTag = (tagId: string) => {
    if (!selectedTagIds.includes(tagId)) {
      setSelectedTagIds([...selectedTagIds, tagId]);
    }
    setTagInput("");
  };

  const handleRemoveTag = (tagId: string) => {
    setSelectedTagIds(selectedTagIds.filter((id) => id !== tagId));
  };

  const handleCreateTag = async () => {
    if (!tagInput.trim()) return;
    setIsCreatingTag(true);
    const newTag = await createTag(tagInput.trim());
    if (newTag) {
      setAvailableTags([...availableTags, newTag]);
      setSelectedTagIds([...selectedTagIds, newTag.id]);
      setTagInput("");
    }
    setIsCreatingTag(false);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);

    // Auto-generate slug only if not in edit mode
    if (!slugEditable) {
      setSlug(
        slugify(newTitle, {
          lower: true,
          strict: true,
          trim: true,
        })
      );
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlug(e.target.value);
  };

  const handleEnableSlugEdit = () => {
    setSlugEditable(true);
  };

  const filteredTags = availableTags.filter(
    (tag) =>
      tag.name.toLowerCase().includes(tagInput.toLowerCase()) &&
      !selectedTagIds.includes(tag.id)
  );

  const selectedTags = availableTags.filter((tag) =>
    selectedTagIds.includes(tag.id)
  );

  const isEditing = !!content?.id;

  // Validation helpers
  const isContentEmpty =
    !editorContent ||
    !editorContent.type ||
    editorContent.type !== "doc" ||
    !Array.isArray(editorContent.content) ||
    editorContent.content.length === 0 ||
    (editorContent.content.length === 1 &&
      editorContent.content[0]?.type === "paragraph" &&
      (!editorContent.content[0]?.content ||
        editorContent.content[0]?.content.length === 0));

  const isTitleEmpty = !title.trim();
  const canSaveDraft = !isTitleEmpty;
  const canPublish = !isTitleEmpty && !isContentEmpty;

  const handlePublishClick = () => {
    if (!canPublish) {
      if (isTitleEmpty) {
        toast.error("Title is required to publish");
        return;
      }
      if (isContentEmpty) {
        toast.error("Content is required to publish");
        return;
      }
    }
    setStatus("published");
  };

  const handleSaveDraftClick = () => {
    if (!canSaveDraft) {
      toast.error("Title is required");
      return;
    }
    setStatus("draft");
  };

  const handlePreview = () => {
    if (!title.trim()) {
      toast.error("Title is required for preview");
      return;
    }

    // Store form state in sessionStorage before navigating
    if (typeof window !== "undefined") {
      sessionStorage.setItem(
        "content-form-body",
        JSON.stringify(editorContent)
      );
      sessionStorage.setItem("content-form-title", title);
      sessionStorage.setItem("content-form-slug", slug);
      sessionStorage.setItem("content-form-type", type);
      sessionStorage.setItem("content-form-status", status);
      sessionStorage.setItem("content-form-visibility", visibility);
      sessionStorage.setItem("content-form-excerpt", excerpt);
      sessionStorage.setItem("content-form-categoryId", categoryId);
      sessionStorage.setItem("content-form-thumbnailUrl", thumbnailUrl);
      sessionStorage.setItem(
        "content-form-isFeatured",
        JSON.stringify(isFeatured)
      );
      sessionStorage.setItem(
        "content-form-allowComments",
        JSON.stringify(allowComments)
      );
      sessionStorage.setItem("content-form-scheduledAt", scheduledAt);
      sessionStorage.setItem(
        "content-form-selectedTagIds",
        JSON.stringify(selectedTagIds)
      );
    }

    const selectedCategory = categories.find((cat) => cat.id === categoryId);
    const categoryName = selectedCategory?.name || null;

    const selectedTags = availableTags
      .filter((tag) => selectedTagIds.includes(tag.id))
      .map((tag) => ({ name: tag.name, slug: tag.slug }));

    // Generate a simple preview ID based on title slug
    const previewSlug =
      slug || slugify(title, { lower: true, strict: true, trim: true });
    const previewId = `${Date.now()}-${previewSlug.substring(0, 20)}`;

    // Store preview data in sessionStorage with preview ID
    if (typeof window !== "undefined") {
      const previewData = {
        title,
        body: editorContent,
        excerpt,
        thumbnailUrl,
        authorName,
        categoryName,
        tags: selectedTags,
        isFeatured,
        publishedAt: status === "published" ? new Date().toISOString() : null,
      };
      sessionStorage.setItem(
        `preview-${previewId}`,
        JSON.stringify(previewData)
      );
    }

    const previewUrl = `/content/preview?id=${previewId}`;
    window.open(previewUrl, "_blank");
  };

  return (
    <form ref={formRef} action={formAction}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-xl font-semibold">
              {isEditing ? "Edit Content" : "Create New Content"}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handlePreview}
            disabled={!title.trim()}
          >
            <HugeiconsIcon
              icon={EyeIcon}
              strokeWidth={2}
              className="size-4 mr-2"
            />
            Preview
          </Button>
          <Button
            type={canSaveDraft ? "submit" : "button"}
            name="status"
            value="draft"
            variant="outline"
            disabled={isPending}
            onClick={handleSaveDraftClick}
          >
            Save Draft
          </Button>
          <Button
            type={canPublish ? "submit" : "button"}
            disabled={isPending}
            onClick={handlePublishClick}
          >
            {isPending && (
              <HugeiconsIcon
                icon={Loading03Icon}
                className="animate-spin"
                strokeWidth={2}
              />
            )}
            {isEditing ? "Update" : "Publish"}
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              name="title"
              value={title}
              onChange={handleTitleChange}
              placeholder="Enter article title..."
              className="text-lg font-medium"
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="slug">Slug (URL)</Label>
              {!slugEditable && (
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={handleEnableSlugEdit}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Edit slug
                </Button>
              )}
            </div>
            <Input
              id="slug"
              name="slug"
              value={slug}
              onChange={handleSlugChange}
              placeholder="article-url-slug"
              disabled={!slugEditable}
              className={!slugEditable ? "bg-muted" : ""}
            />
            <p className="text-xs text-muted-foreground">
              {slugEditable
                ? "Customize your URL slug"
                : "Auto-generated from title"}
            </p>
          </div>

          <div className="space-y-2">
            <Label>
              Content <span className="text-destructive">*</span>
            </Label>
            <div className="border rounded-lg overflow-hidden min-h-[500px]">
              <ContentEditor
                initialContent={editorContent}
                onChange={handleEditorChange}
              />
            </div>
            {isContentEmpty && (
              <p className="text-xs text-muted-foreground">
                Add content to publish your post
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              name="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="A short summary of your content that appears in previews and search results..."
              className="min-h-[100px]"
            />
          </div>
        </div>

        <div className="w-full lg:w-80 shrink-0 space-y-4">
          {/* Featured Image */}
          <div className="bg-card border rounded-lg p-4">
            <Label className="mb-3 block font-medium">Featured Image</Label>
            <div
              className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer relative"
              onClick={handleThumbnailClick}
              onDrop={handleThumbnailDrop}
              onDragOver={handleThumbnailDragOver}
            >
              {isUploadingThumbnail ? (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <HugeiconsIcon
                    icon={Loading03Icon}
                    className="size-10 animate-spin"
                    strokeWidth={1.5}
                  />
                  <span className="text-sm">Uploading...</span>
                </div>
              ) : thumbnailUrl ? (
                <div className="relative">
                  <img
                    src={thumbnailUrl}
                    alt="Thumbnail"
                    className="w-full h-32 object-cover rounded"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon-xs"
                    className="absolute top-1 right-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      setThumbnailUrl("");
                    }}
                  >
                    <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <HugeiconsIcon
                    icon={Image01Icon}
                    className="size-10"
                    strokeWidth={1.5}
                  />
                  <span className="text-sm">Click to upload</span>
                  <span className="text-xs">or drag and drop</span>
                </div>
              )}
            </div>
            <Input
              ref={thumbnailInputRef}
              type="file"
              accept="image/*"
              onChange={handleThumbnailFileSelect}
              className="hidden"
            />
            <Input
              type="url"
              placeholder="Or paste image URL..."
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              className="mt-3 text-sm"
              onClick={(e) => e.stopPropagation()}
            />
            <Input type="hidden" name="thumbnailUrl" value={thumbnailUrl} />
          </div>

          <SettingsSection
            title="Post Settings"
            icon={
              <HugeiconsIcon
                icon={Settings02Icon}
                strokeWidth={2}
                className="size-4"
              />
            }
            defaultOpen={true}
          >
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Author</Label>
              <Input
                value={authorName}
                disabled
                className="bg-muted h-8 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Content Type
              </Label>
              <Select
                value={type}
                onValueChange={(v) => setType(v as ContentType)}
              >
                <SelectTrigger className="w-full h-8">
                  <SelectValue>Select type</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="post">Blog Post</SelectItem>
                  <SelectItem value="page">Page</SelectItem>
                  <SelectItem value="documentation">Documentation</SelectItem>
                  <SelectItem value="product">Product</SelectItem>
                  <SelectItem value="landing_page">Landing Page</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Category</Label>
              <Select value={categoryId || ""} onValueChange={setCategoryId}>
                <SelectTrigger className="w-full h-8">
                  <SelectValue>Select category</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No category</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Tags</Label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {selectedTags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="secondary"
                    className="gap-1 pr-1"
                  >
                    {tag.name}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag.id)}
                      className="hover:bg-muted rounded-full p-0.5"
                    >
                      <HugeiconsIcon
                        icon={Cancel01Icon}
                        strokeWidth={2}
                        className="size-3"
                      />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="relative">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add tags..."
                  className="h-8 text-sm pr-8"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (filteredTags.length > 0) {
                        handleAddTag(filteredTags[0].id);
                      } else if (tagInput.trim()) {
                        handleCreateTag();
                      }
                    }
                  }}
                />
                {isCreatingTag && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <HugeiconsIcon
                      icon={Loading03Icon}
                      className="size-4 animate-spin"
                      strokeWidth={2}
                    />
                  </div>
                )}
              </div>
              {tagInput && filteredTags.length > 0 && (
                <div className="bg-popover border rounded-md shadow-md mt-1 max-h-32 overflow-y-auto">
                  {filteredTags.slice(0, 5).map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      className="w-full text-left px-3 py-1.5 text-sm hover:bg-muted"
                      onClick={() => handleAddTag(tag.id)}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              )}
              {tagInput && filteredTags.length === 0 && (
                <button
                  type="button"
                  className="w-full text-left px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted border rounded-md mt-1"
                  onClick={handleCreateTag}
                  disabled={isCreatingTag}
                >
                  Create &quot;{tagInput}&quot;
                </button>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Visibility
              </Label>
              <Select
                value={visibility}
                onValueChange={(v) => setVisibility(v as ContentVisibility)}
              >
                <SelectTrigger className="w-full h-8">
                  <SelectValue>Select visibility</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="members_only">Members Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </SettingsSection>

          <SettingsSection
            title="Publish Settings"
            icon={
              <HugeiconsIcon
                icon={Calendar03Icon}
                strokeWidth={2}
                className="size-4"
              />
            }
          >
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Status</Label>
              <Select
                value={status}
                onValueChange={(v) => setStatus(v as ContentStatus)}
              >
                <SelectTrigger className="w-full h-8">
                  <SelectValue>Select status</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending_review">Pending Review</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {status === "scheduled" && (
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  Schedule For
                </Label>
                <Input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
            )}

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="featured" className="cursor-pointer text-sm">
                  Featured post
                </Label>
                <Switch
                  id="featured"
                  checked={isFeatured}
                  onCheckedChange={setIsFeatured}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="comments" className="cursor-pointer text-sm">
                  Allow comments
                </Label>
                <Switch
                  id="comments"
                  checked={allowComments}
                  onCheckedChange={setAllowComments}
                />
              </div>
            </div>
          </SettingsSection>

          <SettingsSection
            title="SEO Settings"
            icon={
              <HugeiconsIcon
                icon={Search01Icon}
                strokeWidth={2}
                className="size-4"
              />
            }
          >
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Meta Title
              </Label>
              <Input
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder={title || "Page title for search engines"}
                className="h-8 text-sm"
              />
              <p className="text-xs text-muted-foreground">
                {metaTitle.length}/60 characters
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Meta Description
              </Label>
              <Textarea
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="A brief description for search engine results..."
                className="min-h-[80px] text-sm"
              />
              <p className="text-xs text-muted-foreground">
                {metaDescription.length}/160 characters
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Social Image URL
              </Label>
              <Input
                type="url"
                value={ogImageUrl}
                onChange={(e) => setOgImageUrl(e.target.value)}
                placeholder="https://example.com/og-image.jpg"
                className="h-8 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Canonical URL
              </Label>
              <Input
                type="url"
                value={canonicalUrl}
                onChange={(e) => setCanonicalUrl(e.target.value)}
                placeholder="https://example.com/original-post"
                className="h-8 text-sm"
              />
            </div>
          </SettingsSection>
        </div>
      </div>
    </form>
  );
}
