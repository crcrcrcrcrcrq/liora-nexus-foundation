import { api, API_ROUTES } from "./api";
import type { ApiResult } from "@/types";

/**
 * Integracja z Telegramem.
 *
 * Token bota oraz identyfikator czatu przechowuje wyłącznie backend —
 * frontend zna tylko własne endpointy i nigdy nie woła api.telegram.org.
 */
export type TelegramEvent = "booking" | "contact" | "newsletter" | "test";

export interface TelegramStatus {
  connected: boolean;
  chatLabel?: string;
  lastDeliveryAt?: string;
}

export function notifyTelegram(
  event: TelegramEvent,
  payload: Record<string, unknown>,
): Promise<ApiResult<{ delivered: boolean }>> {
  return api.post<{ delivered: boolean }>(API_ROUTES.telegramNotify, { event, payload });
}

export function fetchTelegramStatus(): Promise<ApiResult<TelegramStatus>> {
  return api.get<TelegramStatus>(API_ROUTES.telegramStatus);
}

export function sendTelegramTest(): Promise<ApiResult<{ delivered: boolean }>> {
  return notifyTelegram("test", { source: "admin-panel" });
}
