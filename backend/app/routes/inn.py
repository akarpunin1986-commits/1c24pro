"""INN lookup route via DaData API."""

from fastapi import APIRouter

from app.exceptions import NotFoundError, ValidationError
from app.schemas import INNLookupRequest, OrganizationResponse
from app.services import dadata

router = APIRouter(prefix="/inn", tags=["inn"])


@router.post("/lookup", response_model=OrganizationResponse)
async def lookup(body: INNLookupRequest) -> OrganizationResponse:
    """Look up organization details by INN using DaData.

    Args:
        body: INN string (10 or 12 digits).

    Returns:
        Organization data from EGRUL / EGRIP.
    """
    if not body.inn.isdigit() or len(body.inn) not in (10, 12):
        raise ValidationError("ИНН должен содержать 10 или 12 цифр")

    org_data = await dadata.find_by_inn(body.inn)
    if not org_data or not org_data.get("inn"):
        raise NotFoundError("ИНН не найден в ЕГРЮЛ/ЕГРИП")

    return OrganizationResponse(
        inn=org_data.get("inn", body.inn),
        kpp=org_data.get("kpp"),
        ogrn=org_data.get("ogrn"),
        name_short=org_data.get("name_short", ""),
        name_full=org_data.get("name_full"),
        type=org_data.get("type", "LEGAL"),
        director_name=org_data.get("director_name"),
        address=org_data.get("address"),
        okved=org_data.get("okved"),
        status=org_data.get("status", "ACTIVE"),
    )
