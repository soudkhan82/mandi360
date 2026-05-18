import Link from "next/link";

const buyerTypes = [
  "Wholesaler",
  "Retailer",
  "Trader",
  "Processor",
  "Exporter",
  "Restaurant / Hotel",
  "Institutional Buyer",
  "Other",
];

const productCategories = [
  "Fruits",
  "Vegetables",
  "Grains",
  "Pulses",
  "Oil Seeds",
  "Livestock Feed",
  "Agri Inputs",
  "Packaging Material",
  "Other",
];

export default function PostBuyerPage() {
  return (
    <main className="min-h-screen bg-[#f5f5f5] px-6 py-10">
      <section className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <Link
            href="/buyers"
            className="text-sm font-bold text-green-700 hover:underline"
          >
            ← Back to Buyers
          </Link>

          <h1 className="mt-3 text-3xl font-black text-slate-950">
            Post Buyer Requirement
          </h1>

          <p className="mt-1 text-sm text-slate-600">
            Add a buyer requirement. Image is optional; a default image will be
            used if skipped.
          </p>
        </div>

        <form
          action="/post-ad/submit"
          method="post"
          encType="multipart/form-data"
          className="space-y-5"
        >
          <input type="hidden" name="module" value="buyers" />

          <div>
            <label className="mb-1 block text-sm font-bold text-slate-800">
              Requirement Title
            </label>
            <input
              name="title"
              required
              placeholder="Example: Need 5 tons kinnow in Lahore"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-950 outline-none focus:border-green-600"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-bold text-slate-800">
                Buyer Type
              </label>
              <select
                name="buyer_type"
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-950 outline-none focus:border-green-600"
              >
                <option value="">Select buyer type</option>
                {buyerTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-bold text-slate-800">
                Product Category
              </label>
              <select
                name="product_category"
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-950 outline-none focus:border-green-600"
              >
                <option value="">Select category</option>
                {productCategories.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-bold text-slate-800">
              Product Needed
            </label>
            <input
              name="product_needed"
              required
              placeholder="Example: Kinnow, onion, wheat, fertilizer"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-950 outline-none focus:border-green-600"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-bold text-slate-800">
                Quantity
              </label>
              <input
                name="quantity"
                placeholder="Example: 5 tons"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-950 outline-none focus:border-green-600"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-bold text-slate-800">
                City
              </label>
              <input
                name="city"
                required
                placeholder="Example: Lahore"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-950 outline-none focus:border-green-600"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-bold text-slate-800">
                Phone
              </label>
              <input
                name="phone"
                required
                placeholder="03xxxxxxxxx"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-950 outline-none focus:border-green-600"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-bold text-slate-800">
              Buyer Image
            </label>
            <input
              type="file"
              name="image"
              accept="image/*"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none file:mr-4 file:rounded-md file:border-0 file:bg-green-600 file:px-4 file:py-2 file:text-sm file:font-bold file:text-white hover:file:bg-green-700"
            />
            <p className="mt-1 text-xs text-slate-500">
              Optional. If skipped, a default buyer image will be used.
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-bold text-slate-800">
              Description
            </label>
            <textarea
              name="description"
              rows={4}
              placeholder="Mention quality, delivery location, payment preference or other details."
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-950 outline-none focus:border-green-600"
            />
          </div>

          <div className="flex justify-end gap-3 border-t pt-5">
            <Link
              href="/buyers"
              className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="rounded-lg bg-green-600 px-6 py-3 text-sm font-bold text-white hover:bg-green-700"
            >
              Submit for Approval
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
