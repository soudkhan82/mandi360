import { Suspense } from "react";
import LoginPageClient from "./LoginPageClient";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-[#020817] px-4">
          <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-950 p-8 text-center shadow-2xl">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-emerald-400" />
            <p className="text-sm font-semibold text-slate-300">
              Loading login...
            </p>
          </div>
        </main>
      }
    >
      <LoginPageClient />
    </Suspense>
  );
}
