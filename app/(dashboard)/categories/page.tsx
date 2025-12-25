import { requireRole } from "@/lib/auth";
import { getCategories } from "./actions";
import { CategoriesList } from "./categories-list";

export default async function CategoriesPage() {
  await requireRole(["admin", "editor"]);

  const categories = await getCategories();

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 px-6 lg:px-10">
      <CategoriesList categories={categories} />
    </div>
  );
}
