import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const sp = request.nextUrl.searchParams;

    const page = Math.max(1, Number(sp.get("page") ?? 1));
    const limit = Math.min(100, Math.max(1, Number(sp.get("limit") ?? 10)));
    const offset = (page - 1) * limit;

    const type = sp.get("type");
    const category = sp.get("category");
    const tag = sp.get("tag");
    const featured = sp.get("featured") === "true";
    const sort = sp.get("sort") ?? "published_at";
    const order = sp.get("order") === "asc";

    const validSort = ["published_at", "updated_at", "created_at", "title"];
    const sortField = validSort.includes(sort) ? sort : "published_at";

    let query = supabase
      .from("public_posts_with_tags")
      .select("*", { count: "exact" });

    if (type) query = query.eq("type", type);
    if (featured) query = query.eq("is_featured", true);
    if (category) query = query.eq("category_slug", category);
    if (tag) query = query.contains("tags", [{ slug: tag }]);

    const { data, error, count } = await query
      .order(sortField, { ascending: order })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error(error);
      return NextResponse.json(
        { error: "Failed to fetch posts" },
        { status: 500 }
      );
    }

    const total = count ?? 0;

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
