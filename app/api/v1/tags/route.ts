import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

/**
 * GET /api/v1/tags
 */
export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("public_tags_with_post_count")
      .select("*")
      .order("name");

    if (error) {
      console.error(error);
      return NextResponse.json(
        { error: "Failed to fetch tags" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
