"""Pydantic v2 schemas for API request / response validation."""

import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


# ── Auth ──────────────────────────────────────────────────────────────────────


class PhoneRequest(BaseModel):
    """Request to send an OTP code to a phone number."""

    phone: str = Field(..., pattern=r"^\+7\d{10}$", examples=["+79991234567"])


class SendCodeResponse(BaseModel):
    """Response after sending an OTP code."""

    sent: bool
    is_new_user: bool
    ttl: int = 300


class OTPVerifyRequest(BaseModel):
    """Request to verify an OTP code."""

    phone: str = Field(..., pattern=r"^\+7\d{10}$", examples=["+79991234567"])
    code: str = Field(..., min_length=6, max_length=6, examples=["123456"])


class OTPVerifyResponse(BaseModel):
    """Response after verifying an OTP code."""

    verified: bool
    needs_registration: bool = False
    access_token: str | None = None
    refresh_token: str | None = None
    temp_token: str | None = None


class CompleteRegistrationRequest(BaseModel):
    """Request to complete registration for a new user."""

    inn: str = Field(..., min_length=10, max_length=12, examples=["7707083893"])
    referral_code: str | None = None


class CompleteRegistrationResponse(BaseModel):
    """Response after completing registration."""

    user_id: uuid.UUID
    access_token: str
    refresh_token: str


class RefreshTokenRequest(BaseModel):
    """Request to refresh JWT tokens."""

    refresh_token: str


class TokenResponse(BaseModel):
    """JWT token pair response."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class AcceptInviteRequest(BaseModel):
    """Request to accept an organization invite."""

    invite_id: uuid.UUID


# ── INN ───────────────────────────────────────────────────────────────────────


class INNLookupRequest(BaseModel):
    """Request to look up an organization by INN via DaData."""

    inn: str = Field(..., min_length=10, max_length=12, examples=["7707083893"])


class OrganizationResponse(BaseModel):
    """Organization data returned from DaData or the database."""

    model_config = ConfigDict(from_attributes=True)

    inn: str
    kpp: str | None = None
    ogrn: str | None = None
    name_short: str
    name_full: str | None = None
    type: str
    director_name: str | None = None
    address: str | None = None
    okved: str | None = None
    status: str


# ── Upload ────────────────────────────────────────────────────────────────────


class UploadInitRequest(BaseModel):
    """Request to initialize a chunked upload session."""

    filename: str = Field(..., max_length=500, examples=["buh_2024.bak"])
    size_bytes: int = Field(..., gt=0, examples=[2500000000])
    config_code: str = Field(..., max_length=20, examples=["bp30"])


class UploadInitResponse(BaseModel):
    """Response after initializing an upload session."""

    upload_id: uuid.UUID
    chunk_size: int = 5242880
    chunks_expected: int
    db_name: str


class UploadStatusResponse(BaseModel):
    """Current status of a chunked upload."""

    model_config = ConfigDict(from_attributes=True)

    upload_id: uuid.UUID
    filename: str
    config_code: str
    status: str
    chunks_expected: int
    chunks_received: int
    size_bytes: int
    db_name: str | None = None
    created_at: datetime
    completed_at: datetime | None = None


# ── Dashboard ─────────────────────────────────────────────────────────────────


class UserProfileResponse(BaseModel):
    """Current user profile information."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    phone: str
    email: str | None = None
    first_name: str | None = None
    last_name: str | None = None
    patronymic: str | None = None
    display_name: str
    role: str
    status: str
    referral_code: str
    organization: OrganizationResponse
    trial_ends_at: datetime
    created_at: datetime


class UpdateProfileRequest(BaseModel):
    """Request to update user profile."""

    email: str | None = None
    first_name: str | None = None
    last_name: str | None = None
    patronymic: str | None = None


class DatabaseResponse(BaseModel):
    """Database instance information for dashboard."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    db_name: str
    config_code: str
    config_name: str
    status: str
    web_url: str | None = None
    rdp_url: str | None = None
    size_gb: Decimal | None = None
    last_backup_at: datetime | None = None
    created_at: datetime


# ── Organization / Members ────────────────────────────────────────────────────


class InviteRequest(BaseModel):
    """Request to invite a user to the organization."""

    phone: str = Field(..., pattern=r"^\+7\d{10}$", examples=["+79991234567"])
    first_name: str = Field(..., min_length=1, max_length=100, examples=["Мария"])
    last_name: str | None = Field(None, max_length=100, examples=["Иванова"])
    patronymic: str | None = Field(None, max_length=100, examples=["Сергеевна"])


class InviteResponse(BaseModel):
    """Invite record information."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    phone: str
    status: str
    created_at: datetime
    expires_at: datetime


class MemberResponse(BaseModel):
    """Organization member information."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    phone: str
    email: str | None = None
    first_name: str | None = None
    last_name: str | None = None
    patronymic: str | None = None
    display_name: str
    role: str
    status: str
    created_at: datetime
    last_login_at: datetime | None = None


class TransferOwnershipRequest(BaseModel):
    """Request to transfer organization ownership."""

    target_user_id: uuid.UUID


# ── Payments ──────────────────────────────────────────────────────────────────


class CreatePaymentRequest(BaseModel):
    """Request to create a payment via YooKassa."""

    plan: str = Field(..., examples=["start"])
    period: str = Field(..., examples=["monthly"])
    users_count: int = Field(..., gt=0, examples=[3])


class CreatePaymentResponse(BaseModel):
    """Response with YooKassa redirect URL."""

    payment_id: uuid.UUID
    redirect_url: str


class PaymentHistoryItem(BaseModel):
    """Single payment in history."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    amount: Decimal
    currency: str
    status: str
    payment_method: str
    plan: str
    period: str
    users_count: int
    created_at: datetime
    paid_at: datetime | None = None


class InvoiceRequest(BaseModel):
    """Request to generate an invoice for a legal entity."""

    plan: str = Field(..., examples=["start"])
    period: str = Field(..., examples=["quarterly"])
    users_count: int = Field(..., gt=0, examples=[5])


class InvoiceResponse(BaseModel):
    """Response with invoice download URL."""

    invoice_id: uuid.UUID
    download_url: str


# ── Subscription ──────────────────────────────────────────────────────────────


class SubscriptionResponse(BaseModel):
    """Current subscription status."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    plan: str
    status: str
    users_limit: int
    current_period_start: datetime
    current_period_end: datetime
    auto_renew: bool


class UpdateSubscriptionRequest(BaseModel):
    """Request to update subscription settings."""

    plan: str | None = None
    auto_renew: bool | None = None


# ── Admin ─────────────────────────────────────────────────────────────────────


class AdminUploadResponse(BaseModel):
    """Upload info for admin panel."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    organization_name: str
    config_code: str
    filename: str
    size_bytes: int
    status: str
    db_name: str | None = None
    storage_path: str
    created_at: datetime
    completed_at: datetime | None = None


class AdminUpdateUploadRequest(BaseModel):
    """Admin request to update upload status."""

    status: str


class AdminUserResponse(BaseModel):
    """User info for admin panel."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    phone: str
    email: str | None = None
    role: str
    status: str
    organization_name: str
    organization_inn: str
    created_at: datetime


class AdminCreateDatabaseRequest(BaseModel):
    """Admin request to create a database record."""

    organization_id: uuid.UUID
    upload_id: uuid.UUID | None = None
    name: str
    config_code: str
    config_name: str
    web_url: str | None = None
    rdp_url: str | None = None


class AdminUpdateDatabaseRequest(BaseModel):
    """Admin request to update a database record."""

    status: str | None = None
    web_url: str | None = None
    rdp_url: str | None = None
    config_name: str | None = None
    admin_notes: str | None = None


# ── Health ────────────────────────────────────────────────────────────────────


class HealthResponse(BaseModel):
    """Health check response."""

    status: str
    version: str
    uptime: float


# ── User Status (for personalized landing) ────────────────────────────────────


class UserStatusResponse(BaseModel):
    """Lightweight user status for personalized UI on landing page."""

    user_id: str
    phone: str
    role: str
    status: str  # "trial" | "trial_ending" | "expired" | "active"
    trial_days_left: int
    trial_ends_at: str | None = None
    org_name: str
    org_inn: str
    first_name: str | None = None
    last_name: str | None = None
    patronymic: str | None = None
    display_name: str
    tariff: str | None = None
    tariff_active_until: str | None = None


# ── Generic ───────────────────────────────────────────────────────────────────


class MessageResponse(BaseModel):
    """Generic message response."""

    message: str
