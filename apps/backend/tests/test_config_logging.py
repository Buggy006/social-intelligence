import json
import logging

import pytest
from pydantic import SecretStr, ValidationError

from app.core.config import Settings
from app.core.logging import JsonFormatter


def test_credentials_are_redacted(settings: Settings) -> None:
    assert settings.database_url.get_secret_value() not in repr(settings)


def test_invalid_database_driver() -> None:
    with pytest.raises(ValidationError, match="DATABASE_URL must use"):
        Settings(
            _env_file=None,
            database_url=SecretStr("sqlite:///test.db"),
            redis_url=SecretStr("redis://localhost/0"),
        )


def test_structured_log_allowlist() -> None:
    record = logging.LogRecord("api", logging.INFO, "", 1, "request_completed", (), None)
    record.request_id = "request-123"
    record.password = "never-output-this"
    payload = json.loads(JsonFormatter().format(record))
    assert payload["request_id"] == "request-123"
    assert payload["level"] == "INFO"
    assert "password" not in payload


def test_invalid_redis_url() -> None:
    with pytest.raises(ValidationError, match="REDIS_URL must be") as error:
        Settings(
            _env_file=None,
            database_url=SecretStr("postgresql+psycopg://localhost/test"),
            redis_url=SecretStr("https://private-credential-value.invalid"),
        )
    assert "private-credential-value" not in str(error.value)
