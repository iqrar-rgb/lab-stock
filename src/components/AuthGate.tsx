"use client";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false); const router = useRouter();
  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) router.replace("/login"); else setReady(true);
    };
    init();
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => { if (!session) router.replace("/login"); });
    return () => { sub.subscription.unsubscribe(); };
  }, [router]);
  if (!ready) return <div className="p-6">Loading...</div>;
  return <>{children}</>;
}
