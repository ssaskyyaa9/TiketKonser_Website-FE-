"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { rupiah } from "@/lib/format";

export default function PromoCard({ promo }) {
  const [copied, setCopied] = useState(false);
  const pct = promo.discountType === "percentage";
  const value = pct ? `${Number(promo.value)}%` : rupiah(promo.value);

  const claim = async () => {
    try { await navigator.clipboard.writeText(promo.code); } catch { /* klip papan diblokir: kode tetap tampil di bawah */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section aria-label="Promo spesial" className="p-6" style={{ borderRadius: 14, border: "1px solid var(--violet-500)", background: "rgba(15,11,28,.82)", backdropFilter: "blur(6px)" }}>
      <p className="text-base" style={{ color: "var(--violet-500)" }}>Promo Spesial</p>
      <p className="mt-1 text-2xl font-bold">Diskon Hingga</p>
      <p className="brand-text font-display text-[44px] font-extrabold leading-none">{value}</p>
      <button type="button" onClick={claim} className="btn btn--primary mt-3" style={{ height: 38, padding: "0 28px", borderRadius: 6 }} aria-live="polite">
        {copied ? <><Check size={16} aria-hidden="true" />Kode {promo.code} disalin</> : "Klaim Promo"}
      </button>
      <p className="mt-3 text-xs" style={{ color: "var(--fg-muted)" }}>{promo.description || "Periode terbatas!"}{copied ? <> Kode: <strong style={{ color: "var(--fg)" }}>{promo.code}</strong></> : null}</p>
    </section>
  );
}
