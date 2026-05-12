import { NextResponse } from "next/server";
import { createClientServer } from "@/app/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = await createClientServer();

  const formData = await req.formData();
  const id = formData.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing ID" }, { status: 400 });
  }

  const { error } = await supabase
    .from("produce_listings")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.redirect(new URL("/my-listings?deleted=1", req.url));
}
