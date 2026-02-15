"""SMS.ru client for sending SMS messages."""

import logging

import httpx

from app.config import settings

logger = logging.getLogger(__name__)


async def send_sms(phone: str, message: str) -> dict[str, bool | str]:
    """Send an SMS message via SMS.ru API.

    Args:
        phone: Recipient phone number in +7XXXXXXXXXX format.
        message: SMS text content.

    Returns:
        Dictionary with success status and optional error message.
    """
    logger.info("Sending SMS to %s: %s", phone, message[:50])

    if not settings.SMSRU_API_KEY:
        logger.warning("SMS.ru API key not configured, skipping SMS")
        return {"success": False, "error": "SMS service not configured"}

    url = "https://sms.ru/sms/send"
    params = {
        "api_id": settings.SMSRU_API_KEY,
        "to": phone.replace("+", ""),
        "msg": message,
        "json": 1,
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params)
        data = response.json()

    success = data.get("status") == "OK"
    if not success:
        logger.error("SMS send failed: %s", data)

    return {"success": success, "error": None if success else str(data)}
