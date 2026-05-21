import { requireAuth } from "@/lib/auth";
import { MediaClient } from "./media-client";

interface Props {
  searchParams: Promise<{
    search?: string;
    type?: string;
    page?: string;
  }>;
}

export default async function MediaPage({ searchParams }: Props) {
  await requireAuth();

  const params = await searchParams;
  const filters = {
    search: params.search || "",
    type: params.type || "all",
    page: parseInt(params.page || "1"),
    limit: 24,
  };

  return <MediaClient filters={filters} />;
}
