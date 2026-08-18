import { initData } from '@tma.js/sdk-react';
export const telegramControl = {
  action: async (name: string, data?: any) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/control`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: name, payload: data, initData: initData.raw() })
    });
    return res.json();
  }
};
