"""Chunked file upload routes for .dt / .bak databases."""

import logging
import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, BackgroundTasks, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.dependencies import get_current_user, get_db
from app.models import User
from app.schemas import (
    MessageResponse,
    UploadInitRequest,
    UploadInitResponse,
    UploadStatusResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/uploads", tags=["uploads"])


@router.post("/init", response_model=UploadInitResponse)
async def init_upload(
    body: UploadInitRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> UploadInitResponse:
    """Initialize a new chunked upload session.

    Starts the 30-day trial on the user's first upload.
    """
    import math

    chunk_size = 5242880
    chunks_expected = math.ceil(body.size_bytes / chunk_size)
    upload_id = uuid.uuid4()
    db_name = f"test_{body.config_code}_1"

    # Start trial on first database upload
    if current_user.trial_started_at is None:
        now = datetime.now(timezone.utc)
        current_user.trial_started_at = now
        current_user.trial_ends_at = now + timedelta(days=30)
        db.add(current_user)
        await db.flush()
        logger.info("Trial started for user %s (first database uploaded)", current_user.phone)

    # Notify admin via SMS (non-blocking)
    from app.services import sms as sms_service

    admin_msg = (
        f"1C24.PRO: загрузка базы!\n"
        f"{body.filename}\n"
        f"Конфиг: {body.config_code}\n"
        f"Размер: {body.size_bytes // (1024 * 1024)} МБ"
    )
    background_tasks.add_task(sms_service.send_sms, settings.ADMIN_PHONE, admin_msg)

    return UploadInitResponse(
        upload_id=upload_id,
        chunk_size=chunk_size,
        chunks_expected=chunks_expected,
        db_name=db_name,
    )


@router.put("/{upload_id}/chunk/{chunk_number}", response_model=MessageResponse)
async def upload_chunk(
    upload_id: uuid.UUID,
    chunk_number: int,
    request: Request,
    current_user: User = Depends(get_current_user),
) -> MessageResponse:
    """Upload a single chunk of a file.

    Args:
        upload_id: The upload session UUID.
        chunk_number: Zero-based chunk index.
        request: The raw request containing binary chunk data.
        current_user: The authenticated user.

    Returns:
        Confirmation that the chunk was received.
    """
    # TODO: read body bytes, save to storage, update chunks_received
    _ = await request.body()
    return MessageResponse(message=f"Chunk {chunk_number} received")


@router.get("/{upload_id}/status", response_model=UploadStatusResponse)
async def get_status(
    upload_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
) -> UploadStatusResponse:
    """Get the current status of an upload session.

    Args:
        upload_id: The upload session UUID.
        current_user: The authenticated user.

    Returns:
        Upload progress and status details.
    """
    # TODO: fetch upload record from DB
    from datetime import datetime, timezone

    return UploadStatusResponse(
        upload_id=upload_id,
        filename="placeholder.bak",
        config_code="bp30",
        status="uploading",
        chunks_expected=100,
        chunks_received=0,
        size_bytes=524288000,
        db_name="test_bp30_1",
        created_at=datetime.now(timezone.utc),
        completed_at=None,
    )


@router.post("/{upload_id}/complete", response_model=MessageResponse)
async def complete_upload(
    upload_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
) -> MessageResponse:
    """Finalize a chunked upload: merge chunks and notify admin.

    Args:
        upload_id: The upload session UUID.
        current_user: The authenticated user.

    Returns:
        Confirmation that the upload is complete.
    """
    # TODO: merge chunks, update status, send admin notification
    return MessageResponse(message="Upload completed successfully")
