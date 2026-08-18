import { useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Field, TextInput } from "@/components/forms/fields";
import { PrivacyNote } from "@/components/forms/PrivacyNote";
import { astrologySchema, type AstrologyFormValues } from "@/lib/validation";
import { useLanguage } from "@/hooks/useLanguage";

/** Etap 2 — dane urodzeniowe. Każde pole wyjaśnia, po co jest potrzebne. */
export function BirthDataForm({ onSubmit }: { onSubmit: (values: AstrologyFormValues) => void }) {
  const { t, language } = useLanguage();
  // P0.20: komunikaty walidacji budowane w aktywnym jezyku.
  const schema = useMemo(() => astrologySchema(), [language]);
  const {
    register,
    clearErrors,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AstrologyFormValues>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: { birthDate: "", birthTime: "", city: "" },
  });

  // P0.20: komunikaty bledow z poprzedniego jezyka nie moga zostac na ekranie.
  useEffect(() => {
    clearErrors();
  }, [language, clearErrors]);

  return (
    <div className="mx-auto max-w-xl">
      <p className="eyebrow">{t("astrology.ritual.form.eyebrow")}</p>
      <h2 className="mt-6 font-display text-[1.75rem] leading-[1.2] text-foreground sm:text-[2.25rem]">
        {t("astrology.ritual.form.title")}
      </h2>
      <p className="mt-5 text-[0.9375rem] leading-[1.8] text-foreground/60">
        {t("astrology.ritual.form.description")}
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-12 grid gap-8" noValidate>
        <Field
          id="astro-date"
          label={t("astrology.ritual.form.dateLabel")}
          error={errors.birthDate?.message}
          hint={t("astrology.ritual.form.dateHint")}
        >
          <TextInput
            id="astro-date"
            type="date"
            autoComplete="bday"
            aria-invalid={Boolean(errors.birthDate)}
            aria-describedby={errors.birthDate ? "astro-date-error" : undefined}
            {...register("birthDate")}
          />
        </Field>

        <Field
          id="astro-time"
          label={t("astrology.ritual.form.timeLabel")}
          error={errors.birthTime?.message}
          hint={t("astrology.ritual.form.timeHint")}
        >
          <TextInput
            id="astro-time"
            type="time"
            aria-invalid={Boolean(errors.birthTime)}
            aria-describedby={errors.birthTime ? "astro-time-error" : undefined}
            {...register("birthTime")}
          />
        </Field>

        <Field
          id="astro-city"
          label={t("astrology.ritual.form.cityLabel")}
          error={errors.city?.message}
          hint={t("astrology.ritual.form.cityHint")}
        >
          <TextInput
            id="astro-city"
            autoComplete="address-level2"
            placeholder={t("astrology.ritual.form.cityPlaceholder")}
            aria-invalid={Boolean(errors.city)}
            aria-describedby={errors.city ? "astro-city-error" : undefined}
            {...register("city")}
          />
        </Field>

        <Button
          type="submit"
          variant="gold"
          size="lg"
          className="mt-2 justify-self-start"
          disabled={isSubmitting}
        >
          {t("astrology.ritual.form.submit")}
        </Button>

        <PrivacyNote tone="astrology" />
      </form>
    </div>
  );
}
