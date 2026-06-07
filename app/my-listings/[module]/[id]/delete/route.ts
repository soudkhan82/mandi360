import { NextResponse } from "next/server";
import { createClientServer } from "@/app/lib/supabase/server";

export const dynamic = "force-dynamic";

const MODULE_TABLES: Record<string, string> = {
  buyers: "buyer_listings",
  produce: "produce_listings",
  logistics: "logistics_listings",
  consultants: "service_listings",
  "agri-inputs": "input_supplier_listings",
};

function redirect303(url: string | URL) {
  return NextResponse.redirect(url, { status: 303 });
}

// If someone opens /delete directly in browser, do not show JSON.
// Just send them back to My Listings.
export async function GET(request: Request) {
  return redirect303(new URL("/my-listings", request.url));
}

export async function POST(
  request: Request,
  context: {
    params: Promise<{
      module: string;
      id: string;
    }>;
  },
) {
  const { module, id } = await context.params;

  const table = MODULE_TABLES[module];

  if (!table || !id) {
    return redirect303(
      new URL("/my-listings?error=invalid-delete", request.url),
    );
  }

  const supabase = await createClientServer();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return redirect303(new URL("/auth/login", request.url));
  }

  const { error } = await supabase
    .from(table)
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("DELETE LISTING ERROR:", {
      table,
      module,
      id,
      user_id: user.id,
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });

    return redirect303(
      new URL("/my-listings?error=delete-failed", request.url),
    );
  }

  return redirect303(new URL("/my-listings?deleted=1", request.url));
}
