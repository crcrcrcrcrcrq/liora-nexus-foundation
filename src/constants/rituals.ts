import type { RitualItem } from "@/types";

export const RITUALS: RitualItem[] = [
  {
    slug: "nowiu",
    titleKey: "rituals.items.nowiu.title",
    cycleKey: "rituals.items.nowiu.cycle",
    summaryKey: "rituals.items.nowiu.summary",
    steps: [
      {
        titleKey: "rituals.items.nowiu.steps.step1.title",
        descriptionKey: "rituals.items.nowiu.steps.step1.description",
      },
      {
        titleKey: "rituals.items.nowiu.steps.step2.title",
        descriptionKey: "rituals.items.nowiu.steps.step2.description",
      },
      {
        titleKey: "rituals.items.nowiu.steps.step3.title",
        descriptionKey: "rituals.items.nowiu.steps.step3.description",
      },
      {
        titleKey: "rituals.items.nowiu.steps.step4.title",
        descriptionKey: "rituals.items.nowiu.steps.step4.description",
      },
    ],
  },
  {
    slug: "pelni",
    titleKey: "rituals.items.pelni.title",
    cycleKey: "rituals.items.pelni.cycle",
    summaryKey: "rituals.items.pelni.summary",
    steps: [
      {
        titleKey: "rituals.items.pelni.steps.step1.title",
        descriptionKey: "rituals.items.pelni.steps.step1.description",
      },
      {
        titleKey: "rituals.items.pelni.steps.step2.title",
        descriptionKey: "rituals.items.pelni.steps.step2.description",
      },
      {
        titleKey: "rituals.items.pelni.steps.step3.title",
        descriptionKey: "rituals.items.pelni.steps.step3.description",
      },
      {
        titleKey: "rituals.items.pelni.steps.step4.title",
        descriptionKey: "rituals.items.pelni.steps.step4.description",
      },
    ],
  },
  {
    slug: "granice",
    titleKey: "rituals.items.granice.title",
    cycleKey: "rituals.items.granice.cycle",
    summaryKey: "rituals.items.granice.summary",
    steps: [
      {
        titleKey: "rituals.items.granice.steps.step1.title",
        descriptionKey: "rituals.items.granice.steps.step1.description",
      },
      {
        titleKey: "rituals.items.granice.steps.step2.title",
        descriptionKey: "rituals.items.granice.steps.step2.description",
      },
      {
        titleKey: "rituals.items.granice.steps.step3.title",
        descriptionKey: "rituals.items.granice.steps.step3.description",
      },
      {
        titleKey: "rituals.items.granice.steps.step4.title",
        descriptionKey: "rituals.items.granice.steps.step4.description",
      },
    ],
  },
];

export const RITUAL_BY_SLUG = (slug: string) => RITUALS.find((r) => r.slug === slug);
