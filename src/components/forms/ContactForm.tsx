import { useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Field, TextInput, TextArea, FormStatus, labelClass } from "@/components/forms/fields";
import { Spinner } from "@/components/state/States";
import { PrivacyNote } from "@/components/forms/PrivacyNote";
import { useFormSubmit } from "@/hooks/useFormSubmit";
import { submitContact } from "@/services/contact.service";
import { contactSchema, type ContactFormValues } from "@/lib/validation";
import { useLanguage } from "@/hooks/useLanguage";

export function ContactForm() {
  const { t, language } = useLanguage();
  // P0.20: komunikaty walidacji budowane w aktywnym jezyku.
  const schema = useMemo(() => contactSchema(), [language]);
  const {
    register,
    clearErrors,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", topic: "", message: "", consent: false },
  });

  // P0.20: komunikaty bledow z poprzedniego jezyka nie moga zostac na ekranie.
  useEffect(() => {
    clearErrors();
  }, [language, clearErrors]);

  const { status, isSubmitting, handle } = useFormSubmit<ContactFormValues>({
    submit: submitContact,
    successMessage: t("forms.contact.successMessage"),
    errorMessage: t("forms.contact.errorMessage"),
    onSuccess: reset,
  });

  return (
    <form onSubmit={handleSubmit(handle)} className="grid gap-7" noValidate>
      <div className="grid gap-7 sm:grid-cols-2">
        <Field id="contact-name" label={t("forms.contact.nameLabel")} error={errors.name?.message}>
          <TextInput id="contact-name" autoComplete="name" {...register("name")} />
        </Field>
        <Field
          id="contact-email"
          label={t("forms.contact.emailLabel")}
          error={errors.email?.message}
        >
          <TextInput id="contact-email" type="email" autoComplete="email" {...register("email")} />
        </Field>
      </div>

      <Field id="contact-topic" label={t("forms.contact.topicLabel")} error={errors.topic?.message}>
        <TextInput id="contact-topic" {...register("topic")} />
      </Field>

      <Field
        id="contact-message"
        label={t("forms.contact.messageLabel")}
        error={errors.message?.message}
      >
        <TextArea id="contact-message" rows={6} {...register("message")} />
      </Field>

      <div>
        <label className="flex items-start gap-3 text-sm leading-relaxed text-foreground/55">
          <input
            type="checkbox"
            className="mt-1 size-4 rounded-sm border border-input bg-transparent accent-[var(--gold)]"
            {...register("consent")}
          />
          <span>{t("forms.contact.consentLabel")}</span>
        </label>
        {errors.consent ? (
          <p role="alert" className="mt-2 text-xs text-destructive">
            {errors.consent.message}
          </p>
        ) : null}
      </div>

      <span className={`${labelClass} sr-only`}>{t("forms.contact.formAriaLabel")}</span>

      <Button
        type="submit"
        variant="gold"
        size="lg"
        className="justify-self-start"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Spinner className="mr-2" />
            {t("forms.contact.submitPending")}
          </>
        ) : (
          t("forms.contact.submitIdle")
        )}
      </Button>

      <FormStatus state={status?.state ?? null} message={status?.message} />

      <PrivacyNote tone="contact" />
    </form>
  );
}
