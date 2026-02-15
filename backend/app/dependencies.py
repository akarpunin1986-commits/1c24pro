"""FastAPI dependency injection utilities."""

import uuid
from collections.abc import AsyncGenerator

from fastapi import Depends, Header
from jose import JWTError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import decode_token
from app.database import async_session_factory
from app.exceptions import ForbiddenError, UnauthorizedError
from app.models import User


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Yield a database session with automatic commit / rollback."""
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


async def get_current_user(
    authorization: str = Header(..., alias="Authorization"),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Extract and validate the current user from the JWT bearer token.

    Args:
        authorization: The Authorization header value.
        db: Database session.

    Returns:
        The authenticated User object.

    Raises:
        UnauthorizedError: If the token is missing, invalid, or the user is not found.
        ForbiddenError: If the user account is disabled.
    """
    if not authorization.startswith("Bearer "):
        raise UnauthorizedError("Invalid authorization header")

    token = authorization.removeprefix("Bearer ")
    try:
        payload = decode_token(token)
    except JWTError:
        raise UnauthorizedError("Invalid or expired token")

    token_type = payload.get("type")
    if token_type != "access":
        raise UnauthorizedError("Invalid token type")

    user_id_str = payload.get("sub")
    if not user_id_str:
        raise UnauthorizedError("Invalid token payload")

    try:
        user_id = uuid.UUID(str(user_id_str))
    except ValueError:
        raise UnauthorizedError("Invalid user ID in token")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise UnauthorizedError("User not found")

    if user.status == "disabled":
        raise ForbiddenError("User account is disabled")

    return user


async def require_owner(
    current_user: User = Depends(get_current_user),
) -> User:
    """Ensure the current user has the 'owner' role.

    Args:
        current_user: The authenticated user.

    Returns:
        The owner User object.

    Raises:
        ForbiddenError: If the user is not an owner.
    """
    if current_user.role != "owner":
        raise ForbiddenError("Only the organization owner can perform this action")
    return current_user


async def require_admin(
    current_user: User = Depends(get_current_user),
) -> User:
    """Ensure the current user has the 'admin' role.

    Args:
        current_user: The authenticated user.

    Returns:
        The admin User object.

    Raises:
        ForbiddenError: If the user is not an admin.
    """
    if current_user.role != "admin":
        raise ForbiddenError("Admin access required")
    return current_user
