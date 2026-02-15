"""Chunked file upload routes for .dt / .bak databases."""

import uuid

from fastapi import APIRouter, Depends, Request

from app.dependencies import get_current_user
from app.models import User
from app.schemas import (
    MessageResponse,
    UploadInitRequest,
    UploadInitResponse,
    UploadStatusResponse,
)

router = APIRouter(prefix="/uploads", tags=["uploads"])


@router.post("/init", response_model=UploadInitResponse)
async def init_upload(
    body: UploadInitRequest,
    current_user: User = Depends(get_current_user),
) -> UploadInitResponse:
    """Initialize a new chunked upload session.

    Args:
        body: Filename, size, and config code for the upload.
        current_user: The authenticated user.

    Returns:
        Upload session details including upload_id and expected chunks.
    """
    # TODO: create Upload record in DB, generate db_name
    import math

    chunk_size = 5242880
    chunks_expected = math.ceil(body.size_bytes / chunk_size)
    return UploadInitResponse(
        upload_id=uuid.uuid4(),
        chunk_size=chunk_size,
        chunks_expected=chunks_expected,
        db_name=f"test_{body.config_code}_1",
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
