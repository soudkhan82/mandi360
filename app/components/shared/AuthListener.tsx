"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientBrowser } from "@/app/lib/supabase/browser";

export default function AuthListener() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClientBrowser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      router.refresh();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  return null;
}
