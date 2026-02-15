"""Admin panel routes: upload queue, database management, users."""

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends

from app.dependencies import require_admin
from app.models import User
from app.schemas import (
    AdminCreateDatabaseRequest,
    AdminUpdateDatabaseRequest,
    AdminUpdateUploadRequest,
    AdminUploadResponse,
    AdminUserResponse,
    DatabaseResponse,
    MessageResponse,
)

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/uploads", response_model=list[AdminUploadResponse])
async def get_uploads(
    current_user: User = Depends(require_admin),
) -> list[AdminUploadResponse]:
    """Get all uploads sorted by newest first.

    Args:
        current_user: The authenticated admin.

    Returns:
        List of all upload records with organization info.
    """
    # TODO: fetch all uploads with org names, newest first
    return []


@router.patch("/uploads/{upload_id}", response_model=MessageResponse)
async def update_upload(
    upload_id: uuid.UUID,
    body: AdminUpdateUploadRequest,
    current_user: User = Depends(require_admin),
) -> MessageResponse:
    """Update the status of an upload.

    Args:
        upload_id: The upload UUID.
        body: New status value.
        current_user: The authenticated admin.

    Returns:
        Confirmation message.
    """
    # TODO: update upload status in DB
    return MessageResponse(message="Upload status updated")


@router.get("/users", response_model=list[AdminUserResponse])
async def get_users(
    current_user: User = Depends(require_admin),
) -> list[AdminUserResponse]:
    """Get all registered users with organization info.

    Args:
        current_user: The authenticated admin.

    Returns:
        List of all users.
    """
    # TODO: fetch all users with org data
    return []


@router.post("/databases", response_model=DatabaseResponse)
async def create_database(
    body: AdminCreateDatabaseRequest,
    current_user: User = Depends(require_admin),
) -> DatabaseResponse:
    """Create a new database record after manual deployment.

    Args:
        body: Database details (org, config, URLs).
        current_user: The authenticated admin.

    Returns:
        Created database record.
    """
    # TODO: create Database record, generate db_name
    return DatabaseResponse(
        id=uuid.uuid4(),
        name=body.name,
        db_name=f"placeholder_{body.config_code}_1",
        config_code=body.config_code,
        config_name=body.config_name,
        status="preparing",
        web_url=body.web_url,
        rdp_url=body.rdp_url,
        size_gb=None,
        last_backup_at=None,
        created_at=datetime.now(timezone.utc),
    )


@router.patch("/databases/{database_id}", response_model=MessageResponse)
async def update_database(
    database_id: uuid.UUID,
    body: AdminUpdateDatabaseRequest,
    current_user: User = Depends(require_admin),
) -> MessageResponse:
    """Update a database record (status, URLs, notes).

    Automatically sends email + SMS to the client when status changes to 'active'.

    Args:
        database_id: The database UUID.
        body: Fields to update.
        current_user: The authenticated admin.

    Returns:
        Confirmation message.
    """
    # TODO: update DB record, notify client if status→active
    return MessageResponse(message="Database updated")
