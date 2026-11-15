# Development guide

## Prerequisites

- Python 3.12; Node.js 24 LTS with npm.
- Docker Engine/Desktop running, Compose v2 (Linux containers on Windows).
- Commands assume the repository root unless stated otherwise.
- Git is useful for version control but no commit or remote is required to run the app.

## Configuration

| File | Consumer | Notes |
| --- | --- | --- |
| Root `.env` | Compose interpolation | Copy root example and set a unique hexadecimal `POSTGRES_PASSWORD` |
| `apps/backend/.env` | Local Python processes | Required `DATABASE_URL`, `REDIS_URL`; ignored by Git |
| `apps/frontend/.env.local` | Local Next.js | Public API origin only; never put secrets in `NEXT_PUBLIC_*` |

Generate a password using a password manager or `python -c "import secrets; print(secrets.token_hex(24))"`.
Compose embeds the password in a PostgreSQL URL, so use the generated hexadecimal value
unchanged. Local backend URL must contain the same password and database/user values.
For other PostgreSQL URLs, percent-encode reserved characters in credentials.

Root and backend environment files are independent. For local Python, use `localhost` as
the database/Redis host; inside Compose, service hosts are `postgres` and `redis`.
`NEXT_PUBLIC_API_URL` is a browser address, not the container hostname `backend`.
It is embedded at build time: rebuild the frontend image when it changes.

## Backend: Windows PowerShell

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -e "apps/backend[dev]"
Copy-Item .env.example .env
Copy-Item apps/backend/.env.example apps/backend/.env
```

Set credentials in both files before continuing:

```powershell
docker compose --env-file .env -f infra/docker-compose.yml up -d postgres redis
Set-Location apps/backend
..\..\.venv\Scripts\alembic.exe upgrade head
..\..\.venv\Scripts\uvicorn.exe app.main:create_app --factory --reload --host 127.0.0.1 --port 8000 --no-access-log
```

## Backend: POSIX shell

```sh
python3.12 -m venv .venv
. .venv/bin/activate
pip install -e 'apps/backend[dev]'
cp .env.example .env
cp apps/backend/.env.example apps/backend/.env
# Edit credentials, then:
docker compose --env-file .env -f infra/docker-compose.yml up -d postgres redis
cd apps/backend
alembic upgrade head
uvicorn app.main:create_app --factory --reload --host 127.0.0.1 --port 8000 --no-access-log
```

## Frontend: separate terminal

From `apps/frontend`, copy `.env.example` to `.env.local` and run:

```sh
npm ci
npm run dev
```

Open http://localhost:3000. A disconnected backend should show `Services unavailable`;
the demo dashboard still renders. Retry checks once services are available.
For a production-mode local build use `npm run build` then `npm start`.
Local commands bind to loopback only. The Docker builder sets `NEXT_OUTPUT=standalone`
and starts the generated server directly; local builds use the standard Next.js server.

## Tests and quality checks

Backend (from `apps/backend`, activated environment or explicit executable path):

```sh
python -m pytest -q
python -m ruff check .
python -m mypy app
```

Coverage includes health aliases, success/failure probes, sanitized errors, request IDs,
CORS rejection, settings validation and structured logs. Tests use injected mocks;
they must not connect to your development database.

Frontend (from `apps/frontend`):

```sh
npm test
npm run typecheck
npm run lint
npm run build
```

Coverage includes shell rendering, demo disclosure, readiness payload validation,
network errors and retry. Rendering tests mock the chart because jsdom does not perform
layout; inspect the real chart in a browser as a separate smoke check.

## Docker verification

```sh
docker compose --env-file .env -f infra/docker-compose.yml config --quiet
docker compose --env-file .env -f infra/docker-compose.yml up --build -d
docker compose --env-file .env -f infra/docker-compose.yml ps -a
docker compose --env-file .env -f infra/docker-compose.yml exec postgres sh -c 'pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB"'
docker compose --env-file .env -f infra/docker-compose.yml exec redis redis-cli ping
curl http://localhost:8000/api/v1/health/ready
```

Expected: healthy services, migration exits 0, Redis returns `PONG`, and readiness
JSON has both checks `ok`. In PowerShell use `Invoke-RestMethod` if `curl` is aliased.
The configuration-only check does not prove images build or services run.

Optional worker:

```sh
docker compose --env-file .env -f infra/docker-compose.yml --profile worker up --build -d
docker compose --env-file .env -f infra/docker-compose.yml exec worker celery -A app.worker:celery_app inspect ping
```

The worker should answer `pong` and has no application tasks. Use Linux containers for
Celery; the project does not depend on native Windows worker support.

## Migrations

Run from `apps/backend` with backend environment values available:

```sh
alembic current
alembic upgrade head
alembic revision --autogenerate -m "describe approved schema change"
```

Add model imports to `alembic/env.py` before autogeneration and inspect every generated
migration. The initial revision intentionally creates no product tables.
`alembic downgrade base` removes baseline history only; future downgrades may destroy data.
Never run destructive migrations against shared data without review and backups.

## Logs and shutdown

Backend stdout is JSON with timestamp, level, event, request ID and timing. Exceptions
emit their class name, not potentially sensitive messages or tracebacks. Uvicorn access
logs are disabled because raw paths and query strings may contain personal data.
Frontend framework logs are retained; no analytics or remote log collector is installed.

```sh
docker compose --env-file .env -f infra/docker-compose.yml logs -f backend
docker compose --env-file .env -f infra/docker-compose.yml --profile worker down
```

Named volumes survive shutdown. Do not add `--volumes` unless you explicitly intend to
delete your local PostgreSQL and Redis data.

## Troubleshooting

- Missing Node/Docker: install the prerequisites; do not report builds or services verified.
- Missing settings: check the working directory and required backend environment variables.
- Database authentication: root/backend password values must agree. Changing `.env` does
  not change the password in an already initialized PostgreSQL volume. Rotate it deliberately.
- CORS failure: frontend origin must exactly match `CORS_ORIGINS` (JSON array).
- Port conflict: stop the conflicting service or change Compose mappings and matching local URLs.
- Startup failure: inspect the migration container before the API; migrations are not hidden in API boot.

This foundation must remain local-only until authentication, tenant isolation and
production operational/security requirements are approved and implemented.

## Initial verification and environment limitations

During Task 001 implementation:

- Backend: 20 Pytest tests passed; Ruff and mypy passed.
- Frontend: 10 Vitest tests passed; TypeScript and ESLint passed; Next.js production build succeeded.
- Browser smoke check: production frontend loaded, demo chart rendered, unavailable-service
  status and retry worked with the backend offline; a 390px viewport had no horizontal overflow.
- `npm audit --omit=dev` reported zero production dependency vulnerabilities at verification time.
- Alembic baseline SQL generation (`upgrade head --sql`) passed without a database.
- Compose YAML parsed and local port bindings/migration ordering were checked statically.
- Docker is not installed in the implementation environment. Image builds, actual
  PostgreSQL/Redis readiness, online migrations and worker startup are **not verified**.
- Windows Application Control blocked the installed psycopg binary DLL. API unit tests
  therefore mock infrastructure construction as well as dependency responses. These tests
  do not prove native PostgreSQL driver availability or end-to-end API startup on this host.
  Use the documented Linux-container path on a Docker-enabled machine; do not disable
  operating-system security controls to run this project.
- Pytest emits an upstream Starlette/HTTPX deprecation warning; all tests still pass.
- npm reported seven moderate development-only advisory entries rooted in the ESLint
  toolchain's transitive `minimatch` dependency. A non-breaking `npm audit fix` did not
  resolve them. No forced major overrides were applied. Recheck upstream updates and
  `npm audit` before release; passing unit tests is not a security audit.

Python dependencies were installed in the ignored root `.venv`. A checksum-verified
portable Node runtime was downloaded into the ignored `.tools` directory without changing
system installations. For this checkout only, from the root in PowerShell:

```powershell
$env:Path = "$PWD\.tools\node-v24.22.3-win-x64;$env:Path"
```

Other machines should use their own Node 24 installation and `npm ci`. Downloaded tooling
and dependency folders are not part of the repository deliverable.
