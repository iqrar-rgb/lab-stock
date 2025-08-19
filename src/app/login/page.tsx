"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [err, setErr] = useState<string|null>(null); const [loading, setLoading] = useState(false);
  const router = useRouter();

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(null); setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false); if (error) return setErr(error.message); if (data.session) router.replace("/products");
  };
  const signUp = async () => {
    setErr(null); setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false); if (error) setErr(error.message); else alert("Sign up berhasil. Cek email jika diminta verifikasi, lalu login.");
  };

  return (
    <main className="flex min-h-screen items-center justify-center">
      <form onSubmit={signIn} className="max-w-md w-full p-8 bg-white rounded-2xl shadow space-y-4">
        <h1 className="text-2xl font-semibold">Login</h1>
        <input className="w-full border rounded-xl px-3 py-2" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="w-full border rounded-xl px-3 py-2" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        {err && <p className="text-red-600 text-sm">{err}</p>}
        <button disabled={loading} className="w-full px-4 py-2 rounded-xl bg-black text-white">{loading?"Loading...":"Sign in"}</button>
        <button type="button" onClick={signUp} className="w-full px-4 py-2 rounded-xl bg-neutral-200">Create account</button>
      </form>
    </main>
  );
}
