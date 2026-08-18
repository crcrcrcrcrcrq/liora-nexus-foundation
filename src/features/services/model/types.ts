/**
 * LIORA P0.27 — kontrakt danych usług.
 *
 * Usługi są DANYMI STRUKTURALNYMI (jak bookings i blog_posts), nie treścią CMS.
 * Jeden rekord = jedna usługa. Pola wspólne (slug, cena, waluta, kolejność,
 * flagi) trzymane są raz; treść PL i EN jest rozdzielona i NIE ma fallbacku
 * między językami — brak tytułu w danym języku oznacza brak usługi w tym
 * języku, nigdy podmiany na drugi język.
 *
 * Moduł jest bezpieczny dla klienta: wyłącznie typy i czyste helpery.
 */
import type { Language } from "@/config/i18n";

export interface ServiceLocaleContent {
  title: string;
  duration: string;
  summary: string;
  cta: string;
  includes: string[];
}

export interface ServiceRecord {
  id: string;
  slug: string;
  /** `null` = cena nieokreślona, `0` = usługa bezpłatna. */
  price: number | null;
  currency: string;
  sortOrder: number;
  isActive: boolean;
  /** Czy usługa pojawia się w formularzu rezerwacji. */
  isBookable: boolean;
  featured: boolean;
  /** Ścieżka CTA w kanonicznym (PL) zapisie — routing lokalizuje ją sam. */
  ctaPath: string;
  content: Record<Language, ServiceLocaleContent>;
}

export function emptyLocaleContent(): ServiceLocaleContent {
  return { title: "", duration: "", summary: "", cta: "", includes: [] };
}

/** Czy usługa ma komplet treści wymagany do publikacji w danym języku. */
export function isPublishableIn(service: ServiceRecord, language: Language): boolean {
  return service.content[language].title.trim().length > 0;
}
