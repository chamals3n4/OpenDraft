"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Loading03Icon, Image01Icon, LogoutSquare01Icon } from "@hugeicons/core-free-icons";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { updateProfile, type ProfileFormState } from "./actions";
import { createClient } from "@/utils/supabase/client";

interface Profile {
  id: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  role: string;
  status: string;
  email: string;
  created_at: string;
  updated_at: string;
}

interface ProfileFormProps {
  profile: Profile;
}

const initialState: ProfileFormState = {
  error: null,
  success: false,
};

export function ProfileForm({ profile }: ProfileFormProps) {
  const router = useRouter();
  const supabase = createClient();
  
  const [displayName, setDisplayName] = useState(profile.display_name);
  const [bio, setBio] = useState(profile.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || "");

  const handleFormAction = async (
    prevState: ProfileFormState,
    formData: FormData
  ): Promise<ProfileFormState> => {
    const result = await updateProfile(prevState, formData);

    if (result.success) {
      toast.success(result.message || "Profile updated!");
    } else if (result.error) {
      toast.error(result.error);
    }

    return result;
  };

  const [, formAction, isPending] = useActionState(
    handleFormAction,
    initialState
  );

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "default";
      case "editor":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-card border rounded-lg p-6">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          {/* Avatar */}
          <div className="shrink-0">
            <Avatar className="h-24 w-24 rounded-xl">
              <AvatarImage src={avatarUrl} alt={displayName} />
              <AvatarFallback className="rounded-xl text-2xl">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Basic Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h2 className="text-xl font-semibold">{displayName}</h2>
              <Badge
                variant={getRoleBadgeVariant(profile.role)}
                className="capitalize"
              >
                {profile.role}
              </Badge>
              <Badge
                variant={profile.status === "active" ? "outline" : "destructive"}
                className="capitalize"
              >
                {profile.status}
              </Badge>
            </div>
            <p className="text-muted-foreground">{profile.email}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Member since{" "}
              {new Date(profile.created_at).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Details Form */}
        <form action={formAction} className="space-y-6">
          <div className="bg-card border rounded-lg p-6 space-y-6">
            <h3 className="font-semibold">Profile Information</h3>

            {/* Avatar URL */}
            <div className="space-y-2">
              <Label htmlFor="avatarUrl">Avatar URL</Label>
              <div className="flex gap-3">
                <div className="shrink-0">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Preview"
                      className="h-10 w-10 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                      <HugeiconsIcon
                        icon={Image01Icon}
                        strokeWidth={2}
                        className="size-5 text-muted-foreground"
                      />
                    </div>
                  )}
                </div>
                <Input
                  id="avatarUrl"
                  name="avatarUrl"
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Enter a URL for your profile picture
              </p>
            </div>

            {/* Display Name */}
            <div className="space-y-2">
              <Label htmlFor="displayName">
                Display Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="displayName"
                name="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your display name"
                required
              />
            </div>

            {/* Email (read-only) */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={profile.email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed here
              </p>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us a little about yourself..."
                className="min-h-[120px]"
              />
              <p className="text-xs text-muted-foreground">
                A short description that appears on your author profile
              </p>
            </div>

            {/* Submit */}
            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={isPending}>
                {isPending && (
                  <HugeiconsIcon
                    icon={Loading03Icon}
                    className="animate-spin"
                    strokeWidth={2}
                  />
                )}
                Save Changes
              </Button>
            </div>
          </div>
        </form>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Account Info */}
          <div className="bg-card border rounded-lg p-6 space-y-4">
            <h3 className="font-semibold">Account Information</h3>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Role</p>
                <p className="font-medium capitalize">{profile.role}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <p className="font-medium capitalize">{profile.status}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Created</p>
                <p className="font-medium">
                  {new Date(profile.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Last Updated</p>
                <p className="font-medium">
                  {new Date(profile.updated_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground pt-2 border-t">
              Contact an administrator to change your role or account status.
            </p>
          </div>

          {/* Logout */}
          <div className="bg-card border rounded-lg p-6">
            <h3 className="font-semibold mb-4">Session</h3>
            <Button
              type="button"
              variant="destructive"
              onClick={handleLogout}
              className="w-full"
            >
              <HugeiconsIcon icon={LogoutSquare01Icon} strokeWidth={2} />
              Log Out
            </Button>
            <p className="text-xs text-muted-foreground mt-3">
              This will sign you out of your current session.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
