export default function LogisticsPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
              Logistics Module
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-5xl">
              Logistics Marketplace
            </h1>

            <p className="mt-4 text-base leading-7 text-slate-600 md:text-lg">
              Browse transport, cold chain, warehousing, and agri-logistics
              related services.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            Logistics module coming soon
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            This page is ready and deployed as a placeholder. We can now build
            the logistics listings flow next.
          </p>
        </div>
      </section>
    </main>
  );
}
