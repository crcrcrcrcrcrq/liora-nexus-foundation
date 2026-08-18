import { useCallback, useState } from "react";
import type { ApiResult } from "@/types";

export type SubmitState = "idle" | "submitting" | "success" | "error";

export interface FormStatusMessage {
  state: "success" | "error";
  message: string;
}

interface Options<TValues, TData> {
  /** Wywołanie warstwy services zwracające ujednolicony `ApiResult`. */
  submit: (values: TValues) => Promise<ApiResult<TData>>;
  successMessage: string;
  errorMessage: string;
  onSuccess?: () => void;
}

interface FormSubmitState<TValues> {
  state: SubmitState;
  status: FormStatusMessage | null;
  isSubmitting: boolean;
  handle: (values: TValues) => Promise<void>;
  reset: () => void;
}

/**
 * Wspólna obsługa cyklu wysyłki formularza (loading / success / error).
 * Eliminuje powielony `useState` w każdym formularzu.
 */
export function useFormSubmit<TValues, TData = unknown>({
  submit,
  successMessage,
  errorMessage,
  onSuccess,
}: Options<TValues, TData>): FormSubmitState<TValues> {
  const [state, setState] = useState<SubmitState>("idle");
  const [status, setStatus] = useState<FormStatusMessage | null>(null);

  const handle = useCallback(
    async (values: TValues) => {
      setState("submitting");
      setStatus(null);
      const result = await submit(values);
      if (result.ok) {
        setState("success");
        setStatus({ state: "success", message: successMessage });
        onSuccess?.();
      } else {
        setState("error");
        setStatus({ state: "error", message: result.error ?? errorMessage });
      }
    },
    [submit, successMessage, errorMessage, onSuccess],
  );

  const reset = useCallback(() => {
    setState("idle");
    setStatus(null);
  }, []);

  return { state, status, isSubmitting: state === "submitting", handle, reset };
}
