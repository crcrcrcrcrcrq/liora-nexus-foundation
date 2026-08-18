import { api, API_ROUTES, type SubmissionAck } from "./api";
import type { ApiResult, ContactRequest } from "@/types";

/** Wysyła zapytanie kontaktowe. Backend odpowiada za powiadomienie Telegram. */
export function submitContact(payload: ContactRequest): Promise<ApiResult<SubmissionAck>> {
  return api.post<SubmissionAck>(API_ROUTES.contact, payload);
}
