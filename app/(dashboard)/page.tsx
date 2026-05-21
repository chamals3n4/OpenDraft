import { requireAuth } from "@/lib/auth";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  // Auth only — data fetching moved to the client component
  // where TanStack Query caches it for instant back-navigation.
  const user = await requireAuth();

  return <DashboardClient userName={user.profile?.display_name || "User"} />;
}
