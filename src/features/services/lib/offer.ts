/**
 * LIORA P0.27 — projekcja rekordu usługi na istniejący model oferty.
 *
 * Publiczne widoki i formularz rezerwacji nadal mówią językiem `ServiceOffer`
 * (P0.4). Tu tłumaczymy dane administracyjne na ten kształt, bez fallbacku
 * językowego: usługa bez tytułu w danym języku po prostu nie istnieje w nim.
 */
import type { Language } from "@/config/i18n";
import type { ServiceOffer } from "@/features/booking/model/types";
import { isPublishableIn, type ServiceRecord } from "../model/types";

export function toOffer(service: ServiceRecord, language: Language): ServiceOffer | null {
  if (!isPublishableIn(service, language)) return null;
  const content = service.content[language];
  return {
    slug: service.slug,
    title: content.title,
    price: service.price,
    currency: service.currency,
    duration: content.duration,
    summary: content.summary,
    includes: content.includes,
    ...(service.featured ? { featured: true } : {}),
  };
}

export interface PublicOffer {
  offer: ServiceOffer;
  ctaPath: string;
  ctaLabel: string;
  isBookable: boolean;
}

/** Oferta publiczna: posortowana, wyłącznie aktywna i dostępna w tym języku. */
export function toPublicOffers(
  services: readonly ServiceRecord[],
  language: Language,
): PublicOffer[] {
  return services
    .filter((service) => service.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.slug.localeCompare(b.slug))
    .flatMap((service) => {
      const offer = toOffer(service, language);
      if (!offer) return [];
      return [
        {
          offer,
          ctaPath: service.ctaPath,
          ctaLabel: service.content[language].cta,
          isBookable: service.isBookable,
        },
      ];
    });
}
