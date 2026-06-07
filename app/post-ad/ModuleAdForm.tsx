import { redirect } from "next/navigation";
import { createClientServer } from "@/app/lib/supabase/server";

export const dynamic = "force-dynamic";

type ModuleAdFormProps = {
  module: "produce" | "logistics" | "consultants" | "agri-inputs" | "buyers";
  title: string;
  subtitle: string;
  categoryLabel: string;
  categoryOptions: string[];
};

export default async function ModuleAdForm({
  module,
  title,
  subtitle,
  categoryLabel,
  categoryOptions,
}: ModuleAdFormProps) {
  const supabase = await createClientServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
            Post Ad
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-950">{title}</h1>

          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>

        <form
          action="/api/listings/create"
          method="post"
          encType="multipart/form-data"
          className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <input type="hidden" name="module" value={module} />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="text-sm font-semibold text-slate-700">
                Title
              </label>
              <input
                name="title"
                required
                placeholder="Enter listing title"
                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">
                {categoryLabel}
              </label>
              <select
                name="category"
                required
                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500"
              >
                <option value="">Select option</option>
                {categoryOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">
                Price
              </label>
              <input
                name="price"
                type="number"
                min="0"
                step="0.01"
                placeholder="Price in Rs"
                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">
                City
              </label>
              <input
                name="city"
                placeholder="Attock"
                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">
                Phone
              </label>
              <input
                name="phone"
                required
                placeholder="03xxxxxxxxx"
                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-sm font-semibold text-slate-700">
                Images
              </label>
              <input
                name="images"
                type="file"
                accept="image/*"
                multiple
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none file:mr-3 file:rounded-full file:border-0 file:bg-emerald-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-sm font-semibold text-slate-700">
                Description
              </label>
              <textarea
                name="description"
                rows={4}
                placeholder="Write short details about your ad."
                className="mt-1 w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              className="rounded-full bg-emerald-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
            >
              Submit for Approval
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
