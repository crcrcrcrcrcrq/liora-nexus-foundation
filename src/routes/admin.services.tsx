import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AdminCard, AdminHeader } from "@/features/admin/components/AdminShell";
import { adminHead } from "@/features/admin/lib/head";
import { ErrorState, LoadingState } from "@/components/state/States";
import { Button } from "@/components/ui/button";
import { TextInput, TextArea } from "@/components/forms/fields";
import { useAdminServices, useServiceMutations } from "@/features/services/hooks/useServices";
import {
  emptyLocaleContent,
  type ServiceLocaleContent,
  type ServiceRecord,
} from "@/features/services/model/types";
import { SUPPORTED_LANGUAGES, type Language } from "@/config/i18n";
import { useLanguage } from "@/hooks/useLanguage";
import { translate as t } from "@/lib/i18n";

export const Route = createFileRoute("/admin/services")({
  head: () => adminHead(t("admin.services.title")),
  component: AdminServices,
});

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

interface Draft {
  id?: string;
  slug: string;
  price: string;
  currency: string;
  sortOrder: string;
  isActive: boolean;
  isBookable: boolean;
  featured: boolean;
  ctaPath: string;
  content: Record<Language, ServiceLocaleContent>;
}

function emptyDraft(): Draft {
  return {
    slug: "",
    price: "",
    currency: "PLN",
    sortOrder: "0",
    isActive: true,
    isBookable: true,
    featured: false,
    ctaPath: "/rezerwacja",
    content: SUPPORTED_LANGUAGES.reduce(
      (acc, language) => {
        acc[language] = emptyLocaleContent();
        return acc;
      },
      {} as Record<Language, ServiceLocaleContent>,
    ),
  };
}

function toDraft(service: ServiceRecord): Draft {
  return {
    id: service.id,
    slug: service.slug,
    price: service.price === null ? "" : String(service.price),
    currency: service.currency,
    sortOrder: String(service.sortOrder),
    isActive: service.isActive,
    isBookable: service.isBookable,
    featured: service.featured,
    ctaPath: service.ctaPath,
    content: SUPPORTED_LANGUAGES.reduce(
      (acc, language) => {
        acc[language] = {
          ...service.content[language],
          includes: [...service.content[language].includes],
        };
        return acc;
      },
      {} as Record<Language, ServiceLocaleContent>,
    ),
  };
}

/**
 * LIORA P0.27 — panel Usług. Lista i edytor korzystają wyłącznie z funkcji
 * serwerowych; rolę personelu i walidację rozstrzyga serwer. Treść PL i EN jest
 * niezależna: brak tytułu w danym języku ukrywa usługę w tym języku.
 */
function AdminServices() {
  const { t } = useLanguage();
  const services = useAdminServices();
  const { save, toggle } = useServiceMutations();
  const [editing, setEditing] = useState<Draft | null>(null);
  const [error, setError] = useState<string | null>(null);

  const rows = useMemo(
    () =>
      [...(services.data ?? [])].sort(
        (a, b) => a.sortOrder - b.sortOrder || a.slug.localeCompare(b.slug),
      ),
    [services.data],
  );

  const patch = (language: Language, field: keyof ServiceLocaleContent, value: string) => {
    if (!editing) return;
    const next =
      field === "includes"
        ? value
            .split("\n")
            .map((line) => line.trim())
            .filter((line) => line.length > 0)
        : value;
    setEditing({
      ...editing,
      content: {
        ...editing.content,
        [language]: { ...editing.content[language], [field]: next },
      },
    });
  };

  const commit = () => {
    if (!editing) return;
    const slug = editing.slug.trim();
    if (!SLUG.test(slug)) {
      setError(t("admin.services.errors.slugRequired"));
      return;
    }
    const hasTitle = SUPPORTED_LANGUAGES.some(
      (language) => editing.content[language].title.trim().length > 0,
    );
    if (!hasTitle) {
      setError(t("admin.services.errors.titleRequired"));
      return;
    }
    setError(null);
    const price = editing.price.trim();
    save.mutate(
      {
        ...(editing.id ? { id: editing.id } : {}),
        slug,
        price: price.length === 0 ? null : Number(price),
        currency: editing.currency.trim() || "PLN",
        sortOrder: Number(editing.sortOrder) || 0,
        isActive: editing.isActive,
        isBookable: editing.isBookable,
        featured: editing.featured,
        ctaPath: editing.ctaPath.trim() || "/rezerwacja",
        content: editing.content,
      },
      {
        onSuccess: () => setEditing(null),
        onError: (mutationError) =>
          setError(
            (mutationError as Error).message.includes("SERVICE_SLUG_TAKEN")
              ? t("admin.services.errors.slugTaken")
              : t("admin.services.errors.saveFailed"),
          ),
      },
    );
  };

  return (
    <div className="grid min-w-0 gap-8">
      <AdminHeader
        title={t("admin.services.title")}
        description={t("admin.services.description")}
        action={
          <Button
            variant="outline"
            onClick={() => {
              setError(null);
              setEditing(emptyDraft());
            }}
          >
            {t("admin.services.newService")}
          </Button>
        }
      />

      {editing ? (
        <AdminCard>
          <div className="grid min-w-0 gap-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <Label text={t("admin.services.fields.slug")}>
                <TextInput
                  value={editing.slug}
                  onChange={(event) => setEditing({ ...editing, slug: event.target.value })}
                />
              </Label>
              <Label text={t("admin.services.fields.price")} hint={t("admin.services.priceHint")}>
                <TextInput
                  inputMode="numeric"
                  value={editing.price}
                  onChange={(event) => setEditing({ ...editing, price: event.target.value })}
                />
              </Label>
              <Label text={t("admin.services.fields.currency")}>
                <TextInput
                  value={editing.currency}
                  onChange={(event) => setEditing({ ...editing, currency: event.target.value })}
                />
              </Label>
              <Label text={t("admin.services.fields.sortOrder")}>
                <TextInput
                  inputMode="numeric"
                  value={editing.sortOrder}
                  onChange={(event) => setEditing({ ...editing, sortOrder: event.target.value })}
                />
              </Label>
              <Label text={t("admin.services.fields.ctaPath")}>
                <TextInput
                  value={editing.ctaPath}
                  onChange={(event) => setEditing({ ...editing, ctaPath: event.target.value })}
                />
              </Label>
              <div className="grid content-center gap-2 text-sm text-foreground/70">
                <Check
                  label={t("admin.services.fields.active")}
                  checked={editing.isActive}
                  onChange={(isActive) => setEditing({ ...editing, isActive })}
                />
                <Check
                  label={t("admin.services.fields.bookable")}
                  checked={editing.isBookable}
                  onChange={(isBookable) => setEditing({ ...editing, isBookable })}
                />
                <Check
                  label={t("admin.services.fields.featured")}
                  checked={editing.featured}
                  onChange={(featured) => setEditing({ ...editing, featured })}
                />
              </div>
            </div>

            <p className="text-xs text-foreground/50">{t("admin.services.languageHint")}</p>

            <div className="grid gap-6 lg:grid-cols-2">
              {SUPPORTED_LANGUAGES.map((language) => (
                <div key={language} className="grid gap-4 rounded-sm border border-border/60 p-5">
                  <p className="eyebrow text-foreground/55">{language.toUpperCase()}</p>
                  <Label text={t("admin.services.fields.title")}>
                    <TextInput
                      value={editing.content[language].title}
                      onChange={(event) => patch(language, "title", event.target.value)}
                    />
                  </Label>
                  <Label text={t("admin.services.fields.duration")}>
                    <TextInput
                      value={editing.content[language].duration}
                      onChange={(event) => patch(language, "duration", event.target.value)}
                    />
                  </Label>
                  <Label text={t("admin.services.fields.cta")}>
                    <TextInput
                      value={editing.content[language].cta}
                      onChange={(event) => patch(language, "cta", event.target.value)}
                    />
                  </Label>
                  <Label text={t("admin.services.fields.summary")}>
                    <TextArea
                      rows={4}
                      value={editing.content[language].summary}
                      onChange={(event) => patch(language, "summary", event.target.value)}
                    />
                  </Label>
                  <Label text={t("admin.services.fields.includes")}>
                    <TextArea
                      rows={4}
                      value={editing.content[language].includes.join("\n")}
                      onChange={(event) => patch(language, "includes", event.target.value)}
                    />
                  </Label>
                </div>
              ))}
            </div>

            {error ? (
              <p role="alert" className="text-xs text-destructive">
                {error}
              </p>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <Button disabled={save.isPending} onClick={commit}>
                {t("admin.services.actions.save")}
              </Button>
              <Button variant="ghost" onClick={() => setEditing(null)}>
                {t("admin.services.actions.cancel")}
              </Button>
            </div>
          </div>
        </AdminCard>
      ) : null}

      {services.isPending ? <LoadingState label={t("admin.services.loading")} /> : null}
      {services.isError ? <ErrorState title={t("admin.services.unavailable")} /> : null}

      {!services.isPending && !services.isError ? (
        <AdminCard>
          {rows.length === 0 ? (
            <p className="text-sm text-foreground/55">{t("admin.services.empty")}</p>
          ) : (
            <ul className="grid gap-3">
              {rows.map((service) => (
                <li
                  key={service.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-sm border border-border/60 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm text-foreground">
                      {service.content.pl.title || service.content.en.title || service.slug}
                    </p>
                    <p className="mt-1 text-xs text-foreground/50">
                      {service.slug} · {service.price === null ? "—" : service.price}{" "}
                      {service.currency} · #{service.sortOrder} ·{" "}
                      {service.isActive
                        ? t("admin.services.status.active")
                        : t("admin.services.status.inactive")}
                      {service.isBookable ? ` · ${t("admin.services.flags.bookable")}` : ""}
                      {service.featured ? ` · ${t("admin.services.flags.featured")}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setError(null);
                        setEditing(toDraft(service));
                      }}
                    >
                      {t("admin.services.actions.edit")}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={toggle.isPending}
                      onClick={() => toggle.mutate({ id: service.id, isActive: !service.isActive })}
                    >
                      {service.isActive
                        ? t("admin.services.actions.deactivate")
                        : t("admin.services.actions.activate")}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </AdminCard>
      ) : null}
    </div>
  );
}

function Label({
  text,
  hint,
  children,
}: {
  text: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2 text-xs uppercase tracking-[var(--tracking-luxe)] text-foreground/55">
      {text}
      {children}
      {hint ? <span className="text-[0.65rem] normal-case text-foreground/40">{hint}</span> : null}
    </label>
  );
}

function Check({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-foreground/70">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="size-4 accent-[var(--color-gold,currentColor)]"
      />
      {label}
    </label>
  );
}
