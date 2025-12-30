"use client";

import { useActionState, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Loading03Icon,
  LogoutSquare01Icon,
  Camera01Icon,
  Delete01Icon,
} from "@hugeicons/core-free-icons";
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState(profile.display_name);
  const [bio, setBio] = useState(profile.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || "");
  const [isUploading, setIsUploading] = useState(false);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be less than 2MB");
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${profile.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

      setAvatarUrl(data.publicUrl);
      toast.success("Avatar uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload avatar");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarUrl("");
  };

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
            <Avatar className="h-24 w-24 rounded-full">
              <AvatarImage src={avatarUrl} alt={displayName} />
              <AvatarFallback className="rounded-full text-2xl">
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
                variant={
                  profile.status === "active" ? "outline" : "destructive"
                }
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

            {/* Avatar Upload */}
            <div className="space-y-3">
              <Label>Profile Photo</Label>
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <Avatar className="h-20 w-20 rounded-full">
                    <AvatarImage src={avatarUrl} alt={displayName} />
                    <AvatarFallback className="rounded-full text-xl">
                      {getInitials(displayName)}
                    </AvatarFallback>
                  </Avatar>
                  {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                      <HugeiconsIcon
                        icon={Loading03Icon}
                        className="animate-spin text-white"
                        strokeWidth={2}
                      />
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                  <input type="hidden" name="avatarUrl" value={avatarUrl} />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    <HugeiconsIcon icon={Camera01Icon} strokeWidth={2} />
                    {avatarUrl ? "Change Photo" : "Upload Photo"}
                  </Button>
                  {avatarUrl && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveAvatar}
                      disabled={isUploading}
                      className="text-destructive hover:text-destructive"
                    >
                      <HugeiconsIcon icon={Delete01Icon} strokeWidth={2} />
                      Remove
                    </Button>
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                JPG, PNG or GIF. Max 2MB.
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
