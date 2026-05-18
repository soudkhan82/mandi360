import { NextResponse } from "next/server";
import { createClientServer } from "@/app/lib/supabase/server";

function cleanText(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function cleanNumber(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value.trim()) return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

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

  const title = cleanText(formData.get("title"));
  const crop = cleanText(formData.get("crop"));
  const variety = cleanText(formData.get("variety"));
  const quantity = cleanNumber(formData.get("quantity"));
  const unit = cleanText(formData.get("unit"));
  const price = cleanNumber(formData.get("price"));
  const city = cleanText(formData.get("city"));
  const phone = cleanText(formData.get("phone"));
  const description = cleanText(formData.get("description"));

  if (!title || !crop || !phone) {
    return NextResponse.json(
      { error: "Title, crop and phone are required." },
      { status: 400 },
    );
  }

  const files = formData
    .getAll("images")
    .filter((file): file is File => file instanceof File && file.size > 0);

  const imageUrls: string[] = [];

  for (const file of files) {
    const path = `${user.id}/${Date.now()}-${crypto.randomUUID()}-${safeFileName(
      file.name,
    )}`;

    const { error: uploadError } = await supabase.storage
      .from("produce-images")
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type || "image/jpeg",
      });

    if (uploadError) {
      return NextResponse.json(
        { error: `Image upload failed: ${uploadError.message}` },
        { status: 500 },
      );
    }

    const { data } = supabase.storage.from("produce-images").getPublicUrl(path);

    if (data.publicUrl) {
      imageUrls.push(data.publicUrl);
    }
  }

  const slug = makeSlug(title);

  const { error: insertError } = await supabase
    .from("produce_listings")
    .insert({
      user_id: user.id,
      title,
      slug,
      crop,
      variety: variety || null,
      quantity,
      unit: unit || null,
      price,
      city: city || null,
      phone,
      description: description || null,
      image_urls: imageUrls,
      status: "pending",
    });

  if (insertError) {
    return NextResponse.json(
      { error: `Listing submit failed: ${insertError.message}` },
      { status: 500 },
    );
  }

  return NextResponse.redirect(new URL("/my-listings", request.url), 303);
}
