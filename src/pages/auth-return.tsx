import { useSearch } from "@tanstack/react-router";
import { definePage } from "@/lib/locale-route";
import { Section } from "@/components/layout/Section";
import { ReturnPanel } from "@/features/auth/components/ReturnPanel";
import { translate as t } from "@/lib/i18n";

export const page = definePage({
  path: "/powrot",
  // Supabase może wrócić z kluczem (`token_hash`) albo z informacją o błędzie.
  validateSearch: (search: Record<string, unknown>): { token?: string; authError?: boolean } => {
    const raw = search["token_hash"] ?? search["token"];
    const token = typeof raw === "string" && raw.length > 0 ? raw : undefined;
    const authError = typeof search["error"] === "string" && search["error"].length > 0;
    return { ...(token ? { token } : {}), ...(authError ? { authError: true } : {}) };
  },
  head: () => {
    const title = t("auth.meta.title");
    const description = t("auth.meta.description");
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { name: "robots", content: "noindex, nofollow" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: ReturnPage,
});

function ReturnPage() {
  const { token, authError } = useSearch({ strict: false }) as unknown as {
    token?: string;
    authError?: boolean;
  };
  return (
    <Section className="pt-28">
      <ReturnPanel token={token} authError={authError ?? false} />
    </Section>
  );
}
