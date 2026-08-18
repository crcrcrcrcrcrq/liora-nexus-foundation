/** Sekcje Kroniki Duszy — jedno źródło prawdy dla nawigacji i widoków. */
export interface ChronicleSection {
  to:
    | "/kronika"
    | "/kronika/rytualy"
    | "/kronika/konsultacje"
    | "/kronika/refleksje"
    | "/kronika/notatki"
    | "/kronika/profil";
  labelKey: string;
  descriptionKey: string;
}

export const CHRONICLE_SECTIONS: ChronicleSection[] = [
  {
    to: "/kronika",
    labelKey: "chronicle.sections.home.label",
    descriptionKey: "chronicle.sections.home.description",
  },
  {
    to: "/kronika/rytualy",
    labelKey: "chronicle.sections.rituals.label",
    descriptionKey: "chronicle.sections.rituals.description",
  },
  {
    to: "/kronika/konsultacje",
    labelKey: "chronicle.sections.consultations.label",
    descriptionKey: "chronicle.sections.consultations.description",
  },
  {
    to: "/kronika/refleksje",
    labelKey: "chronicle.sections.reflections.label",
    descriptionKey: "chronicle.sections.reflections.description",
  },
  {
    to: "/kronika/notatki",
    labelKey: "chronicle.sections.notes.label",
    descriptionKey: "chronicle.sections.notes.description",
  },
  {
    to: "/kronika/profil",
    labelKey: "chronicle.sections.profile.label",
    descriptionKey: "chronicle.sections.profile.description",
  },
];
