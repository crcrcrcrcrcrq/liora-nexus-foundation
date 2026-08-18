import { useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { TextInput, FormStatus } from "@/components/forms/fields";
import { PrivacyNote } from "@/components/forms/PrivacyNote";
import { useFormSubmit } from "@/hooks/useFormSubmit";
import { subscribeNewsletter } from "@/services/newsletter.service";
import { newsletterSchema, type NewsletterFormValues } from "@/lib/validation";
import { useLanguage } from "@/hooks/useLanguage";

export function NewsletterForm() {
  const { t, language } = useLanguage();
  // P0.20: komunikaty walidacji budowane w aktywnym jezyku.
  const schema = useMemo(() => newsletterSchema(), [language]);
  const {
    register,
    clearErrors,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NewsletterFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  // P0.20: komunikaty bledow z poprzedniego jezyka nie moga zostac na ekranie.
  useEffect(() => {
    clearErrors();
  }, [language, clearErrors]);

  const { status, isSubmitting, handle } = useFormSubmit<NewsletterFormValues>({
    submit: (values) => subscribeNewsletter(values.email),
    successMessage: t("forms.newsletter.successMessage"),
    errorMessage: t("forms.newsletter.errorMessage"),
    onSuccess: reset,
  });

  return (
    <form onSubmit={handleSubmit(handle)} className="grid gap-3" noValidate>
      <label className="sr-only" htmlFor="newsletter-email">
        {t("forms.newsletter.emailLabel")}
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <TextInput
          id="newsletter-email"
          type="email"
          autoComplete="email"
          placeholder={t("forms.newsletter.emailPlaceholder")}
          aria-invalid={Boolean(errors.email)}
          {...register("email")}
        />
        <Button type="submit" variant="gold" disabled={isSubmitting} className="sm:shrink-0">
          {isSubmitting ? t("forms.newsletter.submitPending") : t("forms.newsletter.submitIdle")}
        </Button>
      </div>
      {errors.email ? (
        <p role="alert" className="text-xs text-destructive">
          {errors.email.message}
        </p>
      ) : null}
      <FormStatus state={status?.state ?? null} message={status?.message} />
      <PrivacyNote tone="newsletter" />
    </form>
  );
}
