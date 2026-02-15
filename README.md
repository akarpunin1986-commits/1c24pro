# 1C24.PRO — Облачная 1С для бизнеса

> SaaS-сервис облачной аренды 1С:Предприятие с self-service регистрацией

[![CI](https://github.com/YOUR_USERNAME/1c24pro/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/1c24pro/actions/workflows/ci.yml)

## Стек технологий

| Компонент | Технологии |
|-----------|------------|
| **Backend** | Python 3.11, FastAPI, SQLAlchemy 2.0 (async), Alembic, Pydantic v2 |
| **Frontend** | React 18, TypeScript (strict), Vite 5, Tailwind CSS 3 |
| **База данных** | PostgreSQL 16, Redis 7 |
| **Тесты** | pytest + httpx (backend), Vitest + Testing Library (frontend) |
| **Линтинг** | ruff (Python), ESLint + Prettier (TypeScript) |
| **CI/CD** | GitHub Actions |
| **Инфраструктура** | Docker, Docker Compose, Nginx, Let's Encrypt |

## Быстрый старт

### Предварительные требования

- [Docker](https://docs.docker.com/get-docker/) и Docker Compose
- [Python 3.11+](https://www.python.org/downloads/)
- [Node.js 20+](https://nodejs.org/)
- [Make](https://www.gnu.org/software/make/) (опционально, но рекомендуется)

### 1. Клонировать репозиторий

```bash
git clone https://github.com/YOUR_USERNAME/1c24pro.git
cd 1c24pro
```

### 2. Настроить переменные окружения

```bash
cp .env.example .env
# Отредактируйте .env — заполните API-ключи (DaData, SMS.ru и т.д.)
```

### 3. Запустить инфраструктуру (PostgreSQL + Redis)

```bash
docker-compose up -d
# или
make dev-infra
```

### 4. Запустить Backend

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate

pip install -r requirements-dev.txt

# Применить миграции БД
alembic upgrade head

# Запустить сервер
uvicorn app.main:app --reload --port 8000
```

Backend будет доступен на: http://localhost:8000
Swagger документация: http://localhost:8000/docs

### 5. Запустить Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend будет доступен на: http://localhost:5173

### 6. Или запустить всё одной командой (через Makefile)

```bash
make dev
```

## Команды (Makefile)

| Команда | Описание |
|---------|----------|
| `make dev` | Запустить всё (Postgres + Redis + Backend + Frontend) |
| `make dev-infra` | Запустить только Postgres + Redis |
| `make dev-backend` | Запустить только backend (FastAPI) |
| `make dev-frontend` | Запустить только frontend (Vite) |
| `make test` | Запустить все тесты |
| `make test-backend` | Тесты backend (pytest) |
| `make test-frontend` | Тесты frontend (Vitest) |
| `make lint` | Запустить все линтеры |
| `make lint-fix` | Автоматически исправить ошибки линтинга |
| `make migrate` | Применить миграции БД |
| `make migrate-create MSG="описание"` | Создать новую миграцию |
| `make build` | Собрать Docker-образы |
| `make clean` | Очистить сгенерированные файлы |
| `make help` | Показать все доступные команды |

## Структура проекта

```
1c24pro/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── main.py          # Точка входа FastAPI
│   │   ├── config.py        # Конфигурация из .env
│   │   ├── database.py      # Async SQLAlchemy engine
│   │   ├── models.py        # Модели БД (Organization, User, etc.)
│   │   ├── schemas.py       # Pydantic v2 schemas
│   │   ├── auth.py          # JWT создание/проверка
│   │   ├── dependencies.py  # FastAPI зависимости
│   │   ├── exceptions.py    # Кастомные HTTP exceptions
│   │   ├── constants.py     # Именованные константы
│   │   ├── routes/          # API endpoints
│   │   └── services/        # Внешние сервисы (DaData, SMS, etc.)
│   ├── tests/               # Тесты (pytest)
│   ├── alembic/             # Миграции БД
│   ├── requirements.txt     # Production зависимости
│   ├── requirements-dev.txt # Dev зависимости
│   └── Dockerfile
│
├── frontend/                # React frontend
│   ├── src/
│   │   ├── components/      # React компоненты
│   │   │   ├── layout/      # Navbar, Footer, TopBar
│   │   │   ├── sections/    # Секции лендинга
│   │   │   ├── dashboard/   # Компоненты ЛК
│   │   │   ├── admin/       # Компоненты админки
│   │   │   ├── ui/          # Переиспользуемые UI
│   │   │   └── forms/       # Формы (телефон, OTP, ИНН)
│   │   ├── pages/           # Страницы
│   │   ├── hooks/           # Кастомные React hooks
│   │   ├── api/             # Типизированный API клиент
│   │   ├── types/           # TypeScript типы
│   │   ├── constants/       # Константы (тарифы, цвета, FAQ)
│   │   └── utils/           # Утилиты
│   ├── package.json
│   └── Dockerfile
│
├── deploy/                  # Production deployment
│   ├── docker-compose.prod.yml
│   └── nginx.conf
│
├── .github/workflows/ci.yml # CI/CD pipeline
├── docker-compose.yml       # Development (Postgres + Redis)
├── Makefile                 # Команды разработки
├── .env.example             # Шаблон переменных окружения
├── .gitignore
├── .cursorrules             # Правила для AI
├── ARCHITECTURE.md          # Карта проекта
├── CHANGELOG.md             # Лог изменений
└── TODO.md                  # Текущие задачи
```

## API Documentation

После запуска backend, документация доступна:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Основные эндпоинты

| Метод | Путь | Описание |
|-------|------|----------|
| POST | `/api/v1/auth/send-code` | Отправить SMS-код |
| POST | `/api/v1/auth/verify-code` | Проверить код |
| POST | `/api/v1/auth/complete-registration` | Завершить регистрацию |
| POST | `/api/v1/inn/lookup` | Поиск организации по ИНН |
| POST | `/api/v1/uploads/init` | Начать загрузку базы |
| GET | `/api/v1/me` | Профиль текущего пользователя |
| GET | `/api/v1/me/databases` | Список баз |
| GET | `/health` | Health check |

## Тестирование

```bash
# Backend тесты
cd backend && pytest -v

# Frontend тесты
cd frontend && npm run test

# Все тесты
make test
```

## Линтинг

```bash
# Проверка
make lint

# Автоисправление
make lint-fix
```

## Деплой на VPS

```bash
# 1. На сервере
ssh root@your-server
cd /opt
git clone https://github.com/YOUR_USERNAME/1c24pro.git app
cd app

# 2. Настроить .env
cp .env.example .env
nano .env  # заполнить production-ключи

# 3. Запустить
cd deploy
docker-compose -f docker-compose.prod.yml up -d --build

# 4. Миграции
docker-compose -f docker-compose.prod.yml exec backend alembic upgrade head

# 5. Проверить
curl https://1c24.pro/health
```

## Git Workflow

- `main` — продакшн (только через merge из develop)
- `develop` — интеграционная ветка
- `feature/*` — одна фича = одна ветка
- `fix/*` — багфиксы

### Формат коммитов (Conventional Commits)

```
feat(auth): implement OTP verification
fix(frontend): fix pricing calculator discount
refactor(backend): extract DaData to service layer
test(auth): add registration endpoint tests
docs: update ARCHITECTURE.md
```

## Лицензия

Proprietary. All rights reserved.
