# Product requirements

## Vision and users

Social Intelligence helps Indian D2C brands and digital marketing agencies understand
audience opinions, competitor activity, emerging market topics, content performance,
and actionable marketing opportunities. Brand marketers and agency analysts are the
initial personas. English, Hindi, and code-mixed language support are future research
requirements, not implemented language-model capabilities.

## Task 001 scope

- Responsive, accessible application shell and dashboard landing page.
- Explicitly labeled static demo metrics and Recharts visualization.
- Live API/dependency status with failure state and retry.
- Independently runnable frontend and backend.
- Configuration-driven PostgreSQL/Redis connections and Alembic baseline.
- Containerized local development, optional idle Celery worker, structured backend logs.
- Unit/component tests and setup documentation.

## Acceptance criteria

1. Frontend renders without an API and never presents demo figures as real analytics.
2. Both `/health` and `/api/v1/health` return 200 JSON when the API is running.
3. Readiness endpoints return 503 when either infrastructure dependency fails.
4. Compose starts PostgreSQL and Redis, completes migrations before API startup, and
   binds published ports to loopback only.
5. Configuration contains no committed credentials; absent required credentials fail closed.
6. Pytest and Vitest execute successfully; failures must be resolved or reported accurately.

## Explicit non-goals

No login, tenant management, social ingestion, OAuth, scraping, AI/LLM calls, reports,
dashboards backed by customer data, subscriptions, schedulers, AWS, or microservices.
No production security/compliance certification. Product success metrics and provider
selection will be agreed in later approved tasks.

## Future gates (not implementation authorization)

Before real customer data: identity, tenant isolation, consent and retention policies,
provider permissions, deletion/export mechanisms, threat modeling, and legal review.
