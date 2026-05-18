import { NextResponse } from "next/server";
import { createClientServer } from "@/app/lib/supabase/server";

const tableMap: Record<string, string> = {
  buyers: "buyer_listings",
  produce: "produce_listings",
};

type RouteContext = {
  params: Promise<{
    module: string;
    id: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { module, id } = await context.params;

  const table = tableMap[module];

  if (!table || !id) {
    return NextResponse.json(
      { error: "Invalid delete request." },
      { status: 400 },
    );
  }

  const supabase = await createClientServer();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.redirect(new URL("/auth/login", request.url), 303);
  }

  const { error } = await supabase
    .from(table)
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json(
      { error: `Delete failed: ${error.message}` },
      { status: 500 },
    );
  }

  return NextResponse.redirect(new URL("/my-listings", request.url), 303);
}

export async function GET(request: Request) {
  return NextResponse.redirect(new URL("/my-listings", request.url), 303);
}
