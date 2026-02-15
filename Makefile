.PHONY: dev dev-backend dev-frontend test test-backend test-frontend lint lint-backend lint-frontend build clean migrate help

# ═══════════════════════════════════════
# 1C24.PRO — Development Commands
# ═══════════════════════════════════════

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# ── Development ──────────────────────

dev: ## Start all services (Postgres + Redis + Backend + Frontend)
	docker-compose up -d
	@echo "🐘 Postgres: localhost:5432"
	@echo "🔴 Redis: localhost:6379"
	@echo "Starting backend and frontend..."
	@$(MAKE) -j2 dev-backend dev-frontend

dev-backend: ## Start backend (FastAPI) with hot reload
	cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

dev-frontend: ## Start frontend (Vite) dev server
	cd frontend && npm run dev

dev-infra: ## Start only Postgres + Redis
	docker-compose up -d

# ── Testing ──────────────────────────

test: test-backend test-frontend ## Run all tests

test-backend: ## Run backend tests
	cd backend && pytest -v --tb=short

test-frontend: ## Run frontend tests
	cd frontend && npm run test

test-coverage: ## Run tests with coverage
	cd backend && pytest -v --cov=app --cov-report=html
	cd frontend && npm run test:coverage

# ── Linting ──────────────────────────

lint: lint-backend lint-frontend ## Run all linters

lint-backend: ## Lint backend (ruff)
	cd backend && ruff check .
	cd backend && ruff format --check .

lint-frontend: ## Lint frontend (ESLint + Prettier)
	cd frontend && npm run lint
	cd frontend && npm run format:check

lint-fix: ## Fix lint errors automatically
	cd backend && ruff check --fix .
	cd backend && ruff format .
	cd frontend && npm run lint:fix
	cd frontend && npm run format

# ── Database ─────────────────────────

migrate: ## Apply database migrations
	cd backend && alembic upgrade head

migrate-create: ## Create new migration (usage: make migrate-create MSG="description")
	cd backend && alembic revision --autogenerate -m "$(MSG)"

migrate-down: ## Rollback last migration
	cd backend && alembic downgrade -1

# ── Build ────────────────────────────

build: ## Build Docker images
	docker build -t 1c24pro-backend ./backend
	docker build -t 1c24pro-frontend ./frontend

build-frontend: ## Build frontend for production
	cd frontend && npm run build

# ── Cleanup ──────────────────────────

clean: ## Clean generated files
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name .pytest_cache -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name .ruff_cache -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name node_modules -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name dist -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name htmlcov -exec rm -rf {} + 2>/dev/null || true

# ── Infrastructure ───────────────────

docker-up: ## Start all Docker services
	docker-compose up -d

docker-down: ## Stop all Docker services
	docker-compose down

docker-logs: ## View Docker logs
	docker-compose logs -f

deploy: ## Deploy to production
	cd deploy && docker-compose -f docker-compose.prod.yml up -d --build
	cd deploy && docker-compose -f docker-compose.prod.yml exec backend alembic upgrade head
