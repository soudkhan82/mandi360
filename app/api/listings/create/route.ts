import { NextResponse } from "next/server";
import { createClientServer } from "@/app/lib/supabase/server";

export const dynamic = "force-dynamic";

type ModuleKey = "produce" | "logistics" | "consultants" | "agri-inputs";

const MODULE_CONFIG: Record<
  ModuleKey,
  {
    table: string;
    bucket: string;
    redirectTo: string;
  }
> = {
  produce: {
    table: "produce_listings",
    bucket: "produce-images",
    redirectTo: "/my-listings",
  },
  logistics: {
    table: "logistics_listings",
    bucket: "logistics-images",
    redirectTo: "/my-listings",
  },
  consultants: {
    table: "service_listings",
    bucket: "service-images",
    redirectTo: "/my-listings",
  },
  "agri-inputs": {
    table: "input_supplier_listings",
    bucket: "input-images",
    redirectTo: "/my-listings",
  },
};

function redirect303(url: string | URL) {
  return NextResponse.redirect(url, { status: 303 });
}

function cleanText(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function cleanNumber(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  const num = Number(trimmed);
  return Number.isFinite(num) ? num : null;
}

function isValidModule(value: string | null): value is ModuleKey {
  return (
    value === "produce" ||
    value === "logistics" ||
    value === "consultants" ||
    value === "agri-inputs"
  );
}

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
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function removeEmptyValues(payload: Record<string, any>) {
  const cleaned: Record<string, any> = {};

  for (const [key, value] of Object.entries(payload)) {
    if (value === null || value === undefined || value === "") continue;
    if (Array.isArray(value) && value.length === 0) continue;
    cleaned[key] = value;
  }

  return cleaned;
}

async function uploadImages({
  supabase,
  files,
  bucket,
  userId,
}: {
  supabase: Awaited<ReturnType<typeof createClientServer>>;
  files: File[];
  bucket: string;
  userId: string;
}) {
  const imageUrls: string[] = [];

  for (const file of files) {
    if (!file || file.size === 0) continue;

    const filename = `${Date.now()}-${crypto.randomUUID()}-${safeFileName(
      file.name || "image.jpg",
    )}`;

    const path = `${userId}/${filename}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type || "image/jpeg",
      });

    if (uploadError) {
      throw new Error(`Image upload failed: ${uploadError.message}`);
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);

    if (data.publicUrl) {
      imageUrls.push(data.publicUrl);
    }
  }

  return imageUrls;
}

function buildPayload({
  module,
  userId,
  title,
  formData,
  imageUrls,
}: {
  module: ModuleKey;
  userId: string;
  title: string;
  formData: FormData;
  imageUrls: string[];
}) {
  const category = cleanText(formData.get("category"));
  const price = cleanNumber(formData.get("price"));
  const phone = cleanText(formData.get("phone"));
  const city = cleanText(formData.get("city"));

  if (module === "produce") {
    return removeEmptyValues({
      user_id: userId,
      title,
      slug: makeSlug(title),
      status: "pending",
      crop: category || cleanText(formData.get("crop")),
      variety: cleanText(formData.get("variety")),
      quantity: cleanNumber(formData.get("quantity")),
      unit: cleanText(formData.get("unit")),
      price,
      city,
      phone,
      description: cleanText(formData.get("description")),
      image_urls: imageUrls,
    });
  }

  if (module === "logistics") {
    return removeEmptyValues({
      user_id: userId,
      title,
      slug: makeSlug(title),
      status: "pending",
      service_type: category,
      vehicle_type: category,
      price_per_trip: price,
      city,
      phone,
      contact_phone: phone,
      description: cleanText(formData.get("description")),
      image_urls: imageUrls,
    });
  }

  if (module === "consultants") {
    return removeEmptyValues({
      user_id: userId,
      title,
      slug: makeSlug(title),
      status: "pending",
      service_category: category,
      service_type: category,
      category,
      price,
      city,
      phone,
      contact_phone: phone,
      description: cleanText(formData.get("description")),
      image_urls: imageUrls,
    });
  }

  return removeEmptyValues({
    user_id: userId,
    title,
    slug: makeSlug(title),
    status: "pending",
    category,
    price_per_unit: price,
    price_unit: "unit",
    stock_unit: "unit",
    city,
    phone,
    contact_phone: phone,
    description: cleanText(formData.get("description")),
    image_urls: imageUrls,
  });
}

async function insertListing({
  supabase,
  table,
  payload,
}: {
  supabase: Awaited<ReturnType<typeof createClientServer>>;
  table: string;
  payload: Record<string, any>;
}) {
  const { data, error } = await supabase
    .from(table)
    .insert(payload)
    .select("id,slug")
    .single();

  if (error) {
    console.error("SUPABASE INSERT FAILED:", {
      table,
      payload,
      payloadKeys: Object.keys(payload),
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });

    throw new Error(error.message);
  }

  return data;
}

export async function POST(request: Request) {
  const supabase = await createClientServer();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return redirect303(new URL("/auth/login", request.url));
  }

  let moduleRaw: string | null = null;

  try {
    const formData = await request.formData();

    moduleRaw = cleanText(formData.get("module"));

    if (!isValidModule(moduleRaw)) {
      return redirect303(new URL("/post-ad?error=invalid-module", request.url));
    }

    const config = MODULE_CONFIG[moduleRaw];

    const title = cleanText(formData.get("title"));

    if (!title) {
      return redirect303(
        new URL(`/post-ad/${moduleRaw}?error=missing-title`, request.url),
      );
    }

    const files = formData
      .getAll("images")
      .filter((item): item is File => item instanceof File && item.size > 0);

    const imageUrls =
      files.length > 0
        ? await uploadImages({
            supabase,
            files,
            bucket: config.bucket,
            userId: user.id,
          })
        : [];

    const payload = buildPayload({
      module: moduleRaw,
      userId: user.id,
      title,
      formData,
      imageUrls,
    });

    await insertListing({
      supabase,
      table: config.table,
      payload,
    });

    return redirect303(new URL(config.redirectTo, request.url));
  } catch (error) {
    console.error("CREATE LISTING ERROR:", error);

    const safeModule = isValidModule(moduleRaw) ? moduleRaw : "produce";

    return redirect303(
      new URL(`/post-ad/${safeModule}?error=submit-failed`, request.url),
    );
  }
}
