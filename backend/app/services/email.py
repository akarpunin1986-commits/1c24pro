"""Email service using aiosmtplib for async SMTP delivery."""

import logging

import aiosmtplib
from email.message import EmailMessage

from app.config import settings

logger = logging.getLogger(__name__)


async def send_email(to: str, subject: str, body: str) -> dict[str, bool | str]:
    """Send an email via SMTP.

    Args:
        to: Recipient email address.
        subject: Email subject line.
        body: Email body (plain text).

    Returns:
        Dictionary with success status and optional error message.
    """
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        logger.warning("SMTP not configured, skipping email to %s", to)
        return {"success": False, "error": "SMTP not configured"}

    message = EmailMessage()
    message["From"] = settings.SMTP_USER
    message["To"] = to
    message["Subject"] = subject
    message.set_content(body)

    try:
        await aiosmtplib.send(
            message,
            hostname=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            username=settings.SMTP_USER,
            password=settings.SMTP_PASSWORD,
            use_tls=True,
        )
        logger.info("Email sent to %s: %s", to, subject)
        return {"success": True, "error": None}
    except aiosmtplib.SMTPException as exc:
        logger.error("Failed to send email to %s: %s", to, exc)
        return {"success": False, "error": str(exc)}
