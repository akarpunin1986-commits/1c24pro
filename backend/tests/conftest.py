"""Pytest fixtures for async test client, mock services."""

from collections.abc import AsyncGenerator
from unittest.mock import AsyncMock, patch

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app


@pytest.fixture
async def client() -> AsyncGenerator[AsyncClient, None]:
    """Create an async HTTP test client for the FastAPI app.

    Yields:
        httpx AsyncClient configured for testing.
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.fixture
def mock_redis() -> AsyncGenerator[AsyncMock, None]:
    """Mock Redis client for OTP storage.

    Yields:
        AsyncMock that replaces Redis operations.
    """
    with patch("app.services.otp.store_otp", new_callable=AsyncMock) as mock_store:
        mock_store.return_value = True
        with patch("app.services.otp.verify_otp", new_callable=AsyncMock) as mock_verify:
            mock_verify.return_value = True
            yield mock_store


@pytest.fixture
def mock_dadata() -> AsyncGenerator[AsyncMock, None]:
    """Mock DaData API responses.

    Yields:
        AsyncMock that replaces DaData find_by_inn.
    """
    mock_data = {
        "inn": "7707083893",
        "kpp": "770701001",
        "ogrn": "1027700132195",
        "name_short": 'ООО "Тест"',
        "name_full": 'Общество с ограниченной ответственностью "Тест"',
        "type": "LEGAL",
        "director_name": "Иванов Иван Иванович",
        "address": "г. Москва",
        "okved": "62.01",
        "status": "ACTIVE",
    }
    with patch(
        "app.services.dadata.find_by_inn", new_callable=AsyncMock, return_value=mock_data
    ) as mock_find:
        yield mock_find


@pytest.fixture
def mock_sms() -> AsyncGenerator[AsyncMock, None]:
    """Mock SMS.ru — do not send real SMS in tests.

    Yields:
        AsyncMock that replaces SMS sending.
    """
    with patch(
        "app.services.sms.send_sms",
        new_callable=AsyncMock,
        return_value={"success": True, "error": None},
    ) as mock_send:
        yield mock_send
