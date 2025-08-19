"use client";
import AuthGate from "@/components/AuthGate";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const logout = async () => { await supabase.auth.signOut(); router.replace("/login"); };
  return (
    <AuthGate>
      <div className="min-h-screen flex">
        <aside className="w-56 bg-white border-r p-4 space-y-2">
          <h2 className="font-semibold mb-3">Lab Stock</h2>
          <nav className="space-y-1">
            <Link className="block px-3 py-2 rounded-lg hover:bg-neutral-100" href="/products">Products</Link>
            <Link className="block px-3 py-2 rounded-lg hover:bg-neutral-100" href="/lots">Lots</Link>
            <Link className="block px-3 py-2 rounded-lg hover:bg-neutral-100" href="/movements">Movements</Link>
          </nav>
          <button onClick={logout} className="mt-6 px-3 py-2 rounded-lg bg-black text-white w-full">Sign out</button>
        </aside>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </AuthGate>
  );
}
