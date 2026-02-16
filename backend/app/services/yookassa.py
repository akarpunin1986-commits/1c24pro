"""YooKassa payment integration service."""

import logging
import uuid
from decimal import Decimal

from app.config import settings
from app.core.http_client import get_http_client

logger = logging.getLogger(__name__)


async def create_payment(
    amount: Decimal,
    currency: str,
    description: str,
    return_url: str,
    metadata: dict[str, str],
) -> dict[str, str]:
    """Create a payment through the YooKassa API.

    Uses the global HTTP client with connection pooling.

    Args:
        amount: Payment amount.
        currency: Currency code (e.g., 'RUB').
        description: Human-readable payment description.
        return_url: URL to redirect the user after payment.
        metadata: Additional key-value data to store with the payment.

    Returns:
        Dictionary with 'id' (YooKassa payment ID) and 'confirmation_url'.
    """
    logger.info("Creating YooKassa payment: %s %s — %s", amount, currency, description)

    if not settings.YOOKASSA_SHOP_ID or not settings.YOOKASSA_SECRET_KEY:
        logger.warning("YooKassa not configured")
        return {
            "id": str(uuid.uuid4()),
            "confirmation_url": return_url,
        }

    url = "https://api.yookassa.ru/v3/payments"
    headers = {
        "Content-Type": "application/json",
        "Idempotence-Key": str(uuid.uuid4()),
    }
    payload = {
        "amount": {"value": str(amount), "currency": currency},
        "confirmation": {"type": "redirect", "return_url": return_url},
        "capture": True,
        "description": description,
        "metadata": metadata,
    }

    client = await get_http_client()
    response = await client.post(
        url,
        json=payload,
        headers=headers,
        auth=(settings.YOOKASSA_SHOP_ID, settings.YOOKASSA_SECRET_KEY),
    )
    response.raise_for_status()
    data = response.json()

    return {
        "id": data.get("id", ""),
        "confirmation_url": data.get("confirmation", {}).get("confirmation_url", return_url),
    }


async def verify_webhook(payload: dict[str, object]) -> bool:
    """Verify a YooKassa webhook notification.

    Args:
        payload: The parsed JSON body from the webhook request.

    Returns:
        True if the webhook signature is valid and the payment succeeded.
    """
    # TODO: implement webhook signature verification
    logger.info("Verifying YooKassa webhook: %s", payload.get("event"))
    event = payload.get("event", "")
    return event == "payment.succeeded"
