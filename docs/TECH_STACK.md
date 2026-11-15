# Technology stack

| Layer | Technology | Role |
| --- | --- | --- |
| UI | Next.js 16, React 19, TypeScript 5 | App Router and typed components |
| Styling | Tailwind CSS 4 | PostCSS integration and CSS design tokens |
| Components | shadcn/ui convention, Radix Slot, CVA | Locally owned Button/Card, composable variants |
| Charts | Recharts 3 | Client-side demo conversation chart |
| API | Python 3.12, FastAPI, Pydantic settings | Typed contracts and validated environment configuration |
| Persistence | SQLAlchemy 2, psycopg 3, PostgreSQL 17 | Explicit sessions and relational persistence foundation |
| Migrations | Alembic | Reviewed, versioned schema changes |
| Background work | Celery 5, Redis 7 server | Optional worker and broker, no tasks yet |
| Infrastructure | Docker Compose v2 | Local services, named volumes and health checks |
| Tests | Pytest, HTTPX, Vitest, Testing Library | Dependency-isolated API and UI checks |
| Quality | Ruff, mypy, ESLint, tsc | Linting and type validation |

Node 24 is the recommended frontend runtime and Docker build runtime. Python runtime
is restricted to 3.12 in project metadata. Frontend package resolution is committed via
the npm lockfile; backend dependency ranges remain explicit in `pyproject.toml`.

shadcn/ui is source-owned rather than a runtime component library: `components.json`,
CSS variables, `cn`, and local Button/Card components are configured manually. Additional
components can be installed later using `npx shadcn@latest add <component>` after reviewing
the generated changes. No hosted fonts, analytics trackers or external images are required.

Official references for maintenance:
- https://nextjs.org/docs/app/getting-started/installation
- https://tailwindcss.com/docs/installation/framework-guides/nextjs
- https://ui.shadcn.com/docs/installation/manual
- https://fastapi.tiangolo.com/advanced/events/
- https://docs.sqlalchemy.org/en/20/orm/session_basics.html
- https://alembic.sqlalchemy.org/en/latest/tutorial.html
- https://docs.celeryq.dev/en/stable/
- https://docs.docker.com/compose/

Recheck dependency versions and security advisories before any public release.
