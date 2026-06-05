import { NextResponse } from "next/server";
import { createClientServer } from "@/app/config/supabase-server";

function makeSlug(value: string) {
  const base = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base || "produce"}-${suffix}`;
}

function safeFileName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/-+/g, "-");
}

export async function POST(request: Request) {
  const supabase = await createClientServer();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  const formData = await request.formData();

  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const category = String(formData.get("category") || "").trim();
  const city = String(formData.get("city") || "").trim();
  const price = String(formData.get("price") || "").trim();
  const phone = String(formData.get("phone") || "").trim();

  if (!title || !description || !city || !phone) {
    return NextResponse.redirect(
      new URL("/post-ad/produce?error=missing-fields", request.url),
    );
  }

  const slug = makeSlug(title);

  const imageUrls: string[] = [];
  const images = formData.getAll("images");

  for (const item of images) {
    if (!(item instanceof File)) continue;
    if (!item.size) continue;

    const filePath = `${user.id}/${Date.now()}-${safeFileName(item.name)}`;

    const { error: uploadError } = await supabase.storage
      .from("produce-images")
      .upload(filePath, item, {
        cacheControl: "3600",
        upsert: false,
        contentType: item.type || "image/jpeg",
      });

    if (uploadError) {
      console.error("Produce image upload error:", uploadError);
      continue;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("produce-images").getPublicUrl(filePath);

    imageUrls.push(publicUrl);
  }

  const { error: insertError } = await supabase
    .from("produce_listings")
    .insert({
      user_id: user.id,
      title,
      slug,
      description,
      category: category || null,
      city,
      price: price || null,
      phone,
      images: imageUrls,
      status: "pending",
    });

  if (insertError) {
    console.error("Produce listing insert error:", insertError);

    return NextResponse.redirect(
      new URL("/post-ad/produce?error=submit-failed", request.url),
    );
  }

  return NextResponse.redirect(
    new URL("/my-listings?success=produce-submitted", request.url),
  );
}
