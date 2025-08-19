"use client";
import { supabase } from "@/lib/supabaseClient";
import { useCallback, useEffect, useState } from "react";

type ProductRow = {
  id: string;
  sku: string;
  name: string;
  principal: string | null;
  description: string | null;
  stock_on_hand: number | null;
};

export default function ProductsPage() {
  const [rows, setRows] = useState<ProductRow[]>([]);
  const [q, setQ] = useState("");

  const load = useCallback(async () => {
    if (q.trim()) {
      const { data: idsData } = await supabase
        .from("products")
        .select("id")
        .ilike("name", `%${q}%`);
      const ids = (idsData ?? []).map((b: { id: string }) => b.id);
      if (ids.length) {
        const { data } = await supabase
          .from("products_with_stock")
          .select("*")
          .in("id", ids)
          .order("sku");
        setRows((data as ProductRow[]) ?? []);
      } else {
        setRows([]);
      }
    } else {
      const { data } = await supabase
        .from("products_with_stock")
        .select("*")
        .order("sku");
      setRows((data as ProductRow[]) ?? []);
    }
  }, [q]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Products</h1>
      <div className="flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name..."
          className="border px-3 py-2 rounded-xl w-72"
        />
        <button onClick={load} className="px-4 py-2 rounded-xl bg-black text-white">
          Search
        </button>
      </div>
      <div className="rounded-2xl shadow overflow-hidden border">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50">
            <tr>
              <th className="text-left p-3">SKU</th>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Principal</th>
              <th className="text-right p-3">Stock</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-3">{r.sku}</td>
                <td className="p-3">{r.name}</td>
                <td className="p-3">{r.principal ?? "-"}</td>
                <td className="p-3 text-right">{r.stock_on_hand ?? 0}</td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td className="p-4 text-neutral-500" colSpan={4}>No data</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
