export type ContentType =
  | "post"
  | "page"
  | "documentation"
  | "product"
  | "landing_page";

export type ContentStatus =
  | "draft"
  | "pending_review"
  | "scheduled"
  | "published"
  | "archived";

export type ContentVisibility = "public" | "private" | "members_only";

export interface ContentInput {
  id?: string | null;
  title: string;
  slug?: string;
  bodyJson: string;
  type: ContentType;
  status: ContentStatus;
  visibility: ContentVisibility;
  excerpt?: string | null;
  categoryId?: string | null;
  thumbnailUrl?: string | null;
  isFeatured: boolean;
  allowComments: boolean;
  scheduledAt?: string | null;
  bodyIsEmpty: boolean;
  tagIds: string[];
  seoData: SeoInput;
}

export interface SeoInput {
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogImageUrl?: string | null;
  canonicalUrl?: string | null;
}

export interface ContentData {
  title: string;
  slug: string;
  body: unknown;
  body_format: string;
  type: ContentType;
  status: ContentStatus;
  visibility: ContentVisibility;
  excerpt: string | null;
  category_id: string | null;
  thumbnail_url: string | null;
  is_featured: boolean;
  allow_comments: boolean;
  author_id: string;
  published_at: string | null;
  scheduled_at: string | null;
  updated_at: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface ContentFilters {
  search?: string;
  status?: string;
  type?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedContents {
  data: Array<{
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
    profiles: { display_name: string } | null;
  }>;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
