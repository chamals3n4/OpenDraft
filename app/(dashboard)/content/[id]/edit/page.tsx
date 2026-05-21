import { requireAuth } from "@/lib/auth";
import { EditContentClient } from "./edit-content-client";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditContentPage({ params }: Props) {
  const { id } = await params;
  const user = await requireAuth();

  return (
    <EditContentClient
      contentId={id}
      authorName={user.profile?.display_name || "Unknown"}
    />
  );
}
