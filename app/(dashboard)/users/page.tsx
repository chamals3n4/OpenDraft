import { requireRole } from "@/lib/auth";
import { UsersClient } from "./users-client";

export default async function UsersPage() {
  await requireRole(["admin"]);
  return <UsersClient />;
}
