import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("mandis")
      .select("name, slug, address")
      .order("name", { ascending: true });

    if (error) {
      return NextResponse.json(
        { rows: [], error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      rows: data || [],
      error: null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        rows: [],
        error: error instanceof Error ? error.message : "Server error",
      },
      { status: 500 },
    );
  }
}
