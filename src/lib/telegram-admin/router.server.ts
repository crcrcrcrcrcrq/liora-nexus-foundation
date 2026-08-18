import { telegramConfig, botLanguage } from '../telegram/config.server';

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

  const lang = botLanguage();

  if (text.startsWith('/start')) {
    return { text: 'Panel admin Liora - Bot dziala! Lang: ' + lang };
  }

  if (text.startsWith('/status')) {
    return { text: 'Bot dziala Lang: ' + lang + ' Admin: ' + (adminIdNum || 'brak') };
  }

  return { text: 'Nieznana komenda: ' + text };
}

export function createAdminRouter() {
  return { handle: handleAdminCommand };
}
