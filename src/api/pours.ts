const BASE_URL = (import.meta.env.VITE_WORKER_URL ?? "http://localhost:8787").replace(/\/$/, "");

export async function fetchAllPours(): Promise<Record<string, number>> {
  const res = await fetch(`${BASE_URL}/pours`);
  if (!res.ok) {
    throw new Error(`fetchAllPours failed: ${res.status}`);
  }
  return res.json() as Promise<Record<string, number>>;
}

export async function incrementPour(id: string): Promise<number> {
  const res = await fetch(`${BASE_URL}/pours/${id}`, { method: "POST" });
  if (!res.ok) {
    throw new Error(`incrementPour failed: ${res.status}`);
  }
  const data = (await res.json()) as { count: number };
  return data.count;
}
