import { NextResponse } from "next/server";
import { createClientServer } from "@/app/lib/supabase/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClientServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(
      new URL("/login?next=/my-listings", request.url),
    );
  }

  const { data: listing, error: listingError } = await supabase
    .from("produce_listings")
    .select("id, user_id")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (listingError || !listing) {
    return NextResponse.redirect(
      new URL("/my-listings?error=not-found", request.url),
    );
  }

  const { data: images } = await supabase
    .from("produce_listing_images")
    .select("file_path")
    .eq("listing_id", id);

  if (images?.length) {
    const filePaths = images
      .map((img) => img.file_path)
      .filter((p): p is string => Boolean(p));

    if (filePaths.length) {
      const { error: storageError } = await supabase.storage
        .from("produce-images")
        .remove(filePaths);

      if (storageError) {
        console.error("Storage delete error:", storageError.message);
      }
    }
  }

  const { error: imageDeleteError } = await supabase
    .from("produce_listing_images")
    .delete()
    .eq("listing_id", id);

  if (imageDeleteError) {
    console.error("Image rows delete error:", imageDeleteError.message);
    return NextResponse.redirect(
      new URL("/my-listings?error=image-delete-failed", request.url),
    );
  }

  const { error: listingDeleteError } = await supabase
    .from("produce_listings")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (listingDeleteError) {
    console.error("Listing delete error:", listingDeleteError.message);
    return NextResponse.redirect(
      new URL("/my-listings?error=delete-failed", request.url),
    );
  }

  return NextResponse.redirect(new URL("/my-listings?deleted=1", request.url));
}
