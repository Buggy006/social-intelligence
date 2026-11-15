# Social Intelligence Project Instructions

## Product and repository context

Social Intelligence is an AI-powered marketing intelligence SaaS for D2C brands and digital marketing agencies, starting in India. Preserve the current product scope and existing working behavior; check the README and product documentation before assuming a feature or integration exists.

The repository is a modular monolith:

- `apps/frontend/`: Next.js, TypeScript, Tailwind CSS, and shadcn/ui.
- `apps/backend/`: FastAPI, SQLAlchemy 2.x, Pydantic, and Alembic.
- PostgreSQL is the application database. Redis and Celery are for background processing only when justified by product needs.
- `infra/`: Dockerfiles and Docker Compose configuration.

Keep modules cohesive and communicate through clear internal interfaces. Do not introduce microservices or dependencies without a concrete need.

## Development environment

- Run all project development commands in WSL 2 with Ubuntu 24.04, using Linux Git and Docker CLI.
- Never run project commands in Windows CMD or PowerShell, or use Windows-specific command syntax.
- Use Python 3.12 managed by pyenv and Node.js 22 managed by NVM.
- Create and use a Linux Python virtual environment for backend dependencies; do not install project packages globally.
- Follow the repository's existing dependency lockfiles and package-manager conventions.

## Engineering practices

- Inspect relevant code, tests, and documentation before making changes. Prefer focused changes that fit existing patterns and preserve behavior.
- Add or update automated tests for implemented or changed functionality. Run the relevant checks and report only results actually observed; never claim tests passed without executing them.
- Maintain type safety in Python and TypeScript. Avoid suppressions, untyped escape hatches, and unnecessary casts.
- Use structured logging for operational events. Never hardcode credentials, tokens, or other secrets; use the existing environment/configuration mechanisms and keep local secret files out of version control.
- Document significant architectural decisions in `docs/DECISIONS.md` and keep relevant architecture or development documentation current.
- Avoid unnecessary dependencies and premature infrastructure. Use Redis/Celery only when the workload warrants background processing.

## Common checks

Run commands in WSL from the indicated directory, with the backend virtual environment activated:

```sh
# Backend, from apps/backend
python -m pytest -q
python -m ruff check .
python -m mypy app

# Frontend, from apps/frontend
npm test
npm run typecheck
npm run lint
npm run build
```

Use the narrowest relevant tests and checks for a change; run broader checks when needed. See `docs/DEVELOPMENT_GUIDE.md` for setup, migrations, runtime verification, and troubleshooting, and `docs/ARCHITECTURE.md` and `docs/DECISIONS.md` for design context.
