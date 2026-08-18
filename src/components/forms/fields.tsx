import type {
  ReactNode,
  ReactElement,
  SelectHTMLAttributes,
  InputHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { forwardRef, isValidElement, cloneElement } from "react";
import { cn } from "@/lib/utils";

/**
 * Współdzielone pola formularzy. Wszystkie formularze w projekcie
 * (rezerwacja, kontakt, newsletter, astrologia, logowanie) korzystają
 * z tych samych prymitywów — jeden wygląd, jedna obsługa błędów.
 */

export const fieldClass =
  "h-11 w-full rounded-sm border border-input bg-transparent px-4 text-sm text-foreground placeholder:text-foreground/55 transition-colors duration-300 focus:border-gold focus:outline-none aria-[invalid=true]:border-destructive/70 disabled:cursor-not-allowed disabled:opacity-50";

export const labelClass = "eyebrow block text-foreground/60";

interface FieldProps {
  id: string;
  label: string;
  error?: string | undefined;
  hint?: string | undefined;
  className?: string | undefined;
  children: ReactNode;
}

/**
 * Etykieta, podpowiedź i komunikat błędu w jednym miejscu.
 * Pole formularza zostaje automatycznie powiązane z opisem i błędem,
 * dzięki czemu czytnik ekranu zawsze odczytuje pełny kontekst.
 */
export function Field({ id, label, error, hint, className, children }: FieldProps) {
  const hintId = hint && !error ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  const control = isValidElement(children)
    ? cloneElement(children as ReactElement<Record<string, unknown>>, {
        "aria-describedby":
          [(children.props as Record<string, unknown>)["aria-describedby"], describedBy]
            .filter(Boolean)
            .join(" ") || undefined,
        "aria-invalid": error ? true : undefined,
      })
    : children;

  return (
    <div className={className}>
      <label className={labelClass} htmlFor={id}>
        {label}
      </label>
      <div className="mt-3">{control}</div>
      {hint && !error ? (
        <p id={hintId} className="mt-2 text-xs leading-relaxed text-foreground/55">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="animate-fade-in mt-2 text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export const TextInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function TextInput({ className, ...props }, ref) {
    return <input ref={ref} className={cn(fieldClass, className)} {...props} />;
  },
);

export const SelectInput = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function SelectInput({ className, ...props }, ref) {
    return <select ref={ref} className={cn(fieldClass, className)} {...props} />;
  },
);

export const TextArea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function TextArea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        "w-full rounded-sm border border-input bg-transparent p-4 text-sm leading-relaxed text-foreground placeholder:text-foreground/55 transition-colors duration-300 focus:border-gold focus:outline-none aria-[invalid=true]:border-destructive/70 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
});

/** Komunikat po wysłaniu formularza — sukces lub błąd. */
export function FormStatus({
  state,
  message,
}: {
  state: "success" | "error" | null;
  message?: string | null | undefined;
}) {
  if (!state || !message) return null;
  return (
    <p
      role="status"
      aria-live="polite"
      className={cn(
        "animate-fade-in text-sm",
        state === "success" ? "text-gold" : "text-destructive",
      )}
    >
      {message}
    </p>
  );
}
