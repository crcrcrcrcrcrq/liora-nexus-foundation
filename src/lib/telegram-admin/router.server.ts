import { telegramConfig, botLanguage } from '../telegram/config.server';

export async function routeAdminCommand(update: any) {
  try {
    const text = update?.message?.text || '';
    const chatId = update?.message?.chat?.id || 0;

    // FIX: bezpieczne pobranie języka - nie wywołujemy pl()
    let lang = 'pl';
    try {
      const l = botLanguage();
      if (typeof l === 'string') lang = l;
    } catch {
      lang = 'pl';
    }

    if (text.startsWith('/start')) {
      return `🚀 Liora OS DZIALA!\nLang: ${lang}\nChat: ${chatId}`;
    }

    if (text.startsWith('/admin') || text.startsWith('/status')) {
      return `👑 Admin OK\nLang: ${lang}\nBot: ACTIVE\nID: ${chatId}`;
    }

    if (!text) return 'OK';
    
    return `Otrzymano: ${text} [${lang}]`;
  } catch (e) {
    console.error('routeAdminCommand error', e);
    return 'OK - blad obsluzony';
  }
}

export async function handleAdminUpdate(update: any) {
  return routeAdminCommand(update);
}

export function createAdminRouter() {
  return { route: routeAdminCommand };
}
