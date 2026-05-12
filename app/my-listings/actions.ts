"use server";

import { revalidatePath } from "next/cache";
import { createClientServer } from "@/app/lib/supabase/server";

export async function deleteMyListings(ids: string[]) {
  if (!ids.length) return { ok: false, message: "No listings selected." };

  const supabase = await createClientServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "Not authenticated." };
  }

  const { error } = await supabase
    .from("produce_listings")
    .delete()
    .eq("user_id", user.id)
    .in("id", ids);

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/my-listings");
  revalidatePath("/admin/listings");

  return { ok: true };
}
