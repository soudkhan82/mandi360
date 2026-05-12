import { NextResponse } from "next/server";
import { createClientServer } from "@/app/lib/supabase/server";

async function runApprove(request: Request, id: string) {
  const supabase = await createClientServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login?next=/admin", request.url));
  }

  const isAdmin = user.email?.toLowerCase() === "soudkhan82@gmail.com";

  if (!isAdmin) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const { error } = await supabase
    .from("produce_listings")
    .update({
      status: "approved",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return NextResponse.redirect(
      new URL(`/admin?error=${encodeURIComponent(error.message)}`, request.url),
    );
  }

  return NextResponse.redirect(new URL("/admin?updated=1", request.url));
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return runApprove(request, id);
}

export async function GET(request: Request) {
  return NextResponse.redirect(new URL("/admin", request.url));
}
