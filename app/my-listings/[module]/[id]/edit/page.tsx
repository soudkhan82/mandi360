import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClientServer } from "@/app/config/supabase-server";
import { getModuleConfig } from "@/app/lib/marketplace/modules";
import { getListingImages } from "@/app/lib/listing-image";

type PageProps = {
  params: Promise<{
    module: string;
    id: string;
  }>;
};

function text(value: unknown) {
  if (value === null || value === undefined) return "";
  return String(value);
}

export default async function EditListingPage({ params }: PageProps) {
  const { module, id } = await params;

  const config = getModuleConfig(module);

  if (!config) {
    notFound();
  }

  const supabase = await createClientServer();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/auth/login");
  }

  const { data: listing, error } = await supabase
    .from(config.table)
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !listing) {
    notFound();
  }

  const images = getListingImages(listing);

  async function updateListing(formData: FormData) {
    "use server";

    const supabase = await createClientServer();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      redirect("/auth/login");
    }

    const moduleKey = String(formData.get("module") || "");
    const listingId = String(formData.get("id") || "");

    const currentConfig = getModuleConfig(moduleKey);

    if (!currentConfig) {
      throw new Error("Invalid module.");
    }

    const title = String(formData.get("title") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const city = String(formData.get("city") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const category = String(formData.get("category") || "").trim();
    const price = String(formData.get("price") || "").trim();
    const quantity = String(formData.get("quantity") || "").trim();
    const unit = String(formData.get("unit") || "").trim();

    if (!title) {
      throw new Error("Title is required.");
    }

    const payload: Record<string, unknown> = {
      title,
      description,
      city,
      phone,
      category,
      unit,
      updated_at: new Date().toISOString(),
    };

    if (price !== "") {
      payload.price = Number(price);
    }

    if (quantity !== "") {
      payload.quantity = Number(quantity);
    }

    const { error: updateError } = await supabase
      .from(currentConfig.table)
      .update(payload)
      .eq("id", listingId)
      .eq("user_id", user.id);

    if (updateError) {
      throw new Error(updateError.message);
    }

    redirect("/my-listings");
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex flex-col justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center">
          <div>
            <p className="text-sm font-bold text-emerald-700">
              Edit {config.label} Listing
            </p>

            <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950">
              {text(listing.title) || "Edit Listing"}
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Update your ad details below.
            </p>
          </div>

          <Link
            href="/my-listings"
            className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-black text-slate-700 hover:bg-slate-100"
          >
            Back to My Listings
          </Link>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          {images.length > 0 && (
            <div className="mb-6">
              <p className="mb-3 text-sm font-bold text-slate-700">
                Current Images
              </p>

              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {images.map((url, index) => (
                  <div
                    key={`${url}-${index}`}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`Listing image ${index + 1}`}
                      className="h-32 w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <form action={updateListing} className="space-y-5">
            <input type="hidden" name="module" value={module} />
            <input type="hidden" name="id" value={id} />

            <div>
              <label className="mb-1 block text-sm font-bold text-slate-700">
                Title
              </label>
              <input
                name="title"
                required
                defaultValue={text(listing.title)}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-bold text-slate-700">
                Description
              </label>
              <textarea
                name="description"
                rows={4}
                defaultValue={text(listing.description)}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-bold text-slate-700">
                  Category / Type
                </label>
                <input
                  name="category"
                  defaultValue={
                    text(listing.category) ||
                    text(listing.service_type) ||
                    text(listing.vehicle_type) ||
                    text(listing.input_type) ||
                    text(listing.consulting_type)
                  }
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-bold text-slate-700">
                  City
                </label>
                <input
                  name="city"
                  defaultValue={text(listing.city)}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-bold text-slate-700">
                  Price / Rate
                </label>
                <input
                  name="price"
                  type="number"
                  step="any"
                  defaultValue={text(listing.price)}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-bold text-slate-700">
                  Quantity / Capacity
                </label>
                <input
                  name="quantity"
                  type="number"
                  step="any"
                  defaultValue={text(listing.quantity)}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-bold text-slate-700">
                  Unit
                </label>
                <input
                  name="unit"
                  defaultValue={text(listing.unit)}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-bold text-slate-700">
                Phone
              </label>
              <input
                name="phone"
                defaultValue={text(listing.phone)}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
              <Link
                href="/my-listings"
                className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-black text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </Link>

              <button
                type="submit"
                className="rounded-full bg-emerald-600 px-7 py-3 text-sm font-black text-white hover:bg-emerald-700"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
