"""Custom HTTP exceptions for consistent error responses."""

from fastapi import HTTPException, status


class NotFoundError(HTTPException):
    """Resource not found (404)."""

    def __init__(self, detail: str = "Resource not found") -> None:
        """Initialize with a detail message."""
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail=detail)


class ConflictError(HTTPException):
    """Resource already exists or conflicts (409)."""

    def __init__(self, detail: str = "Resource already exists") -> None:
        """Initialize with a detail message."""
        super().__init__(status_code=status.HTTP_409_CONFLICT, detail=detail)


class ForbiddenError(HTTPException):
    """Access denied (403)."""

    def __init__(self, detail: str = "Access denied") -> None:
        """Initialize with a detail message."""
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, detail=detail)


class UnauthorizedError(HTTPException):
    """Authentication required or failed (401)."""

    def __init__(self, detail: str = "Not authenticated") -> None:
        """Initialize with a detail message."""
        super().__init__(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail)


class RateLimitError(HTTPException):
    """Too many requests (429)."""

    def __init__(self, detail: str = "Too many requests, please try again later") -> None:
        """Initialize with a detail message."""
        super().__init__(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=detail)


class ValidationError(HTTPException):
    """Validation failed (422)."""

    def __init__(self, detail: str = "Validation error") -> None:
        """Initialize with a detail message."""
        super().__init__(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=detail)
