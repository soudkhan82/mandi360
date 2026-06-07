import { NextResponse } from "next/server";
import { createClientServer } from "@/app/lib/supabase/server";

export const dynamic = "force-dynamic";

type ModuleKey =
  | "produce"
  | "logistics"
  | "consultants"
  | "agri-inputs"
  | "buyers";

const MODULE_CONFIG: Record<
  ModuleKey,
  {
    label: string;
    table: string;
    bucket: string;
    redirectTo: string;
  }
> = {
  produce: {
    label: "Produce",
    table: "produce_listings",
    bucket: "produce-images",
    redirectTo: "/my-listings",
  },
  logistics: {
    label: "Logistics",
    table: "logistics_listings",
    bucket: "logistics-images",
    redirectTo: "/my-listings",
  },
  consultants: {
    label: "Consultants",
    table: "service_listings",
    bucket: "service-images",
    redirectTo: "/my-listings",
  },
  "agri-inputs": {
    label: "Agri Inputs",
    table: "input_supplier_listings",
    bucket: "input-images",
    redirectTo: "/my-listings",
  },
  buyers: {
    label: "Buyers",
    table: "buyer_listings",
    bucket: "buyer-images",
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
    value === "agri-inputs" ||
    value === "buyers"
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

function getMissingColumn(message: string) {
  return (
    message.match(/Could not find the '([^']+)' column/i)?.[1] ||
    message.match(/column "([^"]+)" of relation/i)?.[1] ||
    message.match(/column ([a-zA-Z0-9_]+) does not exist/i)?.[1] ||
    null
  );
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
  const description = cleanText(formData.get("description"));

  const base = {
    user_id: userId,
    title,
    slug: makeSlug(title),
    status: "pending",
    description,
    city,
    phone,
    image_urls: imageUrls,
  };

  if (module === "produce") {
    return removeEmptyValues({
      ...base,
      crop: category || cleanText(formData.get("crop")),
      variety: cleanText(formData.get("variety")),
      quantity: cleanNumber(formData.get("quantity")),
      unit: cleanText(formData.get("unit")),
      price,
    });
  }

  if (module === "logistics") {
    return removeEmptyValues({
      ...base,
      category,
      service_type: category,
      vehicle_type: category,
      price,
      price_per_trip: price,
      contact_phone: phone,
    });
  }

  if (module === "consultants") {
    return removeEmptyValues({
      ...base,
      category,
      service_category: category,
      service_type: category,
      consulting_type: category,
      price,
      contact_phone: phone,
    });
  }

  if (module === "buyers") {
    return removeEmptyValues({
      ...base,
      buyer_type: category,
      product_category: category,
      product_needed:
        cleanText(formData.get("product_needed")) ||
        cleanText(formData.get("category")) ||
        title,
      quantity: cleanText(formData.get("quantity")),
      contact_phone: phone,
    });
  }

  return removeEmptyValues({
    ...base,
    category,
    brand_name: category,
    price_per_unit: price,
    price_unit: "unit",
    stock_unit: "unit",
    contact_phone: phone,
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
  let currentPayload = { ...payload };

  for (let attempt = 0; attempt < 15; attempt++) {
    const { data, error } = await supabase
      .from(table)
      .insert(currentPayload)
      .select("id, slug")
      .single();

    if (!error) return data;

    const message = error.message || "";
    const missingColumn = getMissingColumn(message);

    if (missingColumn && missingColumn in currentPayload) {
      console.warn(
        `Removing unsupported column '${missingColumn}' for ${table}`,
      );
      const { [missingColumn]: _removed, ...rest } = currentPayload;
      currentPayload = rest;
      continue;
    }

    console.error("SUPABASE INSERT FAILED:", {
      table,
      payload: currentPayload,
      payloadKeys: Object.keys(currentPayload),
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });

    throw new Error(error.message);
  }

  throw new Error(`Insert failed for ${table}. Too many unsupported columns.`);
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
