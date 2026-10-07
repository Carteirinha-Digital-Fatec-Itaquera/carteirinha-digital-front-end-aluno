import { apiClient, buildApiError } from '../config/apiClient';
import type { ProjectCreditsResponse } from '../../domains/ProjectCredits';

const PROJECT_CREDITS_PATH = '/project-credits';

export async function getProjectCredits(signal?: AbortSignal): Promise<ProjectCreditsResponse> {
  const response = await apiClient(PROJECT_CREDITS_PATH, {
    authenticated: false,
    cache: 'no-store',
    signal,
  });

  if (!response.ok) {
    const error = await buildApiError(response, PROJECT_CREDITS_PATH);
    throw new Error(error.message);
  }

  return (await response.json()) as ProjectCreditsResponse;
}
