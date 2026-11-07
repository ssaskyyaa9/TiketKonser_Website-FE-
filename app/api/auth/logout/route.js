import { callBackend, dropToken, fail, ok, readToken, sameOrigin } from "@/lib/server/bff";

export async function POST(request) {
  if (!sameOrigin(request)) return fail(403, "FORBIDDEN", "Permintaan ditolak.");
  const token = await readToken();
  if (token) await callBackend("/api/auth/logout", { method: "POST", token }); // best-effort
  await dropToken();
  return ok();
}
