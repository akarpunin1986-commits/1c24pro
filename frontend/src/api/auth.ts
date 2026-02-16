/**
 * Auth API functions — passwordless flow via phone + SMS code.
 * @see TZ section 2.2 — API Flow
 */

import { apiClient } from "@/api/client";
import type {
  SendCodeRequest,
  SendCodeResponse,
  VerifyCodeRequest,
  VerifyCodeResponse,
  CompleteRegistrationRequest,
  CompleteRegistrationResponse,
  AcceptInviteRequest,
  RefreshTokenRequest,
  RefreshTokenResponse,
} from "@/types/api";

/**
 * Send OTP code to the given phone number.
 * @param phone - Phone number in format +7XXXXXXXXXX
 * @returns Whether the code was sent and if user is new
 */
export async function sendCode(phone: string): Promise<SendCodeResponse> {
  const payload: SendCodeRequest = { phone };
  const { data } = await apiClient.post<SendCodeResponse>("/auth/send-code", payload);
  return data;
}

/**
 * Verify the OTP code entered by user.
 * @param phone - Phone number used for sending code
 * @param code - 6-digit OTP code
 * @returns Verification result with tokens or temp_token
 */
export async function verifyCode(phone: string, code: string): Promise<VerifyCodeResponse> {
  const payload: VerifyCodeRequest = { phone, code };
  const { data } = await apiClient.post<VerifyCodeResponse>("/auth/verify-code", payload);
  return data;
}

/**
 * Complete registration for a new user (after phone verification).
 * @param inn - Organization INN (10 or 12 digits)
 * @param tempToken - Temporary token from verify-code step
 * @param referralCode - Optional referral code
 * @returns User ID and JWT tokens
 */
export async function completeRegistration(
  inn: string,
  tempToken: string,
  referralCode?: string,
  orgData?: Record<string, string | null | undefined>,
): Promise<CompleteRegistrationResponse> {
  const payload: CompleteRegistrationRequest = { inn, referral_code: referralCode, org_data: orgData };
  const { data } = await apiClient.post<CompleteRegistrationResponse>(
    "/auth/complete-registration",
    payload,
    { headers: { Authorization: `Bearer ${tempToken}` } },
  );
  return data;
}

/**
 * Accept an organization invite (for invited employees).
 * @param inviteId - The invite UUID to accept
 */
export async function acceptInvite(inviteId: string): Promise<CompleteRegistrationResponse> {
  const payload: AcceptInviteRequest = { invite_id: inviteId };
  const { data } = await apiClient.post<CompleteRegistrationResponse>(
    "/auth/accept-invite",
    payload,
  );
  return data;
}

/**
 * Refresh JWT tokens using a refresh token.
 * @param refreshToken - Current refresh token
 * @returns New access and refresh tokens
 */
export async function refreshTokens(refreshToken: string): Promise<RefreshTokenResponse> {
  const payload: RefreshTokenRequest = { refresh_token: refreshToken };
  const { data } = await apiClient.post<RefreshTokenResponse>("/auth/refresh", payload);
  return data;
}

/**
 * Logout — invalidate the current refresh token.
 */
export async function logout(): Promise<void> {
  await apiClient.post("/auth/logout");
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}
