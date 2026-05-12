"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClientServer } from "@/app/lib/supabase/server";

export async function submitListing(formData: FormData) {
  const supabase = await createClientServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/post-ad");
  }

  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const city = String(formData.get("city") || "").trim();
  const quantityRaw = String(formData.get("quantity") || "").trim();
  const unit = String(formData.get("unit") || "").trim();
  const pricePerUnitRaw = String(formData.get("price_per_unit") || "").trim();
  const priceUnit = String(formData.get("price_unit") || "").trim();
  const contactNumber = String(formData.get("contact_number") || "").trim();

  if (!title) throw new Error("Title is required.");
  if (!city) throw new Error("City is required.");
  if (!quantityRaw) throw new Error("Quantity is required.");
  if (!unit) throw new Error("Unit is required.");
  if (!pricePerUnitRaw) throw new Error("Price per unit is required.");
  if (!priceUnit) throw new Error("Price unit is required.");

  const quantity = Number(quantityRaw);
  const price_per_unit = Number(pricePerUnitRaw);

  if (!Number.isFinite(quantity) || quantity <= 0) {
    throw new Error("Quantity must be greater than 0.");
  }

  if (!Number.isFinite(price_per_unit) || price_per_unit <= 0) {
    throw new Error("Price per unit must be greater than 0.");
  }

  const slugBase = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  const slug = `${slugBase}-${Math.random().toString(36).slice(2, 8)}`;

  const { error } = await supabase.from("produce_listings").insert({
    user_id: user.id,
    title,
    slug,
    description: description || null,
    city,
    quantity,
    unit,
    price_per_unit,
    price_unit: priceUnit,
    contact_number: contactNumber || null,
    status: "pending",
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
  revalidatePath("/my-listings");

  redirect("/my-listings?posted=1");
}
