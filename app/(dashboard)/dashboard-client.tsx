"use client";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardStats, useRecentContent } from "@/hooks/use-dashboard-data";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  TextAlignLeftIcon,
  FolderOpenIcon,
  TagsIcon,
  Calendar03Icon,
  CheckmarkCircle02Icon,
  Edit02Icon,
} from "@hugeicons/core-free-icons";

interface Props {
  userName: string;
}

const StatSkeleton = () => (
  <div className="bg-card border rounded-xl p-6">
    <Skeleton className="h-4 w-24 mb-3" />
    <Skeleton className="h-8 w-12" />
  </div>
);

const SmallStatSkeleton = () => (
  <div className="bg-card border rounded-xl p-4">
    <div className="flex items-center gap-3">
      <Skeleton className="size-10 rounded-lg" />
      <div>
        <Skeleton className="h-6 w-12 mb-1" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  </div>
);

export function DashboardClient({ userName }: Props) {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: recentContent, isLoading: recentLoading } =
    useRecentContent(5);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
            Published
          </Badge>
        );
      case "draft":
        return <Badge variant="secondary">Draft</Badge>;
      case "scheduled":
        return (
          <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">
            Scheduled
          </Badge>
        );
      case "pending_review":
        return (
          <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">
            Pending
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 px-6 lg:px-10">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Welcome back, {userName}!</h1>
        <p className="text-muted-foreground">
          Here&apos;s what&apos;s happening with your content.
        </p>
      </div>

      {/* Main Stats */}
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        {statsLoading ? (
          <>
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
          </>
        ) : (
          <>
            <Link href="/content" className="group">
              <div className="bg-card border rounded-xl p-6 transition-colors group-hover:border-primary/50">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-muted-foreground text-sm">
                    Total Posts
                  </h3>
                  <HugeiconsIcon
                    icon={TextAlignLeftIcon}
                    strokeWidth={2}
                    className="size-5 text-muted-foreground"
                  />
                </div>
                <p className="text-3xl font-bold mt-2">
                  {stats?.totalPosts ?? 0}
                </p>
              </div>
            </Link>
            <div className="bg-card border rounded-xl p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-muted-foreground text-sm">
                  Published
                </h3>
                <HugeiconsIcon
                  icon={CheckmarkCircle02Icon}
                  strokeWidth={2}
                  className="size-5 text-emerald-500"
                />
              </div>
              <p className="text-3xl font-bold mt-2 text-emerald-600">
                {stats?.published ?? 0}
              </p>
            </div>
            <div className="bg-card border rounded-xl p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-muted-foreground text-sm">
                  Drafts
                </h3>
                <HugeiconsIcon
                  icon={Edit02Icon}
                  strokeWidth={2}
                  className="size-5 text-muted-foreground"
                />
              </div>
              <p className="text-3xl font-bold mt-2">{stats?.drafts ?? 0}</p>
            </div>
          </>
        )}
      </div>

      {/* Secondary Stats */}
      <div className="grid auto-rows-min gap-4 md:grid-cols-4">
        {statsLoading ? (
          <>
            <SmallStatSkeleton />
            <SmallStatSkeleton />
            <SmallStatSkeleton />
            <SmallStatSkeleton />
          </>
        ) : (
          <>
            <div className="bg-card border rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <HugeiconsIcon
                    icon={Calendar03Icon}
                    strokeWidth={2}
                    className="size-5 text-blue-500"
                  />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {stats?.scheduled ?? 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Scheduled</p>
                </div>
              </div>
            </div>
            <Link href="/categories" className="group">
              <div className="bg-card border rounded-xl p-4 transition-colors group-hover:border-primary/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <HugeiconsIcon
                      icon={FolderOpenIcon}
                      strokeWidth={2}
                      className="size-5 text-purple-500"
                    />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {stats?.categories ?? 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Categories</p>
                  </div>
                </div>
              </div>
            </Link>
            <Link href="/tags" className="group">
              <div className="bg-card border rounded-xl p-4 transition-colors group-hover:border-primary/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-500/10 rounded-lg">
                    <HugeiconsIcon
                      icon={TagsIcon}
                      strokeWidth={2}
                      className="size-5 text-orange-500"
                    />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {stats?.tags ?? 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Tags</p>
                  </div>
                </div>
              </div>
            </Link>
            <Link href="/content/new" className="group">
              <div className="bg-primary text-primary-foreground rounded-xl p-4 transition-opacity group-hover:opacity-90">
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-lg font-semibold">New Post</p>
                    <p className="text-sm opacity-80">Create content</p>
                  </div>
                </div>
              </div>
            </Link>
          </>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-card border rounded-xl p-6 flex-1">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Recent Activity</h2>
          <Link
            href="/content"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            View all →
          </Link>
        </div>
        {recentLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-48 mb-1" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
                <Skeleton className="h-3 w-24" />
              </div>
            ))}
          </div>
        ) : recentContent && recentContent.length > 0 ? (
          <div className="space-y-3">
            {recentContent.map((content) => (
              <Link
                key={content.id}
                href={`/content/${content.id}/edit`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="hidden sm:block">
                    {getStatusBadge(content.status)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate group-hover:text-primary transition-colors">
                      {content.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {content.author?.display_name || "Unknown"} •{" "}
                      <span className="capitalize">{content.type}</span>
                    </p>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground whitespace-nowrap ml-4">
                  {formatDistanceToNow(new Date(content.updated_at), {
                    addSuffix: true,
                  })}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>No recent activity</p>
            <p className="text-sm mt-1">
              Start creating content to see activity here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
