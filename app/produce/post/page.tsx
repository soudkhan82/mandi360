import Link from "next/link";
import { ArrowLeft, PlusCircle } from "lucide-react";
import ProductPostForm from "../components/ProductPostForm";
import {
  getCityOptions,
  getProduceCategoryOptions,
} from "@/app/lib/produce/queries";

export default async function ProducePostPage() {
  const [categories, cities] = await Promise.all([
    getProduceCategoryOptions(),
    getCityOptions(),
  ]);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="border-b border-white/10 bg-gradient-to-br from-emerald-950/30 via-slate-950 to-slate-950">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <Link
            href="/produce"
            className="inline-flex items-center gap-2 text-sm text-slate-300 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to produce
          </Link>

          <div className="mt-6 flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-500/10 p-3">
              <PlusCircle className="h-6 w-6 text-emerald-300" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Post Produce Listing
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                Create a fresh produce marketplace post for farmers, wholesalers,
                traders, and mandi buyers.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <ProductPostForm categories={categories} cities={cities} />
      </section>
    </main>
  );
}