# Architecture decisions

## ADR 001: One repository, independently runnable applications
Accepted for Task 001. `apps/frontend` and `apps/backend` own their dependencies,
configuration and test runners. Shared infrastructure is in `infra`. No orchestration
framework or workspace package manager is needed for two applications.

## ADR 002: Modular monolith, not microservices
Accepted. One backend deployable plus an optional worker from the same image. Organize
future capabilities by module; avoid network boundaries until operational need is proven.

## ADR 003: Explicit migrations, no premature product schema
Accepted. SQLAlchemy declarative base and Alembic baseline only. No startup `create_all`.
The Compose migration process completes before backend/worker startup. Future migrations
require manual review and rollback consideration.

## ADR 004: Liveness and readiness are separate
Accepted. Required health routes remain useful when infrastructure is down. Separate
readiness routes query dependencies and return 503 on failure. Unit tests inject probes;
container smoke checks remain necessary to prove actual connectivity.

## ADR 005: Static demo dashboard; real infrastructure status
Accepted. Demo metrics are visually disclosed and never persisted. Only the status widget
calls the backend. Missing API or infrastructure cannot break dashboard rendering.

## ADR 006: Local security posture
Accepted for development only. Loopback port binding, non-root app containers, environment
secrets, sanitized logs and explicit CORS. Authentication, authorization and production
hardening are not implied by this foundation. No customer data is allowed yet.

## ADR 007: Optional Celery worker
Accepted. JSON-only messages and UTC; no tasks, scheduler or result store. Opt-in Compose
profile avoids wasting resources until background processing is approved.

## ADR 008: Tailwind v4 and manually configured shadcn/ui
Accepted. CSS-first tokens, local Button/Card source, aliases and `components.json`.
No Tailwind v3 configuration file or unnecessary UI framework wrapper.
