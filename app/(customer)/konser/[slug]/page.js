import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, Clock, MapPin, Music2 } from "lucide-react";
import BookmarkButton from "@/components/customer/BookmarkButton";
import Poster from "@/components/customer/Poster";
import { dayBadge, jamWib, placeLabel, splitName } from "@/lib/concert";
import { formatDate, rupiah } from "@/lib/format";
import { getData } from "@/lib/server/api";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  return { title: `${slug.replace(/-/g, " ")} — ShowTime` };
}

export default async function ConcertDetail({ params }) {
  const { slug } = await params;
  const list = await getData("/api/concerts?limit=100");
  const concert = (list.data || []).find((c) => c.slug === slug);
  if (!concert) notFound();

  const [cats, favs] = await Promise.all([getData(`/api/concerts/${concert.id}/ticket-categories`), getData("/api/customer/favorites")]);
  const saved = (favs.data || []).some((f) => f.concertId === concert.id);
  const { title, subtitle } = splitName(concert.name);
  const { day, mon } = dayBadge(concert.date);
  const categories = Array.isArray(cats.data) ? cats.data : [];

  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 pb-10 pt-[110px] sm:px-6">
      <nav aria-label="Jejak" className="mb-6 text-sm" style={{ color: "var(--fg-muted)" }}><Link href="/konser" className="underline-offset-4 hover:underline">Konser</Link> / {title}</nav>
      <div className="grid gap-8 md:grid-cols-[320px_1fr]">
        <div className="relative isolate overflow-hidden" style={{ aspectRatio: "3 / 5", borderRadius: 14, border: "1px solid var(--line-strong)" }}><Poster name={concert.name} thumbnail={concert.thumbnail} sizes="320px" priority /></div>
        <div>
          <div className="flex items-start justify-between gap-4">
            <div><h1 className="font-display text-[36px] font-extrabold leading-tight">{title}</h1>{subtitle ? <p className="mt-1 text-xl" style={{ color: "var(--fg-muted)" }}>{subtitle}</p> : null}</div>
            <BookmarkButton concertId={concert.id} initial={saved} size={44} label={title} className="border" />
          </div>
          <ul className="mt-6 flex list-none flex-col gap-3 p-0 text-base">
            <li className="flex items-center gap-3"><CalendarDays size={20} aria-hidden="true" style={{ color: "var(--magenta-500)" }} />{day} {mon} · {formatDate(concert.date)}</li>
            <li className="flex items-center gap-3"><Clock size={20} aria-hidden="true" style={{ color: "var(--magenta-500)" }} />{jamWib(concert.time)}</li>
            <li className="flex items-center gap-3"><MapPin size={20} aria-hidden="true" style={{ color: "var(--magenta-500)" }} />{placeLabel(concert)}</li>
            <li className="flex items-center gap-3"><Music2 size={20} aria-hidden="true" style={{ color: "var(--magenta-500)" }} />{concert.genre}</li>
          </ul>
          {concert.description ? <p className="mt-6 text-base" style={{ color: "var(--fg-muted)" }}>{concert.description}</p> : null}

          <h2 className="mt-10 text-xl font-bold">Kategori tiket</h2>
          <ul className="mt-4 flex list-none flex-col gap-3 p-0">
            {categories.map((k) => (
              <li key={k.id} className="flex items-center justify-between gap-4 rounded-xl border p-4" style={{ borderColor: "var(--line-strong)" }}>
                <div><p className="font-semibold">{k.category}</p><p className="text-xs" style={{ color: "var(--fg-muted)" }}>Sisa {Math.max(0, (k.quota || 0) - (k.sold || 0))} tiket</p></div>
                <p className="text-lg font-bold">{rupiah(k.price)}</p>
              </li>
            ))}
            {!categories.length ? <li style={{ color: "var(--fg-muted)" }}>Kategori tiket belum tersedia.</li> : null}
          </ul>
          <p className="mt-6 rounded-xl border p-4 text-sm" style={{ borderColor: "var(--line)", color: "var(--fg-muted)" }}>Pembelian tiket (pesanan dan pembayaran) sedang disiapkan.</p>
        </div>
      </div>
    </div>
  );
}
