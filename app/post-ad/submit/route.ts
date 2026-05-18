import { NextResponse } from "next/server";
import { createClientServer } from "@/app/config/supabase-server";

const BUYER_FALLBACK_IMAGE = "/images/buyer-placeholder.jpg";

function makeSlug(value: string) {
  const base = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base || "listing"}-${suffix}`;
}

function safeFileName(name: string) {
  const cleaned = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  return cleaned || "buyer-image";
}

function isValidImageFile(value: FormDataEntryValue | null): value is File {
  return (
    value instanceof File && value.size > 0 && value.type.startsWith("image/")
  );
}

export async function POST(request: Request) {
  const supabase = await createClientServer();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.redirect(new URL("/auth/login", request.url), 303);
  }

  const formData = await request.formData();

  const module = String(formData.get("module") ?? "").trim();

  if (module !== "buyers") {
    return NextResponse.json(
      {
        error: "Unsupported module. Only buyers module is currently enabled.",
      },
      { status: 400 },
    );
  }

  const title = String(formData.get("title") ?? "").trim();
  const buyer_type = String(formData.get("buyer_type") ?? "").trim();
  const product_category = String(
    formData.get("product_category") ?? "",
  ).trim();
  const product_needed = String(formData.get("product_needed") ?? "").trim();
  const quantity = String(formData.get("quantity") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (
    !title ||
    !buyer_type ||
    !product_category ||
    !product_needed ||
    !city ||
    !phone
  ) {
    return NextResponse.json(
      {
        error: "Missing required buyer fields.",
      },
      { status: 400 },
    );
  }

  let imageUrls: string[] = [BUYER_FALLBACK_IMAGE];

  const image = formData.get("image");

  if (isValidImageFile(image)) {
    const originalExt = image.name.split(".").pop();
    const ext = originalExt ? originalExt.toLowerCase() : "jpg";

    const filePath = `${user.id}/${Date.now()}-${safeFileName(title)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("buyer-images")
      .upload(filePath, image, {
        cacheControl: "3600",
        upsert: false,
        contentType: image.type || "image/jpeg",
      });

    if (uploadError) {
      return NextResponse.json(
        {
          error: uploadError.message,
        },
        { status: 500 },
      );
    }

    const { data: publicUrlData } = supabase.storage
      .from("buyer-images")
      .getPublicUrl(filePath);

    if (publicUrlData?.publicUrl) {
      imageUrls = [publicUrlData.publicUrl];
    }
  }

  const finalDescription = description
    ? `${description}\n\nCategory: ${product_category}`
    : `Category: ${product_category}`;

  const { error } = await supabase.from("buyer_listings").insert({
    user_id: user.id,
    title,
    slug: makeSlug(title),
    buyer_type,
    product_needed,
    quantity: quantity || null,
    city,
    phone,
    description: finalDescription,
    status: "pending",
    image_urls: imageUrls,
  });

  if (error) {
    return NextResponse.json(
      {
        error: error.message,
      },
      { status: 500 },
    );
  }

  return NextResponse.redirect(new URL("/my-listings", request.url), 303);
}
