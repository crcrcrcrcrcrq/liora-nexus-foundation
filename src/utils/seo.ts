import { SITE } from "@/config/site";
import { translate, localizePath } from "@/lib/i18n";

/**
 * Adres kanoniczny strony publicznej.
 *
 * P0.22: przyjmuje ścieżkę kanoniczną (PL, np. `/uslugi`) i zwraca adres
 * z prefiksem aktywnego języka (`/pl/uslugi`, `/en/services`).
 * `baseUrl` pozostaje pusty dopóki środowisko nie poda `VITE_SITE_URL`.
 */
export function canonical(path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${SITE.baseUrl}${localizePath(clean)}`;
}

interface MetaInput {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article" | "profile";
  publishedTime?: string;
  section?: string;
}

/** Buduje spójny zestaw tagów meta (OpenGraph + Twitter) dla trasy. */
export function buildMeta({
  title,
  description,
  path,
  type = "website",
  publishedTime,
  section,
}: MetaInput) {
  const url = canonical(path);
  const meta: Record<string, string>[] = [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: type },
    { property: "og:url", content: url },
    { property: "og:site_name", content: SITE.name },
    { property: "og:locale", content: SITE.locale },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
  ];
  if (publishedTime) meta.push({ property: "article:published_time", content: publishedTime });
  if (section) meta.push({ property: "article:section", content: section });
  return meta;
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: canonical(item.path),
    })),
  };
}

export function serviceSchema(input: {
  name: string;
  description: string;
  price: number | null;
  currency: string;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: input.name,
    description: input.description,
    serviceType: translate("seo.serviceType"),
    provider: { "@type": "Person", name: SITE.name },
    url: canonical(input.path),
    ...(input.price !== null
      ? {
          offers: {
            "@type": "Offer",
            price: input.price,
            priceCurrency: input.currency,
            availability: "https://schema.org/InStock",
          },
        }
      : {}),
  };
}

export function articleSchema(input: {
  title: string;
  description: string;
  date: string;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    description: input.description,
    datePublished: input.date,
    dateModified: input.date,
    author: { "@type": "Person", name: SITE.name },
    publisher: { "@type": "Organization", name: SITE.legalName },
    mainEntityOfPage: canonical(input.path),
  };
}

export function faqSchema(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export function personSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: SITE.name,
    jobTitle: translate("seo.jobTitle"),
    email: `mailto:${SITE.email}`,
    url: canonical("/"),
    knowsLanguage: ["pl", "en"],
    description: translate("seo.defaultDescription"),
  };
}

/** Dane wydawcy — używane w JSON-LD strony głównej. */
export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.legalName,
    url: canonical("/"),
    email: `mailto:${SITE.email}`,
    foundingDate: String(SITE.founded),
    description: translate("seo.defaultDescription"),
  };
}

/** Profil usługowy widoczny w wynikach lokalnych. */
export function localBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${canonical("/")}#business`,
    name: SITE.legalName,
    url: canonical("/"),
    email: `mailto:${SITE.email}`,
    description: translate("seo.defaultDescription"),
    priceRange: "$$",
    availableLanguage: ["pl", "en"],
    areaServed: "PL",
  };
}
