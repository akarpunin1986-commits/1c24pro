"""Authentication routes: passwordless phone + OTP flow."""

import logging
import re
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, Header
from jose import JWTError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import (
    create_access_token,
    create_refresh_token,
    create_temp_token,
    decode_token,
)
from app.dependencies import get_db
from app.exceptions import (
    ConflictError,
    NotFoundError,
    RateLimitError,
    UnauthorizedError,
    ValidationError,
)
from app.models import Organization, User
from app.schemas import (
    CompleteRegistrationRequest,
    CompleteRegistrationResponse,
    MessageResponse,
    OTPVerifyRequest,
    OTPVerifyResponse,
    PhoneRequest,
    RefreshTokenRequest,
    SendCodeResponse,
    TokenResponse,
    UserStatusResponse,
)
from app.config import settings
from app.services import dadata, otp, sms

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["auth"])


def _generate_referral_code() -> str:
    """Generate a random 8-character referral code."""
    alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    return "".join(secrets.choice(alphabet) for _ in range(8))


def _make_org_slug(name_short: str) -> str:
    """Transliterate org name to a slug for db_name generation."""
    translit_map = {
        "а": "a", "б": "b", "в": "v", "г": "g", "д": "d", "е": "e", "ё": "e",
        "ж": "zh", "з": "z", "и": "i", "й": "y", "к": "k", "л": "l", "м": "m",
        "н": "n", "о": "o", "п": "p", "р": "r", "с": "s", "т": "t", "у": "u",
        "ф": "f", "х": "kh", "ц": "ts", "ч": "ch", "ш": "sh", "щ": "shch",
        "ъ": "", "ы": "y", "ь": "", "э": "e", "ю": "yu", "я": "ya",
    }
    # Remove legal form prefixes
    name = re.sub(r'^(ООО|ОАО|ЗАО|ПАО|АО|ИП)\s*[«"\'"]?', "", name_short, flags=re.IGNORECASE)
    name = re.sub(r'[»"\'"]', "", name).strip()
    # Transliterate
    result = ""
    for char in name.lower():
        if char in translit_map:
            result += translit_map[char]
        elif char.isascii() and char.isalnum():
            result += char
        elif char == " ":
            result += "_"
    # Clean up
    result = re.sub(r"_+", "_", result).strip("_")
    return result[:20] or "org"


@router.post("/send-code", response_model=SendCodeResponse)
async def send_code(body: PhoneRequest, db: AsyncSession = Depends(get_db)) -> SendCodeResponse:
    """Send an OTP code to the given phone number via SMS."""
    phone = body.phone

    # Check cooldown (60 sec between sends)
    if await otp.check_cooldown(phone):
        raise RateLimitError("Подождите 60 секунд перед повторной отправкой")

    # Check daily SMS limit (max 10 per day per phone)
    if await otp.check_daily_limit(phone, max_daily=10):
        raise RateLimitError("Превышен лимит SMS на сегодня. Попробуйте завтра.")

    # Check if user exists
    result = await db.execute(select(User).where(User.phone == phone))
    existing_user = result.scalar_one_or_none()
    is_new_user = existing_user is None

    # Generate and store OTP
    code = await otp.generate_otp()
    await otp.store_otp(phone, code)
    await otp.set_cooldown(phone)

    # Send SMS
    message = f"1C24.PRO — код подтверждения: {code}. Никому не сообщайте."
    await sms.send_sms(phone, message)

    # Increment daily SMS counter
    await otp.increment_daily_counter(phone)

    logger.info("OTP sent to %s (new_user=%s)", phone, is_new_user)
    return SendCodeResponse(sent=True, is_new_user=is_new_user, ttl=300)


@router.post("/verify-code", response_model=OTPVerifyResponse)
async def verify_code(body: OTPVerifyRequest, db: AsyncSession = Depends(get_db)) -> OTPVerifyResponse:
    """Verify an OTP code for phone authentication."""
    phone = body.phone
    code = body.code

    # Check brute-force attempts BEFORE verification (max 5 per OTP)
    attempts = await otp.get_attempts_count(phone)
    if attempts >= settings.OTP_MAX_ATTEMPTS:
        await otp.delete_otp(phone)
        raise RateLimitError("Слишком много попыток. Запросите новый код.")

    # Verify OTP against Redis
    is_valid = await otp.verify_otp(phone, code)
    if not is_valid:
        return OTPVerifyResponse(verified=False, needs_registration=False)

    # Check if user exists
    result = await db.execute(select(User).where(User.phone == phone))
    existing_user = result.scalar_one_or_none()

    if existing_user:
        # Existing user — issue tokens
        access_token = create_access_token(existing_user.id, existing_user.phone, existing_user.role)
        refresh_token = create_refresh_token(existing_user.id)
        existing_user.last_login_at = datetime.now(timezone.utc)
        return OTPVerifyResponse(
            verified=True,
            needs_registration=False,
            access_token=access_token,
            refresh_token=refresh_token,
        )
    else:
        # New user — issue temp token for registration
        temp_token = create_temp_token(phone)
        return OTPVerifyResponse(
            verified=True,
            needs_registration=True,
            temp_token=temp_token,
        )


@router.post("/complete-registration", response_model=CompleteRegistrationResponse)
async def complete_registration(
    body: CompleteRegistrationRequest,
    authorization: str = Header(..., alias="Authorization"),
    db: AsyncSession = Depends(get_db),
) -> CompleteRegistrationResponse:
    """Complete registration for a new user after phone verification."""
    # Validate temp token
    if not authorization.startswith("Bearer "):
        raise UnauthorizedError("Invalid authorization header")
    token = authorization.removeprefix("Bearer ")
    try:
        payload = decode_token(token)
    except JWTError:
        raise UnauthorizedError("Invalid or expired temp token")
    if payload.get("type") != "temp":
        raise UnauthorizedError("Invalid token type")
    phone = str(payload.get("phone", ""))
    if not phone:
        raise UnauthorizedError("Invalid temp token payload")

    # Check phone not already registered
    result = await db.execute(select(User).where(User.phone == phone))
    if result.scalar_one_or_none():
        raise ConflictError("Этот номер уже зарегистрирован")

    # Lookup INN via DaData
    org_data = await dadata.find_by_inn(body.inn)
    if not org_data or not org_data.get("inn"):
        raise NotFoundError("ИНН не найден в ЕГРЮЛ/ЕГРИП")

    # Check INN not already registered
    result = await db.execute(select(Organization).where(Organization.inn == body.inn))
    if result.scalar_one_or_none():
        raise ConflictError("Организация с этим ИНН уже зарегистрирована")

    # Create Organization
    slug = _make_org_slug(org_data.get("name_short", "") or "org")
    # Ensure slug uniqueness
    result = await db.execute(select(Organization).where(Organization.slug == slug))
    if result.scalar_one_or_none():
        slug = f"{slug}_{body.inn[:4]}"

    org = Organization(
        inn=org_data["inn"],
        kpp=org_data.get("kpp"),
        ogrn=org_data.get("ogrn"),
        name_short=org_data.get("name_short", ""),
        name_full=org_data.get("name_full"),
        type=org_data.get("type", "LEGAL"),
        director_name=org_data.get("director_name"),
        address=org_data.get("address"),
        okved=org_data.get("okved"),
        slug=slug,
        status="ACTIVE",
    )
    db.add(org)
    await db.flush()

    # Create User (owner)
    now = datetime.now(timezone.utc)
    user = User(
        organization_id=org.id,
        phone=phone,
        phone_verified=True,
        is_owner=True,
        role="owner",
        status="active",
        referral_code=_generate_referral_code(),
        trial_started_at=now,
        trial_ends_at=now + timedelta(days=30),
    )
    db.add(user)
    await db.flush()

    # Generate tokens
    access_token = create_access_token(user.id, user.phone, user.role)
    refresh_token = create_refresh_token(user.id)

    logger.info("New registration: %s, org=%s", phone, org.name_short)

    # Notify admin via SMS
    try:
        admin_msg = f"1C24.PRO: новый клиент!\n{org.name_short}\nИНН: {org.inn}\nТел: {phone}"
        await sms.send_sms(settings.ADMIN_PHONE, admin_msg)
    except Exception:
        logger.warning("Failed to send admin notification SMS")

    return CompleteRegistrationResponse(
        user_id=user.id,
        access_token=access_token,
        refresh_token=refresh_token,
    )


@router.get("/me", response_model=UserStatusResponse)
async def get_auth_me(
    authorization: str = Header(..., alias="Authorization"),
    db: AsyncSession = Depends(get_db),
) -> UserStatusResponse:
    """Get current user status for personalized UI (landing hero)."""
    if not authorization.startswith("Bearer "):
        raise UnauthorizedError("Invalid authorization header")
    token = authorization.removeprefix("Bearer ")
    try:
        payload = decode_token(token)
    except JWTError:
        raise UnauthorizedError("Invalid or expired token")
    if payload.get("type") != "access":
        raise UnauthorizedError("Invalid token type")

    import uuid as _uuid

    user_id_str = str(payload.get("sub", ""))
    try:
        user_id = _uuid.UUID(user_id_str)
    except ValueError:
        raise UnauthorizedError("Invalid token payload")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise UnauthorizedError("User not found")

    # Get organization
    result = await db.execute(
        select(Organization).where(Organization.id == user.organization_id)
    )
    org = result.scalar_one_or_none()

    # Calculate trial status
    now = datetime.now(timezone.utc)
    trial_days_left = 0
    status = "active"

    if user.trial_ends_at:
        trial_days_left = max(0, (user.trial_ends_at - now).days)
        if trial_days_left > 5:
            status = "trial"
        elif trial_days_left > 0:
            status = "trial_ending"
        else:
            status = "expired"

    # TODO: Check if user has active paid subscription — override status to "active"

    return UserStatusResponse(
        user_id=str(user.id),
        phone=user.phone,
        role=user.role,
        status=status,
        trial_days_left=trial_days_left,
        trial_ends_at=user.trial_ends_at.isoformat() if user.trial_ends_at else None,
        org_name=org.name_short if org else "",
        org_inn=org.inn if org else "",
        tariff=None,
        tariff_active_until=None,
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh(body: RefreshTokenRequest, db: AsyncSession = Depends(get_db)) -> TokenResponse:
    """Refresh an expired access token using a refresh token."""
    try:
        payload = decode_token(body.refresh_token)
    except JWTError:
        raise UnauthorizedError("Invalid or expired refresh token")
    if payload.get("type") != "refresh":
        raise UnauthorizedError("Invalid token type")

    user_id_str = str(payload.get("sub", ""))
    import uuid as _uuid
    try:
        user_id = _uuid.UUID(user_id_str)
    except ValueError:
        raise UnauthorizedError("Invalid token payload")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise UnauthorizedError("User not found")

    access_token = create_access_token(user.id, user.phone, user.role)
    new_refresh_token = create_refresh_token(user.id)
    return TokenResponse(access_token=access_token, refresh_token=new_refresh_token)


@router.post("/logout", response_model=MessageResponse)
async def logout() -> MessageResponse:
    """Invalidate the current session (client-side token removal)."""
    return MessageResponse(message="Successfully logged out")


@router.post("/accept-invite", response_model=MessageResponse)
async def accept_invite() -> MessageResponse:
    """Accept an organization invitation and join as a user."""
    # TODO: implement in Phase 2
    return MessageResponse(message="Invite accepted successfully")
