/**
 * LIORA P0.34 — status operacyjny modułów Admina liczony WYŁĄCZNIE serwerowo.
 *
 * Nie tworzymy nowego systemu: status powstaje z tych samych tabel i tej samej
 * konfiguracji, których używają istniejące moduły. Odczyt idzie klientem
 * sesyjnym personelu, więc obowiązuje RLS — brak uprawnień daje `unavailable`,
 * nie zmyśloną gotowość.
 *
 * Zasada uczciwości: transport (e-mail, Telegram) NIGDY nie jest raportowany
 * jako zweryfikowany bez realnego ruchu. Konfiguracja ≠ dostarczenie.
 */
import type { LioraServerClient } from "@/integrations/supabase/session.server";
import type { OperationsModuleKey, OperationsModuleStatus } from "./model/status";

type Table = "bookings" | "services" | "booking_schedule" | "blog_posts" | "site_content";

async function tableStatus(
  supabase: LioraServerClient,
  key: OperationsModuleKey,
  table: Table,
): Promise<OperationsModuleStatus> {
  try {
    const { count, error } = await supabase.from(table).select("*", { count: "exact", head: true });
    if (error) {
      const denied = /permission|policy|rls/i.test(error.message ?? "");
      return { key, state: denied ? "unavailable" : "error", transportVerified: false };
    }
    const total = count ?? 0;
    return {
      key,
      state: total > 0 ? "ready" : "configured",
      count: total,
      transportVerified: false,
    };
  } catch {
    return { key, state: "error", transportVerified: false };
  }
}

/** Theme/Template — konfiguracja wyglądu żyje w `site_settings.default`. */
async function themeStatus(supabase: LioraServerClient): Promise<OperationsModuleStatus> {
  try {
    const { data, error } = await supabase
      .from("site_settings")
      .select("theme_id, template_id")
      .eq("id", "default")
      .maybeSingle();
    if (error) {
      const denied = /permission|policy|rls/i.test(error.message ?? "");
      return { key: "theme", state: denied ? "unavailable" : "error", transportVerified: false };
    }
    return {
      key: "theme",
      state: data ? "ready" : "configured",
      flags: {
        themeSelected: Boolean(data?.theme_id),
        templateSelected: Boolean(data?.template_id),
      },
      transportVerified: false,
    };
  } catch {
    return { key: "theme", state: "error", transportVerified: false };
  }
}

/**
 * E-mail: adapter jest skonfigurowany albo nie. Dostarczalność pozostaje
 * NIEZWERYFIKOWANA — nie wykonujemy sztucznej wysyłki, żeby „zazielenić” UI.
 */
async function emailStatus(): Promise<OperationsModuleStatus> {
  const { isEmailTransportConfigured, staffRecipient } =
    await import("@/lib/notifications/email.server");
  const transportConfigured = isEmailTransportConfigured();
  const senderConfigured = Boolean(staffRecipient());
  return {
    key: "email",
    state: transportConfigured ? "configured" : "not_configured",
    flags: { transportConfigured, senderConfigured },
    transportVerified: false,
  };
}

export async function readOperationsStatus(
  supabase: LioraServerClient,
): Promise<OperationsModuleStatus[]> {
  const { readTelegramIntegrationStatus } = await import("@/lib/telegram/status.server");
  const telegram = readTelegramIntegrationStatus();

  const telegramModule = (bot: "admin" | "stats"): OperationsModuleStatus => {
    const status = telegram.find((entry) => entry.bot === bot);
    const key: OperationsModuleKey = bot === "admin" ? "telegramAdmin" : "telegramStats";
    if (!status) return { key, state: "not_configured", transportVerified: false };
    return {
      key,
      state: status.configured && status.authorizationConfigured ? "configured" : "not_configured",
      count: status.allowlistSize,
      flags: {
        tokenConfigured: status.tokenConfigured,
        webhookSecretConfigured: status.webhookSecretConfigured,
        allowlistConfigured: status.authorizationConfigured,
        readOnly: status.mode === "read_only",
      },
      transportVerified: status.transport === "configured",
    };
  };

  const [bookings, services, schedule, blog, content, theme, email] = await Promise.all([
    tableStatus(supabase, "bookings", "bookings"),
    tableStatus(supabase, "services", "services"),
    tableStatus(supabase, "schedule", "booking_schedule"),
    tableStatus(supabase, "blog", "blog_posts"),
    tableStatus(supabase, "content", "site_content"),
    themeStatus(supabase),
    emailStatus(),
  ]);

  return [
    bookings,
    services,
    schedule,
    blog,
    content,
    theme,
    email,
    telegramModule("admin"),
    telegramModule("stats"),
  ];
}
