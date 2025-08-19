"use client";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import { addDays, differenceInDays } from "date-fns";

type Lot = {
  id: string;
  product_id: string;
  sku: string;
  product_name: string;
  lot_no: string;
  expiry_date: string;
  stock_on_hand: number;
  is_quarantined: boolean;
};

export default function LotsPage() {
  const [rows, setRows] = useState<Lot[]>([]);
  const [onlyNear, setOnlyNear] = useState(true);

  const load = async () => {
    const { data, error } = await supabase
      .from("lots_with_stock")
      .select("*")
      .gt("stock_on_hand", 0)
      .order("expiry_date", { ascending: true });

    if (error) {
      console.error(error);
      setRows([]);
      return;
    }

    let list = (data as Lot[]) ?? [];
    if (onlyNear) {
      const cutoff = addDays(new Date(), 90);
      list = list.filter(
        (r) => new Date(r.expiry_date) <= cutoff && !r.is_quarantined
      );
    }
    setRows(list);
  };

  useEffect(() => {
    load(); // reload saat toggle near-expiry
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onlyNear]);

  // --- Export helper
  const downloadCSV = () => {
    const header = [
      "SKU",
      "Product",
      "Lot",
      "Expiry",
      "Stock",
      "Status",
    ];
    const lines = rows.map((r) => {
      const days = differenceInDays(new Date(r.expiry_date), new Date());
      const status = r.is_quarantined
        ? "Quarantined"
        : days <= 90
        ? "Near expiry"
        : "OK";
      const expiry = new Date(r.expiry_date)
        .toISOString()
        .slice(0, 10); // YYYY-MM-DD
      // Pastikan koma/quote aman
      const safe = (v: string | number) =>
        typeof v === "string" && /[",\n]/.test(v)
          ? `"${v.replace(/"/g, '""')}"`
          : String(v);
      return [
        safe(r.sku),
        safe(r.product_name),
        safe(r.lot_no),
        safe(expiry),
        safe(r.stock_on_hand),
        safe(status),
      ].join(",");
    });

    const csv = [header.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const prefix = onlyNear ? "near-expiry" : "all-lots";
    a.download = `${prefix}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Lots</h1>

      <div className="flex items-center gap-4">
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={onlyNear}
            onChange={(e) => setOnlyNear(e.target.checked)}
          />
          <span>Show near-expiry (≤ 90 days)</span>
        </label>

        <button
          onClick={downloadCSV}
          className="px-4 py-2 rounded-xl bg-black text-white"
          disabled={rows.length === 0}
          title={rows.length ? "Export current list to CSV" : "No data to export"}
        >
          Export CSV
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50">
            <tr>
              <th className="text-left p-3">SKU</th>
              <th className="text-left p-3">Product</th>
              <th className="text-left p-3">Lot</th>
              <th className="text-left p-3">Expiry</th>
              <th className="text-right p-3">Stock</th>
              <th className="text-left p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const d = differenceInDays(new Date(r.expiry_date), new Date());
              const status = r.is_quarantined
                ? "Quarantined"
                : d <= 90
                ? "Near expiry"
                : "OK";
              const rowClass =
                r.is_quarantined
                  ? "bg-orange-50"
                  : d <= 90
                  ? "bg-red-50"
                  : ""; // highlight baris
              return (
                <tr key={r.id} className={`border-t ${rowClass}`}>
                  <td className="p-3">{r.sku}</td>
                  <td className="p-3">{r.product_name}</td>
                  <td className="p-3">{r.lot_no}</td>
                  <td className="p-3">
                    {new Date(r.expiry_date).toLocaleDateString()}
                  </td>
                  <td className="p-3 text-right">{r.stock_on_hand}</td>
                  <td className="p-3">
                    {status}
                  </td>
                </tr>
              );
            })}
            {!rows.length && (
              <tr>
                <td className="p-4 text-neutral-500" colSpan={6}>
                  No data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
