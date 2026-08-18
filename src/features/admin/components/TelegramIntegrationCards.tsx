import { useQuery } from "@tanstack/react-query";
import { AdminCard } from "@/features/admin/components/AdminShell";
import { fetchTelegramIntegrations } from "@/lib/integrations.functions";
import type { TelegramIntegrationStatus } from "@/lib/telegram/model/status";
import { useLanguage } from "@/hooks/useLanguage";

/**
 * LIORA P0.31 — status botów Telegrama w panelu.
 *
 * Wszystko liczy serwer. Do przeglądarki trafiają wyłącznie flagi: żadnych
 * tokenów, sekretów ani identyfikatorów czatów. Transport bez realnej
 * weryfikacji runtime jest oznaczany jako NIEZWERYFIKOWANY — nigdy "połączony".
 *
 * Dostępność: status niesie tekst (nie tylko kolor) oraz symbol ●/○/◐,
 * układ jest jednokolumnowy na 390 px i nie wychodzi poza szerokość ekranu.
 */
function StatusRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "ok" | "off" | "pending";
}) {
  const symbol = tone === "ok" ? "●" : tone === "pending" ? "◐" : "○";
  const color =
    tone === "ok" ? "text-gold" : tone === "pending" ? "text-foreground/75" : "text-foreground/45";
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-border py-3 last:border-0">
      <dt className="text-xs uppercase tracking-[var(--tracking-luxe)] text-foreground/45">
        {label}
      </dt>
      <dd className={`flex min-w-0 items-baseline gap-2 text-sm ${color}`}>
        <span aria-hidden>{symbol}</span>
        <span className="break-words">{value}</span>
      </dd>
    </div>
  );
}

function BotCard({ status }: { status: TelegramIntegrationStatus }) {
  const { t } = useLanguage();
  const isAdminBot = status.bot === "admin";

  const transportLabel =
    status.transport === "configured"
      ? t("admin.integrations.telegram.status.configured")
      : status.transport === "not_verified"
        ? t("admin.integrations.telegram.status.notVerified")
        : t("admin.integrations.telegram.status.notConfigured");

  return (
    <AdminCard
      title={
        isAdminBot
          ? t("admin.integrations.telegram.adminName")
          : t("admin.integrations.telegram.statsName")
      }
    >
      <p className="text-sm leading-relaxed text-foreground/55">
        {isAdminBot
          ? t("admin.integrations.telegram.adminNote")
          : t("admin.integrations.telegram.statsNote")}
      </p>
      <dl className="mt-6" aria-label={t("admin.integrations.telegram.statusLabel")}>
        <StatusRow
          label={t("admin.integrations.telegram.configuration")}
          value={
            status.configured
              ? t("admin.integrations.telegram.status.configured")
              : t("admin.integrations.telegram.status.notConfigured")
          }
          tone={status.configured ? "ok" : "off"}
        />
        <StatusRow
          label={t("admin.integrations.telegram.authorization")}
          value={
            status.authorizationConfigured
              ? t("admin.integrations.telegram.status.authConfigured")
              : t("admin.integrations.telegram.status.authMissing")
          }
          tone={status.authorizationConfigured ? "ok" : "off"}
        />
        <StatusRow
          label={t("admin.integrations.telegram.transport")}
          value={transportLabel}
          tone={
            status.transport === "configured"
              ? "ok"
              : status.transport === "not_verified"
                ? "pending"
                : "off"
          }
        />
        <StatusRow
          label={t("admin.integrations.telegram.mode")}
          value={
            isAdminBot
              ? t("admin.integrations.telegram.modeOperational")
              : t("admin.integrations.telegram.modeReadOnly")
          }
          tone="pending"
        />
      </dl>
      <p className="mt-6 break-all text-xs text-foreground/40">{status.webhookPath}</p>
    </AdminCard>
  );
}

export function TelegramIntegrationCards() {
  const { t } = useLanguage();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "integrations", "telegram"],
    queryFn: () => fetchTelegramIntegrations(),
    staleTime: 30_000,
  });

  if (isLoading) {
    return (
      <AdminCard>
        <p className="text-sm text-foreground/55">{t("admin.integrations.telegram.loading")}</p>
      </AdminCard>
    );
  }

  if (isError || !data) {
    return (
      <AdminCard>
        <p className="text-sm text-foreground/55">{t("admin.integrations.telegram.error")}</p>
      </AdminCard>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {data.map((status) => (
        <BotCard key={status.bot} status={status} />
      ))}
    </div>
  );
}
