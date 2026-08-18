import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/hooks/useLanguage";
import { NOTE_MAX_LENGTH } from "../hooks/useChronicleNotes";

/**
 * Najprostszy możliwy zapis notatki — jeden obszar tekstu i jeden przycisk.
 * Wzorzec formularza zgodny z ReflectionForm.
 */
export function NoteForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial?: string;
  submitLabel?: string;
  onSubmit: (body: string) => void;
  onCancel?: () => void;
}) {
  const { t } = useLanguage();
  const fieldId = useId();
  const [body, setBody] = useState(initial ?? "");

  const value = body.trim();
  const canSubmit = value.length > 0 && value.length <= NOTE_MAX_LENGTH;

  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (!canSubmit) return;
        onSubmit(value);
        if (!initial) setBody("");
      }}
    >
      <label
        htmlFor={fieldId}
        className="text-[0.7rem] uppercase tracking-[var(--tracking-luxe)] text-foreground/55"
      >
        {t("chronicle.notes.form.label")}
      </label>
      <Textarea
        id={fieldId}
        value={body}
        rows={4}
        maxLength={NOTE_MAX_LENGTH}
        onChange={(event) => setBody(event.target.value)}
        placeholder={t("chronicle.notes.form.placeholder")}
        className="min-h-28 resize-none rounded-sm border-border bg-transparent text-[0.95rem] leading-[1.9] text-foreground/80 transition-colors duration-500 placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
      />
      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" variant="gold" disabled={!canSubmit}>
          {submitLabel ?? t("chronicle.notes.form.save")}
        </Button>
        {onCancel ? (
          <Button type="button" variant="ghost" onClick={onCancel}>
            {t("chronicle.notes.form.cancel")}
          </Button>
        ) : null}
      </div>
    </form>
  );
}
