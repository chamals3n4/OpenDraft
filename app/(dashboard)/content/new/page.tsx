import { requireAuth } from "@/lib/auth";
import { getCategories, getTags } from "../actions";
import { ContentForm } from "../content-form";

export default async function NewContentPage() {
  const user = await requireAuth();
  const [categories, tags] = await Promise.all([getCategories(), getTags()]);

  return (
    <div className="flex flex-1 flex-col px-6 lg:px-10 py-4 pt-0">
      <ContentForm
        categories={categories}
        tags={tags}
        authorName={user.profile?.display_name || "Unknown"}
      />
    </div>
  );
}
