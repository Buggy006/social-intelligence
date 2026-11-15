FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PIP_NO_CACHE_DIR=1
WORKDIR /app
RUN groupadd --system app && useradd --system --gid app app
COPY apps/backend/pyproject.toml ./
COPY apps/backend/app ./app
RUN pip install .
COPY apps/backend/alembic.ini ./
COPY apps/backend/alembic ./alembic
USER app
EXPOSE 8000
CMD ["uvicorn", "app.main:create_app", "--factory", "--host", "0.0.0.0", "--port", "8000", "--no-access-log"]
