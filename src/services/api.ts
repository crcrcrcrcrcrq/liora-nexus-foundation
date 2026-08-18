export const API_ROUTES = {
  contact: '/api/contact',
  astrology: '/api/astrology',
  user: '/api/user',
  admin: '/api/admin',
  auth: '/api/auth',
  telegram: '/api/telegram',
  messages: '/api/messages',
  horoscope: '/api/horoscope',
} as const;

async function safeJson(res: Response) {
  try {
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('application/json')) return await res.json();
    return await res.text();
  } catch { return null; }
}

async function request<T = any>(url: string, init: RequestInit = {}): Promise<T> {
  try {
    const res = await fetch(url, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(init.headers||{}) },
    });
    const data = await safeJson(res);
    return (data ?? {}) as T;
  } catch (e) {
    console.warn('API offline:', url, e);
    return {} as T;
  }
}

export const api = {
  get: <T=any>(url: string) => request<T>(url),
  post: <T=any>(url: string, body?: any) => request<T>(url, { method: 'POST', body: JSON.stringify(body) }),
  put: <T=any>(url: string, body?: any) => request<T>(url, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T=any>(url: string) => request<T>(url, { method: 'DELETE' }),
};

export default api;
