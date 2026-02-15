# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- Project initialization: monorepo structure (backend + frontend)
- Backend: FastAPI skeleton with all routes (stubs), models, schemas
- Backend: Alembic for database migrations
- Backend: pytest + httpx test setup
- Backend: ruff linter configuration
- Frontend: React + TypeScript + Vite + Tailwind CSS
- Frontend: ESLint (strict) + Prettier
- Frontend: All pages and components (stubs)
- Docker Compose: PostgreSQL 16 + Redis 7 for local dev
- Docker Compose: Production setup with nginx, SSL, certbot
- CI/CD: GitHub Actions (lint + test + build)
- Makefile: dev, test, lint, build, migrate commands
