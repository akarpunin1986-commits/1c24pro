"""JWT token creation and verification utilities."""

import uuid
from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt

from app.config import settings
from app.constants import ACCESS_TOKEN_EXPIRE_MINUTES, REFRESH_TOKEN_EXPIRE_DAYS


def create_access_token(
    user_id: uuid.UUID,
    phone: str,
    role: str,
) -> str:
    """Create a short-lived JWT access token.

    Args:
        user_id: The user's UUID.
        phone: The user's phone number.
        role: The user's role (owner / admin / user).

    Returns:
        Encoded JWT string.
    """
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user_id),
        "phone": phone,
        "role": role,
        "type": "access",
        "iat": now,
        "exp": now + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def create_refresh_token(user_id: uuid.UUID) -> str:
    """Create a long-lived JWT refresh token.

    Args:
        user_id: The user's UUID.

    Returns:
        Encoded JWT string.
    """
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user_id),
        "type": "refresh",
        "iat": now,
        "exp": now + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS),
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def create_temp_token(phone: str) -> str:
    """Create a temporary token for registration completion.

    Args:
        phone: The verified phone number.

    Returns:
        Encoded JWT string valid for 15 minutes.
    """
    now = datetime.now(timezone.utc)
    payload = {
        "phone": phone,
        "type": "temp",
        "iat": now,
        "exp": now + timedelta(minutes=15),
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def decode_token(token: str) -> dict[str, str | int]:
    """Decode and validate a JWT token.

    Args:
        token: The JWT string to decode.

    Returns:
        Decoded payload as a dictionary.

    Raises:
        JWTError: If the token is invalid or expired.
    """
    try:
        payload: dict[str, str | int] = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
        )
        return payload
    except JWTError:
        raise
