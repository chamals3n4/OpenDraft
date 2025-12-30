import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { getContent, getCategories, getTags } from "../../actions";
import { ContentForm } from "../../components/content-form";

interface EditContentPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditContentPage({
  params,
}: EditContentPageProps) {
  const { id } = await params;
  const user = await requireAuth();

  const [content, categories, tags] = await Promise.all([
    getContent(id),
    getCategories(),
    getTags(),
  ]);

  if (!content) {
    notFound();
  }

  return (
    <div className="flex flex-1 flex-col px-6 lg:px-10 py-4 pt-0">
      <ContentForm
        content={content}
        categories={categories}
        tags={tags}
        authorName={user.profile?.display_name || "Unknown"}
      />
    </div>
  );
}
