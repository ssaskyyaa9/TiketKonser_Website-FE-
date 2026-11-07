// Label peran (sumber tunggal). Sesi sendiri hidup di cookie httpOnly — lihat lib/server/bff.js.
export const ROLE_LABEL = {
  customer: "Penonton",
  organizer: "Penyelenggara",
  admin: "Admin",
  super_admin: "Super Admin",
};

// Hanya izinkan tujuan internal area login (cegah open-redirect lewat ?next=).
const NEXT_RE = /^\/(akun|beranda|konser|tiket-disimpan|tiket-saya|riwayat|pengaturan)(\/[\w-]*)*(\?[\w=&%.-]*)?$/;
export function safeNext(value) {
  return typeof value === "string" && NEXT_RE.test(value) ? value : "/beranda";
}
