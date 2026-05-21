import { requireAuth } from "@/lib/auth";
import { ProfileClient } from "./profile-client";

export default async function ProfilePage() {
  await requireAuth();
  return <ProfileClient />;
}
