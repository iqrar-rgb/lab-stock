"use client";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

type Product = { id: string; sku: string; name: string; };
type Lot = { id: string; lot_no: string; expiry_date: string; stock_on_hand: number; is_quarantined: boolean; };

export default function MovementsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [lots, setLots] = useState<Lot[]>([]);
  const [productId, setProductId] = useState<string>(""); const [lotId, setLotId] = useState<string>("");
  const [type, setType] = useState<"IN"|"OUT"|"ADJUST">("OUT"); const [qty, setQty] = useState<string>("1");
  const [reference, setReference] = useState(""); const [notes, setNotes] = useState(""); const [msg, setMsg] = useState<string|null>(null);

  useEffect(() => { supabase.from("products").select("id,sku,name").order("name").then(({data})=>setProducts((data as Product[])??[])); }, []);
  const loadLots = async (pid: string) => {
    setLots([]); setLotId(""); if (!pid) return;
    const { data } = await supabase.from("lots_with_stock").select("id,lot_no,expiry_date,stock_on_hand,is_quarantined").eq("product_id", pid).order("expiry_date", { ascending: true });
    const list = ((data as Lot[]) ?? []).filter(l => !l.is_quarantined);
    setLots(list); if (type==="OUT" && list.length) setLotId(list[0].id);
  };
  useEffect(()=>{ loadLots(productId); /* eslint-disable-next-line */}, [productId, type]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setMsg(null);
    const n = Number(qty);
    if (!productId || !lotId || !n || n<=0) return setMsg("Lengkapi product, lot, dan qty > 0.");
    const { error } = await supabase.from("stock_movements").insert([{ product_id: productId, lot_id: lotId, movement_type: type, qty: n, reference, notes }]);
    if (error) setMsg(error.message); else { setMsg("Movement berhasil disimpan."); setQty("1"); setReference(""); setNotes(""); await loadLots(productId); }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Movements</h1>
      <form onSubmit={submit} className="bg-white rounded-2xl shadow p-4 space-y-3 max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="block"><span className="text-sm">Product</span>
            <select value={productId} onChange={e=>setProductId(e.target.value)} className="w-full border rounded-xl px-3 py-2 mt-1">
              <option value="">— Select —</option>{products.map(p=><option value={p.id} key={p.id}>{p.sku} — {p.name}</option>)}
            </select>
          </label>
          <label className="block"><span className="text-sm">Lot (FEFO default)</span>
            <select value={lotId} onChange={e=>setLotId(e.target.value)} className="w-full border rounded-xl px-3 py-2 mt-1">
              <option value="">— Select —</option>
              {lots.map(l=><option key={l.id} value={l.id}>{l.lot_no} • exp {new Date(l.expiry_date).toLocaleDateString()} • stok {l.stock_on_hand}</option>)}
            </select>
          </label>
        </div>
        <div className="flex gap-3 items-end">
          <label className="block"><span className="text-sm">Type</span>
            <div className="mt-1 flex gap-2">
              {(["IN","OUT","ADJUST"] as const).map(t=>(
                <label key={t} className={`px-3 py-2 rounded-xl border cursor-pointer ${type===t?"bg-black text-white":"bg-white"}`}>
                  <input type="radio" name="type" className="hidden" checked={type===t} onChange={()=>setType(t)} />{t}
                </label>
              ))}
            </div>
          </label>
          <label className="block"><span className="text-sm">Qty</span>
            <input value={qty} onChange={e=>setQty(e.target.value)} type="number" min={0.01} step="0.01" className="border rounded-xl px-3 py-2 mt-1 w-32"/>
          </label>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="block"><span className="text-sm">Reference</span>
            <input value={reference} onChange={e=>setReference(e.target.value)} className="border rounded-xl px-3 py-2 mt-1 w-full"/>
          </label>
          <label className="block"><span className="text-sm">Notes</span>
            <input value={notes} onChange={e=>setNotes(e.target.value)} className="border rounded-xl px-3 py-2 mt-1 w-full"/>
          </label>
        </div>
        {msg && <p className="text-sm text-neutral-700">{msg}</p>}
        <button className="px-4 py-2 rounded-xl bg-black text-white">Save Movement</button>
      </form>
    </div>
  );
}
