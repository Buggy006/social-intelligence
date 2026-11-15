import logging
from typing import Protocol

from redis import Redis
from sqlalchemy import Engine, text

logger = logging.getLogger(__name__)


class ReadinessProbe(Protocol):
    def check(self) -> dict[str, str]: ...


class InfrastructureProbe:
    def __init__(self, engine: Engine, redis_client: Redis) -> None:
        self.engine = engine
        self.redis_client = redis_client

    def check(self) -> dict[str, str]:
        checks: dict[str, str] = {}
        try:
            with self.engine.connect() as connection:
                connection.execute(text("SELECT 1"))
            checks["postgresql"] = "ok"
        except Exception as error:
            checks["postgresql"] = "unavailable"
            logger.warning("postgresql_check_failed", extra={"error_type": type(error).__name__})
        try:
            checks["redis"] = "ok" if self.redis_client.ping() else "unavailable"
        except Exception as error:
            checks["redis"] = "unavailable"
            logger.warning("redis_check_failed", extra={"error_type": type(error).__name__})
        return checks
