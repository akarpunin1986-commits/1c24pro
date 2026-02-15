"""Tests for registration flow endpoints."""

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app


@pytest.mark.asyncio
async def test_send_code_returns_sent() -> None:
    """Send code endpoint should return sent=true."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/v1/auth/send-code",
            json={"phone": "+79991234567"},
        )

    assert response.status_code == 200
    data = response.json()
    assert data["sent"] is True


@pytest.mark.asyncio
async def test_send_code_invalid_phone_returns_422() -> None:
    """Send code with invalid phone format should return 422."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/v1/auth/send-code",
            json={"phone": "not-a-phone"},
        )

    assert response.status_code == 422
