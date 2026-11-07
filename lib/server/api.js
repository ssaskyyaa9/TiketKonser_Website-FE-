// Fetch data backend dari Server Component (token dari cookie httpOnly).
import { callBackend, readToken } from "@/lib/server/bff";

export async function getData(path) {
  const token = await readToken();
  const { status, data } = await callBackend(path, { token });
  return { status, data: data?.data ?? null, raw: data };
}

export const apiBase = () => process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5003";

export function imageUrl(path) {
  if (!path) return null;
  return /^https?:\/\//.test(path) ? path : `${apiBase()}${path.startsWith("/") ? "" : "/"}${path}`;
}
