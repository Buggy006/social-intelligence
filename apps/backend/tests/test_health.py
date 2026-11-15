from unittest.mock import MagicMock
from uuid import UUID

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.modules.health.router import get_probe
from app.modules.health.service import InfrastructureProbe


@pytest.mark.parametrize("path", ["/health", "/api/v1/health"])
def test_liveness_without_infrastructure(application: FastAPI, path: str) -> None:
    with TestClient(application) as client:
        response = client.get(path)
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "social-intelligence-api", "checks": {}}
    assert UUID(response.headers["X-Request-ID"])


@pytest.mark.parametrize("path", ["/health/ready", "/api/v1/health/ready"])
@pytest.mark.parametrize("available", [True, False])
def test_readiness(application: FastAPI, available: bool, path: str) -> None:
    probe = MagicMock()
    probe.check.return_value = {"postgresql": "ok", "redis": "ok" if available else "unavailable"}
    application.dependency_overrides[get_probe] = lambda: probe
    with TestClient(application) as client:
        response = client.get(path)
    assert response.status_code == (200 if available else 503)
    assert response.json()["status"] == ("ok" if available else "degraded")


def test_probe_handles_failures_without_exposing_details() -> None:
    engine, redis_client = MagicMock(), MagicMock()
    engine.connect.side_effect = RuntimeError("private database URL")
    redis_client.ping.side_effect = RuntimeError("private redis URL")
    assert InfrastructureProbe(engine, redis_client).check() == {
        "postgresql": "unavailable",
        "redis": "unavailable",
    }


def test_probe_success() -> None:
    engine, redis_client = MagicMock(), MagicMock()
    redis_client.ping.return_value = True
    assert InfrastructureProbe(engine, redis_client).check() == {"postgresql": "ok", "redis": "ok"}


def test_unhandled_error_is_sanitized(application: FastAPI) -> None:
    @application.get("/test-error")
    def fail() -> None:
        raise RuntimeError("secret-value")

    with TestClient(application) as client:
        response = client.get("/test-error")
    assert response.status_code == 500
    assert "secret-value" not in response.text
    assert response.json()["request_id"] == response.headers["X-Request-ID"]


def test_cors_rejects_unknown_origin(application: FastAPI) -> None:
    with TestClient(application) as client:
        response = client.options(
            "/health",
            headers={"Origin": "https://untrusted.invalid", "Access-Control-Request-Method": "GET"},
        )
    assert response.status_code == 400
    assert "access-control-allow-origin" not in response.headers


def test_lifespan_disposes_clients(
    application: FastAPI, infrastructure: tuple[MagicMock, MagicMock]
) -> None:
    engine, redis_client = infrastructure
    with TestClient(application) as client:
        assert client.get("/health").status_code == 200
    engine.dispose.assert_called_once()
    redis_client.close.assert_called_once()


def test_validation_errors_do_not_echo_input(application: FastAPI) -> None:
    @application.get("/test-validation")
    def validated(count: int) -> dict[str, int]:
        return {"count": count}

    with TestClient(application) as client:
        response = client.get("/test-validation?count=private-input")
    assert response.status_code == 422
    assert "private-input" not in response.text
    assert response.json()["detail"] == "Invalid request"


def test_allowed_origin(application: FastAPI) -> None:
    with TestClient(application) as client:
        response = client.get("/health", headers={"Origin": "http://localhost:3000"})
    assert response.headers["access-control-allow-origin"] == "http://localhost:3000"
