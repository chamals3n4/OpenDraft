import { requireAuth } from "@/lib/auth";
import { ContentListClient } from "./content-list-client";

interface Props {
  searchParams: Promise<{
    search?: string;
    status?: string;
    type?: string;
    page?: string;
  }>;
}

export default async function ContentPage({ searchParams }: Props) {
  await requireAuth();

  const params = await searchParams;
  const filters = {
    search: params.search || "",
    status: params.status || "all",
    type: params.type || "all",
    page: parseInt(params.page || "1"),
    limit: 10,
  };

  return <ContentListClient filters={filters} />;
}
