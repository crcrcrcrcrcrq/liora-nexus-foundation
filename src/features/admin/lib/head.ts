import { translate as t } from "@/lib/i18n";

/** Wspólne meta dla widoków panelu — panel nigdy nie trafia do indeksu. */
export function adminHead(title: string) {
  return {
    meta: [
      { title: `${title} — Panel | Liora Ylva` },
      { name: "description", content: t("admin.meta.dashboard.description") },
      { name: "robots", content: "noindex, nofollow" },
    ],
  };
}
