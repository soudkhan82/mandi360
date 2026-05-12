"use client";

import { useState } from "react";
import Link from "next/link";
import { deleteMyListings } from "./actions";

type Listing = {
  id: string;
  title: string | null;
  description: string | null;
  city: string | null;
  price_per_unit: number | null;
  price_unit: string | null;
  quantity: number | null;
  status: string | null;
  slug: string | null;
  created_at: string | null;
};

export default function MyListingsClient({
  listings,
}: {
  listings: Listing[];
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const selectAll = () => {
    if (selected.length === listings.length) {
      setSelected([]);
    } else {
      setSelected(listings.map((l) => l.id));
    }
  };

  const handleDelete = async () => {
    if (!selected.length) return;

    setLoading(true);
    const res = await deleteMyListings(selected);
    setLoading(false);

    if (res.ok) {
      setSelected([]);
      setShowModal(false);
      location.reload(); // simple + effective
    } else {
      alert(res.message);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold md:text-3xl">My Listings</h1>
            <p className="mt-2 text-sm text-slate-400">Manage your ads</p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/post-ad"
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm"
            >
              Post New Ad
            </Link>
          </div>
        </div>

        {/* Bulk Action Bar */}
        {selected.length > 0 && (
          <div className="mb-4 flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900 p-3">
            <span className="text-sm text-slate-300">
              {selected.length} selected
            </span>

            <div className="flex gap-2">
              <button
                onClick={() => setSelected([])}
                className="text-xs text-slate-400"
              >
                Clear
              </button>

              <button
                onClick={() => setShowModal(true)}
                className="rounded-md bg-red-600 px-3 py-1 text-xs"
              >
                Delete Selected
              </button>
            </div>
          </div>
        )}

        {/* Select All */}
        {listings.length > 0 && (
          <div className="mb-3 flex items-center gap-2 text-sm text-slate-400">
            <input
              type="checkbox"
              checked={selected.length === listings.length}
              onChange={selectAll}
            />
            Select All
          </div>
        )}

        {/* Cards */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {listings.map((item) => (
            <div
              key={item.id}
              className="relative rounded-xl border border-slate-800 bg-slate-900 p-4"
            >
              {/* Checkbox */}
              <input
                type="checkbox"
                checked={selected.includes(item.id)}
                onChange={() => toggleSelect(item.id)}
                className="absolute right-3 top-3"
              />

              <h3 className="text-sm font-semibold">
                {item.title || "Untitled"}
              </h3>

              <p className="mt-2 text-xs text-slate-400">
                {item.description || "No description"}
              </p>

              <div className="mt-3 text-xs text-slate-500">
                {item.city} • {item.quantity ?? "-"}
              </div>

              <div className="mt-4 flex gap-2">
                <Link
                  href={`/my-listings/${item.id}/edit`}
                  className="text-xs text-sky-400"
                >
                  Edit
                </Link>

                <button
                  onClick={() => {
                    setSelected([item.id]);
                    setShowModal(true);
                  }}
                  className="text-xs text-red-400"
                >
                  Delete
                </button>

                {item.status === "approved" && item.slug && (
                  <Link
                    href={`/listing/${item.slug}`}
                    className="text-xs text-emerald-400"
                  >
                    View
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/60">
            <div className="w-full max-w-sm rounded-xl bg-slate-900 p-5">
              <h2 className="text-lg font-semibold">Confirm Delete</h2>

              <p className="mt-2 text-sm text-slate-400">
                Delete {selected.length} listing(s)?
              </p>

              <div className="mt-5 flex justify-end gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="text-sm text-slate-400"
                >
                  Cancel
                </button>

                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="rounded-md bg-red-600 px-4 py-2 text-sm"
                >
                  {loading ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
