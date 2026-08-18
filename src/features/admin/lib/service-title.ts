import { services } from "@/features/booking/model/services";

/**
 * Nazwa usługi po slugu z rezerwacji. Gdy slug nie ma odpowiednika w ofercie,
 * pokazujemy surowy slug zamiast zmyślać etykietę.
 */
export function serviceTitle(slug: string): string {
  return services().find((service) => service.slug === slug)?.title ?? slug;
}

/**
 * P0.34 — cena usługi w formacie prezentacyjnym. Brak usługi w ofercie albo
 * brak ceny = brak wartości; nie zmyślamy kwoty.
 */
export function servicePriceLabel(slug: string): string | null {
  const offer = services().find((service) => service.slug === slug);
  if (!offer || offer.price === null) return null;
  return offer.price === 0 ? "0" : `${offer.price} ${offer.currency}`;
}
