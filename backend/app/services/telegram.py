"""Telegram Bot API client for admin notifications."""

import logging

from app.config import settings
from app.core.http_client import get_http_client

logger = logging.getLogger(__name__)


async def send_admin_notification(message: str) -> bool:
    """Send a notification message to the admin Telegram chat.

    Uses the global HTTP client with connection pooling.

    Args:
        message: Text message to send.

    Returns:
        True if the message was sent successfully, False otherwise.
    """
    token = settings.TELEGRAM_BOT_TOKEN
    chat_id = settings.TELEGRAM_ADMIN_CHAT_ID

    if not token or not chat_id:
        logger.warning("Telegram not configured, skipping notification")
        return False

    url = f"https://api.telegram.org/bot{token}/sendMessage"

    try:
        client = await get_http_client()
        response = await client.post(
            url,
            json={"chat_id": chat_id, "text": message, "parse_mode": "HTML"},
        )
        response.raise_for_status()
        logger.info("Telegram notification sent: %s", message[:80])
        return True
    except Exception as exc:
        logger.error("Failed to send Telegram notification: %s", exc)
        return False
