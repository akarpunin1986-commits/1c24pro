"""Tests for SQLAlchemy models."""

import pytest

from app.models import Base, Organization, User


@pytest.mark.asyncio
async def test_models_have_tablenames() -> None:
    """All models should have proper __tablename__ attributes."""
    assert Organization.__tablename__ == "organizations"
    assert User.__tablename__ == "users"


def test_base_metadata_contains_tables() -> None:
    """Base metadata should include all defined tables."""
    table_names = set(Base.metadata.tables.keys())
    expected = {
        "organizations",
        "users",
        "otp_logs",
        "invites",
        "payments",
        "subscriptions",
        "uploads",
        "databases",
    }
    assert expected.issubset(table_names)
