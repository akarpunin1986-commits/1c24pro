/**
 * API request/response types matching backend Pydantic schemas.
 * @see TZ section 5.6
 */

// ═══ Auth ═══

/** Request body for POST /auth/send-code */
export interface SendCodeRequest {
  phone: string;
}

/** Response from POST /auth/send-code */
export interface SendCodeResponse {
  sent: boolean;
  is_new_user: boolean;
  ttl: number;
}

/** Request body for POST /auth/verify-code */
export interface VerifyCodeRequest {
  phone: string;
  code: string;
}

/** Response from POST /auth/verify-code */
export interface VerifyCodeResponse {
  verified: boolean;
  needs_registration: boolean;
  access_token?: string;
  refresh_token?: string;
  temp_token?: string;
  message: string;
}

/** Request body for POST /auth/complete-registration */
export interface CompleteRegistrationRequest {
  inn: string;
  referral_code?: string;
}

/** Response from POST /auth/complete-registration */
export interface CompleteRegistrationResponse {
  user_id: string;
  access_token: string;
  refresh_token: string;
  organization: {
    name_short: string;
    slug: string;
  };
}

/** Request body for POST /auth/accept-invite */
export interface AcceptInviteRequest {
  invite_id: string;
}

/** Request body for POST /auth/refresh */
export interface RefreshTokenRequest {
  refresh_token: string;
}

/** Response from POST /auth/refresh */
export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
}

// ═══ INN ═══

/** Request body for POST /inn/lookup */
export interface INNLookupRequest {
  inn: string;
}

/** Response from POST /inn/lookup (DaData data) */
export interface OrganizationResponse {
  inn: string;
  kpp?: string;
  ogrn?: string;
  name_short: string;
  name_full?: string;
  type: "LEGAL" | "INDIVIDUAL";
  director_name?: string;
  address?: string;
  okved?: string;
  okved_name?: string;
  status: string;
}

// ═══ Upload ═══

/** Request body for POST /uploads/init */
export interface UploadInitRequest {
  filename: string;
  size_bytes: number;
  config_code: string;
}

/** Response from POST /uploads/init */
export interface UploadInitResponse {
  upload_id: string;
  db_name: string;
  chunk_size: number;
  chunks_expected: number;
}

/** Response from PUT /uploads/{id}/chunk/{n} */
export interface ChunkUploadResponse {
  received: boolean;
  chunks_received: number;
}

/** Response from GET /uploads/{id}/status */
export interface UploadStatusResponse {
  upload_id: string;
  chunks_received: number;
  chunks_expected: number;
  status: UploadStatus;
}

/** Response from POST /uploads/{id}/complete */
export interface UploadCompleteResponse {
  status: string;
  db_name: string;
  message: string;
}

// ═══ Dashboard ═══

/** Response from GET /me */
export interface MeResponse {
  user: UserProfile;
  organization: OrganizationInfo;
  trial: TrialInfo;
}

/** User profile data */
export interface UserProfile {
  id: string;
  phone: string;
  email: string | null;
  email_verified: boolean;
  role: UserRole;
  referral_code: string;
  status: UserStatus;
}

/** Organization basic info */
export interface OrganizationInfo {
  id: string;
  name_short: string;
  inn: string;
  slug: string;
}

/** Trial period info */
export interface TrialInfo {
  active: boolean;
  started_at: string;
  ends_at: string;
  days_left: number;
}

/** Request body for PATCH /me */
export interface UpdateProfileRequest {
  email?: string;
  first_name?: string;
  last_name?: string;
}

/** Database record from GET /me/databases */
export interface DatabaseRecord {
  id: string;
  db_name: string;
  name: string;
  config_name: string;
  config_code: string;
  status: DatabaseStatus;
  web_url: string | null;
  rdp_url: string | null;
  size_gb: number | null;
  last_backup_at: string | null;
  created_at: string;
}

/** Upload record from GET /me/uploads */
export interface UploadRecord {
  id: string;
  filename: string;
  config_code: string;
  size_bytes: number;
  status: UploadStatus;
  chunks_received: number;
  chunks_expected: number;
  created_at: string;
  completed_at: string | null;
}

// ═══ Admin ═══

/** Admin upload view (includes org/user info) */
export interface AdminUploadRecord extends UploadRecord {
  organization: OrganizationInfo;
  user_phone: string;
  user_email: string | null;
  db_name: string;
  storage_path: string;
}

/** Request body for PATCH /admin/databases/{id} */
export interface AdminDatabaseUpdateRequest {
  status?: DatabaseStatus;
  web_url?: string;
  rdp_url?: string;
  config_name?: string;
  admin_notes?: string;
  notify?: boolean;
}

/** Admin user view */
export interface AdminUserRecord {
  id: string;
  phone: string;
  email: string | null;
  email_verified: boolean;
  role: UserRole;
  status: UserStatus;
  organization: OrganizationInfo;
  trial_ends_at: string;
  created_at: string;
  last_login_at: string | null;
}

// ═══ Organization / Members ═══

/** Request body for POST /org/invite */
export interface InviteRequest {
  phone: string;
}

/** Invite record */
export interface InviteRecord {
  id: string;
  phone: string;
  invited_by: string;
  status: InviteStatus;
  created_at: string;
  expires_at: string;
}

/** Organization member */
export interface MemberRecord {
  id: string;
  phone: string;
  email: string | null;
  role: UserRole;
  status: UserStatus;
  invited_by: string | null;
  created_at: string;
}

// ═══ Payments ═══

/** Request body for POST /payments/create */
export interface CreatePaymentRequest {
  plan: PlanId;
  period: PaymentPeriod;
  users_count: number;
}

/** Response from POST /payments/create */
export interface CreatePaymentResponse {
  payment_id: string;
  confirmation_url: string;
  amount: number;
}

/** Payment record from GET /payments/history */
export interface PaymentRecord {
  id: string;
  yookassa_id: string;
  amount: number;
  status: PaymentStatus;
  payment_method: PaymentMethod;
  plan: PlanId;
  period: PaymentPeriod;
  users_count: number;
  created_at: string;
  paid_at: string | null;
}

/** Subscription from GET /subscription */
export interface SubscriptionRecord {
  id: string;
  plan: PlanId | "trial";
  status: SubscriptionStatus;
  users_limit: number;
  current_period_start: string;
  current_period_end: string;
  auto_renew: boolean;
}

// ═══ Health ═══

/** Response from GET /health */
export interface HealthResponse {
  status: string;
  version: string;
  uptime: number;
}

// ═══ Enums as union types ═══

export type UserRole = "owner" | "admin" | "user";
export type UserStatus = "active" | "disabled";
export type DatabaseStatus = "preparing" | "active" | "readonly" | "blocked" | "deleted";
export type UploadStatus = "pending" | "uploading" | "uploaded" | "processing" | "error";
export type InviteStatus = "pending" | "accepted" | "expired" | "cancelled";
export type PlanId = "start" | "business" | "corp";
export type PaymentPeriod = "monthly" | "quarterly" | "annual";
export type PaymentStatus = "pending" | "succeeded" | "canceled" | "refunded";
export type PaymentMethod = "bank_card" | "sbp" | "invoice";
export type SubscriptionStatus = "trial" | "active" | "past_due" | "canceled";
export type OrgType = "LEGAL" | "INDIVIDUAL";
export type OrgStatus = "ACTIVE" | "LIQUIDATING" | "LIQUIDATED";
