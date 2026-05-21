import { requireRole } from "@/lib/auth";
import { CategoriesClient } from "./categories-client";

export default async function CategoriesPage() {
  await requireRole(["admin", "editor"]);
  return <CategoriesClient />;
}
