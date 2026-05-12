import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const PRODUCE_BUCKET = "produce-images";

export type CreateProduceListingInput = {
  user_id?: string | null;
  business_profile_id?: string | null;
  category_id: string;
  city_id: string;
  mandi_id?: string | null;
  title: string;
  slug: string;
  description: string;
  quantity: number;
  quantity_unit: string;
  price_per_unit: number;
  price_unit: string;
  minimum_order_quantity?: number | null;
  contact_name: string;
  contact_phone: string;
  contact_whatsapp?: string | null;
  variety?: string | null;
  grade?: string | null;
  packaging_details?: string | null;
  is_organic?: boolean;
};

export type UploadedProduceImage = {
  path: string;
  publicUrl: string;
};

function getSupabaseClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anon) {
    throw new Error("Supabase environment variables are missing.");
  }

  return createClient(url, anon);
}

function buildProduceImagePath(file: File) {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  return `${fileName}`;
}

export async function uploadProduceImage(
  file: File,
): Promise<UploadedProduceImage> {
  const supabase = getSupabaseClient();
  const filePath = buildProduceImagePath(file);

  const { error: uploadError } = await supabase.storage
    .from(PRODUCE_BUCKET)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || "image/jpeg",
    });

  if (uploadError) {
    console.error("UPLOAD ERROR FULL:", uploadError);
    throw new Error(uploadError.message);
  }

  const { data } = supabase.storage.from(PRODUCE_BUCKET).getPublicUrl(filePath);

  return {
    path: filePath,
    publicUrl: data.publicUrl,
  };
}

export async function createProduceListing(input: CreateProduceListingInput) {
  const supabase = getSupabaseClient();

  const payload = {
    user_id: input.user_id ?? null,
    business_profile_id: input.business_profile_id ?? null,
    category_id: input.category_id,
    city_id: input.city_id,
    mandi_id: input.mandi_id ?? null,
    title: input.title,
    slug: input.slug,
    description: input.description,
    quantity: input.quantity,
    quantity_unit: input.quantity_unit,
    price_per_unit: input.price_per_unit,
    price_unit: input.price_unit,
    minimum_order_quantity: input.minimum_order_quantity ?? null,
    contact_name: input.contact_name,
    contact_phone: input.contact_phone,
    contact_whatsapp: input.contact_whatsapp ?? null,
    variety: input.variety ?? null,
    grade: input.grade ?? null,
    packaging_details: input.packaging_details ?? null,
    is_organic: input.is_organic ?? false,
  };

  const { data, error } = await supabase
    .from("produce_listings")
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error("Produce insert error:", error);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Assumes this table exists with columns:
 * - listing_id
 * - image_url
 * - is_primary
 *
 * Adjust only if your image table uses different column names.
 */
export async function attachProduceImageToListing(params: {
  listing_id: string;
  file_path: string;
  public_url: string;
  is_primary?: boolean;
  sort_order?: number;
}) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("produce_listing_images")
    .insert({
      listing_id: params.listing_id,
      bucket_name: PRODUCE_BUCKET,
      file_path: params.file_path,
      public_url: params.public_url,
      is_primary: params.is_primary ?? true,
      sort_order: params.sort_order ?? 0,
    })
    .select()
    .single();

  if (error) {
    console.error("Produce image attach error:", error);
    throw new Error(error.message);
  }

  return data;
}
