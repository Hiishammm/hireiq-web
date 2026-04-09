import { supabase } from './supabase';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';

async function authHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) return {};
  return { Authorization: `Bearer ${session.access_token}` };
}

async function post(endpoint: string, body: object) {
  const headers = await authHeaders();
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    throw Object.assign(new Error(data?.message || data?.error || `Error ${res.status}`), { code: data?.error, status: res.status });
  }
  return data;
}

export async function extractText(file: File): Promise<string> {
  const headers = await authHeaders();
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${BASE_URL}/extract-text`, { method: 'POST', headers, body: form });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Failed to read file');
  return data.text;
}

export async function roastCV(cvText: string) {
  return post('/roast', { cvText });
}

export async function fixCV(cvText: string) {
  return post('/fix-cv', { cvText });
}

export async function tailorCV(cvText: string, jobDescription: string) {
  return post('/tailor-cv', { cvText, jobDescription });
}

export async function createCheckout(productId: string): Promise<string> {
  const data = await post('/checkout', { productId });
  return data.url;
}
