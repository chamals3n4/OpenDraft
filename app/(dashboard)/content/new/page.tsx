import { requireAuth } from "@/lib/auth";
import { NewContentClient } from "./new-content-client";

export default async function NewContentPage() {
  const user = await requireAuth();
  return (
    <NewContentClient authorName={user.profile?.display_name || "Unknown"} />
  );
}
