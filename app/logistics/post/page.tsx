import { redirect } from "next/navigation";
import { createClientServer } from "@/app/lib/supabase/server";

const vehicleTypes = [
  { value: "loader_rickshaw", label: "Loader Rickshaw" },
  { value: "pickup", label: "Pickup" },
  { value: "mazda", label: "Mazda" },
  { value: "truck", label: "Truck" },
  { value: "container", label: "Container" },
  { value: "reefer", label: "Reefer / Cold Chain" },
  { value: "tractor_trolley", label: "Tractor Trolley" },
  { value: "other", label: "Other" },
];

const capacityUnits = ["ton", "truck", "bag", "crate", "box", "unit"];
const rateUnits = ["trip", "truck", "ton", "day", "hour", "custom"];

export default async function LogisticsPostPage() {
  const supabase = await createClientServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/logistics/post");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone, whatsapp_number")
    .eq("id", user.id)
    .maybeSingle();

  const { data: cities } = await supabase
    .from("cities")
    .select("id, name")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  return (
    <main className="min-h-screen bg-black px-4 py-10 text-white">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-300">
            Logistics Service
          </p>

          <h1 className="mt-2 text-3xl font-bold">Post Logistics Ad</h1>

          <p className="mt-2 text-sm text-slate-400">
            Add vehicle, route, capacity, rate and contact details for admin
            review.
          </p>
        </div>

        <form
          action="/logistics/post/submit"
          method="post"
          encType="multipart/form-data"
          className="rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-2xl shadow-black/40"
        >
          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold">
                Listing Title
              </label>
              <input
                name="title"
                required
                placeholder="e.g. Pickup available for mandi transport"
                className="h-11 w-full rounded-xl border border-slate-700 bg-black px-4 text-sm outline-none focus:border-emerald-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold">
                Description
              </label>
              <textarea
                name="description"
                rows={4}
                placeholder="Add service details, route notes, timing, load suitability..."
                className="w-full rounded-xl border border-slate-700 bg-black px-4 py-3 text-sm outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Service City
              </label>
              <select
                name="city_id"
                required
                className="h-11 w-full rounded-xl border border-slate-700 bg-black px-4 text-sm outline-none focus:border-emerald-500"
              >
                <option value="">Select city</option>
                {(cities ?? []).map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Vehicle Type
              </label>
              <select
                name="vehicle_type"
                required
                className="h-11 w-full rounded-xl border border-slate-700 bg-black px-4 text-sm outline-none focus:border-emerald-500"
              >
                <option value="">Select vehicle</option>
                {vehicleTypes.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Capacity
              </label>
              <input
                name="capacity_value"
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g. 5"
                className="h-11 w-full rounded-xl border border-slate-700 bg-black px-4 text-sm outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Capacity Unit
              </label>
              <select
                name="capacity_unit"
                defaultValue="ton"
                className="h-11 w-full rounded-xl border border-slate-700 bg-black px-4 text-sm outline-none focus:border-emerald-500"
              >
                {capacityUnits.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Source City
              </label>
              <select
                name="source_city_id"
                className="h-11 w-full rounded-xl border border-slate-700 bg-black px-4 text-sm outline-none focus:border-emerald-500"
              >
                <option value="">Flexible / Not fixed</option>
                {(cities ?? []).map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Destination City
              </label>
              <select
                name="destination_city_id"
                className="h-11 w-full rounded-xl border border-slate-700 bg-black px-4 text-sm outline-none focus:border-emerald-500"
              >
                <option value="">Flexible / Not fixed</option>
                {(cities ?? []).map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Source Address
              </label>
              <input
                name="source_address"
                placeholder="Farm, mandi, warehouse, area..."
                className="h-11 w-full rounded-xl border border-slate-700 bg-black px-4 text-sm outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Destination Address
              </label>
              <input
                name="destination_address"
                placeholder="Mandi, city, warehouse, area..."
                className="h-11 w-full rounded-xl border border-slate-700 bg-black px-4 text-sm outline-none focus:border-emerald-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold">
                Route Notes
              </label>
              <input
                name="route_notes"
                placeholder="e.g. Lahore to Multan, same-day available, return load accepted"
                className="h-11 w-full rounded-xl border border-slate-700 bg-black px-4 text-sm outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Rate Amount
              </label>
              <input
                name="rate_amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g. 25000"
                className="h-11 w-full rounded-xl border border-slate-700 bg-black px-4 text-sm outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Rate Unit
              </label>
              <select
                name="rate_unit"
                defaultValue="trip"
                className="h-11 w-full rounded-xl border border-slate-700 bg-black px-4 text-sm outline-none focus:border-emerald-500"
              >
                {rateUnits.map((unit) => (
                  <option key={unit} value={unit}>
                    per {unit}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Available From
              </label>
              <input
                name="available_from"
                type="date"
                className="h-11 w-full rounded-xl border border-slate-700 bg-black px-4 text-sm outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Available Until
              </label>
              <input
                name="available_until"
                type="date"
                className="h-11 w-full rounded-xl border border-slate-700 bg-black px-4 text-sm outline-none focus:border-emerald-500"
              />
            </div>

            <label className="flex items-center gap-3 rounded-xl border border-slate-800 bg-black p-4 text-sm font-semibold">
              <input name="cold_chain_available" type="checkbox" value="yes" />
              Cold chain / reefer available
            </label>

            <label className="flex items-center gap-3 rounded-xl border border-slate-800 bg-black p-4 text-sm font-semibold">
              <input name="loader_available" type="checkbox" value="yes" />
              Loader / labour available
            </label>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Contact Name
              </label>
              <input
                name="contact_name"
                defaultValue={profile?.full_name ?? ""}
                className="h-11 w-full rounded-xl border border-slate-700 bg-black px-4 text-sm outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Contact Phone
              </label>
              <input
                name="contact_phone"
                defaultValue={profile?.phone ?? ""}
                className="h-11 w-full rounded-xl border border-slate-700 bg-black px-4 text-sm outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                WhatsApp
              </label>
              <input
                name="contact_whatsapp"
                defaultValue={profile?.whatsapp_number ?? ""}
                placeholder="923001234567"
                className="h-11 w-full rounded-xl border border-slate-700 bg-black px-4 text-sm outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Contact Preference
              </label>
              <select
                name="contact_preference"
                defaultValue="phone"
                className="h-11 w-full rounded-xl border border-slate-700 bg-black px-4 text-sm outline-none focus:border-emerald-500"
              >
                <option value="phone">Phone</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="email">Email</option>
                <option value="in_app">In App</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold">
                Vehicle / Service Image
              </label>
              <input
                name="image"
                type="file"
                accept="image/*"
                className="block w-full rounded-xl border border-slate-700 bg-black px-4 py-3 text-sm text-slate-300 file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-500 file:px-4 file:py-2 file:text-sm file:font-bold file:text-black"
              />
            </div>
          </div>

          <div className="mt-7 flex justify-end gap-3 border-t border-slate-800 pt-5">
            <a
              href="/logistics"
              className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-300 hover:text-white"
            >
              Cancel
            </a>

            <button
              type="submit"
              className="rounded-xl bg-emerald-500 px-6 py-3 text-sm font-bold text-black hover:bg-emerald-400"
            >
              Submit for Review
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
