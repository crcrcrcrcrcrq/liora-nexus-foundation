import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { ADMIN_NAV } from "@/constants/navigation";
import { useIdentity } from "@/features/identity/context/identity-context";
import { useLanguage } from "@/hooks/useLanguage";

/**
 * Szkielet panelu administratora. Warstwa wyłącznie prezentacyjna —
 * dane pochodzą z `src/services/*`, gdy backend zostanie podłączony.
 */
export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { can } = useIdentity();
  const { t } = useLanguage();
  const items = ADMIN_NAV.filter((item) => can(item.permission));

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1400px] gap-10 px-6 py-12 lg:px-10">
      <aside className="hidden w-56 shrink-0 lg:block">
        <p className="eyebrow text-foreground/55">{t("admin.sidebar.panel")}</p>
        <nav className="mt-8 grid gap-1">
          {items.map((item) => {
            const active =
              item.to === "/admin" ? pathname === "/admin" : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "rounded-sm px-3 py-2 text-sm transition-colors duration-300",
                  active
                    ? "bg-surface-raised text-gold"
                    : "text-foreground/50 hover:text-foreground",
                )}
              >
                {t(item.labelKey)}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="min-w-0 flex-1">
        <nav className="mb-8 flex gap-2 overflow-x-auto lg:hidden">
          {items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="whitespace-nowrap rounded-sm border border-border px-3 py-2 text-xs text-foreground/60"
            >
              {t(item.labelKey)}
            </Link>
          ))}
        </nav>
        {children}
      </div>
    </div>
  );
}

export function AdminHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-6 border-b border-border pb-8">
      <div>
        <h1 className="font-display text-3xl text-foreground">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-foreground/50">{description}</p>
      </div>
      {action}
    </header>
  );
}

export function AdminCard({
  title,
  children,
  className,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("glass rounded-sm p-8", className)}>
      {title ? <p className="eyebrow text-foreground/55">{title}</p> : null}
      <div className={title ? "mt-6" : undefined}>{children}</div>
    </section>
  );
}
