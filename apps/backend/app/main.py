import logging
from collections.abc import AsyncIterator, Awaitable, Callable
from contextlib import asynccontextmanager
from time import perf_counter
from uuid import uuid4

from fastapi import FastAPI, Request, Response
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from redis import Redis
from redis.backoff import NoBackoff
from redis.retry import Retry
from sqlalchemy.orm import sessionmaker

from app.core.config import Settings, get_settings
from app.core.logging import configure_logging
from app.db.session import build_engine
from app.modules.health.router import router
from app.modules.health.service import InfrastructureProbe

logger = logging.getLogger(__name__)


def create_app(settings: Settings | None = None) -> FastAPI:
    settings = settings or get_settings()
    configure_logging(settings.log_level)

    @asynccontextmanager
    async def lifespan(application: FastAPI) -> AsyncIterator[None]:
        engine = build_engine(settings)
        redis_client = Redis.from_url(
            settings.redis_url.get_secret_value(),
            socket_connect_timeout=3,
            socket_timeout=3,
            retry_on_timeout=False,
            retry=Retry(NoBackoff(), 0),
        )
        application.state.session_factory = sessionmaker(engine, expire_on_commit=False)
        application.state.readiness_probe = InfrastructureProbe(engine, redis_client)
        logger.info("application_started")
        try:
            yield
        finally:
            redis_client.close()
            engine.dispose()
            logger.info("application_stopped")

    application = FastAPI(title=settings.app_name, version="0.1.0", lifespan=lifespan)
    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_methods=["GET"],
        allow_headers=["Content-Type"],
        expose_headers=["X-Request-ID"],
    )

    @application.middleware("http")
    async def request_logging(
        request: Request, call_next: Callable[[Request], Awaitable[Response]]
    ) -> Response:
        request_id = str(uuid4())
        request.state.request_id = request_id
        started = perf_counter()
        try:
            response = await call_next(request)
        except Exception as error:
            logger.error(
                "unhandled_request_error",
                extra={"request_id": request_id, "error_type": type(error).__name__},
            )
            response = JSONResponse(
                status_code=500,
                content={"detail": "Internal server error", "request_id": request_id},
            )
        response.headers["X-Request-ID"] = request_id
        logger.info(
            "request_completed",
            extra={
                "request_id": request_id,
                "method": request.method,
                "status_code": response.status_code,
                "duration_ms": round((perf_counter() - started) * 1000, 2),
            },
        )
        return response

    @application.exception_handler(RequestValidationError)
    async def validation_error(request: Request, error: RequestValidationError) -> JSONResponse:
        return JSONResponse(
            status_code=422,
            content={"detail": "Invalid request", "request_id": request.state.request_id},
        )

    application.include_router(router)
    application.include_router(router, prefix="/api/v1")
    return application
