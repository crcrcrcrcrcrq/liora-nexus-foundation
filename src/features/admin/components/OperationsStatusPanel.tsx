import { useQuery } from "@tanstack/react-query";
import { AdminCard } from "@/features/admin/components/AdminShell";
import { fetchOperationsStatus } from "@/lib/integrations.functions";
import type { OperationsModuleStatus, OperationsState } from "@/lib/ops/model/status";
import { useLanguage } from "@/hooks/useLanguage";

/**
 * LIORA P0.34 — tablica stanu operacyjnego modułów Admina.
 *
 * Każdy stan pochodzi z serwera (RLS + konfiguracja środowiska). UI nie liczy
 * niczego samodzielnie i nie pokazuje „Connected”, dopóki transport nie został
 * realnie potwierdzony ruchem produkcyjnym.
 *
 * Dostępność: stan niesie tekst, nie tylko kolor; symbol ●/◐/○ jest dekoracją.
 */
const SYMBOL: Record<OperationsState, string> = {
  ready: "●",
  configured: "◐",
  not_configured: "○",
  unavailable: "○",
  error: "△",
};

const TONE: Record<OperationsState, string> = {
  ready: "text-gold",
  configured: "text-foreground/75",
  not_configured: "text-foreground/45",
  unavailable: "text-foreground/45",
  error: "text-destructive",
};

function ModuleRow({ status }: { status: OperationsModuleStatus }) {
  const { t } = useLanguage();
  const transport =
    status.key === "email" || status.key === "telegramAdmin" || status.key === "telegramStats"
      ? status.transportVerified
        ? t("admin.integrations.operations.transportVerified")
        : t("admin.integrations.operations.transportNotVerified")
      : null;

  return (
    <div className="grid gap-1 border-b border-border py-3 last:border-0">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <dt className="text-xs uppercase tracking-[var(--tracking-luxe)] text-foreground/45">
          {t(`admin.integrations.operations.modules.${status.key}`)}
        </dt>
        <dd className={`flex min-w-0 items-baseline gap-2 text-sm ${TONE[status.state]}`}>
          <span aria-hidden>{SYMBOL[status.state]}</span>
          <span className="break-words">
            {t(`admin.integrations.operations.states.${status.state}`)}
            {typeof status.count === "number" ? ` · ${status.count}` : ""}
          </span>
        </dd>
      </div>
      {transport ? <p className="text-xs text-foreground/40">{transport}</p> : null}
    </div>
  );
}

export function OperationsStatusPanel() {
  const { t } = useLanguage();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "operations", "status"],
    queryFn: () => fetchOperationsStatus(),
    staleTime: 30_000,
  });

  if (isLoading) {
    return (
      <AdminCard title={t("admin.integrations.operations.title")}>
        <p className="text-sm text-foreground/55">{t("admin.integrations.operations.loading")}</p>
      </AdminCard>
    );
  }

  if (isError || !data) {
    return (
      <AdminCard title={t("admin.integrations.operations.title")}>
        <p className="text-sm text-foreground/55">{t("admin.integrations.operations.error")}</p>
      </AdminCard>
    );
  }

  return (
    <AdminCard title={t("admin.integrations.operations.title")}>
      <p className="text-sm leading-relaxed text-foreground/55">
        {t("admin.integrations.operations.note")}
      </p>
      <dl className="mt-6" aria-label={t("admin.integrations.operations.title")}>
        {data.map((status) => (
          <ModuleRow key={status.key} status={status} />
        ))}
      </dl>
    </AdminCard>
  );
}
