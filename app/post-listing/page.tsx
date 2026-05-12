import { redirect } from "next/navigation";
import { createClientServer } from "@/app/lib/supabase/server";

export default async function PostListingPage() {
  const supabase = await createClientServer();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  console.log("[post-listing/page] user =", user?.email || null);
  console.log("[post-listing/page] error =", error?.message || null);

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Post Listing</h1>
    </main>
  );
}
