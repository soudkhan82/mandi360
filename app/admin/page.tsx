"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClientBrowser } from "@/app/lib/supabase/browser";
import { getListingPreviewUrl } from "@/app/lib/listing-image";

type ListingStatus =
  | "draft"
  | "published"
  | "paused"
  | "sold"
  | "closed"
  | "rejected"
  | "pending";

type ProfileRow = {
  full_name: string | null;
  phone: string | null;
  email?: string | null;
};

type ListingRow = {
  id: string;
  title: string | null;
  slug: string | null;
  status: ListingStatus;
  created_at: string | null;
  updated_at: string | null;
  quantity: number | null;
  quantity_unit: string | null;
  price_per_unit: number | null;
  price_unit: string | null;
  user_id: string | null;
  image_urls: string[] | string | null;
  profiles: ProfileRow | null;
};

type RawListingRow = {
  id: unknown;
  title: unknown;
  slug: unknown;
  status: unknown;
  created_at: unknown;
  updated_at: unknown;
  quantity: unknown;
  quantity_unit: unknown;
  price_per_unit: unknown;
  price_unit: unknown;
  user_id: unknown;
  image_urls?: unknown;
  profiles?: unknown;
};

const STATUS_LABELS: Record<ListingStatus, string> = {
  draft: "Draft",
  published: "Approved",
  paused: "Paused",
  sold: "Sold",
  closed: "Closed",
  rejected: "Rejected",
  pending: "Pending",
};

function formatDate(value: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatPrice(value: number | null, unit: string | null) {
  if (value == null) return "—";
  return `PKR ${value.toLocaleString()}${unit ? `/${unit}` : ""}`;
}

function getStatusLabel(status: string) {
  return STATUS_LABELS[status as ListingStatus] ?? status;
}

function getBadgeClasses(status: ListingStatus) {
  switch (status) {
    case "pending":
      return "border-yellow-500/30 bg-yellow-500/10 text-yellow-300";
    case "published":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
    case "rejected":
      return "border-rose-500/30 bg-rose-500/10 text-rose-300";
    case "draft":
      return "border-slate-500/30 bg-slate-500/10 text-slate-300";
    case "paused":
      return "border-orange-500/30 bg-orange-500/10 text-orange-300";
    case "sold":
      return "border-cyan-500/30 bg-cyan-500/10 text-cyan-300";
    case "closed":
      return "border-purple-500/30 bg-purple-500/10 text-purple-300";
    default:
      return "border-white/10 bg-white/5 text-white/70";
  }
}

function isValidListingStatus(value: unknown): value is ListingStatus {
  return (
    value === "draft" ||
    value === "published" ||
    value === "paused" ||
    value === "sold" ||
    value === "closed" ||
    value === "rejected" ||
    value === "pending"
  );
}

function toNullableString(value: unknown): string | null {
  if (value == null) return null;
  return String(value);
}

function toNullableNumber(value: unknown): number | null {
  if (value == null || value === "") return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function normalizeImageUrls(value: unknown): string[] | string | null {
  if (value == null) return null;
  if (Array.isArray(value)) {
    return value.map((x) => String(x));
  }
  if (typeof value === "string") {
    return value;
  }
  return null;
}

function normalizeProfile(input: unknown): ProfileRow | null {
  if (!input) return null;

  if (Array.isArray(input)) {
    const first = input[0];
    if (!first || typeof first !== "object") return null;

    const obj = first as Record<string, unknown>;
    return {
      full_name: toNullableString(obj.full_name),
      phone: toNullableString(obj.phone),
      email: toNullableString(obj.email),
    };
  }

  if (typeof input === "object") {
    const obj = input as Record<string, unknown>;
    return {
      full_name: toNullableString(obj.full_name),
      phone: toNullableString(obj.phone),
      email: toNullableString(obj.email),
    };
  }

  return null;
}

function normalizeListing(row: RawListingRow): ListingRow {
  return {
    id: String(row.id ?? ""),
    title: toNullableString(row.title),
    slug: toNullableString(row.slug),
    status: isValidListingStatus(row.status) ? row.status : "draft",
    created_at: toNullableString(row.created_at),
    updated_at: toNullableString(row.updated_at),
    quantity: toNullableNumber(row.quantity),
    quantity_unit: toNullableString(row.quantity_unit),
    price_per_unit: toNullableNumber(row.price_per_unit),
    price_unit: toNullableString(row.price_unit),
    user_id: toNullableString(row.user_id),
    image_urls: normalizeImageUrls(row.image_urls),
    profiles: normalizeProfile(row.profiles),
  };
}

export default function AdminPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorMessage = searchParams.get("error");

  const supabase = createClientBrowser();

  const [listings, setListings] = useState<ListingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminEmail, setAdminEmail] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    setAdminEmail(user?.email ?? "");

    const { data, error } = await supabase
      .from("produce_listings")
      .select(
        `
  id,
  title,
  slug,
  status,
  created_at,
  updated_at,
  quantity,
  quantity_unit,
  price_per_unit,
  price_unit,
  user_id,
  image_urls,
  profiles (
    full_name,
    phone
  )
`,
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Admin listings load error:", error.message);
      setListings([]);
      setLoading(false);
      return;
    }

    const normalized: ListingRow[] = ((data ?? []) as RawListingRow[]).map(
      normalizeListing,
    );

    setListings(normalized);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const counts = useMemo(() => {
    return {
      total: listings.length,
      pending: listings.filter((x) => x.status === "pending").length,
      approved: listings.filter((x) => x.status === "published").length,
      rejected: listings.filter((x) => x.status === "rejected").length,
      drafts: listings.filter((x) => x.status === "draft").length,
    };
  }, [listings]);

  async function updateStatus(id: string, status: ListingStatus) {
    try {
      setBusyId(id);

      const { error } = await supabase
        .from("produce_listings")
        .update({ status })
        .eq("id", id);

      if (error) {
        router.push(`/admin?error=${encodeURIComponent(error.message)}`);
        return;
      }

      await loadData();
      router.replace("/admin");
    } catch (err) {
      console.error("Status update failed:", err);
      router.push(
        `/admin?error=${encodeURIComponent("Unable to update listing status")}`,
      );
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: string) {
    const ok = window.confirm("Are you sure you want to delete this listing?");
    if (!ok) return;

    try {
      setBusyId(id);

      const { error } = await supabase
        .from("produce_listings")
        .delete()
        .eq("id", id);

      if (error) {
        router.push(`/admin?error=${encodeURIComponent(error.message)}`);
        return;
      }

      await loadData();
      router.replace("/admin");
    } catch (err) {
      console.error("Delete failed:", err);
      router.push(
        `/admin?error=${encodeURIComponent("Unable to delete listing")}`,
      );
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#000814] px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-5xl font-bold tracking-tight text-white">
              Admin Panel
            </h1>
            <p className="mt-3 text-lg text-slate-300">
              Review and manage all marketplace listings.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#07152f] px-5 py-4 shadow-lg">
            <div className="text-xs uppercase tracking-[0.25em] text-slate-400">
              Admin User
            </div>
            <div className="mt-2 text-lg font-medium text-white">
              {adminEmail || "—"}
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-6 rounded-2xl border border-rose-500/30 bg-rose-950/40 px-5 py-4 text-base text-rose-200">
            {errorMessage}
          </div>
        )}

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-3xl border border-slate-800 bg-[#04122a] p-6">
            <div className="text-lg text-slate-300">Total Listings</div>
            <div className="mt-3 text-5xl font-bold text-white">
              {counts.total}
            </div>
          </div>

          <div className="rounded-3xl border border-yellow-500/20 bg-yellow-950/10 p-6">
            <div className="text-lg text-yellow-300">Pending</div>
            <div className="mt-3 text-5xl font-bold text-yellow-400">
              {counts.pending}
            </div>
          </div>

          <div className="rounded-3xl border border-emerald-500/20 bg-emerald-950/10 p-6">
            <div className="text-lg text-emerald-300">Approved</div>
            <div className="mt-3 text-5xl font-bold text-emerald-400">
              {counts.approved}
            </div>
          </div>

          <div className="rounded-3xl border border-rose-500/20 bg-rose-950/10 p-6">
            <div className="text-lg text-rose-300">Rejected</div>
            <div className="mt-3 text-5xl font-bold text-rose-400">
              {counts.rejected}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-700 bg-[#04122a] p-6">
            <div className="text-lg text-slate-300">Drafts</div>
            <div className="mt-3 text-5xl font-bold text-white">
              {counts.drafts}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-slate-800 bg-[#04122a] p-10 text-center text-lg text-slate-300">
            Loading admin listings...
          </div>
        ) : listings.length === 0 ? (
          <div className="rounded-3xl border border-slate-800 bg-[#04122a] p-10 text-center text-lg text-slate-300">
            No listings found.
          </div>
        ) : (
          <div className="space-y-5">
            {listings.map((listing) => {
              const isPending = listing.status === "pending";
              const isPublished = listing.status === "published";
              const isBusy = busyId === listing.id;
              const preview = getListingPreviewUrl(listing);

              return (
                <div
                  key={listing.id}
                  className="rounded-[28px] border border-slate-800 bg-[#04122a] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]"
                >
                  <div className="flex flex-col gap-6 xl:flex-row">
                    <div className="relative h-48 w-full shrink-0 overflow-hidden rounded-2xl bg-slate-900 xl:w-64">
                      {preview ? (
                        <Image
                          src={preview}
                          alt={listing.title || "Listing image"}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-slate-500">
                          No image
                        </div>
                      )}
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="mb-4 flex flex-wrap items-center gap-3">
                          <h2 className="text-3xl font-bold text-white">
                            {listing.title || "Untitled Listing"}
                          </h2>
                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-semibold ${getBadgeClasses(
                              listing.status,
                            )}`}
                          >
                            {getStatusLabel(listing.status)}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 gap-3 text-base text-slate-300 md:grid-cols-2 xl:grid-cols-4">
                          <div>
                            <span className="text-slate-400">Created:</span>{" "}
                            <span className="text-white">
                              {formatDate(listing.created_at)}
                            </span>
                          </div>

                          <div>
                            <span className="text-slate-400">Updated:</span>{" "}
                            <span className="text-white">
                              {formatDate(listing.updated_at)}
                            </span>
                          </div>

                          <div>
                            <span className="text-slate-400">Contact:</span>{" "}
                            <span className="text-white">
                              {listing.profiles?.full_name || "—"}
                            </span>
                          </div>

                          <div>
                            <span className="text-slate-400">Phone:</span>{" "}
                            <span className="text-white">
                              {listing.profiles?.phone || "—"}
                            </span>
                          </div>

                          <div>
                            <span className="text-slate-400">Quantity:</span>{" "}
                            <span className="text-white">
                              {listing.quantity ?? "—"}{" "}
                              {listing.quantity_unit
                                ? listing.quantity_unit
                                : ""}
                            </span>
                          </div>

                          <div>
                            <span className="text-slate-400">Price:</span>{" "}
                            <span className="text-white">
                              {formatPrice(
                                listing.price_per_unit,
                                listing.price_unit,
                              )}
                            </span>
                          </div>

                          <div className="md:col-span-2 xl:col-span-2">
                            <span className="text-slate-400">Listing ID:</span>{" "}
                            <span className="break-all text-white">
                              {listing.id}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 xl:justify-end">
                        {isPublished && listing.slug ? (
                          <Link
                            href={`/listing/${listing.slug}`}
                            className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-300"
                          >
                            Live
                          </Link>
                        ) : (
                          <span className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/60">
                            Not Live
                          </span>
                        )}

                        <Link
                          href={`/my-listings/${listing.id}/edit`}
                          className="rounded-2xl border border-slate-700 bg-[#0a1a37] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#102347]"
                        >
                          Edit
                        </Link>

                        {isPending && (
                          <>
                            <button
                              onClick={() =>
                                updateStatus(listing.id, "published")
                              }
                              disabled={isBusy}
                              className="rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {isBusy ? "Working..." : "Approve"}
                            </button>

                            <button
                              onClick={() =>
                                updateStatus(listing.id, "rejected")
                              }
                              disabled={isBusy}
                              className="rounded-2xl bg-amber-400 px-4 py-2 text-sm font-semibold text-black transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {isBusy ? "Working..." : "Reject"}
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => handleDelete(listing.id)}
                          disabled={isBusy}
                          className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm font-medium text-rose-300 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isBusy ? "Working..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
