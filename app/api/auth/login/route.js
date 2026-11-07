import { callBackend, clientIp, failGuard, failHit, failReset, fail, messageOf, ok, publicUser, sameOrigin, writeToken } from "@/lib/server/bff";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  if (!sameOrigin(request)) return fail(403, "FORBIDDEN", "Permintaan ditolak.");

  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  if (!EMAIL_RE.test(email) || email.length > 254 || !password || password.length > 128) {
    return fail(400, "INVALID_INPUT", "Email atau kata sandi belum benar. Periksa isiannya.");
  }

  const ip = clientIp(request);
  const WIN = 15 * 60_000;
  const kIp = `login:ip:${ip}`;
  const kAcct = `login:acct:${ip}:${email}`;
  // Hanya percobaan GAGAL yang dihitung; login sukses tidak menghabiskan jatah.
  const perIp = failGuard(kIp, 30);
  const perAcct = failGuard(kAcct, 6);
  if (!perIp.ok || !perAcct.ok) {
    const wait = Math.max(perIp.retryAfter, perAcct.retryAfter);
    return fail(429, "RATE_LIMITED", `Terlalu banyak percobaan. Coba lagi dalam ${Math.ceil(wait / 60)} menit.`, { retryAfter: wait });
  }

  const { status, data } = await callBackend("/api/auth/login", { method: "POST", body: { email, password } });
  if (status === 503) return fail(503, "SERVER_UNREACHABLE", "Server belum bisa dihubungi. Coba lagi sebentar lagi.");
  if (status !== 200 || !data?.token) { failHit(kIp, WIN); failHit(kAcct, WIN); }
  if (status !== 200 || !data?.token || !data?.user) {
    if (status === 403) {
      const raw = messageOf(data);
      const msg = /blocked/i.test(raw)
        ? "Akun kamu diblokir. Hubungi help@showtime.id untuk bantuan."
        : /pending/i.test(raw)
          ? "Akun penyelenggara kamu masih menunggu verifikasi admin."
          : /rejected/i.test(raw)
            ? "Pendaftaran penyelenggara kamu ditolak. Hubungi help@showtime.id."
            : "Akun belum bisa dipakai masuk.";
      return fail(403, "FORBIDDEN_ACCOUNT", msg);
    }
    // 401/400/lainnya: satu pesan seragam agar tidak membocorkan email mana yang terdaftar.
    return fail(401, "INVALID_CREDENTIALS", "Email atau kata sandi salah. Coba periksa kembali.");
  }

  failReset(kAcct);
  await writeToken(data.token, { remember: body?.remember !== false });
  return ok({ user: publicUser(data.user) });
}
