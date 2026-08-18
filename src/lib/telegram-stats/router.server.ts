/**
 * LIORA P0.30 — dyspozytor poleceń bota statystyk (server-only, READ-ONLY).
 *
 * Kanał jest CAŁKOWICIE oddzielony od bota administracyjnego: inny token, inny
 * sekret webhooka, inna allowlista i inne źródło danych (`analytics_events`).
 * Nie ma tu dostępu do rezerwacji, klientów, CMS-u ani zmiany czegokolwiek —
 * moduł nie importuje żadnej funkcji mutującej.
 *
 * Prywatność: odpowiedzi zawierają wyłącznie liczby i udziały procentowe.
 * Nigdy: adresu IP, pseudonimu sesji, e-maila, nazwiska ani pojedynczej wizyty.
 */
import { translator } from "@/lib/i18n";
import { botLanguage, statsAllowlist } from "@/lib/telegram/config.server";
import type { TelegramCommand } from "@/lib/telegram/update.server";
import type { StatsPeriod } from "@/lib/analytics/aggregate.server";
import type { StatsShare } from "@/lib/analytics/model/events";

function t() {
  return translator(botLanguage());
}

function shareLines(items: StatsShare[]): string[] {
  const translate = t();
  return items.map((item) =>
    translate("telegram.stats.shareLine", {
      label: item.label,
      count: item.count,
      share: item.share,
    }),
  );
}

function section(title: string, lines: string[]): string {
  const translate = t();
  return lines.length > 0
    ? [title, "", ...lines].join("\n")
    : `${title}\n\n${translate("telegram.common.empty")}`;
}

async function summary(period: StatsPeriod, titleKey: string): Promise<string> {
  const translate = t();
  const { statisticsReader, readPeriodStats } = await import("@/lib/analytics/stats.server");
  const stats = await readPeriodStats(await statisticsReader(), period);
  return [
    translate(titleKey),
    "",
    translate("telegram.stats.visits", { count: stats.visits }),
    translate("telegram.stats.visitors", { count: stats.visitors }),
    translate("telegram.stats.returning", {
      fresh: stats.newVisitors,
      returning: stats.returningVisitors,
    }),
    "",
    ...shareLines(stats.topPages),
    "",
    translate("telegram.stats.privacyNote"),
  ].join("\n");
}

async function breakdown(
  pick: (period: StatsPeriod) => Promise<StatsShare[]>,
  titleKey: string,
): Promise<string> {
  return section(t()(titleKey), shareLines(await pick("week")));
}

async function handleAuthorized(input: TelegramCommand): Promise<string> {
  const translate = t();
  const { statisticsReader, readPeriodStats, readBookingFunnel } =
    await import("@/lib/analytics/stats.server");

  switch (input.command) {
    case "/start":
      return translate("telegram.stats.welcome");
    case "/help":
      return translate("telegram.stats.help");
    case "/stats":
      return summary("today", "telegram.stats.titleToday");
    case "/week":
      return summary("week", "telegram.stats.titleWeek");
    case "/month":
      return summary("month", "telegram.stats.titleMonth");

    case "/pages":
      return breakdown(
        async (period) => (await readPeriodStats(await statisticsReader(), period)).topPages,
        "telegram.stats.pagesTitle",
      );
    case "/countries":
      return breakdown(
        async (period) => (await readPeriodStats(await statisticsReader(), period)).countries,
        "telegram.stats.countriesTitle",
      );
    case "/languages":
      return breakdown(
        async (period) => (await readPeriodStats(await statisticsReader(), period)).languages,
        "telegram.stats.languagesTitle",
      );
    case "/devices":
      return breakdown(
        async (period) => (await readPeriodStats(await statisticsReader(), period)).devices,
        "telegram.stats.devicesTitle",
      );

    case "/funnel": {
      const funnel = await readBookingFunnel(await statisticsReader(), "week");
      return [
        translate("telegram.stats.funnelTitle"),
        "",
        translate("telegram.stats.funnelLine", {
          started: funnel.started,
          completed: funnel.completed,
          rate: funnel.conversion,
        }),
      ].join("\n");
    }

    default:
      return translate("telegram.common.unknownCommand");
  }
}

/** Zwraca gotową treść odpowiedzi. NIGDY nie rzuca. */
export async function routeStatsCommand(input: TelegramCommand): Promise<string> {
  const translate = t();
  if (!statsAllowlist().has(input.fromId)) return translate("telegram.common.notAuthorized");
  try {
    return await handleAuthorized(input);
  } catch {
    return translate("telegram.common.error");
  }
}
