"""Organization management routes: invites, members, ownership."""

import logging
import secrets
import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.dependencies import get_current_user, get_db, require_owner
from app.models import User
from app.schemas import (
    InviteRequest,
    InviteResponse,
    MemberResponse,
    MessageResponse,
    TransferOwnershipRequest,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/org", tags=["organization"])


def _generate_referral_code() -> str:
    alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    return "".join(secrets.choice(alphabet) for _ in range(8))


def _build_display_name(user: User) -> str:
    """Build 'Имя Отчество' or phone fallback."""
    if user.first_name:
        name = user.first_name
        if user.patronymic:
            name += f" {user.patronymic}"
        return name
    return user.phone


@router.post("/invite", response_model=InviteResponse)
async def invite(
    body: InviteRequest,
    current_user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
) -> InviteResponse:
    """Invite a new member to the organization by phone number.

    Creates a User record with status='invited' and sends an SMS invitation.
    """
    now = datetime.now(timezone.utc)

    # Check if phone is already registered
    result = await db.execute(select(User).where(User.phone == body.phone))
    existing = result.scalar_one_or_none()
    if existing:
        from app.exceptions import ConflictError
        raise ConflictError("Пользователь с таким телефоном уже зарегистрирован")

    user = User(
        organization_id=current_user.organization_id,
        phone=body.phone,
        phone_verified=False,
        is_owner=False,
        role="user",
        status="invited",
        first_name=body.first_name,
        last_name=body.last_name or None,
        patronymic=body.patronymic or None,
        referral_code=_generate_referral_code(),
        invited_by=current_user.id,
        trial_started_at=current_user.trial_started_at,
        trial_ends_at=current_user.trial_ends_at,
    )
    db.add(user)
    await db.flush()

    # Send SMS invitation
    try:
        from app.services import sms as sms_service
        msg = f"Вас пригласили в 1C24.PRO. Войдите: https://1c24.pro/auth"
        await sms_service.send_sms(body.phone, msg)
    except Exception:
        logger.warning("Failed to send invite SMS to %s", body.phone)

    # Notify admin
    try:
        from app.services import sms as sms_service
        admin_msg = f"1C24.PRO: приглашение сотрудника\nТел: {body.phone}\nИмя: {body.first_name} {body.last_name or ''}"
        await sms_service.send_sms(settings.ADMIN_PHONE, admin_msg)
    except Exception:
        logger.warning("Failed to send admin invite notification")

    return InviteResponse(
        id=user.id,
        phone=body.phone,
        status="invited",
        created_at=now,
        expires_at=now + timedelta(days=7),
    )


@router.get("/invites", response_model=list[InviteResponse])
async def get_invites(
    current_user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
) -> list[InviteResponse]:
    """Get all invited (pending) members for the organization."""
    result = await db.execute(
        select(User)
        .where(
            User.organization_id == current_user.organization_id,
            User.status == "invited",
        )
        .order_by(User.created_at.desc())
    )
    invited_users = result.scalars().all()
    now = datetime.now(timezone.utc)
    return [
        InviteResponse(
            id=u.id,
            phone=u.phone,
            status="invited",
            created_at=u.created_at,
            expires_at=u.created_at + timedelta(days=7) if u.created_at else now + timedelta(days=7),
        )
        for u in invited_users
    ]


@router.delete("/invites/{invite_id}", response_model=MessageResponse)
async def cancel_invite(
    invite_id: uuid.UUID,
    current_user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
) -> MessageResponse:
    """Cancel a pending invitation by removing the invited user."""
    result = await db.execute(
        select(User).where(
            User.id == invite_id,
            User.organization_id == current_user.organization_id,
            User.status == "invited",
        )
    )
    invited_user = result.scalar_one_or_none()
    if invited_user:
        await db.delete(invited_user)
    return MessageResponse(message="Приглашение отменено")


@router.get("/members", response_model=list[MemberResponse])
async def get_members(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[MemberResponse]:
    """Get all members of the organization."""
    result = await db.execute(
        select(User)
        .where(User.organization_id == current_user.organization_id)
        .order_by(User.is_owner.desc(), User.created_at.asc())
    )
    users = result.scalars().all()
    return [
        MemberResponse(
            id=u.id,
            phone=u.phone,
            email=u.email,
            first_name=u.first_name,
            last_name=u.last_name,
            patronymic=u.patronymic,
            display_name=_build_display_name(u),
            role=u.role,
            status=u.status,
            created_at=u.created_at,
            last_login_at=u.last_login_at,
        )
        for u in users
    ]


@router.post("/members/{member_id}/disable", response_model=MessageResponse)
async def disable_member(
    member_id: uuid.UUID,
    current_user: User = Depends(require_owner),
) -> MessageResponse:
    """Disable a member's access to the organization.

    Args:
        member_id: The user UUID to disable.
        current_user: The authenticated owner.

    Returns:
        Confirmation message.
    """
    # TODO: set user status=disabled, invalidate JWT, send SMS
    return MessageResponse(message="Member disabled")


@router.post("/members/{member_id}/enable", response_model=MessageResponse)
async def enable_member(
    member_id: uuid.UUID,
    current_user: User = Depends(require_owner),
) -> MessageResponse:
    """Re-enable a previously disabled member.

    Args:
        member_id: The user UUID to enable.
        current_user: The authenticated owner.

    Returns:
        Confirmation message.
    """
    # TODO: set user status=active, send SMS
    return MessageResponse(message="Member enabled")


@router.post("/transfer-ownership", response_model=MessageResponse)
async def transfer_ownership(
    body: TransferOwnershipRequest,
    current_user: User = Depends(require_owner),
) -> MessageResponse:
    """Transfer organization ownership to another member (irreversible).

    Requires SMS confirmation in the full implementation.

    Args:
        body: Target user UUID to become the new owner.
        current_user: The authenticated owner.

    Returns:
        Confirmation message.
    """
    # TODO: verify via SMS, swap owner role, update both users
    return MessageResponse(message="Ownership transferred successfully")
