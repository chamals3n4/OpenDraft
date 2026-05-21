"use client";

import { redirect } from "next/navigation";
import { useProfile } from "@/hooks/use-admin-data";
import { ProfileForm } from "./profile-form";
import { Skeleton } from "@/components/ui/skeleton";

export function ProfileClient() {
  const { data: profile, isLoading, error } = useProfile();

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col px-6 lg:px-10 py-4 pt-0 gap-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (error || !profile) {
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
