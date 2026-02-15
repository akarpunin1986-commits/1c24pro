"""Dashboard routes: user profile, databases, uploads."""

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends

from app.dependencies import get_current_user
from app.models import User
from app.schemas import (
    DatabaseResponse,
    MessageResponse,
    UpdateProfileRequest,
    UploadStatusResponse,
    UserProfileResponse,
)

router = APIRouter(tags=["dashboard"])


@router.get("/me", response_model=UserProfileResponse)
async def get_me(
    current_user: User = Depends(get_current_user),
) -> UserProfileResponse:
    """Get the current user's profile and organization info.

    Args:
        current_user: The authenticated user.

    Returns:
        Full user profile including organization details.
    """
    # TODO: load user with organization relationship from DB
    from app.schemas import OrganizationResponse

    return UserProfileResponse(
        id=current_user.id,
        phone=current_user.phone,
        email=current_user.email,
        first_name=current_user.first_name,
        last_name=current_user.last_name,
        role=current_user.role,
        status=current_user.status,
        referral_code=current_user.referral_code,
        organization=OrganizationResponse(
            inn="0000000000",
            name_short="Placeholder Org",
            type="LEGAL",
            status="ACTIVE",
        ),
        trial_ends_at=current_user.trial_ends_at,
        created_at=current_user.created_at,
    )


@router.patch("/me", response_model=MessageResponse)
async def update_me(
    body: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
) -> MessageResponse:
    """Update the current user's profile (email, name).

    Args:
        body: Fields to update.
        current_user: The authenticated user.

    Returns:
        Confirmation message.
    """
    # TODO: update user fields in DB, send email verification if email changed
    return MessageResponse(message="Profile updated successfully")


@router.get("/me/databases", response_model=list[DatabaseResponse])
async def get_databases(
    current_user: User = Depends(get_current_user),
) -> list[DatabaseResponse]:
    """Get all databases belonging to the user's organization.

    Args:
        current_user: The authenticated user.

    Returns:
        List of database instances.
    """
    # TODO: fetch databases for current_user.organization_id
    return [
        DatabaseResponse(
            id=uuid.uuid4(),
            name="Бухгалтерия предприятия",
            db_name="test_bp30_1",
            config_code="bp30",
            config_name="Бухгалтерия предприятия 3.0",
            status="active",
            web_url="https://1c24.pro:15009/test_bp30_1",
            rdp_url=None,
            size_gb=None,
            last_backup_at=None,
            created_at=datetime.now(timezone.utc),
        )
    ]


@router.get("/me/uploads", response_model=list[UploadStatusResponse])
async def get_uploads(
    current_user: User = Depends(get_current_user),
) -> list[UploadStatusResponse]:
    """Get all uploads belonging to the user's organization.

    Args:
        current_user: The authenticated user.

    Returns:
        List of upload sessions.
    """
    # TODO: fetch uploads for current_user.organization_id
    return []
