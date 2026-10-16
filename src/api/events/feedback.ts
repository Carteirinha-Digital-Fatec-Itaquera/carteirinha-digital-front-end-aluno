import { apiClient, buildApiError } from '../config/apiClient';

export interface SubmitFeedbackPayload {
  rating: number; // 1 a 5
  comments?: string;
  suggestions?: string;
}

export interface SubmitFeedbackResponse {
  success: boolean;
  id?: string;
  message: string;
}

export async function submitEventFeedback(
  eventId: string,
  payload: SubmitFeedbackPayload,
  signal?: AbortSignal,
): Promise<SubmitFeedbackResponse> {
  const res = await apiClient(`/public/events/${encodeURIComponent(eventId)}/feedback`, {
    method: 'POST',
    body: payload,
    signal,
  });

  if (!res.ok) {
    throw await buildApiError(res, `/public/events/${eventId}/feedback`);
  }

  return res.json();
}
