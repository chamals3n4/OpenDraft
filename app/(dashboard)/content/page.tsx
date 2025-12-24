import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon } from "@hugeicons/core-free-icons"
import { requireAuth } from "@/lib/auth"
import { getContents } from "./actions"
import { Button } from "@/components/ui/button"
import { ContentList } from "./content-list"

export default async function ContentPage() {
  await requireAuth()
  const contents = await getContents()

  return (
    <div className="flex flex-1 flex-col gap-4 px-6 lg:px-10 py-4 pt-0">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Content</h1>
          <p className="text-muted-foreground">
            Manage your posts, pages, and other content.
          </p>
        </div>
        <Link href="/content/new">
          <Button>
            <HugeiconsIcon icon={Add01Icon} data-icon="inline-start" strokeWidth={2} />
            New Content
          </Button>
        </Link>
      </div>

      <ContentList contents={contents} />
    </div>
  )
}

