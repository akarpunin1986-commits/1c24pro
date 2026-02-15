"""Subscription management routes."""

import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends

from app.dependencies import get_current_user, require_owner
from app.models import User
from app.schemas import MessageResponse, SubscriptionResponse, UpdateSubscriptionRequest

router = APIRouter(prefix="/subscription", tags=["subscription"])


@router.get("", response_model=SubscriptionResponse)
async def get_subscription(
    current_user: User = Depends(get_current_user),
) -> SubscriptionResponse:
    """Get the current subscription for the user's organization.

    Args:
        current_user: The authenticated user.

    Returns:
        Active subscription details.
    """
    # TODO: fetch subscription for current_user.organization_id
    now = datetime.now(timezone.utc)
    return SubscriptionResponse(
        id=uuid.uuid4(),
        plan="trial",
        status="trial",
        users_limit=3,
        current_period_start=now,
        current_period_end=now + timedelta(days=30),
        auto_renew=True,
    )


@router.patch("", response_model=MessageResponse)
async def update_subscription(
    body: UpdateSubscriptionRequest,
    current_user: User = Depends(require_owner),
) -> MessageResponse:
    """Update subscription plan or auto-renew setting.

    Args:
        body: Fields to update (plan, auto_renew).
        current_user: The authenticated owner.

    Returns:
        Confirmation message.
    """
    # TODO: validate plan change, update subscription record
    return MessageResponse(message="Subscription updated successfully")
