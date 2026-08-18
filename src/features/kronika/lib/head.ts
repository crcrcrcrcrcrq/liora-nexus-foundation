import { translate as t } from "@/lib/i18n";

/** Kronika Duszy to przestrzeń prywatna — nigdy nie trafia do indeksu wyszukiwarek. */
export function chronicleHead(
  titleKey: string,
  description: string = t("chronicle.meta.layout.description"),
) {
  return {
    meta: [
      { title: `${t(titleKey)} — ${t("chronicle.meta.layout.title")} | Liora Ylva` },
      { name: "description", content: description },
      { name: "robots", content: "noindex, nofollow" },
    ],
  };
}
