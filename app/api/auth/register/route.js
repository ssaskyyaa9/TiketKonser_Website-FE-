import { callBackend, clientIp, fail, messageOf, ok, publicUser, rateLimit, sameOrigin, writeToken } from "@/lib/server/bff";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const str = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const opt = (v, max) => str(v, max) || undefined;

export async function POST(request) {
  if (!sameOrigin(request)) return fail(403, "FORBIDDEN", "Permintaan ditolak.");

  const b = await request.json().catch(() => null);
  if (!b || typeof b !== "object") return fail(400, "INVALID_INPUT", "Data pendaftaran tidak terbaca.");

  const type = b.type === "organizer" ? "organizer" : "customer";
  const name = str(b.name, 100);
  const email = str(b.email, 254).toLowerCase();
  const password = typeof b.password === "string" ? b.password : "";
  const phone = opt(b.phone, 20);

  if (name.length < 2) return fail(400, "INVALID_INPUT", "Nama harus 2–100 karakter.");
  if (!EMAIL_RE.test(email)) return fail(400, "INVALID_INPUT", "Format email belum benar. Contoh: nama@email.com.");
  if (password.length < 8 || password.length > 128) return fail(400, "INVALID_INPUT", "Kata sandi 8–128 karakter.");
  if (phone && !/^\+?[0-9\s-]{10,15}$/.test(phone)) return fail(400, "INVALID_INPUT", "Nomor telepon harus 10–15 angka.");

  const rl = rateLimit(`register:${clientIp(request)}`, 10, 60 * 60_000);
  if (!rl.ok) return fail(429, "RATE_LIMITED", `Terlalu banyak pendaftaran dari jaringan ini. Coba lagi dalam ${Math.ceil(rl.retryAfter / 60)} menit.`);

  let path = "/api/auth/register/customer";
  let payload = { name, email, password, phone };

  if (type === "organizer") {
    const companyName = str(b.companyName, 150);
    const city = str(b.city, 80);
    const address = str(b.address, 300);
    if (!companyName) return fail(400, "INVALID_INPUT", "Nama perusahaan atau komunitas wajib diisi.");
    if (!city) return fail(400, "INVALID_INPUT", "Kota wajib diisi.");
    if (!address) return fail(400, "INVALID_INPUT", "Alamat wajib diisi.");
    path = "/api/auth/register/organizer";
    payload = {
      ...payload,
      companyName,
      city,
      address,
      description: opt(b.description, 1000),
      website: opt(b.website, 200),
      instagram: opt(b.instagram, 80),
      bankName: opt(b.bankName, 80),
      bankAccount: opt(b.bankAccount, 30),
      bankHolder: opt(b.bankHolder, 100),
    };
  }

  const { status, data } = await callBackend(path, { method: "POST", body: payload });
  if (status === 503) return fail(503, "SERVER_UNREACHABLE", "Server belum bisa dihubungi. Coba lagi sebentar lagi.");
  if (status === 201 || status === 200) {
    if (type === "organizer") {
      return ok({ pending: true, name: data?.user?.name || name, companyName: data?.organizerProfile?.companyName || payload.companyName });
    }
    if (!data?.token || !data?.user) return fail(502, "BAD_GATEWAY", "Pendaftaran berhasil, tetapi sesi tidak bisa dimulai. Silakan masuk manual.");
    await writeToken(data.token, { remember: true });
    return ok({ user: publicUser(data.user) }, { status: 201 });
  }
  if (/already exists/i.test(messageOf(data))) return fail(409, "EMAIL_TAKEN", "Email ini sudah terdaftar. Coba masuk atau gunakan email lain.");
  return fail(status >= 400 && status < 500 ? 400 : 502, "REJECTED", messageOf(data) || "Pendaftaran belum bisa diproses.");
}
