import LoginButton from "@/app/components/auth/LoginButton";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const next = params?.next || "/";

  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-xl border p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Login</h1>
        <p className="mt-2 text-sm text-gray-600">
          Browsing is public. Login is only required for posting and account
          actions.
        </p>

        <div className="mt-6">
          <LoginButton next={next} />
        </div>
      </div>
    </main>
  );
}
