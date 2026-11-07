"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, ChevronDown, MapPin, Search } from "lucide-react";
import { PRICE_FILTERS } from "@/lib/concert";

const fmtDate = (v) => (v ? `${v.slice(8, 10)}/${v.slice(5, 7)}/${v.slice(2, 4)}` : "dd/mm/yy");

const field = "flex items-center gap-3 px-4 transition-[border-color,box-shadow] focus-within:shadow-[0_0_0_3px_rgba(154,77,240,.25)]";
const fieldStyle = { height: 56, borderRadius: 14, border: "1px solid rgba(154,77,240,.6)", background: "rgba(5,3,9,.55)", backdropFilter: "blur(6px)" };

/** Pencarian hero: kata kunci + lokasi + tanggal + chip harga → /konser?… (bisa dibagikan). */
export default function HeroSearch({ cities = [], defaults = {} }) {
  const router = useRouter();
  const [q, setQ] = useState(defaults.q || "");
  const [city, setCity] = useState(defaults.city || "");
  const [date, setDate] = useState(defaults.date || "");
  const [price, setPrice] = useState(defaults.price || "");

  const go = (over = {}) => {
    const v = { q, city, date, price, ...over };
    const p = new URLSearchParams();
    for (const [k, val] of Object.entries(v)) if (val) p.set(k, val);
    router.push(`/konser${p.toString() ? `?${p}` : ""}`);
  };

  return (
    <form role="search" aria-label="Cari konser" onSubmit={(e) => { e.preventDefault(); go(); }} className="flex flex-col gap-3.5">
      <label className={field} style={fieldStyle}>
        <Search size={22} strokeWidth={1.75} aria-hidden="true" />
        <span className="sr-only">Cari konser</span>
        <input type="search" name="q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari konser yang kamu mau.." autoComplete="off" className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-[color:var(--fg-muted)]" />
      </label>

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-[1.55fr_1fr]">
        <label className={`${field} relative`} style={fieldStyle}>
          <MapPin size={22} strokeWidth={1.75} aria-hidden="true" />
          <span className="sr-only">Lokasi</span>
          <select name="city" value={city} onChange={(e) => setCity(e.target.value)} className="min-w-0 flex-1 cursor-pointer appearance-none bg-transparent pr-7 text-base outline-none" style={{ color: city ? "var(--fg)" : "var(--fg-muted)" }}>
            <option value="" style={{ background: "#0f0b1c" }}>Pilih lokasi</option>
            {cities.map((c) => <option key={c} value={c} style={{ background: "#0f0b1c", color: "#f4f1fb" }}>{c}</option>)}
          </select>
          <ChevronDown size={20} aria-hidden="true" className="pointer-events-none absolute right-4" />
        </label>
        <label className={`${field} relative cursor-pointer`} style={fieldStyle}>
          <CalendarDays size={22} strokeWidth={1.75} aria-hidden="true" />
          <span className="sr-only">Tanggal</span>
          <span aria-hidden="true" className="flex-1 text-base" style={{ color: date ? "var(--fg)" : "var(--fg-muted)" }}>{fmtDate(date)}</span>
          {/* input asli transparan di atas field: tetap bisa difokus, diketik, dan membuka pemilih tanggal */}
          <input type="date" name="date" value={date} onChange={(e) => setDate(e.target.value)} onClick={(e) => e.currentTarget.showPicker?.()} className="absolute inset-0 h-full w-full cursor-pointer opacity-0 [color-scheme:dark]" />
        </label>
      </div>

      <div role="group" aria-label="Rentang harga" className="flex flex-wrap gap-3">
        {PRICE_FILTERS.map((f) => {
          const on = price === f.key;
          return (
            <button key={f.key} type="button" aria-pressed={on} onClick={() => { const next = on ? "" : f.key; setPrice(next); go({ price: next }); }}
              className="rounded-xl px-4 text-base transition-colors hover:bg-white/10"
              style={{ height: 48, border: `1px solid ${on ? "var(--magenta-500)" : "rgba(154,77,240,.6)"}`, background: on ? "rgba(129,56,232,.28)" : "rgba(5,3,9,.45)" }}>
              {f.label}
            </button>
          );
        })}
      </div>
      <button type="submit" className="sr-only">Cari konser</button>
    </form>
  );
}
