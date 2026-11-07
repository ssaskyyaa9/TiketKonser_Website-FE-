// Lapisan server (BFF) untuk auth. JWT dari backend TIDAK pernah dikirim ke
// JavaScript browser: disimpan di cookie httpOnly, diteruskan sebagai Bearer
// oleh route handler di sini. Hanya dipakai dari app/api/** dan Server Component.
import { cookies } from "next/headers";

const IS_PROD = process.env.NODE_ENV === "production";

// Awalan __Host- (hanya di produksi) mengikat cookie ke host persis, wajib Secure & path "/".
export const COOKIE_NAME = IS_PROD ? "__Host-st_session" : "st_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // selaras JWT_EXPIRE=7d di backend

const API_BASE =
  process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5003";

export async function readToken() {
  const jar = await cookies();
  return jar.get(COOKIE_NAME)?.value || null;
}

export async function writeToken(token, { remember = true } = {}) {
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: "lax",
    path: "/",
    // Tanpa maxAge = cookie sesi (hilang saat browser ditutup) untuk perangkat bersama.
    ...(remember ? { maxAge: SESSION_MAX_AGE } : {}),
  });
}

export async function dropToken() {
  const jar = await cookies();
  jar.set(COOKIE_NAME, "", { httpOnly: true, secure: IS_PROD, sameSite: "lax", path: "/", maxAge: 0 });
}

/** Panggil backend Express. Tidak pernah melempar: selalu { status, data }. */
export async function callBackend(path, { method = "GET", body, token } = {}) {
  const headers = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    const data = await res.json().catch(() => null);
    return { status: res.status, data };
  } catch {
    return { status: 503, data: { message: "SERVER_UNREACHABLE" } };
  }
}

export function messageOf(data) {
  if (!data) return "";
  if (data.message) return String(data.message);
  if (Array.isArray(data.errors) && data.errors[0]?.msg) return String(data.errors[0].msg);
  return "";
}

// Perlindungan CSRF lapis kedua (cookie sudah SameSite=Lax): permintaan
// mengubah-state harus berasal dari origin yang sama.
export function sameOrigin(request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export function clientIp(request) {
  const fwd = request.headers.get("x-forwarded-for");
  return (fwd ? fwd.split(",")[0].trim() : "") || request.headers.get("x-real-ip") || "local";
}

// Pembatas laju in-memory (cukup untuk 1 instance; ganti Redis bila scale-out).
const buckets = new Map();
export function rateLimit(key, max, windowMs) {
  const now = Date.now();
  const hit = buckets.get(key);
  if (!hit || hit.reset <= now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    if (buckets.size > 5000) for (const [k, v] of buckets) if (v.reset <= now) buckets.delete(k);
    return { ok: true, retryAfter: 0 };
  }
  hit.count += 1;
  return { ok: hit.count <= max, retryAfter: Math.ceil((hit.reset - now) / 1000) };
}

export const publicUser = (u) =>
  u ? { id: u.id, name: u.name, email: u.email, role: u.role, status: u.status, avatar: u.avatar || null } : null;

export function fail(status, code, message, extra = {}) {
  return Response.json({ ok: false, code, message, ...extra }, { status, headers: { "Cache-Control": "no-store" } });
}
export function ok(payload = {}, init = {}) {
  return Response.json({ ok: true, ...payload }, { ...init, headers: { "Cache-Control": "no-store" } });
}
