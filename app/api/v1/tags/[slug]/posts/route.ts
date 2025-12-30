import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

/**
 * GET /api/v1/tags/[slug]/posts
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const supabase = await createClient();

    const { slug } = await params;

    const sp = request.nextUrl.searchParams;
    const page = Math.max(1, Number(sp.get("page") ?? 1));
    const limit = Math.min(100, Math.max(1, Number(sp.get("limit") ?? 10)));
    const offset = (page - 1) * limit;

    const { data: tag } = await supabase
      .from("tags")
      .select("id, name, slug")
      .eq("slug", slug)
      .single();

    if (!tag) {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 });
    }

    const { data, error, count } = await supabase
      .from("public_posts_with_tags")
      .select("*", { count: "exact" })
      .contains("tags", [{ slug }])
      .order("published_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Supabase Error:", error);
      return NextResponse.json(
        { error: "Failed to fetch posts" },
        { status: 500 }
      );
    }

    const total = count ?? 0;

    return NextResponse.json({
      data,
      tag: {
        id: tag.id,
        name: tag.name,
        slug: tag.slug,
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (e) {
    console.error("Internal API Error:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
