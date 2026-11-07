// Pembantu tampilan konser (murni, aman dipakai di server & klien).
import { rupiah } from "@/lib/format";

const MON = ["JAN", "FEB", "MAR", "APR", "MEI", "JUN", "JUL", "AGU", "SEP", "OKT", "NOV", "DES"];

/** "2026-12-07T00:00:00.000Z" → { day: "07", mon: "DES" } (tanpa geser zona waktu). */
export function dayBadge(date) {
  const [, m, d] = String(date || "").slice(0, 10).split("-");
  return { day: d || "--", mon: MON[Number(m) - 1] || "---" };
}

/** "19:00:00" → "19.00 WIB" */
export function jamWib(time) {
  const [h, m] = String(time || "").split(":");
  return h ? `${h}.${m || "00"} WIB` : "";
}

/** "Raisa — Live in Concert" → { title: "Raisa", subtitle: "Live in Concert" } */
export function splitName(name = "") {
  const i = name.indexOf(" — ");
  return i > 0 ? { title: name.slice(0, i), subtitle: name.slice(i + 3) } : { title: name, subtitle: "" };
}

export const concertHref = (c) => `/konser/${c.slug}`;
export const priceLabel = (c) => rupiah(c.minPrice);
export const placeLabel = (c) => [c.venueName || c.venue?.name, c.city || c.venue?.city].filter(Boolean).join(", ");

export const PRICE_FILTERS = [
  { key: "lt250", label: "< Rp 250.000", test: (p) => p < 250000 },
  { key: "gt250", label: "> Rp 250.000", test: (p) => p > 250000 },
  { key: "gt500", label: "> Rp 500.000", test: (p) => p > 500000 },
  { key: "gt1000", label: "> Rp 1.000.000", test: (p) => p > 1000000 },
];

export function applyPrice(list, key) {
  const f = PRICE_FILTERS.find((x) => x.key === key);
  return f ? list.filter((c) => f.test(Number(c.minPrice) || 0)) : list;
}

export const bySoonest = (a, b) => String(a.date).localeCompare(String(b.date));
export const byPopular = (a, b) => (b.views || 0) - (a.views || 0);
export const byCheapest = (a, b) => (Number(a.minPrice) || 0) - (Number(b.minPrice) || 0);
