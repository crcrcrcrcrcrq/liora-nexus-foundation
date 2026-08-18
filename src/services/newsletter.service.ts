import { api, API_ROUTES, type SubmissionAck } from "./api";
import type { ApiResult } from "@/types";

export function subscribeNewsletter(email: string): Promise<ApiResult<SubmissionAck>> {
  return api.post<SubmissionAck>(API_ROUTES.newsletter, { email });
}

export function unsubscribeNewsletter(token: string): Promise<ApiResult<SubmissionAck>> {
  return api.post<SubmissionAck>(API_ROUTES.newsletterUnsubscribe, { token });
}
