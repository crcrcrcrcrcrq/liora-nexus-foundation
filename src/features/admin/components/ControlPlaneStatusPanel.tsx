import { useQuery } from "@tanstack/react-query";
import { AdminCard } from "@/features/admin/components/AdminShell";
import { fetchControlPlaneStatus } from "@/lib/control.functions";
import type { ControlModuleStatus, ControlState } from "@/lib/control/model";
import { useLanguage } from "@/hooks/useLanguage";

/**
 * LIORA P0.38 — tablica stanu Control Plane (Storage / Backup / Release /
 * Deployment / Checkpoints).
 *
 * Panel jest WYŁĄCZNIE statusem — nie ma tu GUI deploymentu. Stany pochodzą z
 * serwera; „zweryfikowane” pojawia się tylko po realnej operacji.
 */
const SYMBOL: Record<ControlState, string> = {
  ready: "●",
  configured: "◐",
  not_configured: "○",
  unavailable: "○",
  error: "△",
};

const TONE: Record<ControlState, string> = {
  ready: "text-gold",
  configured: "text-foreground/75",
  not_configured: "text-foreground/45",
  unavailable: "text-foreground/45",
  error: "text-destructive",
};

function ModuleRow({ status }: { status: ControlModuleStatus }) {
  const { t } = useLanguage();
  return (
    <div className="grid gap-1 border-b border-border py-3 last:border-0">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <dt className="text-xs uppercase tracking-[var(--tracking-luxe)] text-foreground/45">
          {t(`admin.integrations.control.modules.${status.module}`)}
        </dt>
        <dd className={`flex min-w-0 items-baseline gap-2 text-sm ${TONE[status.state]}`}>
          <span aria-hidden>{SYMBOL[status.state]}</span>
          <span className="break-words">
            {t(`admin.integrations.control.states.${status.state}`)}
            {typeof status.count === "number" ? ` · ${status.count}` : ""}
          </span>
        </dd>
      </div>
      <p className="text-xs text-foreground/40">
        {status.verified
          ? t("admin.integrations.control.verified")
          : t("admin.integrations.control.notVerified")}
      </p>
    </div>
  );
}

export function ControlPlaneStatusPanel() {
  const { t } = useLanguage();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "control", "status"],
    queryFn: () => fetchControlPlaneStatus(),
    staleTime: 30_000,
  });

  if (isLoading) {
    return (
      <AdminCard title={t("admin.integrations.control.title")}>
        <p className="text-sm text-foreground/55">{t("admin.integrations.control.loading")}</p>
      </AdminCard>
    );
  }

  if (isError || !data) {
    return (
      <AdminCard title={t("admin.integrations.control.title")}>
        <p className="text-sm text-foreground/55">{t("admin.integrations.control.error")}</p>
      </AdminCard>
    );
  }

  return (
    <AdminCard title={t("admin.integrations.control.title")}>
      <p className="text-sm leading-relaxed text-foreground/55">
        {t("admin.integrations.control.note")}
      </p>
      <dl className="mt-6" aria-label={t("admin.integrations.control.title")}>
        {data.map((status) => (
          <ModuleRow key={status.module} status={status} />
        ))}
      </dl>
    </AdminCard>
  );
}
