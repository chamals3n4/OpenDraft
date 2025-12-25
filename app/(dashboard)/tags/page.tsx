import { requireRole } from "@/lib/auth";
import { getTags } from "./actions";
import { TagsList } from "./tags-list";

export default async function TagsPage() {
  await requireRole(["admin", "editor"]);

  const tags = await getTags();

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 px-6 lg:px-10">
      <TagsList tags={tags} />
    </div>
  );
}
