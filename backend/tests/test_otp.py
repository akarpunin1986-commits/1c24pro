"""Tests for OTP service and verification."""

import pytest

from app.services.otp import generate_otp, hash_otp


@pytest.mark.asyncio
async def test_generate_otp_returns_six_digits() -> None:
    """Generated OTP should be a 6-digit numeric string."""
    code = await generate_otp()
    assert len(code) == 6
    assert code.isdigit()


def test_hash_otp_is_deterministic() -> None:
    """Hashing the same code twice should produce the same result."""
    code = "123456"
    assert hash_otp(code) == hash_otp(code)


def test_hash_otp_different_for_different_codes() -> None:
    """Different codes should produce different hashes."""
    assert hash_otp("123456") != hash_otp("654321")
