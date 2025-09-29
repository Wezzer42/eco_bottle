import { auth } from "@/lib/authOptions";

// API wrapper с автоматической авторизацией
export async function apiFetch(input: string, init?: RequestInit) {
  const session = await auth();
  const token = (session as typeof session & { apiAccessToken?: string })?.apiAccessToken;
  const headers = new Headers(init?.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  
  // Определяем базовый URL (для серверной стороны нужен полный URL)
  const baseUrl = typeof window === 'undefined' 
    ? (process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000')
    : '';
  const url = typeof window === 'undefined' 
    ? `${baseUrl}${input}`
    : `/api/backend${input}`;
    
  const res = await fetch(url, { ...init, headers, cache: "no-store" });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

// Старая функция для совместимости
export async function fetchProducts() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';
  const r = await fetch(`${baseUrl}/api/products`, { cache: 'no-store' });
  if (!r.ok) return [];
  return r.json();
}

