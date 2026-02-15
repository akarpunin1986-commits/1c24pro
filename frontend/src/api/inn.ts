/**
 * INN lookup API — fetches organization data from DaData via backend.
 * @see TZ section 2.2 — INN lookup flow
 */

import { apiClient } from "@/api/client";
import type { INNLookupRequest, OrganizationResponse } from "@/types/api";

/**
 * Look up organization by INN using DaData integration.
 * @param inn - INN string (10 digits for legal entity, 12 for individual)
 * @returns Organization data from EGRUL via DaData
 * @throws AxiosError with 404 if INN not found, 422 if invalid format
 */
export async function lookupINN(inn: string): Promise<OrganizationResponse> {
  const payload: INNLookupRequest = { inn };
  const { data } = await apiClient.post<OrganizationResponse>("/inn/lookup", payload);
  return data;
}
