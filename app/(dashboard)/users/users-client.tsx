"use client";

import { useUsers } from "@/hooks/use-admin-data";
import { UsersList } from "./users-list";
import { Skeleton } from "@/components/ui/skeleton";

export function UsersClient() {
  const { data: users, isLoading, error } = useUsers();

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
          Failed to load users: {error.message}
        </div>
      )}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <UsersList users={users ?? []} />
      )}
    </div>
  );
}
