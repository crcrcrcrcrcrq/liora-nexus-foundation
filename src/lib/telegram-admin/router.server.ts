import { telegramConfig, botLanguage } from '../telegram/config.server.ts';

// BEZPIECZNY translator - nie używa i18next na serwerze!
function t() {
  const translations: Record<string, string> = {
    'admin.welcome': '👋 Panel admin Liora',
    'admin.help': 'Dostępne komendy: /start /status',
    'admin.unknown': 'Nieznana komenda',
  };
  return (key: string, params?: Record<string, any>) => {
    let text = translations[key] || key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        text = text.split(`{${k}}`).join(String(v));
      }
    }
    return text;
  };
}

type TelegramMessage = {
  text?: string;
  chat: { id: number };
  from?: { id: number };
};

export async function handleAdminCommand(message: TelegramMessage) {
  const translate = t();
  const text = message.text?.trim() || '';
  const adminId = Number(telegramConfig.adminId || 0);
  const fromId = message.from?.id || 0;

  if (adminId && fromId!== adminId) {
    return { text: '⛔ Brak dostępu' };
  }

  if (text.startsWith('/start')) {
    return { text: translate('admin.welcome') + '\n\n' + translate('admin.help') };
  }

  if (text.startsWith('/status')) {
    return { text: `✅ Bot działa\nLang: ${botLanguage()}\nAdmin: ${adminId || 'brak'}` };
  }

  return { text: translate('admin.unknown') + `: ${text}` };
}

// dla kompatybilności ze starym kodem
export function createAdminRouter() {
  return { handle: handleAdminCommand };
}
