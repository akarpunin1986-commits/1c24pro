"""Tests for INN lookup endpoint."""

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app


@pytest.mark.asyncio
async def test_inn_lookup_returns_organization() -> None:
    """INN lookup should return organization data with status 200."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/v1/inn/lookup",
            json={"inn": "7707083893"},
        )

    assert response.status_code == 200
    data = response.json()
    assert data["inn"] == "7707083893"
    assert "name_short" in data


@pytest.mark.asyncio
async def test_inn_lookup_invalid_inn_returns_422() -> None:
    """INN lookup with an invalid INN should return 422."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/v1/inn/lookup",
            json={"inn": "123"},
        )

    assert response.status_code == 422
