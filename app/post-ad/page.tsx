import Link from "next/link";
import { redirect } from "next/navigation";
import { createClientServer } from "@/app/lib/supabase/server";

type OptionRow = {
  id: string;
  name: string;
};

type PageProps = {
  searchParams?: Promise<{
    error?: string;
    success?: string;
  }>;
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

export default async function PostAdPage({ searchParams }: PageProps) {
  const params = (await searchParams) || {};
  const errorMessage = params.error ? decodeURIComponent(params.error) : "";
  const successMessage = params.success
    ? decodeURIComponent(params.success)
    : "";

  const supabase = await createClientServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/post-ad");
  }

  const [{ data: profile }, cities, produceCategories] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, phone")
      .eq("id", user.id)
      .maybeSingle(),
    loadCities(supabase),
    loadProduceCategories(supabase),
  ]);

  const fullName =
    String(
      profile?.full_name ||
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        "",
    ).trim() ||
    user.email ||
    "Logged in user";

  const contactNameDefault = String(
    profile?.full_name ||
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      "",
  ).trim();

  const contactPhoneDefault = String(
    profile?.phone || user.user_metadata?.phone || user.phone || "",
  ).trim();

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Post an Ad
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Submit your produce listing for admin review.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-right">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
              Logged in as
            </p>
            <p className="mt-1 text-sm font-medium text-white">{fullName}</p>
          </div>
        </div>

        {errorMessage ? (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
            {errorMessage}
          </div>
        ) : null}

        {successMessage ? (
          <div className="mb-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">
            {successMessage}
          </div>
        ) : null}

        <form
          action="/post-ad/submit"
          method="post"
          encType="multipart/form-data"
          className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]"
        >
          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Listing Title
              </label>
              <input
                name="title"
                type="text"
                required
                placeholder="e.g. Fresh A-Grade Kino"
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Description
              </label>
              <textarea
                name="description"
                rows={5}
                required
                placeholder="Add quality, origin, packaging, availability, etc."
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Select City
              </label>
              <select
                name="city_id"
                required
                defaultValue=""
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400"
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
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Select Produce / Crop
              </label>
              <select
                name="category_id"
                required
                defaultValue=""
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400"
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

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Quantity
              </label>
              <input
                name="quantity"
                type="number"
                step="any"
                min="0"
                required
                placeholder="e.g. 500"
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Quantity Unit
              </label>
              <select
                name="quantity_unit"
                required
                defaultValue=""
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400"
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

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Price Per Unit
              </label>
              <input
                name="price_per_unit"
                type="number"
                step="any"
                min="0"
                required
                placeholder="e.g. 4500"
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Price Unit
              </label>
              <select
                name="price_unit"
                required
                defaultValue=""
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400"
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

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Contact Name
              </label>
              <input
                name="contact_name"
                type="text"
                required
                defaultValue={contactNameDefault}
                placeholder="e.g. Saud Khan"
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Contact Phone
              </label>
              <input
                name="contact_phone"
                type="text"
                required
                defaultValue={contactPhoneDefault}
                placeholder="e.g. 03XX-XXXXXXX"
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Minimum Order Quantity
              </label>
              <input
                name="minimum_order_quantity"
                type="number"
                step="any"
                min="0"
                placeholder="e.g. 50"
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Variety
              </label>
              <input
                name="variety"
                type="text"
                placeholder="e.g. Seedless / Premium"
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Grade
              </label>
              <input
                name="grade"
                type="text"
                placeholder="e.g. A Grade"
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Packaging Details
              </label>
              <textarea
                name="packaging_details"
                rows={3}
                placeholder="e.g. Packed in 10kg crates"
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400"
              />
            </div>

            <div className="md:col-span-2 flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3">
              <input
                id="is_organic"
                name="is_organic"
                type="checkbox"
                value="true"
                className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
              />
              <label
                htmlFor="is_organic"
                className="text-sm font-medium text-slate-200"
              >
                Mark this listing as organic
              </label>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Upload Images
              </label>
              <input
                name="images"
                type="file"
                accept="image/*"
                multiple
                className="block w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white file:mr-4 file:rounded-xl file:border-0 file:bg-emerald-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-950 hover:file:bg-emerald-400"
              />
              <p className="mt-2 text-xs text-slate-500">
                Debug mode: selected files will be logged by the submit route.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-200">
            Seller name and phone are auto-filled from your profile. You can
            still adjust them before posting if needed.
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="submit"
              name="_intent"
              value="submit"
              className="inline-flex items-center rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
            >
              Submit for Review
            </button>

            <button
              type="submit"
              name="_intent"
              value="draft"
              className="inline-flex items-center rounded-2xl border border-slate-700 px-5 py-3 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:bg-slate-800"
            >
              Save as Draft
            </button>

            <Link
              href="/"
              className="inline-flex items-center rounded-2xl border border-slate-700 px-5 py-3 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:bg-slate-800"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
