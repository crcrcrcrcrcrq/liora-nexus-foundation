import { translate as t } from "@/lib/i18n";
import type { ChronicleRitual } from "../model/types";

/** Nazwy rodzajów rytuałów używane na osi czasu i w kartach. */
export function ritualKindLabel(kind: ChronicleRitual["kind"]): string {
  return t(`chronicle.ritualKind.${kind}`);
}
