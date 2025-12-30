import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const supabase = await createClient();

    const sp = request.nextUrl.searchParams;
    const page = Math.max(1, Number(sp.get("page") ?? 1));
    const limit = Math.min(100, Math.max(1, Number(sp.get("limit") ?? 10)));
    const offset = (page - 1) * limit;

    const { data: category, error: categoryError } = await supabase
      .from("categories")
      .select("id, name, slug, description")
      .eq("slug", slug)
      .single();

    if (categoryError || !category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    const { data, error, count } = await supabase
      .from("public_posts_with_tags")
      .select("*", { count: "exact" })
      .eq("category_id", category.id)
      .order("published_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch posts" },
        { status: 500 }
      );
    }

    const total = count ?? 0;

    return NextResponse.json({
      data,
      category,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("API Error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
