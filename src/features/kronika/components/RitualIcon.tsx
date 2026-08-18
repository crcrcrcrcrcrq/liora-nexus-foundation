import { Compass, Moon, PenLine } from "lucide-react";
import type { ChronicleRitual } from "../model/types";

/** Delikatny znak rodzaju rytuału — bez koloru, bez błysku. */
export function RitualIcon({
  kind,
  className,
}: {
  kind: ChronicleRitual["kind"];
  className?: string;
}) {
  const Icon = kind === "astrology" ? Compass : kind === "note" ? PenLine : Moon;
  return <Icon aria-hidden className={className ?? "h-4 w-4"} strokeWidth={1.25} />;
}
