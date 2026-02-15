"""Payment routes: YooKassa integration."""

import uuid

from fastapi import APIRouter, Depends, Request

from app.dependencies import get_current_user, require_owner
from app.models import User
from app.schemas import (
    CreatePaymentRequest,
    CreatePaymentResponse,
    InvoiceRequest,
    InvoiceResponse,
    MessageResponse,
    PaymentHistoryItem,
)

router = APIRouter(prefix="/payments", tags=["payments"])


@router.post("/create", response_model=CreatePaymentResponse)
async def create_payment(
    body: CreatePaymentRequest,
    current_user: User = Depends(require_owner),
) -> CreatePaymentResponse:
    """Create a payment via YooKassa and return the redirect URL.

    Args:
        body: Plan, period, and user count.
        current_user: The authenticated owner.

    Returns:
        Payment ID and YooKassa redirect URL.
    """
    # TODO: call YooKassa API, create Payment record
    return CreatePaymentResponse(
        payment_id=uuid.uuid4(),
        redirect_url="https://yookassa.ru/checkout/placeholder",
    )


@router.post("/webhook", response_model=MessageResponse)
async def webhook(request: Request) -> MessageResponse:
    """Handle YooKassa webhook notifications.

    No JWT required — validates via YooKassa signature.

    Args:
        request: Raw request with webhook payload.

    Returns:
        Acknowledgment message.
    """
    # TODO: verify YooKassa signature, process payment confirmation
    _ = await request.json()
    return MessageResponse(message="Webhook processed")


@router.get("/history", response_model=list[PaymentHistoryItem])
async def history(
    current_user: User = Depends(get_current_user),
) -> list[PaymentHistoryItem]:
    """Get payment history for the current organization.

    Args:
        current_user: The authenticated user.

    Returns:
        List of payment records.
    """
    # TODO: fetch payments for current_user.organization_id
    return []


@router.post("/invoice", response_model=InvoiceResponse)
async def invoice(
    body: InvoiceRequest,
    current_user: User = Depends(require_owner),
) -> InvoiceResponse:
    """Generate a PDF invoice for a legal entity payment.

    Args:
        body: Plan, period, and user count.
        current_user: The authenticated owner.

    Returns:
        Invoice ID and download URL.
    """
    # TODO: generate PDF invoice, store, return URL
    return InvoiceResponse(
        invoice_id=uuid.uuid4(),
        download_url="https://1c24.pro/invoices/placeholder.pdf",
    )
