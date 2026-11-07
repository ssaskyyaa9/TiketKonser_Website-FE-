import Image from "next/image";
import ConcertCard from "@/components/customer/ConcertCard";
import ConcertRow from "@/components/customer/ConcertRow";
import Carousel from "@/components/customer/Carousel";
import HeroSearch from "@/components/customer/HeroSearch";
import MyTicketsCard from "@/components/customer/MyTicketsCard";
import PromoCard from "@/components/customer/PromoCard";
import SectionHead from "@/components/customer/SectionHead";
import { bySoonest, byPopular } from "@/lib/concert";
import { getData } from "@/lib/server/api";

export const metadata = { title: "Halaman Utama — ShowTime" };

export default async function BerandaPage() {
  const [list, promos, dash, favs] = await Promise.all([
    getData("/api/concerts?limit=50"),
    getData("/api/promos/active"),
    getData("/api/customer/dashboard"),
    getData("/api/customer/favorites"),
  ]);

  const concerts = Array.isArray(list.data) ? list.data : [];
  const failed = list.status !== 200;
  const saved = new Set((favs.data || []).map((f) => f.concertId));
  const cities = [...new Set(concerts.map((c) => c.city || c.venue?.city).filter(Boolean))].sort();
  const promo = (promos.data || [])[0];

  const recommended = [...concerts].sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured) || byPopular(a, b)).slice(0, 10);
  const trending = [...concerts].sort(byPopular).slice(0, 10);
  const soon = [...concerts].sort(bySoonest).slice(0, 5);

  return (
    <>
      <section className="relative isolate overflow-hidden" aria-labelledby="judul-hero">
        <Image src="/icons/bg.png" alt="" fill priority sizes="100vw" style={{ objectFit: "cover", objectPosition: "center top", zIndex: -2 }} />
        <div aria-hidden="true" className="absolute inset-0 -z-10" style={{ background: "linear-gradient(180deg, rgba(5,3,9,.45) 0%, rgba(8,6,15,.35) 55%, var(--ink-900) 100%)" }} />
        <div className="mx-auto grid w-full max-w-[var(--page-max)] items-start gap-10 px-4 pb-16 pt-[120px] sm:px-6 lg:grid-cols-[minmax(0,1fr)_393px] lg:pb-24">
          <div className="min-w-0 lg:max-w-[690px] min-[1900px]:max-w-[820px]">
            <h1 id="judul-hero" className="brand-text font-display text-[30px] font-extrabold leading-[1.1] sm:text-[44px] min-[1900px]:text-[56px]">Mau nonton konser apa hari ini?</h1>
            <p className="mt-4 text-xl font-semibold sm:text-[30px]">Yuk cari tiket konser favoritmu!</p>
            <div className="mt-8"><HeroSearch cities={cities} /></div>
          </div>
          <div className="flex flex-col gap-5">
            {promo ? <PromoCard promo={{ code: promo.code, value: promo.value, discountType: promo.discountType, description: promo.description }} /> : null}
            <MyTicketsCard tickets={dash.data?.upcomingEvents || []} />
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-[var(--page-max)] px-4 sm:px-6">
        {failed ? (
          <p role="alert" className="my-10 rounded-xl border p-5 text-sm" style={{ borderColor: "var(--danger)", color: "var(--fg-muted)" }}>Konser belum bisa dimuat. Muat ulang halaman ini sebentar lagi.</p>
        ) : null}

        <section id="konser-rekomendasi" aria-labelledby="h-rek" className="pt-4">
          <SectionHead id="h-rek" title="Konser Rekomendasi" subtitle="Deretan konser megah siap manjakan telinga kamu." href="/konser?urut=populer" />
          {recommended.length ? (
            <Carousel label="Konser Rekomendasi">
              {recommended.map((c, i) => <ConcertCard key={c.id} concert={c} saved={saved.has(c.id)} priority={i < 5} />)}
            </Carousel>
          ) : !failed ? <p style={{ color: "var(--fg-muted)" }}>Belum ada konser yang tersedia.</p> : null}
        </section>

        <section id="trending" aria-labelledby="h-trend" className="pt-16">
          <SectionHead id="h-trend" title="Trending Saat Ini" subtitle="Jangan lewatkan panggung musik terhangat saat ini!" href="/konser?urut=populer" />
          {trending.length ? (
            <Carousel label="Trending Saat Ini">
              {trending.map((c) => <ConcertCard key={c.id} concert={c} saved={saved.has(c.id)} />)}
            </Carousel>
          ) : null}
        </section>

        <section id="segera" aria-labelledby="h-dekat" className="pt-16">
          <SectionHead id="h-dekat" title="Konser Dalam waktu dekat" href="/konser" />
          <div className="flex flex-col gap-4">
            {soon.map((c) => <ConcertRow key={c.id} concert={c} saved={saved.has(c.id)} />)}
          </div>
        </section>
      </div>
    </>
  );
}
