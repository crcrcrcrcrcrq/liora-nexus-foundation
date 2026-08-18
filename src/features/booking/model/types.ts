export interface ServiceOffer {
  slug: string;
  title: string;
  price: number | null;
  currency: string;
  duration: string;
  summary: string;
  includes: string[];
  featured?: boolean;
}

export interface BookingRequest {
  name: string;
  email: string;
  serviceSlug: string;
  preferredDate?: string;
  /** HH:MM — godzina wybrana z grafiku (opcjonalna, capacity dnia = 1). */
  preferredTime?: string;
  message?: string;
  /** Język, w jakim klient widział ofertę (URL). Weryfikowany serwerowo. */
  language?: string;
}

export type BookingStatus = "new" | "confirmed" | "done" | "cancelled";

export interface BookingRecord extends BookingRequest {
  id: string;
  status: BookingStatus;
  createdAt: string;
}
