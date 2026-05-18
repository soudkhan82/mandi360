"use client";

import { useMemo, useState } from "react";
import type { MarketplaceModule } from "@/app/lib/marketplace/modules";

type Props = {
  module: MarketplaceModule;
  title: string;
  categoryLabel: string;
  categoryOptions: string[];
};

export default function ModuleAdForm({
  module,
  title,
  categoryLabel,
  categoryOptions,
}: Props) {
  const [previews, setPreviews] = useState<string[]>([]);

  const units = useMemo(() => {
    if (module === "produce") return ["kg", "maund", "ton", "crate", "bag"];
    if (module === "logistics") return ["trip", "km", "day", "ton", "vehicle"];
    if (module === "consultants") return ["visit", "hour", "day", "project"];
    return ["kg", "bag", "liter", "packet", "unit"];
  }, [module]);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <p className="text-sm font-semibold text-emerald-700">
            Post Advertisement
          </p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">{title}</h1>
        </div>

        <form
          action="/post-ad/submit"
          method="post"
          encType="multipart/form-data"
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <input type="hidden" name="module" value={module} />

          <div className="grid gap-5">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">
                Title
              </label>
              <input
                name="title"
                required
                placeholder="Enter ad title"
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">
                Description
              </label>
              <textarea
                name="description"
                rows={4}
                placeholder="Describe your listing"
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  {categoryLabel}
                </label>
                <select
                  name="category"
                  required
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                >
                  <option value="">Select</option>
                  {categoryOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  City
                </label>
                <input
                  name="city"
                  required
                  placeholder="City"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Price / Rate
                </label>
                <input
                  name="price"
                  type="number"
                  step="any"
                  placeholder="0"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Quantity / Capacity
                </label>
                <input
                  name="quantity"
                  type="number"
                  step="any"
                  placeholder="0"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Unit
                </label>
                <select
                  name="unit"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                >
                  <option value="">Select</option>
                  {units.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">
                Phone
              </label>
              <input
                name="phone"
                required
                placeholder="Contact number"
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">
                Images
              </label>
              <input
                name="images"
                type="file"
                accept="image/*"
                multiple
                onChange={(event) => {
                  const files = Array.from(event.target.files || []);
                  const urls = files.map((file) => URL.createObjectURL(file));
                  setPreviews(urls);
                }}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm"
              />

              {previews.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                  {previews.map((src, index) => (
                    <div
                      key={`${src}-${index}`}
                      className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={src}
                        alt={`Preview ${index + 1}`}
                        className="h-32 w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end border-t border-slate-200 pt-5">
              <button
                type="submit"
                className="rounded-full bg-emerald-600 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-700"
              >
                Submit Ad
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
