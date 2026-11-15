from typing import Annotated, Literal, cast

from fastapi import APIRouter, Depends, Request, Response
from pydantic import BaseModel, Field

from app.modules.health.service import ReadinessProbe

router = APIRouter(tags=["health"])


class HealthResponse(BaseModel):
    status: Literal["ok", "degraded"] = "ok"
    service: str = "social-intelligence-api"
    checks: dict[str, str] = Field(default_factory=dict)


def get_probe(request: Request) -> ReadinessProbe:
    return cast(ReadinessProbe, request.app.state.readiness_probe)


@router.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse()


@router.get(
    "/health/ready", response_model=HealthResponse, responses={503: {"model": HealthResponse}}
)
def readiness(
    response: Response, probe: Annotated[ReadinessProbe, Depends(get_probe)]
) -> HealthResponse:
    checks = probe.check()
    if not all(value == "ok" for value in checks.values()) or not checks:
        response.status_code = 503
        return HealthResponse(status="degraded", checks=checks)
    return HealthResponse(checks=checks)
