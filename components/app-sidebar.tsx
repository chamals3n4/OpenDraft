"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Edit02Icon,
  FolderOpenIcon,
  TagsIcon,
  Settings01Icon,
  UserGroupIcon,
  DashboardBrowsingIcon,
  Add01Icon,
  TextAlignLeftIcon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";

import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { AuthUser } from "@/lib/auth";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: AuthUser;
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const pathname = usePathname();
  const isAdmin = user.profile?.role === "admin";
  const isEditorOrAbove =
    user.profile?.role === "admin" || user.profile?.role === "editor";

  // Check if we're in the content section
  const isContentSection = pathname.startsWith("/content");

  const userData = {
    name: user.profile?.display_name || "User",
    email: user.email,
    avatar: user.profile?.avatar_url || "",
    role: user.profile?.role || "contributor",
  };

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/">
              <SidebarMenuButton
                size="lg"
                className="hover:bg-transparent active:bg-transparent"
              >
                <span className="text-[1.35rem] font-semibold">
                  OpenDraft 🧩
                </span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarMenu>
            {/* Dashboard */}
            <SidebarMenuItem>
              <Link href="/">
                <SidebarMenuButton tooltip="Dashboard" isActive={pathname === "/"}>
                  <HugeiconsIcon icon={DashboardBrowsingIcon} strokeWidth={2} />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>

            {/* Content - Collapsible */}
            <Collapsible defaultOpen={isContentSection} className="group/collapsible">
              <SidebarMenuItem>
                <CollapsibleTrigger className="w-full">
                  <SidebarMenuButton tooltip="Content" isActive={isContentSection}>
                    <HugeiconsIcon icon={Edit02Icon} strokeWidth={2} />
                    <span>Content</span>
                    <HugeiconsIcon
                      icon={ArrowRight01Icon}
                      strokeWidth={2}
                      className="ml-auto transition-transform duration-200 group-data-[open]/collapsible:rotate-90"
                    />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        render={<Link href="/content/new" />}
                        isActive={pathname === "/content/new"}
                      >
                        <HugeiconsIcon icon={Add01Icon} strokeWidth={2} />
                        <span>New Post</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        render={<Link href="/content" />}
                        isActive={pathname === "/content"}
                      >
                        <HugeiconsIcon icon={TextAlignLeftIcon} strokeWidth={2} />
                        <span>All Posts</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>

            {/* Categories & Tags - Only for editors and above */}
            {isEditorOrAbove && (
              <>
                <SidebarMenuItem>
                  <Link href="/categories">
                    <SidebarMenuButton tooltip="Categories" isActive={pathname === "/categories"}>
                      <HugeiconsIcon icon={FolderOpenIcon} strokeWidth={2} />
                      <span>Categories</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <Link href="/tags">
                    <SidebarMenuButton tooltip="Tags" isActive={pathname === "/tags"}>
                      <HugeiconsIcon icon={TagsIcon} strokeWidth={2} />
                      <span>Tags</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              </>
            )}
          </SidebarMenu>
        </SidebarGroup>

        {/* Admin Section */}
        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <Link href="/users">
                  <SidebarMenuButton tooltip="User Management" isActive={pathname === "/users"}>
                    <HugeiconsIcon icon={UserGroupIcon} strokeWidth={2} />
                    <span>User Management</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/settings">
                  <SidebarMenuButton tooltip="Settings" isActive={pathname === "/settings"}>
                    <HugeiconsIcon icon={Settings01Icon} strokeWidth={2} />
                    <span>Settings</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}
