"use client"

import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Edit02Icon,
  Delete02Icon,
  MoreHorizontalIcon,
} from "@hugeicons/core-free-icons"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { deleteContent } from "./actions"
import { toast } from "sonner"

interface Content {
  id: string
  title: string
  slug: string
  type: string
  status: string
  visibility: string
  created_at: string
  updated_at: string
  published_at: string | null
  author_id: string
  profiles: {
    display_name: string
  } | null
}

interface ContentListProps {
  contents: Content[]
}

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  draft: "secondary",
  pending_review: "outline",
  scheduled: "outline",
  published: "default",
  archived: "destructive",
}

const typeLabels: Record<string, string> = {
  post: "Post",
  page: "Page",
  documentation: "Docs",
  product: "Product",
  landing_page: "Landing",
}

export function ContentList({ contents }: ContentListProps) {
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this content?")) {
      return
    }

    const result = await deleteContent(id)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Content deleted successfully")
    }
  }

  if (contents.length === 0) {
    return (
      <div className="bg-card border rounded-xl p-12 text-center">
        <p className="text-muted-foreground mb-4">No content yet</p>
        <Link href="/content/new">
          <Button>Create your first content</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-card border rounded-xl overflow-hidden">
      <table className="w-full">
        <thead className="border-b bg-muted/50">
          <tr>
            <th className="text-left px-4 py-3 font-medium text-sm">Title</th>
            <th className="text-left px-4 py-3 font-medium text-sm">Type</th>
            <th className="text-left px-4 py-3 font-medium text-sm">Status</th>
            <th className="text-left px-4 py-3 font-medium text-sm">Author</th>
            <th className="text-left px-4 py-3 font-medium text-sm">Updated</th>
            <th className="px-4 py-3 w-12"></th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {contents.map((content) => (
            <tr key={content.id} className="hover:bg-muted/30 transition-colors">
              <td className="px-4 py-3">
                <Link
                  href={`/content/${content.id}/edit`}
                  className="font-medium hover:underline"
                >
                  {content.title}
                </Link>
                <p className="text-xs text-muted-foreground mt-0.5">
                  /{content.slug}
                </p>
              </td>
              <td className="px-4 py-3">
                <span className="text-sm text-muted-foreground">
                  {typeLabels[content.type] || content.type}
                </span>
              </td>
              <td className="px-4 py-3">
                <Badge variant={statusColors[content.status] || "secondary"}>
                  {content.status.replace("_", " ")}
                </Badge>
              </td>
              <td className="px-4 py-3 text-sm text-muted-foreground">
                {content.profiles?.display_name || "Unknown"}
              </td>
              <td className="px-4 py-3 text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(content.updated_at), {
                  addSuffix: true,
                })}
              </td>
              <td className="px-4 py-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-sm">
                      <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={2} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/content/${content.id}/edit`}>
                        <HugeiconsIcon icon={Edit02Icon} strokeWidth={2} />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => handleDelete(content.id)}
                    >
                      <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

