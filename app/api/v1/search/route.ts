import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

/**
 * GET /api/v1/search
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const sp = request.nextUrl.searchParams;

    const q = sp.get("q")?.trim();
    if (!q) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      );
    }

    const page = Math.max(1, Number(sp.get("page") ?? 1));
    const limit = Math.min(100, Math.max(1, Number(sp.get("limit") ?? 10)));
    const offset = (page - 1) * limit;
    const type = sp.get("type");

    let query = supabase
      .from("public_posts_with_tags")
      .select("*", { count: "exact" })
      .or(`title.ilike.%${q}%,excerpt.ilike.%${q}%,slug.ilike.%${q}%`);

    if (type) query = query.eq("type", type);

    const { data, error, count } = await query
      .order("published_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error(error);
      return NextResponse.json(
        { error: "Failed to search content" },
        { status: 500 }
      );
    }

    const total = count ?? 0;

    return NextResponse.json({
      data,
      query: q,
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
