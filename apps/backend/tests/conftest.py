from unittest.mock import MagicMock

import pytest
from fastapi import FastAPI
from pydantic import SecretStr

from app.core.config import Settings
from app.main import create_app


@pytest.fixture
def settings() -> Settings:
    return Settings(
        _env_file=None,
        environment="test",
        database_url=SecretStr("postgresql+psycopg://localhost/test"),
        redis_url=SecretStr("redis://localhost:6379/15"),
    )


@pytest.fixture
def infrastructure(monkeypatch: pytest.MonkeyPatch) -> tuple[MagicMock, MagicMock]:
    engine, redis_client = MagicMock(), MagicMock()
    monkeypatch.setattr("app.main.build_engine", lambda settings: engine)
    monkeypatch.setattr("app.main.Redis.from_url", lambda *args, **kwargs: redis_client)
    return engine, redis_client


@pytest.fixture
def application(settings: Settings, infrastructure: tuple[MagicMock, MagicMock]) -> FastAPI:
    return create_app(settings)
