"""Health check endpoint."""

from fastapi import APIRouter

from app.schemas import HealthResponse

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """Return application health status, version, and uptime."""
    from app.main import get_uptime

    return HealthResponse(
        status="ok",
        version="1.0.0",
        uptime=get_uptime(),
    )
