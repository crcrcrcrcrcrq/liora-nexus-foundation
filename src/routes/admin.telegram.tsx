import { createFileRoute } from "@tanstack/react-router";
import { AdminCard, AdminHeader } from "@/features/admin/components/AdminShell";
import { adminHead } from "@/features/admin/lib/head";
import { ProtectedRoute } from "@/features/identity/components/ProtectedRoute";
import { previewTelegramMessages } from "@/features/telegram/lib/messages";
import { telegramAdapter } from "@/features/telegram/lib/adapter";
import { useLanguage } from "@/hooks/useLanguage";
import { translate as t } from "@/lib/i18n";

export const Route = createFileRoute("/admin/telegram")({
  head: () => adminHead(t("admin.meta.telegram.title")),
  component: GuardedTelegram,
});

function GuardedTelegram() {
  return (
    <ProtectedRoute permission="integrations:manage">
      <AdminTelegram />
    </ProtectedRoute>
  );
}

function AdminTelegram() {
  const { t } = useLanguage();
  const messages = previewTelegramMessages();

  return (
    <div className="grid gap-8">
      <AdminHeader
        title={t("experience.telegram.title")}
        description={t("experience.telegram.description")}
      />

      <AdminCard title={t("experience.telegram.adapterTitle")}>
        <dl className="grid gap-5 sm:grid-cols-3">
          <div>
            <dt className="text-xs uppercase tracking-[var(--tracking-luxe)] text-foreground/40">
              {t("experience.telegram.transportLabel")}
            </dt>
            <dd className="mt-2 text-sm text-foreground/75">{telegramAdapter.transport.name}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[var(--tracking-luxe)] text-foreground/40">
              {t("experience.telegram.stateLabel")}
            </dt>
            <dd className="mt-2 text-sm text-gold">
              {telegramAdapter.transport.ready
                ? t("experience.telegram.stateReady")
                : t("experience.telegram.statePending")}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[var(--tracking-luxe)] text-foreground/40">
              {t("experience.telegram.secretsLabel")}
            </dt>
            <dd className="mt-2 text-sm text-foreground/75">
              {t("experience.telegram.secretsValue")}
            </dd>
          </div>
        </dl>
        <p className="mt-8 text-sm leading-relaxed text-foreground/55">
          {t("experience.telegram.adapterNote")}
        </p>
      </AdminCard>

      <AdminCard title={t("experience.telegram.signalsTitle")}>
        <ul className="grid gap-5">
          {messages.map((message) => (
            <li
              key={message.signal}
              className="border-b border-border pb-5 last:border-0 last:pb-0"
            >
              <p className="text-[0.7rem] uppercase tracking-[var(--tracking-luxe)] text-gold/70">
                {t(`experience.telegram.signals.${message.signal.replace(".", "_")}`)}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-foreground/75">{message.text}</p>
            </li>
          ))}
        </ul>
      </AdminCard>

      <AdminCard title={t("experience.telegram.privacyTitle")}>
        <p className="text-sm leading-relaxed text-foreground/55">
          {t("experience.telegram.privacyNote")}
        </p>
      </AdminCard>
    </div>
  );
}
