import { z } from "zod";
import { translate as t } from "@/lib/i18n";

/**
 * P0.20 — schematy są FABRYKAMI, nie stałymi modułu.
 *
 * Komunikaty walidacji czytamy ze słownika dopiero w momencie budowy schematu
 * (render formularza), dzięki czemu użytkownik w EN nie zobaczy polskiego
 * błędu. Kształt danych i reguły biznesowe pozostają bez zmian.
 */

/**
 * P0.28 — krok „dane klienta”. Usługa, dzień i godzina są wybierane w krokach
 * 1–3 (i tak walidowane ponownie na serwerze), więc formularz pilnuje tylko
 * pól tekstowych. `serviceSlug`/`preferredDate` zostają jako opcjonalne, aby
 * nie zmieniać kontraktu typów formularza.
 */
export const bookingSchema = () =>
  z.object({
    name: z.string().trim().min(2, t("forms.validation.nameRequired")).max(80),
    email: z.string().trim().email(t("forms.validation.emailInvalid")).max(255),
    serviceSlug: z.string().optional(),
    preferredDate: z.string().max(40).optional(),
    message: z.string().trim().max(1200).optional(),
  });

export type BookingFormValues = z.infer<ReturnType<typeof bookingSchema>>;

export const astrologySchema = () =>
  z.object({
    birthDate: z
      .string()
      .min(1, t("forms.validation.birthDateRequired"))
      .refine(
        (value) => !Number.isNaN(new Date(value).getTime()),
        t("forms.validation.birthDateInvalid"),
      )
      .refine((value) => new Date(value) <= new Date(), t("forms.validation.birthDateFuture")),
    birthTime: z
      .string()
      .min(1, t("forms.validation.birthTimeRequired"))
      .regex(/^([01]\d|2[0-3]):[0-5]\d$/, t("forms.validation.birthTimeInvalid")),
    city: z.string().trim().min(2, t("forms.validation.cityRequired")).max(80),
  });

export type AstrologyFormValues = z.infer<ReturnType<typeof astrologySchema>>;

export const contactSchema = () =>
  z.object({
    name: z.string().trim().min(2, t("forms.validation.nameRequired")).max(80),
    email: z.string().trim().email(t("forms.validation.emailInvalid")).max(255),
    topic: z.string().trim().min(3, t("forms.validation.topicRequired")).max(120),
    message: z.string().trim().min(20, t("forms.validation.messageRequired")).max(2000),
    consent: z
      .boolean()
      .refine((value) => value, { message: t("forms.validation.consentRequired") }),
  });

export type ContactFormValues = z.infer<ReturnType<typeof contactSchema>>;

export const newsletterSchema = () =>
  z.object({
    email: z.string().trim().email(t("forms.validation.emailInvalid")).max(255),
  });

/** Powrót do Kroniki Duszy — jedno pole, jeden krok. */
export const magicLinkSchema = () =>
  z.object({
    email: z.string().trim().email(t("forms.validation.emailInvalid")).max(255),
  });

export type MagicLinkFormValues = z.infer<ReturnType<typeof magicLinkSchema>>;

export type NewsletterFormValues = z.infer<ReturnType<typeof newsletterSchema>>;
