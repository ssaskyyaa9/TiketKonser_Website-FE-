import Link from "next/link";
import { Music2, MapPin } from "lucide-react";
import Poster from "./Poster";
import BookmarkButton from "./BookmarkButton";
import { concertHref, dayBadge, placeLabel, splitName } from "@/lib/concert";
import { rupiah } from "@/lib/format";

/** Kartu poster 3:5 (acuan: Konser Rekomendasi / Trending). Seluruh kartu = tautan; tombol di atasnya. */
export default function ConcertCard({ concert, saved = false, priority = false }) {
  const { title, subtitle } = splitName(concert.name);
  const { day, mon } = dayBadge(concert.date);
  const soldOut = concert.status === "sold_out";

  return (
    <article
      className="group relative isolate shrink-0 overflow-hidden transition-transform duration-150 hover:-translate-y-0.5"
      style={{ aspectRatio: "3 / 5", borderRadius: 10, border: "1px solid var(--line-strong)", background: "var(--ink-800)" }}
    >
      <Poster name={concert.name} thumbnail={concert.thumbnail} priority={priority} />
      <span aria-hidden="true" className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(8,6,15,0) 38%, rgba(8,6,15,.92) 78%)" }} />

      <Link href={concertHref(concert)} aria-label={`${concert.name}, ${day} ${mon}`} className="absolute inset-0 z-0 rounded-[10px]" />

      <div className="relative z-10 flex items-start justify-between p-2.5 pointer-events-none">
        <span className="grid place-items-center text-center leading-none" style={{ background: "rgba(8,6,15,.78)", border: "1px solid var(--line-strong)", borderRadius: 8, padding: "6px 9px" }}>
          <span className="text-[18px] font-extrabold">{day}</span>
          <span className="mt-0.5 text-[10px] font-semibold tracking-wide">{mon}</span>
        </span>
        <span className="pointer-events-auto">
          <BookmarkButton concertId={concert.id} initial={saved} label={title} />
        </span>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-1 p-3 pointer-events-none">
        <h3 className="font-display text-[26px] font-bold leading-[1.05]">{title}</h3>
        {subtitle ? <p className="text-xs" style={{ color: "var(--fg-muted)" }}>{subtitle}</p> : null}
        <p className="mt-1 flex items-center gap-1.5 text-[11px]"><Music2 size={12} aria-hidden="true" style={{ color: "var(--magenta-500)" }} /><span className="truncate">{concert.genre}</span></p>
        <p className="flex items-center gap-1.5 text-[11px]"><MapPin size={12} aria-hidden="true" style={{ color: "var(--magenta-500)" }} /><span className="truncate">{placeLabel(concert)}</span></p>
        <div className="mt-2 flex items-end justify-between gap-2">
          <div>
            <p className="text-[9px]" style={{ color: "var(--fg-muted)" }}>Mulai dari</p>
            <p className="text-[15px] font-bold">{rupiah(concert.minPrice)}</p>
          </div>
          {soldOut ? (
            <span className="chip chip--danger">Habis</span>
          ) : (
            <Link href={concertHref(concert)} className="btn btn--primary pointer-events-auto" style={{ height: 26, padding: "0 12px", fontSize: 11, borderRadius: 5 }}>
              Beli Tiket
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
