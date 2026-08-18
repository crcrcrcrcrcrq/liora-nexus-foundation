import { api } from "@/services/api";
import type { ApiResult } from "@/types";
import type { ChronicleOverview } from "../model/types";

/**
 * Warstwa dostępu do Kroniki. Frontend niczego nie wylicza ani nie przechowuje —
 * całość zapisu należy do backendu, który autoryzuje każde żądanie tokenem sesji.
 */
export const CHRONICLE_ROUTES = {
  overview: "/chronicle/overview",
  rituals: "/chronicle/rituals",
  consultations: "/chronicle/consultations",
  reflection: "/chronicle/reflection",
  reports: "/chronicle/reports",
} as const;

export function fetchChronicleOverview(): Promise<ApiResult<ChronicleOverview>> {
  return api.get<ChronicleOverview>(CHRONICLE_ROUTES.overview);
}
