"""Organization management routes: invites, members, ownership."""

import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends

from app.dependencies import get_current_user, require_owner
from app.models import User
from app.schemas import (
    InviteRequest,
    InviteResponse,
    MemberResponse,
    MessageResponse,
    TransferOwnershipRequest,
)

router = APIRouter(prefix="/org", tags=["organization"])


@router.post("/invite", response_model=InviteResponse)
async def invite(
    body: InviteRequest,
    current_user: User = Depends(require_owner),
) -> InviteResponse:
    """Invite a new member to the organization by phone number.

    Args:
        body: Phone number to invite.
        current_user: The authenticated owner.

    Returns:
        Created invite details.
    """
    # TODO: create Invite record, send SMS to invited phone
    now = datetime.now(timezone.utc)
    return InviteResponse(
        id=uuid.uuid4(),
        phone=body.phone,
        status="pending",
        created_at=now,
        expires_at=now + timedelta(days=7),
    )


@router.get("/invites", response_model=list[InviteResponse])
async def get_invites(
    current_user: User = Depends(require_owner),
) -> list[InviteResponse]:
    """Get all pending invitations for the organization.

    Args:
        current_user: The authenticated owner.

    Returns:
        List of invite records.
    """
    # TODO: fetch invites for current_user.organization_id
    return []


@router.delete("/invites/{invite_id}", response_model=MessageResponse)
async def cancel_invite(
    invite_id: uuid.UUID,
    current_user: User = Depends(require_owner),
) -> MessageResponse:
    """Cancel a pending invitation.

    Args:
        invite_id: The invite UUID to cancel.
        current_user: The authenticated owner.

    Returns:
        Confirmation message.
    """
    # TODO: update invite status to cancelled
    return MessageResponse(message="Invite cancelled")


@router.get("/members", response_model=list[MemberResponse])
async def get_members(
    current_user: User = Depends(get_current_user),
) -> list[MemberResponse]:
    """Get all members of the organization.

    Args:
        current_user: The authenticated user.

    Returns:
        List of organization members.
    """
    # TODO: fetch users for current_user.organization_id
    return []


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
