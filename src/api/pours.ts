import type { PourCounts } from "../data/types";

const WORKER_URL_ENV = import.meta.env.VITE_WORKER_URL;

if (import.meta.env.PROD && !WORKER_URL_ENV) {
  throw new Error("VITE_WORKER_URL must be set in production");
}

const BASE_URL = (WORKER_URL_ENV ?? "http://localhost:8787").replace(/\/$/, "");

export async function fetchAllPours(): Promise<PourCounts> {
  const res = await fetch(`${BASE_URL}/pours`);
  if (!res.ok) {
    throw new Error(`fetchAllPours failed: ${res.status}`);
  }
  return res.json() as Promise<PourCounts>;
}

export async function incrementPour(id: string): Promise<number> {
  const res = await fetch(`${BASE_URL}/pours/${id}`, { method: "POST" });
  if (!res.ok) {
    throw new Error(`incrementPour failed: ${res.status}`);
  }
  const data = (await res.json()) as { count: number };
  return data.count;
}
