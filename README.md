# Social Intelligence

India-first marketing intelligence for D2C brands and digital marketing agencies.
**Task 001: project foundation only.** The dashboard uses explicitly labeled demo data;
there are no social integrations, accounts, AI analysis, billing, or customer data.
This unauthenticated local preview is **not production-ready**.

## Quick start: Docker Compose

Prerequisites: Docker Engine/Desktop with Compose v2. Python and Node are not needed on
the host for this path. Run all commands from the repository root.

1. Copy `.env.example` to `.env` (PowerShell: `Copy-Item .env.example .env`).
2. Generate a local password with `python -c "import secrets; print(secrets.token_hex(24))"`
   or a password manager. Set `POSTGRES_PASSWORD` in `.env` to that value. Use hexadecimal
   characters here because Compose embeds this password into a database URL. Never commit it.
3. Start the application:

```sh
docker compose --env-file .env -f infra/docker-compose.yml up --build -d
docker compose --env-file .env -f infra/docker-compose.yml ps -a
```

Open the frontend at http://localhost:3000 and API docs at http://localhost:8000/docs.
The migration container should exit with code 0; frontend/backend/PostgreSQL/Redis should
be healthy. The dashboard service indicator performs a real readiness check.

```sh
curl http://localhost:8000/health
curl http://localhost:8000/api/v1/health
curl http://localhost:8000/api/v1/health/ready
```

Liveness returns 200 when the API process runs. Readiness returns 200 only when PostgreSQL
and Redis respond, otherwise 503. A green liveness check does not prove dependencies work.

The optional Celery worker has no product tasks yet:

```sh
docker compose --env-file .env -f infra/docker-compose.yml --profile worker up --build -d
```

## Independent development

- Backend: Python **3.12**, virtual environment, `pip install -e "apps/backend[dev]"`.
  Copy `apps/backend/.env.example` to `apps/backend/.env`, set the database password,
  then from `apps/backend` run `alembic upgrade head` and
  `uvicorn app.main:create_app --factory --reload --host 127.0.0.1 --port 8000 --no-access-log`.
- Frontend: Node **24 LTS** recommended, from `apps/frontend` run `npm ci`, copy
  `.env.example` to `.env.local`, then `npm run dev`. The dashboard runs without the backend.
- Infrastructure only: `docker compose --env-file .env -f infra/docker-compose.yml up -d postgres redis`.

See [the development guide](docs/DEVELOPMENT_GUIDE.md) for complete Windows and POSIX steps,
tests, migrations, troubleshooting, and shutdown instructions.

## Automated checks

```sh
# From apps/backend with the virtual environment activated
python -m pytest -q
python -m ruff check .
python -m mypy app

# From apps/frontend
npm test
npm run typecheck
npm run lint
npm run build
```

Unit tests do not require real PostgreSQL/Redis. Runtime container verification is a
separate check; do not treat mocked readiness tests as infrastructure integration tests.
Frontend dependencies are resolved in `package-lock.json`; use `npm ci`.
Python dependency ranges are in `pyproject.toml`; a cross-platform lock is deferred.

## Repository

```text
apps/backend/     FastAPI modular monolith, Alembic, Pytest
apps/frontend/    Next.js App Router, TypeScript, Tailwind, shadcn/ui, Recharts, Vitest
infra/           Dockerfiles and Compose configuration
docs/            Product and engineering documentation
```

## Documentation

- [PRD](docs/PRD.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Technology stack](docs/TECH_STACK.md)
- [Development guide](docs/DEVELOPMENT_GUIDE.md)
- [Engineering decisions](docs/DECISIONS.md)
