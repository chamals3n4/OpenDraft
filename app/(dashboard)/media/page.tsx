import { requireAuth } from "@/lib/auth";
import { getMedia } from "./actions";
import { MediaGrid } from "./media-grid";

interface MediaPageProps {
  searchParams: Promise<{
    search?: string;
    type?: string;
    page?: string;
  }>;
}

export default async function MediaPage({ searchParams }: MediaPageProps) {
  await requireAuth();

  const params = await searchParams;
  const filters = {
    search: params.search || "",
    type: params.type || "all",
    page: parseInt(params.page || "1"),
    limit: 24,
  };

  const media = await getMedia(filters);

  return (
    <div className="flex flex-1 flex-col gap-4 px-6 lg:px-10 py-4 pt-0">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Media Library</h1>
        <p className="text-muted-foreground">
          Upload and manage your images and files.
        </p>
      </div>

      <MediaGrid
        media={media.data}
        pagination={{
          total: media.total,
          page: media.page,
          limit: media.limit,
          totalPages: media.totalPages,
        }}
        filters={filters}
      />
    </div>
  );
}

