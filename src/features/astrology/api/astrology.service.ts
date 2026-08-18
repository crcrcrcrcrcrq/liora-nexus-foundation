import { api, API_ROUTES } from "@/services/api";
import type { ApiResult } from "@/types";
import type { AstrologyRequest, EphemerisProvider, NatalChartResponse } from "../model/types";
import { translate as t } from "@/lib/i18n";

/**
 * Warstwa komunikacji modułu Astrologia.
 *
 * Moduł nie liczy niczego lokalnie. Kosmogram i interpretację dostarcza
 * backend, który proxy'uje profesjonalny silnik efemeryd (np. Swiss Ephemeris).
 * Klucze API pozostają wyłącznie po stronie serwera — frontend nie zawiera
 * żadnych sekretów.
 */
const backendProvider: EphemerisProvider = {
  id: "backend",
  get label() {
    return t("astrology.service.label");
  },
  async fetchChart(input) {
    const result = await api.post<NatalChartResponse>(API_ROUTES.astrologyChart, input);
    return result.ok && result.data ? result.data : null;
  },
};

let provider: EphemerisProvider = backendProvider;

/** Podmiana dostawcy efemeryd na inne źródło obliczeń. */
export function registerEphemerisProvider(next: EphemerisProvider): void {
  provider = next;
}

export function activeProvider(): EphemerisProvider {
  return provider;
}

/** Komunikat pokazywany, dopóki silnik obliczeniowy nie jest podłączony. */
export function engineNotConnectedMessage(): string {
  return t("astrology.service.engineNotConnected");
}

export async function fetchNatalChart(
  input: AstrologyRequest,
): Promise<ApiResult<NatalChartResponse>> {
  try {
    const response = await provider.fetchChart(input);
    if (!response) {
      return { ok: false, error: engineNotConnectedMessage() };
    }
    return { ok: true, data: response };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : t("astrology.service.fetchError"),
    };
  }
}
