"""Dashboard routes: user profile, databases, uploads — real DB queries."""

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_current_user, get_db
from app.models import Database, Organization, Upload, User
from app.schemas import (
    DatabaseResponse,
    MessageResponse,
    OrganizationResponse,
    UpdateProfileRequest,
    UploadStatusResponse,
    UserProfileResponse,
)

router = APIRouter(tags=["dashboard"])


@router.get("/me", response_model=UserProfileResponse)
async def get_me(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> UserProfileResponse:
    """Get the current user's profile and organization info from DB.

    Loads the user's organization by organization_id and builds
    the full profile response with real data.
    """
    # Load the organization
    result = await db.execute(
        select(Organization).where(Organization.id == current_user.organization_id)
    )
    org = result.scalar_one_or_none()

    org_response = OrganizationResponse(
        inn=org.inn if org else "",
        kpp=org.kpp if org else None,
        ogrn=org.ogrn if org else None,
        name_short=org.name_short if org else "Организация не найдена",
        name_full=org.name_full if org else None,
        type=org.type if org else "LEGAL",
        director_name=org.director_name if org else None,
        address=org.address if org else None,
        okved=org.okved if org else None,
        status=org.status if org else "ACTIVE",
    )

    return UserProfileResponse(
        id=current_user.id,
        phone=current_user.phone,
        email=current_user.email,
        first_name=current_user.first_name,
        last_name=current_user.last_name,
        role=current_user.role,
        status=current_user.status,
        referral_code=current_user.referral_code,
        organization=org_response,
        trial_ends_at=current_user.trial_ends_at,
        created_at=current_user.created_at,
    )


@router.patch("/me", response_model=MessageResponse)
async def update_me(
    body: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> MessageResponse:
    """Update the current user's profile (email, name) in DB.

    Applies provided fields to the user record and commits.
    """
    if body.email is not None:
        current_user.email = body.email
    if body.first_name is not None:
        current_user.first_name = body.first_name
    if body.last_name is not None:
        current_user.last_name = body.last_name

    db.add(current_user)
    return MessageResponse(message="Profile updated successfully")


@router.get("/me/databases", response_model=list[DatabaseResponse])
async def get_databases(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[DatabaseResponse]:
    """Get all databases belonging to the user's organization from DB."""
    result = await db.execute(
        select(Database)
        .where(Database.organization_id == current_user.organization_id)
        .order_by(Database.created_at.desc())
    )
    databases = result.scalars().all()

    return [
        DatabaseResponse(
            id=d.id,
            name=d.name,
            db_name=d.db_name,
            config_code=d.config_code,
            config_name=d.config_name,
            status=d.status,
            web_url=d.web_url,
            rdp_url=d.rdp_url,
            size_gb=d.size_gb,
            last_backup_at=d.last_backup_at,
            created_at=d.created_at,
        )
        for d in databases
    ]


@router.get("/me/uploads", response_model=list[UploadStatusResponse])
async def get_uploads(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[UploadStatusResponse]:
    """Get all uploads belonging to the user's organization from DB."""
    result = await db.execute(
        select(Upload)
        .where(Upload.organization_id == current_user.organization_id)
        .order_by(Upload.created_at.desc())
    )
    uploads = result.scalars().all()

    return [
        UploadStatusResponse(
            upload_id=u.id,
            filename=u.filename,
            config_code=u.config_code,
            status=u.status,
            chunks_expected=u.chunks_expected,
            chunks_received=u.chunks_received,
            size_bytes=u.size_bytes,
            db_name=u.db_name,
            created_at=u.created_at,
            completed_at=u.completed_at,
        )
        for u in uploads
    ]
