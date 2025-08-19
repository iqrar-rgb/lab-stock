"use client";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

type Product = { id: string; sku: string; name: string; principal: string|null; description: string|null; stock_on_hand: number|null; };

export default function ProductsPage() {
  const [rows, setRows] = useState<Product[]>([]); const [q, setQ] = useState("");
  const load = async () => {
    let { data } = await supabase.from("products_with_stock").select("*").order("sku");
    if (q.trim()) {
      const base = await supabase.from("products").select("id").ilike("name", `%${q}%`);
      const ids = (base.data ?? []).map((b:any)=>b.id);
      ({ data } = ids.length ? await supabase.from("products_with_stock").select("*").in("id", ids).order("sku") : { data: [] });
    }
    setRows((data as Product[]) ?? []);
  };
  useEffect(()=>{ load(); /* eslint-disable-next-line */ },[]);
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Products</h1>
      <div className="flex gap-2">
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search name..." className="border px-3 py-2 rounded-xl w-72"/>
        <button onClick={load} className="px-4 py-2 rounded-xl bg-black text-white">Search</button>
      </div>
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50"><tr><th className="p-3 text-left">SKU</th><th className="p-3 text-left">Name</th><th className="p-3 text-left">Principal</th><th className="p-3 text-right">Stock</th></tr></thead>
          <tbody>
            {rows.map(r=>(
              <tr key={r.id} className="border-t">
                <td className="p-3">{r.sku}</td><td className="p-3">{r.name}</td><td className="p-3">{r.principal ?? "-"}</td>
                <td className="p-3 text-right">{r.stock_on_hand ?? 0}</td>
              </tr>
            ))}
            {!rows.length && <tr><td className="p-4 text-neutral-500" colSpan={4}>No data</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
