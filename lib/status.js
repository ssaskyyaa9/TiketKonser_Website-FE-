// Pemetaan status backend → label bahasa awam + nada warna.
// Wajib konsisten; rujukan: docs/DESIGN-SYSTEM.md §5.1.

const MAPS = {
  order: {
    pending: { label: "Menunggu pembayaran", tone: "warn" },
    paid: { label: "Sudah dibayar", tone: "ok" },
    expired: { label: "Kedaluwarsa", tone: "neutral" },
    cancelled: { label: "Dibatalkan", tone: "neutral" },
    refunded: { label: "Dana dikembalikan", tone: "info" },
  },
  payment: {
    pending: { label: "Menunggu", tone: "warn" },
    processing: { label: "Diproses", tone: "info" },
    completed: { label: "Berhasil", tone: "ok" },
    failed: { label: "Gagal", tone: "danger" },
    refunded: { label: "Dikembalikan", tone: "info" },
  },
  concert: {
    draft: { label: "Draf", tone: "neutral" },
    pending: { label: "Menunggu verifikasi", tone: "warn" },
    approved: { label: "Disetujui", tone: "info" },
    published: { label: "Tayang", tone: "ok" },
    on_sale: { label: "Tayang", tone: "ok" },
    upcoming: { label: "Akan datang", tone: "info" },
    rejected: { label: "Ditolak", tone: "danger" },
    sold_out: { label: "Tiket habis", tone: "neutral" },
    finished: { label: "Selesai", tone: "neutral" },
    cancelled: { label: "Dibatalkan", tone: "danger" },
  },
  withdrawal: {
    pending: { label: "Menunggu", tone: "warn" },
    processing: { label: "Diproses", tone: "info" },
    completed: { label: "Selesai", tone: "ok" },
    rejected: { label: "Ditolak", tone: "danger" },
    cancelled: { label: "Dibatalkan", tone: "neutral" },
  },
  refund: {
    pending: { label: "Menunggu", tone: "warn" },
    processing: { label: "Diproses", tone: "info" },
    completed: { label: "Selesai", tone: "ok" },
    rejected: { label: "Ditolak", tone: "danger" },
    cancelled: { label: "Dibatalkan", tone: "neutral" },
  },
  verification: {
    pending: { label: "Menunggu", tone: "warn" },
    approved: { label: "Terverifikasi", tone: "ok" },
    rejected: { label: "Ditolak", tone: "danger" },
  },
  ticket: {
    active: { label: "Aktif", tone: "ok" },
    used: { label: "Sudah dipakai", tone: "neutral" },
    expired: { label: "Kedaluwarsa", tone: "neutral" },
    refunded: { label: "Dikembalikan", tone: "info" },
    cancelled: { label: "Dibatalkan", tone: "danger" },
  },
  user: {
    active: { label: "Aktif", tone: "ok" },
    inactive: { label: "Nonaktif", tone: "neutral" },
    blocked: { label: "Diblokir", tone: "danger" },
  },
  review: {
    pending: { label: "Menunggu moderasi", tone: "warn" },
    approved: { label: "Tayang", tone: "ok" },
    rejected: { label: "Ditolak", tone: "danger" },
  },
};

/**
 * @param {"order"|"payment"|"concert"|"withdrawal"|"verification"|"ticket"|"user"|"review"} domain
 * @param {string} value nilai ENUM dari backend
 * @returns {{label:string, tone:string}}
 */
export function statusMeta(domain, value) {
  return (
    MAPS[domain]?.[value] || {
      label: value ? String(value).replace(/_/g, " ") : "—",
      tone: "neutral",
    }
  );
}
