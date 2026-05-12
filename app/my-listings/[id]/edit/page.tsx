import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { createClientServer } from "@/app/lib/supabase/server";

type EditPageProps = {
  params: Promise<{ id: string }>;
};

type OptionRow = {
  id: string;
  name: string;
};

async function loadProduceCategories(
  supabase: Awaited<ReturnType<typeof createClientServer>>,
): Promise<OptionRow[]> {
  const { data, error } = await supabase
    .from("produce_categories")
    .select("id, name, is_active, sort_order")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    console.error("produce_categories fetch error:", error.message);
    return [];
  }

  return (data || []).map((row) => ({
    id: String(row.id),
    name: String(row.name),
  }));
}

async function loadCities(
  supabase: Awaited<ReturnType<typeof createClientServer>>,
): Promise<OptionRow[]> {
  const attempts = [
    () =>
      supabase
        .from("cities")
        .select("id, name")
        .order("name", { ascending: true }),
    () =>
      supabase
        .from("cities")
        .select("id, city_name")
        .order("city_name", { ascending: true }),
    () =>
      supabase
        .from("cities")
        .select("id, title")
        .order("title", { ascending: true }),
  ];

  for (const run of attempts) {
    const { data, error } = await run();
    if (!error && data) {
      return (data as Array<Record<string, unknown>>).map((row) => ({
        id: String(row.id),
        name: String(row.name ?? row.city_name ?? row.title ?? ""),
      }));
    }
  }

  console.error("cities fetch error: could not resolve city label column");
  return [];
}

async function updateMyListing(formData: FormData) {
  "use server";

  const listingId = String(formData.get("listingId") || "").trim();
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const cityId = String(formData.get("city_id") || "").trim();
  const categoryId = String(formData.get("category_id") || "").trim();

  const quantityRaw = String(formData.get("quantity") || "").trim();
  const quantityUnit = String(formData.get("quantity_unit") || "").trim();

  const priceRaw = String(formData.get("price_per_unit") || "").trim();
  const priceUnit = String(formData.get("price_unit") || "").trim();

  const minimumOrderRaw = String(
    formData.get("minimum_order_quantity") || "",
  ).trim();

  const variety = String(formData.get("variety") || "").trim();
  const grade = String(formData.get("grade") || "").trim();
  const packagingDetails = String(
    formData.get("packaging_details") || "",
  ).trim();

  const contactName = String(formData.get("contact_name") || "").trim();
  const contactPhone = String(formData.get("contact_phone") || "").trim();

  const isOrganic = formData.get("is_organic") === "on";

  const fail = (msg: string) =>
    redirect(`/my-listings/${listingId}/edit?error=${encodeURIComponent(msg)}`);

  if (!listingId) fail("Invalid listing.");
  if (!title) fail("Title is required.");
  if (!categoryId) fail("Category is required.");
  if (!cityId) fail("City is required.");
  if (!contactName) fail("Contact name is required.");
  if (!contactPhone) fail("Contact phone is required.");
  if (!quantityRaw || Number.isNaN(Number(quantityRaw))) {
    fail("Valid quantity is required.");
  }
  if (!priceRaw || Number.isNaN(Number(priceRaw))) {
    fail("Valid price per unit is required.");
  }
  if (!quantityUnit) fail("Quantity unit is required.");
  if (!priceUnit) fail("Price unit is required.");

  const quantity = Number(quantityRaw);
  const pricePerUnit = Number(priceRaw);
  const minimumOrderQuantity = minimumOrderRaw ? Number(minimumOrderRaw) : null;

  if (quantity <= 0) fail("Quantity must be greater than 0.");
  if (pricePerUnit <= 0) fail("Price per unit must be greater than 0.");
  if (
    minimumOrderRaw &&
    (!Number.isFinite(Number(minimumOrderRaw)) || Number(minimumOrderRaw) < 0)
  ) {
    fail("Minimum order quantity must be a valid number.");
  }

  const supabase = await createClientServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/my-listings/${listingId}/edit`);
  }

  const { data: existing, error: existingError } = await supabase
    .from("produce_listings")
    .select("id, user_id")
    .eq("id", listingId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingError || !existing) {
    redirect("/my-listings");
  }

  const { error: updateError } = await supabase
    .from("produce_listings")
    .update({
      title,
      description: description || null,
      city_id: cityId,
      category_id: categoryId,
      quantity,
      quantity_unit: quantityUnit,
      price_per_unit: pricePerUnit,
      price_unit: priceUnit,
      minimum_order_quantity: minimumOrderQuantity,
      is_organic: isOrganic,
      variety: variety || null,
      grade: grade || null,
      packaging_details: packagingDetails || null,
      contact_name: contactName,
      contact_phone: contactPhone,
      status: "pending",
      updated_at: new Date().toISOString(),
    })
    .eq("id", listingId)
    .eq("user_id", user.id);

  if (updateError) {
    fail(updateError.message || "Failed to update listing.");
  }

  revalidatePath("/my-listings");
  revalidatePath(`/my-listings/${listingId}/edit`);
  revalidatePath("/");

  redirect("/my-listings?updated=1");
}

export default async function EditMyListingPage({
  params,
  searchParams,
}: EditPageProps & {
  searchParams?: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const qp = (await searchParams) || {};
  const errorMessage = qp.error ? decodeURIComponent(qp.error) : "";

  const supabase = await createClientServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/my-listings/${id}/edit`);
  }

  const [{ data: listing, error: listingError }, cities, produceCategories] =
    await Promise.all([
      supabase
        .from("produce_listings")
        .select(
          `
            id,
            user_id,
            title,
            description,
            city_id,
            category_id,
            quantity,
            quantity_unit,
            price_per_unit,
            price_unit,
            minimum_order_quantity,
            variety,
            grade,
            packaging_details,
            contact_name,
            contact_phone,
            is_organic,
            status
          `,
        )
        .eq("id", id)
        .eq("user_id", user.id)
        .maybeSingle(),
      loadCities(supabase),
      loadProduceCategories(supabase),
    ]);

  if (listingError || !listing) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
              Edit Listing
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              After editing, the listing will be marked pending for admin review
              again.
            </p>
          </div>

          <Link
            href="/my-listings"
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-500 hover:bg-slate-900"
          >
            Back
          </Link>
        </div>

        {errorMessage ? (
          <div className="mb-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {errorMessage}
          </div>
        ) : null}

        <form
          action={updateMyListing}
          className="space-y-5 rounded-2xl border border-slate-800 bg-slate-900/70 p-5"
        >
          <input type="hidden" name="listingId" value={listing.id} />

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Title
            </label>
            <input
              name="title"
              defaultValue={listing.title || ""}
              required
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Description
            </label>
            <textarea
              name="description"
              defaultValue={listing.description || ""}
              rows={5}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-emerald-500"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                City
              </label>
              <select
                name="city_id"
                required
                defaultValue={String(listing.city_id || "")}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-500"
              >
                <option value="" disabled>
                  {cities.length ? "Select city" : "No cities found"}
                </option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Produce / Crop
              </label>
              <select
                name="category_id"
                required
                defaultValue={String(listing.category_id || "")}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-500"
              >
                <option value="" disabled>
                  {produceCategories.length
                    ? "Select produce / crop"
                    : "No active produce categories found"}
                </option>
                {produceCategories.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Quantity
              </label>
              <input
                type="number"
                step="any"
                min="0"
                name="quantity"
                defaultValue={listing.quantity ?? ""}
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Quantity Unit
              </label>
              <select
                name="quantity_unit"
                required
                defaultValue={listing.quantity_unit || ""}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-500"
              >
                <option value="" disabled>
                  Select quantity unit
                </option>
                <option value="kg">kg</option>
                <option value="40kg">40kg</option>
                <option value="maund">maund</option>
                <option value="ton">ton</option>
                <option value="crate">crate</option>
                <option value="box">box</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Price Per Unit
              </label>
              <input
                type="number"
                step="any"
                min="0"
                name="price_per_unit"
                defaultValue={listing.price_per_unit ?? ""}
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Price Unit
              </label>
              <select
                name="price_unit"
                required
                defaultValue={listing.price_unit || ""}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-500"
              >
                <option value="" disabled>
                  Select price unit
                </option>
                <option value="kg">kg</option>
                <option value="40kg">40kg</option>
                <option value="maund">maund</option>
                <option value="ton">ton</option>
                <option value="crate">crate</option>
                <option value="box">box</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Contact Name
              </label>
              <input
                name="contact_name"
                defaultValue={listing.contact_name || ""}
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Contact Phone
              </label>
              <input
                name="contact_phone"
                defaultValue={listing.contact_phone || ""}
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Minimum Order Quantity
              </label>
              <input
                type="number"
                step="any"
                min="0"
                name="minimum_order_quantity"
                defaultValue={listing.minimum_order_quantity ?? ""}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Variety
              </label>
              <input
                name="variety"
                defaultValue={listing.variety || ""}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Grade
              </label>
              <input
                name="grade"
                defaultValue={listing.grade || ""}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Packaging Details
            </label>
            <textarea
              name="packaging_details"
              defaultValue={listing.packaging_details || ""}
              rows={4}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950 px-4 py-3">
            <input
              id="is_organic"
              name="is_organic"
              type="checkbox"
              defaultChecked={Boolean(listing.is_organic)}
              className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
            />
            <label
              htmlFor="is_organic"
              className="text-sm font-medium text-slate-300"
            >
              Mark this listing as organic
            </label>
          </div>

          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            Current status:{" "}
            <span className="font-semibold">{listing.status || "Unknown"}</span>
            . Saving changes will resubmit it for admin review.
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-emerald-500"
            >
              Save Changes
            </button>

            <Link
              href="/my-listings"
              className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:bg-slate-800"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
