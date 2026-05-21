import { requireRole } from "@/lib/auth";
import { TagsClient } from "./tags-client";

export default async function TagsPage() {
  await requireRole(["admin", "editor"]);
  return <TagsClient />;
}
