import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// GET /api/v1/posts/[slug]
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const supabase = await createClient();

    const { data: post, error } = await supabase
      .from("public_posts_with_tags")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error || !post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const { data: seoMeta } = await supabase
      .from("seo_meta")
      .select("*")
      .eq("content_id", post.id)
      .single();

    const { data: relatedPosts } = await supabase
      .from("public_posts_with_tags")
      .select(
        `
        id,
        title,
        slug,
        excerpt,
        thumbnail_url,
        published_at,
        author_name
        `
      )
      .eq("type", post.type)
      .neq("id", post.id)
      .order("published_at", { ascending: false })
      .limit(5);

    return NextResponse.json({
      data: {
        ...post,
        seo_meta: seoMeta || null,
        related_posts: relatedPosts || [],
      },
    });
  } catch (e) {
    console.error("Post API Error:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
