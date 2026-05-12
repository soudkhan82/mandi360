"use client";

import { useEffect } from "react";
import { createClientBrowser } from "@/app/lib/supabase/browser";
import { useAuthStore } from "@/app/lib/store/auth-store";
import { createBrowserClient } from "@supabase/ssr";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClientBrowser();
  const setUser = useAuthStore((s) => s.setUser);
  const setLoading = useAuthStore((s) => s.setLoading);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      setLoading(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      if (!session?.user) {
        clearAuth();
        return;
      }

      const userId = session.user.id;

      const { data: profile } = await supabase
        .from("profiles")
        .select("id,email,full_name,phone,role")
        .eq("id", userId)
        .maybeSingle();

      if (!mounted) return;

      setUser({
        id: userId,
        email: session.user.email ?? profile?.email ?? null,
        full_name: profile?.full_name ?? null,
        phone: profile?.phone ?? null,
        role: profile?.role ?? null,
      });
      setLoading(false);
    };

    bootstrap();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;

      if (!session?.user) {
        clearAuth();
        return;
      }

      const userId = session.user.id;

      const { data: profile } = await supabase
        .from("profiles")
        .select("id,email,full_name,phone,role")
        .eq("id", userId)
        .maybeSingle();

      if (!mounted) return;

      setUser({
        id: userId,
        email: session.user.email ?? profile?.email ?? null,
        full_name: profile?.full_name ?? null,
        phone: profile?.phone ?? null,
        role: profile?.role ?? null,
      });
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, setUser, setLoading, clearAuth]);

  return <>{children}</>;
}
