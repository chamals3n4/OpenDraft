import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { cache } from "react";

export type UserRole = "admin" | "editor" | "contributor";
export type UserStatus = "active" | "suspended";

export interface UserProfile {
  id: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  role: UserRole;
  status: UserStatus;
  preferences: Record<string, unknown>;
  last_seen_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
  profile: UserProfile | null;
}

// cache() deduplicates calls within a single HTTP request.
// The layout calls requireAuth() for the sidebar, then the page calls
// requireAuth() for its own guard — getAuthUser() runs only once per request.
export const getAuthUser = cache(async (): Promise<AuthUser | null> => {
  const supabase = await createClient();

  const { data: claims, error } = await supabase.auth.getClaims();

  if (error || !claims) {
    return null;
  }

  // claims.claims holds the actual JWT payload (sub, email, etc.)
  const { sub, email } = claims.claims as { sub: string; email?: string };

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", sub)
    .maybeSingle();

  return {
    id: sub,
    email: email as string,
    profile: profile as UserProfile | null,
  };
});

export async function requireAuth(): Promise<AuthUser> {
  const user = await getAuthUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireRole(allowedRoles: UserRole[]): Promise<AuthUser> {
  const user = await requireAuth();

  if (!user.profile || !allowedRoles.includes(user.profile.role)) {
    redirect("/");
  }

  return user;
}

export async function isAdmin(): Promise<boolean> {
  const user = await getAuthUser();
  return user?.profile?.role === "admin";
}
