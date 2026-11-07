// Klien auth sisi browser. Semua panggilan ke route handler same-origin
// (/api/auth/*) — token tidak pernah terlihat oleh JavaScript.

async function post(path, body) {
  let res;
  try {
    res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body ?? {}),
      credentials: "same-origin",
    });
  } catch {
    throw new Error("Tidak bisa menghubungi server. Periksa koneksi internet kamu lalu coba lagi.");
  }
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.ok) {
    const err = new Error(data?.message || `Terjadi kesalahan (${res.status}). Coba lagi.`);
    err.code = data?.code;
    throw err;
  }
  return data;
}

export const login = (email, password, remember = true) => post("/api/auth/login", { email, password, remember });
export const register = (payload) => post("/api/auth/register", payload);
export const logout = () => post("/api/auth/logout");

/** Pengguna aktif atau null. Tidak pernah melempar. */
export async function fetchSession() {
  try {
    const res = await fetch("/api/auth/session", { credentials: "same-origin", cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.user || null;
  } catch {
    return null;
  }
}
