import { NextResponse } from "next/server";
import { createClientServer } from "@/app/config/supabase-server";

export async function POST(request: Request) {
  const supabase = await createClientServer();
  const formData = await request.formData();

  const id = String(formData.get("id") ?? "").trim();
  const action = String(formData.get("action") ?? "").trim();

  if (!id || !["approve", "reject"].includes(action)) {
    return NextResponse.json(
      { error: "Invalid admin action." },
      { status: 400 },
    );
  }

  const status = action === "approve" ? "published" : "rejected";

  const { error } = await supabase
    .from("buyer_listings")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.redirect(new URL("/admin", request.url));
}
