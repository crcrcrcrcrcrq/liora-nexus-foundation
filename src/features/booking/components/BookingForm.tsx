import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Field, TextInput, TextArea, FormStatus } from "@/components/forms/fields";
import { EmptyState, ErrorState, LoadingState, Spinner } from "@/components/state/States";
import { PrivacyNote } from "@/components/forms/PrivacyNote";
import { useFormSubmit } from "@/hooks/useFormSubmit";
import { useBooking } from "@/features/booking/hooks/useBooking";
import { bookingSchema, type BookingFormValues } from "@/lib/validation";
import { formatPrice } from "@/utils/format";
import { useLanguage } from "@/hooks/useLanguage";
import { useAnalytics } from "@/hooks/useAnalytics";
import { cn } from "@/lib/utils";

type Step = 1 | 2 | 3 | 4 | 5 | 6;

const STEP_KEYS: Record<Step, string> = {
  1: "service",
  2: "date",
  3: "time",
  4: "details",
  5: "summary",
  6: "confirmation",
};

/** Kafelek wyboru — minimum 44px wysokości, jednokolumnowy na mobile. */
function ChoiceButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "min-h-11 w-full rounded-sm border px-4 py-3 text-left text-sm transition-colors duration-300",
        selected
          ? "border-gold/60 text-gold"
          : "border-border text-foreground/70 hover:border-gold/30 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

/**
 * LIORA P0.28 — rezerwacja jako uporządkowany, sześciokrokowy przepływ.
 * Usługi, dni i godziny pochodzą z bazy; serwer waliduje wszystko ponownie.
 */
export function BookingForm({ defaultService }: { defaultService?: string }) {
  const {
    bookableServices,
    isLoadingServices,
    isServicesError,
    availability,
    isLoadingAvailability,
    isAvailabilityError,
    loadAvailability,
    slotsFor,
    submit,
  } = useBooking();
  const { t, language } = useLanguage();
  const { track } = useAnalytics();
  const bookingStarted = useRef(false);

  const [step, setStep] = useState<Step>(1);
  const [serviceSlug, setServiceSlug] = useState(defaultService ?? "");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const schema = useMemo(() => bookingSchema(), [language]);
  const {
    register,
    clearErrors,
    handleSubmit,
    watch,
    trigger,
    formState: { errors },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", serviceSlug: "", preferredDate: "", message: "" },
  });

  useEffect(() => {
    clearErrors();
  }, [language, clearErrors]);

  // Krok 2 wymaga dostępności policzonej przez serwer dla wybranej usługi.
  useEffect(() => {
    if (serviceSlug) void loadAvailability(serviceSlug);
  }, [serviceSlug, loadAvailability]);

  // Początek lejka: pierwszy wybór usługi w tej sesji formularza.
  useEffect(() => {
    if (!serviceSlug || bookingStarted.current) return;
    bookingStarted.current = true;
    track("booking_started", { service: serviceSlug });
  }, [serviceSlug, track]);

  const service = bookableServices.find((item) => item.slug === serviceSlug);
  const slots = slotsFor(date);

  const { status, isSubmitting, handle } = useFormSubmit<BookingFormValues>({
    submit: (values) =>
      submit({
        name: values.name,
        email: values.email,
        serviceSlug,
        ...(date ? { preferredDate: date } : {}),
        ...(time ? { preferredTime: time } : {}),
        ...(values.message ? { message: values.message } : {}),
      }),
    successMessage: t("booking.form.successMessage"),
    errorMessage: t("booking.form.errorMessage"),
    onSuccess: () => {
      // P0.31 — analityka jest obserwatorem: nie zmienia logiki `createBooking`
      // i nie może przerwać rezerwacji (wysyłka jest fire-and-forget).
      track("booking_completed", serviceSlug ? { service: serviceSlug } : undefined);
      setStep(6);
    },
  });

  const stepper = (
    <ol className="flex flex-wrap gap-x-4 gap-y-2 text-[0.7rem] uppercase tracking-[var(--tracking-luxe)]">
      {([1, 2, 3, 4, 5, 6] as Step[]).map((value) => (
        <li
          key={value}
          aria-current={step === value ? "step" : undefined}
          className={step === value ? "text-gold" : "text-foreground/40"}
        >
          {value}. {t(`booking.steps.${STEP_KEYS[value]}`)}
        </li>
      ))}
    </ol>
  );

  const nav = (onBack: (() => void) | null, onNext: (() => void) | null, disabled = false) => (
    <div className="flex flex-wrap gap-3">
      {onBack ? (
        <Button type="button" variant="outline" size="lg" onClick={onBack}>
          {t("booking.steps.back")}
        </Button>
      ) : null}
      {onNext ? (
        <Button type="button" variant="gold" size="lg" disabled={disabled} onClick={onNext}>
          {t("booking.steps.next")}
        </Button>
      ) : null}
    </div>
  );

  if (isLoadingServices) return <LoadingState />;
  if (isServicesError) return <ErrorState />;
  if (bookableServices.length === 0) {
    return (
      <EmptyState
        title={t("booking.states.noServices.title")}
        description={t("booking.states.noServices.description")}
      />
    );
  }

  return (
    <div className="grid gap-8">
      {step < 6 ? stepper : null}

      {step === 1 ? (
        <section className="grid gap-4" aria-label={t("booking.steps.service")}>
          <p className="text-sm text-foreground/60">{t("booking.steps.serviceHint")}</p>
          <div className="grid gap-3">
            {bookableServices.map((offer) => (
              <ChoiceButton
                key={offer.slug}
                selected={serviceSlug === offer.slug}
                onClick={() => {
                  setServiceSlug(offer.slug);
                  setDate("");
                  setTime("");
                }}
              >
                <span className="block">{offer.title}</span>
                <span className="mt-1 block text-xs text-foreground/50">
                  {offer.duration} · {formatPrice(offer.price, offer.currency)}
                </span>
              </ChoiceButton>
            ))}
          </div>
          {nav(null, () => setStep(2), !serviceSlug)}
        </section>
      ) : null}

      {step === 2 ? (
        <section className="grid gap-4" aria-label={t("booking.steps.date")}>
          {isLoadingAvailability ? (
            <LoadingState />
          ) : isAvailabilityError ? (
            <ErrorState onRetry={() => void loadAvailability(serviceSlug)} />
          ) : availability.dates.length === 0 ? (
            <EmptyState
              title={t("booking.states.noDates.title")}
              description={t("booking.states.noDates.description")}
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {availability.dates.map((value) => (
                <ChoiceButton
                  key={value}
                  selected={date === value}
                  onClick={() => {
                    setDate(value);
                    setTime("");
                  }}
                >
                  {value}
                </ChoiceButton>
              ))}
            </div>
          )}
          {nav(
            () => setStep(1),
            () => setStep(slotsFor(date).length > 0 ? 3 : 4),
            !date,
          )}
        </section>
      ) : null}

      {step === 3 ? (
        <section className="grid gap-4" aria-label={t("booking.steps.time")}>
          {slots.length === 0 ? (
            <EmptyState
              title={t("booking.states.noSlots.title")}
              description={t("booking.states.noSlots.description")}
            />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {slots.map((value) => (
                <ChoiceButton key={value} selected={time === value} onClick={() => setTime(value)}>
                  {value}
                </ChoiceButton>
              ))}
            </div>
          )}
          {nav(
            () => setStep(2),
            () => setStep(4),
            slots.length > 0 && !time,
          )}
        </section>
      ) : null}

      {step === 4 ? (
        <section className="grid gap-7" aria-label={t("booking.steps.details")}>
          <Field id="booking-name" label={t("booking.form.nameLabel")} error={errors.name?.message}>
            <TextInput id="booking-name" autoComplete="name" {...register("name")} />
          </Field>
          <Field
            id="booking-email"
            label={t("booking.form.emailLabel")}
            error={errors.email?.message}
          >
            <TextInput
              id="booking-email"
              type="email"
              autoComplete="email"
              {...register("email")}
            />
          </Field>
          <Field
            id="booking-message"
            label={t("booking.form.messageLabel")}
            error={errors.message?.message}
          >
            <TextArea id="booking-message" rows={5} {...register("message")} />
          </Field>
          {nav(
            () => setStep(slots.length > 0 ? 3 : 2),
            () => {
              void trigger(["name", "email", "message"]).then((valid) => {
                if (valid) setStep(5);
              });
            },
          )}
        </section>
      ) : null}

      {step === 5 ? (
        <form onSubmit={handleSubmit(handle)} className="grid gap-7" noValidate>
          <dl className="grid gap-4 border-y border-border py-6 text-sm text-foreground/70">
            <div className="grid gap-1">
              <dt className="eyebrow text-foreground/55">{t("booking.form.serviceLabel")}</dt>
              <dd>
                {service?.title} — {formatPrice(service?.price ?? null, service?.currency)}
              </dd>
            </div>
            <div className="grid gap-1">
              <dt className="eyebrow text-foreground/55">{t("booking.form.dateLabel")}</dt>
              <dd>
                {date || t("booking.form.datePlaceholder")}
                {time ? ` · ${time}` : ""}
              </dd>
            </div>
            <div className="grid gap-1">
              <dt className="eyebrow text-foreground/55">{t("booking.form.nameLabel")}</dt>
              <dd>{watch("name")}</dd>
            </div>
            <div className="grid gap-1">
              <dt className="eyebrow text-foreground/55">{t("booking.form.emailLabel")}</dt>
              <dd className="break-all">{watch("email")}</dd>
            </div>
            {watch("message") ? (
              <div className="grid gap-1">
                <dt className="eyebrow text-foreground/55">{t("booking.form.messageLabel")}</dt>
                <dd className="leading-relaxed">{watch("message")}</dd>
              </div>
            ) : null}
          </dl>

          <div className="flex flex-wrap gap-3">
            <Button type="button" variant="outline" size="lg" onClick={() => setStep(4)}>
              {t("booking.steps.back")}
            </Button>
            <Button type="submit" variant="gold" size="lg" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner className="mr-2" />
                  {t("booking.form.submitting")}
                </>
              ) : (
                t("booking.form.submit")
              )}
            </Button>
          </div>

          <FormStatus state={status?.state ?? null} message={status?.message} />
          <PrivacyNote tone="booking" />
        </form>
      ) : null}

      {step === 6 ? (
        <section className="grid gap-4" aria-live="polite">
          <p className="font-display text-2xl text-foreground">
            {t("booking.states.confirmed.title")}
          </p>
          <p className="text-sm leading-relaxed text-foreground/60">
            {t("booking.form.successMessage")}
          </p>
          <dl className="grid gap-2 text-sm text-foreground/60">
            <div>
              {service?.title} · {date}
              {time ? ` · ${time}` : ""}
            </div>
          </dl>
        </section>
      ) : null}
    </div>
  );
}
