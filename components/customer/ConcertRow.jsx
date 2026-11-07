import Link from "next/link";
import { Clock, MapPin } from "lucide-react";
import Poster from "./Poster";
import BookmarkButton from "./BookmarkButton";
import { concertHref, dayBadge, jamWib, splitName } from "@/lib/concert";
import { rupiah } from "@/lib/format";

/** Baris daftar (acuan: Konser Dalam waktu dekat). */
export default function ConcertRow({ concert, saved = false }) {
  const { title, subtitle } = splitName(concert.name);
  const { day, mon } = dayBadge(concert.date);
  const venue = concert.venueName || concert.venue?.name;
  const city = concert.city || concert.venue?.city;

  return (
    <article className="relative isolate grid items-center gap-x-5 gap-y-3 p-3 transition-colors hover:bg-white/[0.03] sm:p-4 grid-cols-[56px_72px_1fr] xl:grid-cols-[70px_90px_minmax(0,1fr)_200px_130px_150px_auto_40px]"
      style={{ border: "1px solid var(--violet-500)", borderRadius: 8, background: "rgba(8,6,15,.6)" }}>
      <Link href={concertHref(concert)} aria-label={`${concert.name}, ${day} ${mon}`} className="absolute inset-0 z-0 rounded-[8px]" />

      <div className="relative text-center leading-none pointer-events-none">
        <p className="text-[22px] font-extrabold">{day}</p>
        <p className="mt-1 text-base font-semibold">{mon}</p>
      </div>
      <div className="relative h-[84px] w-[72px] overflow-hidden rounded-md xl:h-[100px] xl:w-[90px] pointer-events-none"><Poster name={concert.name} thumbnail={concert.thumbnail} sizes="90px" /></div>
      <div className="relative min-w-0 pointer-events-none">
        <h3 className="truncate font-display text-xl font-bold xl:text-[22px]">{title}</h3>
        {subtitle ? <p className="truncate text-sm xl:text-base" style={{ color: "var(--fg-muted)" }}>{subtitle}</p> : null}
        <p className="mt-1 text-sm font-bold xl:hidden">{rupiah(concert.minPrice)}</p>
      </div>

      <p className="relative col-span-3 flex items-start gap-3 text-sm pointer-events-none xl:col-span-1" style={{ color: "var(--fg-muted)" }}>
        <MapPin size={20} aria-hidden="true" style={{ color: "var(--magenta-500)", flexShrink: 0 }} />
        <span>{city}, Indonesia<br />{venue}</span>
      </p>
      <p className="relative col-span-3 flex items-center gap-3 text-sm pointer-events-none xl:col-span-1" style={{ color: "var(--fg-muted)" }}>
        <Clock size={20} aria-hidden="true" style={{ color: "var(--magenta-500)" }} />
        {jamWib(concert.time)}
      </p>
      <p className="relative hidden text-[22px] font-bold pointer-events-none xl:block">{rupiah(concert.minPrice)}</p>
      <div className="relative z-10 col-span-2 xl:col-span-1">
        <Link href={concertHref(concert)} className="btn btn--primary btn--block xl:w-auto" style={{ height: 42, padding: "0 28px", borderRadius: 6 }}>Beli Tiket</Link>
      </div>
      <div className="relative z-10 justify-self-end"><BookmarkButton concertId={concert.id} initial={saved} size={40} label={title} /></div>
    </article>
  );
}
