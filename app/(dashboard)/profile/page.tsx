import { requireAuth } from "@/lib/auth";
import { getProfile } from "./actions";
import { ProfileForm } from "./profile-form";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  await requireAuth();
  const profile = await getProfile();

  if (!profile) {
    redirect("/login");
  }

  return (
    <div className="flex flex-1 flex-col px-6 lg:px-10 py-4 pt-0">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-muted-foreground">
          Manage your account settings and profile information.
        </p>
      </div>

      <ProfileForm profile={profile} />
    </div>
  );
}
