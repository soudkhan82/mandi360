import { NextResponse } from "next/server";
import { createClientServer } from "@/app/lib/supabase/server";

async function handleDelete(request: Request, id: string) {
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

  const { data: images, error: imagesFetchError } = await supabase
    .from("produce_listing_images")
    .select("file_path")
    .eq("listing_id", id);

  if (imagesFetchError) {
    return NextResponse.redirect(
      new URL(
        `/admin?error=${encodeURIComponent(imagesFetchError.message)}`,
        request.url,
      ),
    );
  }

  const filePaths = (images || [])
    .map((img) => img.file_path)
    .filter((p): p is string => Boolean(p));

  if (filePaths.length > 0) {
    const { error: storageError } = await supabase.storage
      .from("produce-images")
      .remove(filePaths);

    if (storageError) {
      console.error("Admin storage delete error:", storageError.message);
    }
  }

  const { error: imageDeleteError } = await supabase
    .from("produce_listing_images")
    .delete()
    .eq("listing_id", id);

  if (imageDeleteError) {
    return NextResponse.redirect(
      new URL(
        `/admin?error=${encodeURIComponent(imageDeleteError.message)}`,
        request.url,
      ),
    );
  }

  const { error: listingDeleteError } = await supabase
    .from("produce_listings")
    .delete()
    .eq("id", id);

  if (listingDeleteError) {
    return NextResponse.redirect(
      new URL(
        `/admin?error=${encodeURIComponent(listingDeleteError.message)}`,
        request.url,
      ),
    );
  }

  return NextResponse.redirect(new URL("/admin?deleted=1", request.url));
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  return handleDelete(request, id);
}

export async function GET(request: Request) {
  return NextResponse.redirect(new URL("/admin", request.url));
}
