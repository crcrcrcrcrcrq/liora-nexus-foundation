import { useState } from "react";
import { definePage } from "@/lib/locale-route";
import {
  ChronicleCard,
  ChronicleHeader,
  ChroniclePlaceholder,
} from "@/features/kronika/components/ChronicleShell";
import { NoteForm } from "@/features/kronika/components/NoteForm";
import { chronicleHead } from "@/features/kronika/lib/head";
import { useChronicle } from "@/features/kronika/hooks/useChronicle";
import { useChronicleNotes } from "@/features/kronika/hooks/useChronicleNotes";
import { useIdentity } from "@/features/identity/context/identity-context";
import { formatChronicleDate } from "@/features/kronika/lib/format";
import { useLanguage } from "@/hooks/useLanguage";

import type { ChronicleNote } from "@/features/kronika/model/types";

export const page = definePage({
  path: "/kronika/notatki",
  head: () => ({
    ...chronicleHead("chronicle.meta.notes.title"),
  }),
  component: ChronicleNotes,
});

function ChronicleNotes() {
  const { t, language } = useLanguage();
  const { isAuthenticated } = useIdentity();
  const { chronicle } = useChronicle();
  const { notes, create, update, remove } = useChronicleNotes();
  const [editingId, setEditingId] = useState<string | null>(null);

  // Poza sesją pozostaje dotychczasowy podgląd Kroniki; zapis należy do sesji.
  const entries: readonly ChronicleNote[] = isAuthenticated ? notes : chronicle.notes;

  return (
    <div className="grid gap-10">
      <ChronicleHeader
        eyebrow={t("chronicle.notes.eyebrow")}
        title={t("chronicle.notes.title")}
        lead={t("chronicle.notes.lead")}
        description={t("chronicle.notes.description")}
      />

      {isAuthenticated ? (
        <ChronicleCard title={t("chronicle.notes.form.cardTitle")}>
          <NoteForm onSubmit={create} />
        </ChronicleCard>
      ) : null}

      <ChronicleCard title={t("chronicle.notes.cardTitle")}>
        {entries.length > 0 ? (
          <ul className="grid gap-8">
            {entries.map((note) => (
              <li key={note.id} className="border-l border-border pl-5">
                <p className="text-[0.7rem] uppercase tracking-[var(--tracking-luxe)] text-foreground/55">
                  {formatChronicleDate(note.createdAt, language)}
                </p>

                {isAuthenticated && editingId === note.id ? (
                  <div className="mt-4 max-w-2xl">
                    <NoteForm
                      initial={note.body}
                      submitLabel={t("chronicle.notes.form.update")}
                      onCancel={() => setEditingId(null)}
                      onSubmit={(body) => {
                        update(note.id, body);
                        setEditingId(null);
                      }}
                    />
                  </div>
                ) : (
                  <>
                    <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-foreground/65">
                      {note.body}
                    </p>
                    {isAuthenticated ? (
                      <div className="mt-4 flex flex-wrap items-center gap-4">
                        <button
                          type="button"
                          onClick={() => setEditingId(note.id)}
                          className="rounded-sm text-[0.7rem] uppercase tracking-[var(--tracking-luxe)] text-foreground/55 outline-none transition-colors duration-500 hover:text-gold focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
                        >
                          {t("chronicle.notes.actions.edit")}
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(note.id)}
                          className="rounded-sm text-[0.7rem] uppercase tracking-[var(--tracking-luxe)] text-foreground/45 outline-none transition-colors duration-500 hover:text-gold focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
                        >
                          {t("chronicle.notes.actions.delete")}
                        </button>
                      </div>
                    ) : null}
                  </>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <ChroniclePlaceholder note={t("chronicle.notes.empty")} />
        )}
      </ChronicleCard>
    </div>
  );
}
