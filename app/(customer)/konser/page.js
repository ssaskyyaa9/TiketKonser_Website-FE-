import Link from "next/link";
import ConcertRow from "@/components/customer/ConcertRow";
import HeroSearch from "@/components/customer/HeroSearch";
import { applyPrice, bySoonest, byPopular, byCheapest } from "@/lib/concert";
import { getData } from "@/lib/server/api";

export const metadata = { title: "Cari Konser — ShowTime" };

const SORTS = { tanggal: ["Terdekat", bySoonest], populer: ["Terpopuler", byPopular], termurah: ["Termurah", byCheapest] };

export default async function KonserPage({ searchParams }) {
  const sp = await searchParams;
  const one = (k) => (Array.isArray(sp[k]) ? sp[k][0] : sp[k]) || "";
  const q = one("q").slice(0, 100), city = one("city").slice(0, 60), date = /^\d{4}-\d{2}-\d{2}$/.test(one("date")) ? one("date") : "";
  const price = one("price"), urut = SORTS[one("urut")] ? one("urut") : "tanggal";

  const qs = new URLSearchParams({ limit: "50" });
  if (city) qs.set("city", city);
  if (date) qs.set("date", date);
  let path = "/api/concerts?" + qs;
  if (q) { qs.set("q", q); path = "/api/concerts/search?" + qs; }

  const [res, all, favs] = await Promise.all([getData(path), getData("/api/concerts?limit=50"), getData("/api/customer/favorites")]);
  const saved = new Set((favs.data || []).map((f) => f.concertId));
  const cities = [...new Set((all.data || []).map((c) => c.city || c.venue?.city).filter(Boolean))].sort();
  const rows = applyPrice(Array.isArray(res.data) ? res.data : [], price).sort(SORTS[urut][1]);
  const hasFilter = q || city || date || price;

  const link = (u) => { const p = new URLSearchParams(); for (const [k, v] of Object.entries({ q, city, date, price, urut: u })) if (v) p.set(k, v); return `/konser?${p}`; };

  return (
    <div className="mx-auto w-full max-w-[1320px] px-4 pb-10 pt-[110px] sm:px-6">
      <h1 className="brand-text font-display text-[32px] font-extrabold sm:text-[40px]">Cari konser</h1>
      <div className="mt-6 max-w-[690px]"><HeroSearch cities={cities} defaults={{ q, city, date, price }} /></div>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
        <p role="status" className="text-sm" style={{ color: "var(--fg-muted)" }}>{res.status === 200 ? `${rows.length} konser ditemukan` : "Konser belum bisa dimuat"}</p>
        <nav aria-label="Urutkan" className="flex gap-2">
          {Object.entries(SORTS).map(([k, [label]]) => (
            <Link key={k} href={link(k)} aria-current={urut === k ? "true" : undefined} className="rounded-full border px-4 py-1.5 text-sm" style={{ borderColor: urut === k ? "var(--magenta-500)" : "var(--line-strong)", background: urut === k ? "rgba(129,56,232,.25)" : "transparent" }}>{label}</Link>
          ))}
        </nav>
      </div>

      <div className="mt-5 flex flex-col gap-4">
        {rows.map((c) => <ConcertRow key={c.id} concert={c} saved={saved.has(c.id)} />)}
        {!rows.length ? (
          <div className="rounded-2xl border p-10 text-center" style={{ borderColor: "var(--line-strong)" }}>
            <p className="text-lg font-semibold">Belum ada konser yang cocok.</p>
            <p className="mt-1 text-sm" style={{ color: "var(--fg-muted)" }}>Coba kata kunci, lokasi, atau tanggal lain.</p>
            {hasFilter ? <Link href="/konser" className="btn btn--primary mt-5">Hapus filter</Link> : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
