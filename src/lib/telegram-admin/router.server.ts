import { telegramConfig, botLanguage } from '../telegram/config.server';

function t() {
  return (key: string) => key;
}

type TelegramMessage = {
  text?: string;
  chat: { id: number };
  from?: { id: number };
};

export async function handleAdminCommand(message: TelegramMessage) {
  const text = message.text?.trim() || '';
  const adminIdNum = Number(telegramConfig.adminId || 0);
  const fromId = message.from?.id || 0;

  if (adminIdNum && fromId != adminIdNum) {
    return { text: 'Brak dostepu' };
  }

  if (text.startsWith('/start')) {
    return { text: 'Panel admin Liora - Bot dziala! Lang: ' + botLanguage() };
  }

  if (text.startsWith('/status')) {
    return { text: 'Bot dziala Lang: ' + botLanguage() + ' Admin: ' + (adminIdNum || 'brak') };
  }

  return { text: 'Nieznana komenda: ' + text };
}

export function createAdminRouter() {
  return { handle: handleAdminCommand };
}
