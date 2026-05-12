import { NextResponse } from "next/server";
import { createClientServer } from "@/app/lib/supabase/server";

function makeSlug(title: string) {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  return `${base}-${Math.random().toString(36).slice(2, 8)}`;
}

function toNumber(value: FormDataEntryValue | null) {
  if (value == null || value === "") return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function toText(value: FormDataEntryValue | null) {
  if (value == null) return null;
  const text = String(value).trim();
  return text.length ? text : null;
}

export async function POST(req: Request) {
  const supabase = await createClientServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(
      new URL("/auth/login?next=/post-ad", req.url),
      303,
    );
  }

  const formData = await req.formData();

  const intent = String(formData.get("_intent") || "submit").trim();
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const city_id = String(formData.get("city_id") || "").trim();
  const category_id = String(formData.get("category_id") || "").trim();
  const quantity = toNumber(formData.get("quantity"));
  const quantity_unit = toText(formData.get("quantity_unit"));
  const price_per_unit = toNumber(formData.get("price_per_unit"));
  const price_unit = toText(formData.get("price_unit"));
  const contact_name = toText(formData.get("contact_name"));
  const contact_phone = toText(formData.get("contact_phone"));
  const minimum_order_quantity = toNumber(
    formData.get("minimum_order_quantity"),
  );
  const variety = toText(formData.get("variety"));
  const grade = toText(formData.get("grade"));
  const packaging_details = toText(formData.get("packaging_details"));
  const is_organic = formData.get("is_organic") === "true";

  if (
    !title ||
    !description ||
    !city_id ||
    !category_id ||
    quantity == null ||
    !quantity_unit ||
    price_per_unit == null ||
    !price_unit
  ) {
    return NextResponse.redirect(
      new URL(
        `/post-ad?error=${encodeURIComponent("Please fill all required fields.")}`,
        req.url,
      ),
      303,
    );
  }

  const rawFiles = formData.getAll("images");
  const imageFiles = rawFiles.filter(
    (value): value is File => value instanceof File && value.size > 0,
  );

  console.log(
    "POST-AD DEBUG incoming files:",
    imageFiles.map((f) => ({
      name: f.name,
      size: f.size,
      type: f.type,
    })),
  );

  const uploadedUrls: string[] = [];

  for (const file of imageFiles) {
    console.log("POST-AD DEBUG uploading file:", file.name);

    const ext = file.name.split(".").pop() || "jpg";
    const filePath = `${user.id}/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${ext}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("produce-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("POST-AD DEBUG upload error:", uploadError.message);

      return NextResponse.redirect(
        new URL(
          `/post-ad?error=${encodeURIComponent(`Image upload failed: ${uploadError.message}`)}`,
          req.url,
        ),
        303,
      );
    }

    console.log("POST-AD DEBUG upload path:", uploadData.path);

    const { data: publicUrlData } = supabase.storage
      .from("produce-images")
      .getPublicUrl(uploadData.path);

    console.log("POST-AD DEBUG public URL:", publicUrlData.publicUrl);

    uploadedUrls.push(publicUrlData.publicUrl);
  }

  console.log("POST-AD DEBUG final uploadedUrls:", uploadedUrls);

  const slug = makeSlug(title);
  const status = intent === "draft" ? "draft" : "pending";

  const payload = {
    user_id: user.id,
    title,
    slug,
    description,
    city_id,
    category_id,
    quantity,
    quantity_unit,
    price_per_unit,
    price_unit,
    contact_name,
    contact_phone,
    minimum_order_quantity,
    variety,
    grade,
    packaging_details,
    is_organic,
    status,
    image_urls: uploadedUrls,
  };

  console.log("POST-AD DEBUG insert payload:", payload);

  const { error } = await supabase.from("produce_listings").insert(payload);

  if (error) {
    console.error("POST-AD DEBUG insert error:", error.message);

    return NextResponse.redirect(
      new URL(`/post-ad?error=${encodeURIComponent(error.message)}`, req.url),
      303,
    );
  }

  return NextResponse.redirect(
    new URL(
      `/my-listings?success=${encodeURIComponent(
        status === "draft"
          ? "Listing saved as draft."
          : "Listing submitted successfully.",
      )}`,
      req.url,
    ),
    303,
  );
}
