# Architecture

## Modular monolith

```text
Browser -> Next.js application shell
Browser -> FastAPI /api/v1/health/ready -> PostgreSQL (SELECT 1)
                                     -> Redis (PING)
Alembic one-shot process -> PostgreSQL migration history
Optional Celery worker -> Redis broker (no application tasks yet)
```

The API and worker share one Python codebase and configuration. This is not a
microservice deployment. Next.js owns presentation; FastAPI will own domain logic.
Future business capabilities belong in `app/modules/<capability>/` with routers,
Pydantic schemas and service functions. Shared runtime configuration belongs in
`core/`; database session machinery belongs in `db/`.

## API contracts

| Endpoint | Purpose | Responses |
| --- | --- | --- |
| `GET /health` | Liveness, no external calls | 200 |
| `GET /api/v1/health` | Versioned liveness | 200 |
| `GET /health/ready` | PostgreSQL and Redis readiness | 200 / 503 |
| `GET /api/v1/health/ready` | Versioned readiness used by frontend | 200 / 503 |

Health JSON: `status` (`ok` or `degraded`), `service`, and `checks`.
Each request gets a server-generated `X-Request-ID`. Unhandled errors return a generic
500 body and request ID. Validation errors are sanitized. Readiness failures expose only
dependency names and availability, not exceptions or credentials.

Lifespan creates a bounded SQLAlchemy connection pool and Redis client, then closes them
at shutdown. Synchronous dependency probes run in FastAPI's thread pool. Connection and
query timeouts bound dependency checks, although driver retries can add latency. Migration
execution is separate from API startup to avoid competing schema changes across replicas.

## Database boundary

Task 001 has **no business entities or customer tables**. The declarative base defines
deterministic constraint names. Revision `0001_baseline` establishes history without
inventing a tenant/customer schema; Alembic manages its own `alembic_version` table.
Future model modules must be imported in Alembic `env.py` for autogeneration.
Sessions are request-scoped and roll back on errors; future write services must commit
explicitly. API import does not connect to the database or create tables.

Redis is a local-only broker with append-only persistence. Celery is configured to
accept JSON only, use UTC, and discard task results. The worker is opt-in until tasks exist.

## Security boundaries and known gaps

- Local-only deployment: loopback ports, non-root application containers, no embedded secrets.
- Required connection URLs use masked settings fields; logs omit bodies, paths, queries,
  authorization headers, tokens, raw exception messages, and tracebacks.
- Exact development CORS origin allowlist. CORS is not authentication.
- PostgreSQL initialization user is a local development role, not a production least-privilege role.
- Redis is unauthenticated on a local container network; it must not be exposed publicly.
- No authentication or tenant enforcement exists: never load real customer data or deploy publicly.
- Future production gates: TLS, identity/RBAC, tenant-scoped queries, secret rotation,
  rate limiting, backups/restore drills, dependency scanning, audit events and secure observability.
- India-focused privacy review must assess applicable privacy rules, consent, retention,
  deletion, cross-border processing and vendor contracts before collecting personal data.
  These are engineering review gates, not a legal determination.
- Future social content is untrusted input; any AI enrichment requires prompt-injection
  defenses, output validation, provenance, and human review. No such integration exists here.
