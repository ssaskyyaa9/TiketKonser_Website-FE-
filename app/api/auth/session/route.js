import { callBackend, dropToken, fail, ok, publicUser, readToken } from "@/lib/server/bff";

export async function GET() {
  const token = await readToken();
  if (!token) return fail(401, "NO_SESSION", "Belum masuk.");
  const { status, data } = await callBackend("/api/auth/me", { token });
  if (status === 200 && data?.user) return ok({ user: publicUser(data.user), organizerProfile: data.organizerProfile || null });
  if (status === 401 || status === 403) await dropToken(); // token kedaluwarsa/akun diblokir
  return fail(status === 503 ? 503 : 401, status === 503 ? "SERVER_UNREACHABLE" : "NO_SESSION", "Sesi tidak valid.");
}
