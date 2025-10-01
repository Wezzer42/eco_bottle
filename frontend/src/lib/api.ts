import { auth } from "@/lib/authOptions";

// API wrapper with automatic authorization
export async function apiFetch(input: string, init?: RequestInit) {
  const session = await auth();
  const token = (session as typeof session & { apiAccessToken?: string })?.apiAccessToken;
  const headers = new Headers(init?.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  
  // Determine base URL (server-side needs absolute URL)
  const baseUrl = typeof window === 'undefined' 
    ? (process.env.NEXT_PUBLIC_API_BASE!)
    : '';
  const url = typeof window === 'undefined' 
    ? `${baseUrl}${input}`
    : `/api/backend${input}`;
    
  const res = await fetch(url, { ...init, headers, cache: "no-store" });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

// Legacy function for compatibility
export async function fetchProducts() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE!;
  const r = await fetch(`${baseUrl}/api/products`, { cache: 'no-store' });
  if (!r.ok) return [];
  return r.json();
}

