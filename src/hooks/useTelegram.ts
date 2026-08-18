import { initData, useSignal } from '@tma.js/sdk-react';
export const useTelegram = () => {
  const d = useSignal(initData.state);
  return { user: d?.user, isAdmin: d?.user?.id === Number(import.meta.env.VITE_ADMIN_ID), raw: initData.raw() };
};
