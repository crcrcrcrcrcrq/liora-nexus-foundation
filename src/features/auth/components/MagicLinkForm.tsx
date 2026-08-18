import { useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field, TextInput } from "@/components/forms/fields";
import { PrivacyNote } from "@/components/forms/PrivacyNote";
import { Button } from "@/components/ui/button";
import { magicLinkSchema, type MagicLinkFormValues } from "@/lib/validation";
import { useLanguage } from "@/hooks/useLanguage";

/** Krok 1 — jedno pole i jedno zaproszenie. Wysyłkę realizuje backend. */
export function MagicLinkForm({
  onSubmit,
  isSending,
  error,
}: {
  onSubmit: (email: string) => Promise<void> | void;
  isSending: boolean;
  error: string | null;
}) {
  const { t, language } = useLanguage();
  // P0.20: komunikaty walidacji budowane w aktywnym jezyku.
  const schema = useMemo(() => magicLinkSchema(), [language]);
  const {
    register,
    clearErrors,
    handleSubmit,
    formState: { errors },
  } = useForm<MagicLinkFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  // P0.20: komunikaty bledow z poprzedniego jezyka nie moga zostac na ekranie.
  useEffect(() => {
    clearErrors();
  }, [language, clearErrors]);

  const fieldError = errors.email?.message;

  return (
    <form
      noValidate
      className="grid gap-8"
      onSubmit={handleSubmit((values) => onSubmit(values.email))}
    >
      <Field
        id="magic-email"
        label={t("auth.magicLink.email.label")}
        error={fieldError}
        hint={t("auth.magicLink.email.hint")}
      >
        <TextInput
          id="magic-email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder={t("auth.magicLink.email.placeholder")}
          aria-invalid={fieldError ? true : undefined}
          aria-describedby={fieldError ? "magic-email-error" : undefined}
          {...register("email")}
        />
      </Field>

      <Button
        type="submit"
        variant="gold"
        size="lg"
        className="h-auto min-h-14 whitespace-normal px-7 py-4 text-center leading-relaxed sm:px-9"
        disabled={isSending}
      >
        {isSending ? t("auth.magicLink.submit.sending") : t("auth.magicLink.submit.idle")}
      </Button>

      {error ? (
        <p role="alert" className="animate-fade-in text-xs leading-relaxed text-foreground/55">
          {error}
        </p>
      ) : null}

      <PrivacyNote tone="magicLink" />
    </form>
  );
}
