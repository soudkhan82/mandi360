import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const ALLOWED_TABLES = [
  "produce_listings",
  "logistics_listings",
  "service_listings",
  "input_supplier_listings",
  "buyer_listings",
] as const;

type AllowedTable = (typeof ALLOWED_TABLES)[number];

function isAllowedTable(value: string): value is AllowedTable {
  return ALLOWED_TABLES.includes(value as AllowedTable);
}

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  },
);

export async function POST(request: Request) {
  const formData = await request.formData();

  const id = String(formData.get("id") ?? "").trim();
  const table = String(formData.get("table") ?? "").trim();
  const action = String(formData.get("action") ?? "").trim();

  if (!id || !table || !["approve", "reject"].includes(action)) {
    return NextResponse.redirect(
      new URL("/admin?error=invalid-action", request.url),
      303,
    );
  }

  if (!isAllowedTable(table)) {
    return NextResponse.redirect(
      new URL("/admin?error=invalid-table", request.url),
      303,
    );
  }

  const status = action === "approve" ? "published" : "rejected";

  const { error } = await supabaseAdmin
    .from(table)
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error(`Admin ${action} error on ${table}:`, error);

    return NextResponse.redirect(
      new URL(`/admin?error=${encodeURIComponent(error.message)}`, request.url),
      303,
    );
  }

  return NextResponse.redirect(
    new URL(`/admin?success=${action}`, request.url),
    303,
  );
}
