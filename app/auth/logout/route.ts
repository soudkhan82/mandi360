import { NextResponse } from "next/server";
import { createClientServer } from "@/app/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClientServer();
  await supabase.auth.signOut();

  return NextResponse.redirect(new URL("/", request.url), 303);
}
