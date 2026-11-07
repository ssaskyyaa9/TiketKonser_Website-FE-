// Label peran (sumber tunggal). Sesi sendiri hidup di cookie httpOnly — lihat lib/server/bff.js.
export const ROLE_LABEL = {
  customer: "Penonton",
  organizer: "Penyelenggara",
  admin: "Admin",
  super_admin: "Super Admin",
};

// Hanya izinkan tujuan internal di bawah /akun (cegah open-redirect lewat ?next=).
export function safeNext(value) {
  return typeof value === "string" && /^\/akun(\/[\w-]*)*(\?[\w=&%-]*)?$/.test(value) ? value : "/akun";
}
