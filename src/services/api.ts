// src/services/api.ts - fixed for Cloudflare build
export const API_ROUTES = {
  contact: '/api/contact',
  astrology: '/api/astrology',
  user: '/api/user',
  admin: '/api/admin',
  auth: '/api/auth',
  telegram: '/api/telegram',
} as const;

type ApiOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
};

async function request<T = any>(url: string, options: ApiOptions = {}): Promise<T> {
  const res = await fetch(url, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Request failed: ${res.status}`);
  }
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return (await res.json()) as T;
  return (await res.text()) as unknown as T;
}

export const api = {
  get: <T = any>(url: string, headers?: Record<string, string>) => 
    request<T>(url, { method: 'GET', headers }),
  post: <T = any>(url: string, body?: any, headers?: Record<string, string>) => 
    request<T>(url, { method: 'POST', body, headers }),
  put: <T = any>(url: string, body?: any, headers?: Record<string, string>) => 
    request<T>(url, { method: 'PUT', body, headers }),
  delete: <T = any>(url: string, headers?: Record<string, string>) => 
    request<T>(url, { method: 'DELETE', headers }),
};

export default api;
