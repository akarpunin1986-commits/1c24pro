"""OTP generation, storage (Redis), and verification."""

import hashlib
import logging
import secrets

import redis.asyncio as aioredis

from app.config import settings
from app.constants import OTP_LENGTH, OTP_MAX_ATTEMPTS, OTP_TTL_SECONDS

logger = logging.getLogger(__name__)

_redis: aioredis.Redis | None = None


async def _get_redis() -> aioredis.Redis:
    """Return a shared async Redis connection (lazy singleton)."""
    global _redis  # noqa: PLW0603
    if _redis is None:
        _redis = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
    return _redis


async def generate_otp() -> str:
    """Generate a random numeric OTP code.

    Returns:
        String of random digits with length OTP_LENGTH.
    """
    code = "".join(secrets.choice("0123456789") for _ in range(OTP_LENGTH))
    return code


def hash_otp(code: str) -> str:
    """Create a SHA-256 hash of an OTP code.

    Args:
        code: The plaintext OTP code.

    Returns:
        Hexadecimal SHA-256 hash string.
    """
    return hashlib.sha256(code.encode()).hexdigest()


async def store_otp(phone: str, code: str) -> bool:
    """Store an OTP code hash in Redis with TTL.

    Also resets the attempts counter for this phone.

    Args:
        phone: The target phone number (used in Redis key).
        code: The plaintext OTP code.

    Returns:
        True if stored successfully.
    """
    r = await _get_redis()
    code_hash = hash_otp(code)
    pipe = r.pipeline()
    pipe.setex(f"otp:{phone}", OTP_TTL_SECONDS, code_hash)
    pipe.setex(f"otp_attempts:{phone}", OTP_TTL_SECONDS, 0)
    await pipe.execute()
    logger.info("Stored OTP for %s (TTL: %d seconds)", phone, OTP_TTL_SECONDS)
    return True


async def verify_otp(phone: str, code: str) -> bool:
    """Verify an OTP code against the stored hash in Redis.

    Checks that the number of failed attempts has not exceeded MAX.
    On failure the attempts counter is incremented.
    On success both the OTP and attempts keys are deleted.

    Args:
        phone: The target phone number (Redis key).
        code: The OTP code to verify.

    Returns:
        True if the code matches, has not expired, and attempts < MAX.
    """
    r = await _get_redis()
    stored_hash = await r.get(f"otp:{phone}")
    if stored_hash is None:
        logger.warning("OTP not found or expired for %s", phone)
        return False

    # Check attempts
    attempts_raw = await r.get(f"otp_attempts:{phone}")
    attempts = int(attempts_raw) if attempts_raw is not None else 0
    if attempts >= OTP_MAX_ATTEMPTS:
        logger.warning("OTP max attempts exceeded for %s", phone)
        return False

    # Compare hashes
    if hash_otp(code) != stored_hash:
        await r.incr(f"otp_attempts:{phone}")
        logger.info("OTP mismatch for %s (attempt %d)", phone, attempts + 1)
        return False

    # Success — clean up
    pipe = r.pipeline()
    pipe.delete(f"otp:{phone}")
    pipe.delete(f"otp_attempts:{phone}")
    await pipe.execute()
    logger.info("OTP verified successfully for %s", phone)
    return True


async def check_cooldown(phone: str) -> bool:
    """Check whether a cooldown is active for the given phone.

    Args:
        phone: The phone number to check.

    Returns:
        True if a cooldown key exists (i.e. must wait).
    """
    r = await _get_redis()
    return await r.exists(f"otp_cooldown:{phone}") == 1


async def set_cooldown(phone: str) -> None:
    """Set a cooldown key preventing repeated OTP sends.

    The key expires after OTP_COOLDOWN_SECONDS (default 60 s).

    Args:
        phone: The phone number to set cooldown for.
    """
    r = await _get_redis()
    await r.setex(f"otp_cooldown:{phone}", settings.OTP_COOLDOWN_SECONDS, 1)
