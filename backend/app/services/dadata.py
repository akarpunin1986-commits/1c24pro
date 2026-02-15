"""DaData API client for INN lookup (EGRUL / EGRIP)."""

import logging

import httpx

from app.config import settings

logger = logging.getLogger(__name__)


async def find_by_inn(inn: str) -> dict[str, str | None]:
    """Look up an organization by INN via the DaData API.

    Args:
        inn: Russian tax identification number (10 or 12 digits).

    Returns:
        Dictionary with organization fields (inn, kpp, name_short, etc.).

    Raises:
        httpx.HTTPStatusError: If the DaData API returns an error.
    """
    logger.info("DaData lookup for INN: %s", inn)

    url = "https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/party"
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": f"Token {settings.DADATA_API_KEY}",
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(url, json={"query": inn}, headers=headers)
        response.raise_for_status()
        data = response.json()

    suggestions = data.get("suggestions", [])
    if not suggestions:
        return {}

    suggestion = suggestions[0]
    org_data = suggestion.get("data", {})

    return {
        "inn": org_data.get("inn"),
        "kpp": org_data.get("kpp"),
        "ogrn": org_data.get("ogrn"),
        "name_short": suggestion.get("value", ""),
        "name_full": org_data.get("name", {}).get("full_with_opf"),
        "type": org_data.get("type", "LEGAL"),
        "director_name": org_data.get("management", {}).get("name") if org_data.get("management") else None,
        "address": org_data.get("address", {}).get("unrestricted_value") if org_data.get("address") else None,
        "okved": org_data.get("okved"),
        "status": org_data.get("state", {}).get("status", "ACTIVE") if org_data.get("state") else "ACTIVE",
    }
