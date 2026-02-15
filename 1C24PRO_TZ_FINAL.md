# 1C24.PRO — Техническое задание v4.0 (ФИНАЛЬНОЕ)

> Облачная 1С для бизнеса | Production-Grade Specification
> Дата: 15.02.2026 | Версия: 4.0 FINAL
> Содержит ВСЁ: user story, мультиюзер, оплату, уведомления, архитектуру

---

## 0. Инструкции для Cursor AI

### 0.1 .cursorrules (положить в корень проекта)

```
# ═══ PROJECT: 1C24.PRO ═══
# SaaS облачная 1С | FastAPI + React + TypeScript

## CRITICAL RULES
- НИКОГДА не удалять и не перезаписывать существующий рабочий код без явного запроса
- ВСЕГДА создавать новый файл или ветку, если не уверен
- Перед изменением файла — ПРОЧИТАЙ его целиком
- НЕ ВЫДУМЫВАЙ API endpoints или модели — используй ТОЛЬКО то, что описано в TZ.md
- При ошибке — НЕ ПЕРЕПИСЫВАЙ всё, а найди и исправь конкретную проблему
- ВСЕГДА добавляй type hints в Python и TypeScript types
- НИКАКИХ any в TypeScript
- КАЖДАЯ функция должна иметь docstring/JSDoc

## VERSION CONTROL
- Перед каждым значимым изменением — git commit с описательным сообщением
- Формат коммитов: feat|fix|refactor|docs|test(scope): описание
- Примеры: "feat(auth): add OTP verification endpoint", "fix(frontend): fix pricing calculator discount logic"
- НЕ коммитить .env, node_modules, __pycache__, .venv
- Работать в feature-ветках: feature/auth, feature/landing, feature/pricing

## ARCHITECTURE
- Backend: FastAPI, async everywhere, pydantic v2 schemas
- Frontend: React + Vite + TypeScript + Tailwind
- Auth: PASSWORDLESS (телефон + SMS-код, без пароля)
  - /auth/send-code → /auth/verify-code → (новый?) /auth/complete-registration
  - JWT access 60 мин + refresh 30 дней
- Upload: CHUNKED (5 МБ chunks, resume, до 50 ГБ)
- Модели: Organization, User, OTPLog, Upload, Database
- API клиент — ТОЛЬКО через типизированные функции в api/
- Состояние — React hooks (useState, useEffect), НЕ redux
- Стили — Tailwind utility classes, НЕ inline styles
- Страницы: LandingPage, AuthPage, DashboardPage, AdminPage

## TESTING
- Backend: pytest + httpx AsyncClient для каждого endpoint
- Frontend: минимум — проверка рендера каждого компонента
- Перед PR: все тесты должны проходить

## FILE STRUCTURE
- НЕ создавать файлы за пределами установленной структуры
- Компоненты — по одному на файл
- Общие типы — в shared/types.ts
- API функции — в api/ директории
- Env переменные — ТОЛЬКО через config.py (backend) или import.meta.env (frontend)

## QUALITY
- Линтинг: ruff (Python), eslint + prettier (TypeScript)
- Максимальная длина функции: 50 строк
- Максимальная длина файла: 300 строк (разбивать на модули)
- DRY: повторяющийся код → в утилиты
- Нет магических чисел — ТОЛЬКО именованные константы
```

### 0.2 Контроль памяти Cursor

**Проблема:** Cursor теряет контекст на длинных сессиях, начинает «забывать» архитектуру и дублировать код.

**Решение — система якорных файлов:**

```
1c24pro/
  TZ.md                    ← ЭТОТ ДОКУМЕНТ (главный источник правды)
  .cursorrules              ← правила поведения AI
  ARCHITECTURE.md           ← краткая карта проекта (обновлять!)
  CHANGELOG.md              ← лог всех изменений
  TODO.md                   ← текущие задачи с приоритетами
```

**ARCHITECTURE.md** — обновлять после каждой сессии:
```markdown
# Architecture Map (обновлено: DD.MM.YYYY)

## Готово ✅
- [ ] POST /api/v1/inn/lookup
- [ ] ...

## В работе 🔄
- [ ] ...

## Не начато ⬜
- [ ] ...

## Известные проблемы
- ...
```

**Правило:** В начале КАЖДОЙ новой сессии с Cursor говорить:
> «Прочитай TZ.md, .cursorrules, ARCHITECTURE.md и CHANGELOG.md перед началом работы»

---

## 1. Обзор проекта

- **Название:** 1C24.PRO
- **Домен:** 1c24.pro
- **Суть:** SaaS-сервис облачной аренды 1С:Предприятие с self-service регистрацией
- **ЦА:** ИП, малый и средний бизнес в России

### Ключевые преимущества
- Загрузка SQL .bak напрямую (единственные на рынке)
- Автозаполнение по ИНН из ЕГРЮЛ через DaData
- Self-service за ~10 минут (без менеджеров)
- Конфигуратор через RDP бесплатно на всех тарифах
- 67 дней на решение (30 тест + 7 read-only + 30 хранение)
- Цены от 690 ₽/мес за пользователя

### Инфраструктура
- SQL Server: 172.10.10.38 (768 ГБ RAM, 56 ядер)
- Apache: 1c24.pro:15009
- Система «1C Publisher & Updater»

---

## 2. User Story — полный путь клиента

### 2.1 Единая точка входа (Passwordless Auth)

**Принцип:** Нет пароля. Только телефон + SMS-код. Email НЕ обязателен при регистрации — запрашиваем позже в ЛК.

```
┌─────────────────────────────────────────────────────┐
│  Шаг 1: Ввод телефона                               │
│  [+7 (___) ___-__-__]  [Получить код →]             │
│                                                       │
│  Шаг 2: Ввод SMS-кода                                │
│  [_ _ _ _ _ _]  Код отправлен на +7***45             │
│  Не пришёл? [Отправить повторно] через 58 сек        │
│                                                       │
│  ─── Развилка ───                                    │
│                                                       │
│  ЕСЛИ телефон НЕ найден (новый клиент):              │
│    Шаг 3: Только ИНН                                 │
│    [ИНН] → DaData автозаполнение                     │
│    [✓] Принимаю оферту                               │
│    [Создать аккаунт →]                               │
│    → Organization + User (trial 30 дней)             │
│    → redirect в ЛК                                    │
│    → в ЛК баннер: «Укажите email для получения       │
│      ссылок и документов»                             │
│                                                       │
│  ЕСЛИ телефон НАЙДЕН (существующий клиент):           │
│    → сразу redirect в ЛК                              │
└─────────────────────────────────────────────────────┘
```

### 2.2 API Flow — Вход / Регистрация

```
POST /api/v1/auth/send-code    {phone: "+7..."}
  → генерирует OTP → Redis (TTL 5 мин) → SMS.ru
  → {sent: true, is_new_user: bool}

POST /api/v1/auth/verify-code  {phone: "+7...", code: "123456"}
  → проверяет код в Redis
  → ЕСЛИ пользователь существует:
      → JWT tokens + {needs_registration: false}
  → ЕСЛИ НЕ существует:
      → temp_token + {needs_registration: true}

POST /api/v1/auth/complete-registration  {inn, referral_code?}
  → Header: Authorization: Bearer <temp_token>
  → DaData → Organization (+ slug для имени базы)
  → User (owner, trial 30 дней, email = null)
  → JWT tokens

POST /api/v1/inn/lookup  {inn}
  → DaData → OrganizationResponse (для превью на фронте)
```

### 2.3 Личный кабинет (MVP)

```
┌──────────────────────────────────────────────────────┐
│  1C24.PRO                            [Профиль] [Выйти]
│  ООО «Рассвет» (ИНН 7707083893)                     │
│  Тариф: Тестовый | Осталось: 24 дня                  │
├──────────────────────────────────────────────────────┤
│                                                        │
│  ⚠️ Укажите email, чтобы получать ссылки и документы  │
│  [email@_______________]  [Сохранить]                 │
│                                                        │
│  📊 Мои базы                                          │
│  ┌────────────────────────────────────────────┐       │
│  │ Бухгалтерия 3.0         🟢 Работает        │       │
│  │ Имя базы: rassvet_bp30_1                   │       │
│  │ Веб:  https://1c24.pro:15009/rassvet_bp30_1│       │
│  │ RDP:  [Скачать .rdp файл]                  │       │
│  │ Размер: 2.4 ГБ | Бэкап: сегодня 04:00     │       │
│  └────────────────────────────────────────────┘       │
│  ┌────────────────────────────────────────────┐       │
│  │ ЗУП 3.1                 🟡 Разворачиваем   │       │
│  │ Ваша база загружена, мы её разворачиваем.  │       │
│  │ Обычно это занимает 1-2 часа.              │       │
│  │ Уведомим по email / SMS когда будет готово. │       │
│  └────────────────────────────────────────────┘       │
│                                                        │
│  📤 Загрузить новую базу                              │
│  Шаг 1: Выберите конфигурацию                         │
│  [Бухгалтерия 3.0 ▼]                                 │
│  Шаг 2: Загрузите файл                                │
│  [Перетащите .dt или .bak сюда]                       │
│  Макс: 50 ГБ | Поддержка: .dt, .bak                  │
│                                                        │
│  💳 Оплата                                            │
│  Статус: Тестовый период (бесплатно)                  │
│  [Выбрать тариф]                                      │
│                                                        │
│  👤 Профиль                                           │
│  Телефон: +7 (999) 123-45-67  ✅                      │
│  Email: [не указан — укажите!]                         │
│  Организация: ООО «Рассвет»                           │
│  Реферальный код: ABC12DEF [Копировать]               │
└──────────────────────────────────────────────────────┘
```

### 2.4 Полный путь: от регистрации до работы в 1С

```
ЭТАП 1 — РЕГИСТРАЦИЯ (2 минуты)
═══════════════════════════════
Лендинг → [Попробовать бесплатно]
→ Ввод телефона → SMS-код → Ввод ИНН → DaData → Оферта
→ Аккаунт создан, trial 30 дней
→ Redirect в ЛК
→ Баннер: «Укажите email»

ЭТАП 2 — ЗАГРУЗКА БАЗЫ (5-10 минут)
═══════════════════════════════════
В ЛК → «Загрузить новую базу»
→ Шаг 1: Выбор конфигурации из списка (bp30, zup31, ut11...)
→ Шаг 2: Drag & drop файла .dt или .bak
→ Chunked upload (5 МБ chunks, прогресс-бар, resume)
→ Файл сохраняется: /uploads/{org_id}/{upload_id}/{filename}
→ Запись Upload: {org_id, user_id, config_code, filename, status: "uploaded"}
→ Автогенерация db_name: rassvet_bp30_1
→ Уведомление админу: email + Telegram

ЭТАП 3 — РАЗВОРАЧИВАНИЕ (1-4 часа, вручную на MVP)
═══════════════════════════════════════════════
Админ видит в админке:
  «Новая загрузка: ООО Рассвет | Бухгалтерия 3.0 | 2.4 ГБ»
  Путь: /uploads/{org_id}/{upload_id}/buh_rassvet.bak
  Имя базы: rassvet_bp30_1

Админ вручную:
  1. Забирает файл
  2. RESTORE/загрузка на SQL Server как [rassvet_bp30_1]
  3. Регистрирует в кластере 1С
  4. Публикует через Apache
  5. В админке заполняет:
     - Web URL: https://1c24.pro:15009/rassvet_bp30_1
     - RDP: ссылка на .rdp
     - Статус: ✅ Активна
  6. Нажимает [Сохранить и уведомить клиента]

ЭТАП 4 — УВЕДОМЛЕНИЕ КЛИЕНТА
═══════════════════════════════
Автоматически при смене статуса на «active»:

  ЕСЛИ email указан:
    → Email: «Ваша база Бухгалтерия 3.0 готова!
      Веб: https://1c24.pro:15009/rassvet_bp30_1
      RDP: [ссылка]
      Также доступно в Личном кабинете.»
    → SMS: «1C24.PRO: Ваша база готова! Ссылки в email и ЛК.»

  ЕСЛИ email НЕ указан:
    → SMS: «1C24.PRO: Ваша база готова! Зайдите в ЛК: 1c24.pro/dashboard»
    → В ЛК: баннер «Укажите email, чтобы получать ссылки и документы»

  ВСЕГДА:
    → В ЛК: карточка базы меняется 🟡→🟢, появляются ссылки

ЭТАП 5 — РАБОТА
═══════════════
Клиент открывает 1С:
  - Через браузер: https://1c24.pro:15009/rassvet_bp30_1
  - Через RDP: скачивает .rdp файл из ЛК
```

### 2.5 Загрузка базы (Chunked Upload) — техническая схема

```
Фронт:                              Бэкенд:

  [Выбрал: Бухгалтерия 3.0]
  [Выбрал файл: buh.bak, 2.4 ГБ]
  │
  ├─ POST /uploads/init ──────────→  Создаёт Upload запись:
  │  {filename, size, config_code}    upload_id, org_id, config_code
  │                                   db_name = generate_db_name()
  │                                   Папка: /uploads/{org_id}/{upload_id}/
  │  ←────────── {upload_id, chunk_size: 5MB, chunks_expected: 477}
  │
  ├─ PUT /uploads/{id}/chunk/0 ───→  Сохраняет chunk
  ├─ PUT /uploads/{id}/chunk/1 ───→  ...
  │  [════████████░░░░░░ 48%]         (прогресс)
  │  ... (если обрыв: GET /status → resume)
  ├─ PUT /uploads/{id}/chunk/N ───→  Последний chunk
  │
  ├─ POST /uploads/{id}/complete ─→  Склеивает chunks
  │                                   Проверяет размер / целостность
  │                                   status: "uploaded"
  │                                   → Email + Telegram админу:
  │                                     «Загрузка от ООО Рассвет,
  │                                      Бухгалтерия 3.0, 2.4 ГБ»
  │
  │  Клиент видит в ЛК:
  │  🟡 «Бухгалтерия 3.0 — загружена, ожидает разворачивания»
```

### 2.6 Админ-панель (MVP)

```
┌──────────────────────────────────────────────────┐
│  АДМИНКА 1C24.PRO                                │
│                                                    │
│  📥 Очередь загрузок (2 новых)                    │
│  ┌──────────────────────────────────────────┐     │
│  │ 🟡 ООО «Рассвет»                         │     │
│  │ Конфигурация: Бухгалтерия 3.0             │     │
│  │ Файл: buh_rassvet.bak (2.4 ГБ)           │     │
│  │ Загружен: 15.02.2026 19:30                │     │
│  │ db_name: rassvet_bp30_1                   │     │
│  │ Путь: /uploads/org_abc/upl_123/           │     │
│  │                                            │     │
│  │ Статус: [Загружена ▼] → Развёрнута        │     │
│  │ Web URL:  [https://1c24.pro:15009/___]    │     │
│  │ RDP URL:  [________________________]      │     │
│  │ Заметки:  [________________________]      │     │
│  │                                            │     │
│  │ [💾 Сохранить] [📨 Сохранить и уведомить] │     │
│  └──────────────────────────────────────────┘     │
│                                                    │
│  👥 Клиенты без email (1)                         │
│  │ +7***45 | ООО «Рассвет» | email: ❌            │
│                                                    │
│  📊 Статистика                                    │
│  │ Регистраций: 12 | На тесте: 8 | Оплачено: 4  │
│  │ Загрузок в очереди: 2 | Баз активных: 6       │
└──────────────────────────────────────────────────┘
```

### 2.7 Уведомления

| Событие | Email | SMS | ЛК | Telegram (админу) |
|---------|-------|-----|----|-------------------|
| Регистрация | — (нет email ещё) | ✅ «Добро пожаловать» | ✅ | ✅ «Новый клиент» |
| Email добавлен | ✅ Подтверждение | — | ✅ | — |
| Файл загружен | — | ✅ «Файл принят» | ✅ 🟡 | ✅ «Новая загрузка» |
| База развёрнута | ✅ Ссылки (если есть email) | ✅ «Готово, зайдите в ЛК» | ✅ 🟢 | — |
| 7 дней до конца теста | ✅ (если есть) | ✅ | ✅ баннер | — |
| 3 дня до конца | ✅ (если есть) | ✅ | ✅ баннер | — |
| Тест окончен → read-only | ✅ (если есть) | ✅ | ✅ баннер | ✅ |

### 2.8 Жизненный цикл тестового периода

```
День 0:  Регистрация → полный доступ (30 дней)
День 23: «Осталось 7 дней» (email если есть + SMS + ЛК)
День 27: «Осталось 3 дня» (email + SMS + ЛК)
День 30: READ-ONLY (7 дней). «Оплатите для продолжения»
День 37: Блокировка доступа, база хранится 30 дней
День 67: Удаление (предупреждение за 7 дней)
```

При оплате в любой момент — доступ восстанавливается мгновенно.

### 2.9 Мультипользовательский доступ (MVP)

**Роли:** owner (всё) и user (только смотреть и работать в 1С).

**Добавление сотрудника:**
```
Owner в ЛК → «Сотрудники» → [+ Пригласить] → вводит телефон
→ POST /org/invite {phone}
→ SMS сотруднику: «Вас пригласили в ООО Рассвет»
→ Сотрудник: 1c24.pro → телефон → код → «Присоединиться к ООО Рассвет»
→ POST /auth/accept-invite → User(role: "user")
→ ИНН НЕ спрашиваем (орг из invite)
→ SMS owner: «Сидорова Анна присоединилась»
```

**Увольнение:**
```
Owner → [Отключить] → POST /org/members/{id}/disable
→ Инвалидация JWT в Redis → SMS «Доступ отключён»
→ Middleware проверяет status на каждом запросе → 403
```

**Потерянный owner:** поддержка → проверка по ЕГРЮЛ → ручная передача.

**Передача владения:** Owner → [Передать] → SMS-подтверждение → необратимо.

**Лимиты:** тест — 3, Старт — от 1, Бизнес — от 5, Корпорация — от 15.

**Матрица прав MVP:**
| Действие | owner | user |
|----------|:-----:|:----:|
| Приглашать / отключать | ✅ | ❌ |
| Загружать базы | ✅ | ❌ |
| Видеть базы и работать в 1С | ✅ | ✅ |
| Управлять тарифом / оплатой | ✅ | ❌ |

### 2.10 Оплата (ЮKassa)

**Способы:** карты (Visa/MC/МИР) + СБП (QR) + счёт для юрлиц.

**Flow:**
```
Клиент → ЛК → «Выбрать тариф» → выбирает тариф + период + кол-во пользователей
→ POST /payments/create → ЮKassa API → redirect URL
→ Клиент оплачивает на стороне ЮKassa
→ ЮKassa → POST /payments/webhook → подтверждение
→ Активация подписки → email + SMS клиенту
```

**Для юрлиц:**
```
→ POST /payments/invoice → PDF-счёт с реквизитами → email клиенту
→ Клиент оплачивает по р/с
→ Поступление (webhook или ручная проверка) → активация
```

**Автопродление:** за 7 дней email → за 3 дня SMS → попытка автосписания → если нет — read-only.

---

## 3. Version Control & Git Workflow

### 2.1 Репозиторий
```
Платформа: GitHub / Gitea (self-hosted)
Monorepo: 1c24pro/ (frontend + backend в одном репо)
```

### 2.2 Branching Strategy (Git Flow Simplified)

```
main          ← продакшн, деплоится автоматически
  └── develop ← интеграционная ветка
        ├── feature/landing-hero
        ├── feature/auth-register
        ├── feature/auth-otp
        ├── feature/pricing-calculator
        ├── feature/inn-lookup
        └── fix/otp-cooldown-bug
```

**Правила:**
- `main` — только через merge из `develop`, всегда рабочий
- `develop` — сюда мержатся feature-ветки
- `feature/*` — одна фича = одна ветка
- `fix/*` — багфиксы
- Перед merge — все тесты зелёные
- Squash merge для чистой истории

### 2.3 Формат коммитов (Conventional Commits)

```
<type>(<scope>): <описание>

Типы: feat, fix, refactor, docs, test, chore, style, perf
Скоупы: auth, frontend, backend, landing, pricing, inn, otp, db, ci

Примеры:
feat(auth): implement OTP verification with Redis
feat(landing): add hero section with dashboard mockup
fix(otp): handle expired code gracefully
refactor(backend): extract DaData client to service layer
test(auth): add registration endpoint tests
docs: update ARCHITECTURE.md after auth implementation
chore(ci): add GitHub Actions workflow
```

### 2.4 .gitignore
```gitignore
# Python
__pycache__/
*.pyc
.venv/
venv/
*.egg-info/

# Node
node_modules/
dist/
.next/

# Environment
.env
.env.local
.env.production

# IDE
.vscode/
.idea/
*.swp

# OS
.DS_Store
Thumbs.db

# Logs
*.log
```

---

## 4. Архитектура и структура проекта

### 3.1 Полная структура

```
1c24pro/
│
├── .cursorrules                 # Правила для AI
├── TZ.md                       # Этот документ
├── ARCHITECTURE.md              # Карта проекта (обновлять!)
├── CHANGELOG.md                 # Лог изменений
├── TODO.md                      # Задачи
├── docker-compose.yml           # PostgreSQL + Redis для разработки
├── .gitignore
├── README.md
│
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI app, CORS, lifespan, middleware
│   │   ├── config.py            # pydantic-settings, всё из .env
│   │   ├── database.py          # async engine, session factory
│   │   ├── models.py            # Organization, User, OTPLog, Upload, Database
│   │   ├── schemas.py           # Pydantic v2: request/response
│   │   ├── auth.py              # JWT create/decode/middleware
│   │   ├── dependencies.py      # get_db, get_current_user, require_admin
│   │   ├── exceptions.py        # кастомные HTTP exceptions
│   │   ├── constants.py         # все магические числа → именованные константы
│   │   │
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py          # /auth/send-code, verify-code, complete-registration
│   │   │   ├── inn.py           # /inn/lookup
│   │   │   ├── upload.py        # /uploads/init, chunk, status, complete
│   │   │   ├── dashboard.py     # /me, /me/databases, /me/uploads
│   │   │   ├── org.py           # /org/invite, /org/members, /org/transfer-ownership
│   │   │   ├── payments.py      # /payments/create, webhook, history, invoice
│   │   │   ├── subscription.py  # /subscription GET, PATCH
│   │   │   ├── admin.py         # /admin/uploads, /admin/databases, /admin/users
│   │   │   └── health.py        # /health
│   │   │
│   │   └── services/
│   │       ├── __init__.py
│   │       ├── dadata.py        # DaData API client
│   │       ├── sms.py           # SMS.ru client
│   │       ├── email.py         # SMTP sender + HTML templates
│   │       ├── otp.py           # OTP gen/store/verify (Redis)
│   │       ├── yookassa.py      # ЮKassa: создание платежа, webhook, счета
│   │       └── telegram.py      # Telegram Bot: уведомления админу
│   │
│   ├── tests/
│   │   ├── conftest.py          # фикстуры: test db, test client, mock redis
│   │   ├── test_inn.py          # тесты /inn/lookup
│   │   ├── test_register.py     # тесты /register
│   │   ├── test_otp.py          # тесты /otp/send, /otp/verify
│   │   └── test_models.py       # тесты моделей
│   │
│   ├── alembic/                 # миграции БД
│   │   ├── alembic.ini
│   │   ├── env.py
│   │   └── versions/
│   │
│   ├── requirements.txt
│   ├── requirements-dev.txt     # pytest, ruff, httpx[http2]
│   ├── .env.example
│   ├── ruff.toml                # линтер конфиг
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.tsx
│   │   │   │   ├── Footer.tsx
│   │   │   │   └── TopBar.tsx          # партнёрский баннер
│   │   │   ├── sections/               # секции лендинга
│   │   │   │   ├── Hero.tsx
│   │   │   │   ├── BigNumbers.tsx
│   │   │   │   ├── Features.tsx
│   │   │   │   ├── Pricing.tsx
│   │   │   │   ├── Calculator.tsx
│   │   │   │   ├── FAQ.tsx
│   │   │   │   └── RegisterSection.tsx
│   │   │   ├── dashboard/              # личный кабинет
│   │   │   │   ├── DatabaseCard.tsx     # карточка базы (статус, ссылки)
│   │   │   │   ├── UploadZone.tsx       # drag&drop + chunked upload
│   │   │   │   ├── UploadProgress.tsx   # прогресс-бар загрузки
│   │   │   │   ├── ProfileCard.tsx      # профиль + реферальный код
│   │   │   │   └── TrialBanner.tsx      # «Осталось X дней»
│   │   │   ├── admin/                   # админ-панель
│   │   │   │   ├── UploadQueue.tsx      # очередь загрузок
│   │   │   │   ├── DatabaseEditor.tsx   # ввод ссылок для базы
│   │   │   │   └── UserList.tsx         # список пользователей
│   │   │   ├── ui/                      # переиспользуемые UI
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Badge.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   └── Accordion.tsx
│   │   │   └── forms/
│   │   │       ├── PhoneForm.tsx        # шаг 1: ввод телефона
│   │   │       ├── OTPInput.tsx         # шаг 2: ввод кода
│   │   │       └── RegistrationForm.tsx # шаг 3: email + ИНН (если новый)
│   │   │
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx          # все секции лендинга
│   │   │   ├── AuthPage.tsx             # вход / регистрация
│   │   │   ├── DashboardPage.tsx        # ЛК клиента
│   │   │   └── AdminPage.tsx            # админ-панель
│   │   │
│   │   ├── hooks/
│   │   │   ├── useInView.ts            # Intersection Observer
│   │   │   ├── useCounter.ts           # анимированный счётчик
│   │   │   └── useDebounce.ts          # debounce для ИНН
│   │   │
│   │   ├── api/
│   │   │   ├── client.ts               # axios instance + interceptors
│   │   │   ├── auth.ts                 # register, sendOTP, verifyOTP
│   │   │   └── inn.ts                  # lookupINN
│   │   │
│   │   ├── types/
│   │   │   ├── api.ts                  # типы request/response
│   │   │   └── common.ts               # общие типы
│   │   │
│   │   ├── constants/
│   │   │   ├── plans.ts                # тарифы, цены, скидки
│   │   │   ├── design.ts               # цвета, breakpoints
│   │   │   └── faq.ts                  # вопросы-ответы
│   │   │
│   │   ├── utils/
│   │   │   ├── formatters.ts           # форматирование цен, телефонов
│   │   │   └── validators.ts           # валидация ИНН, телефона
│   │   │
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css                   # Tailwind imports + custom
│   │
│   ├── public/
│   │   └── favicon.svg
│   │
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── .eslintrc.cjs
│   ├── .prettierrc
│   └── Dockerfile
│
└── deploy/
    ├── nginx.conf                # reverse proxy конфиг
    └── docker-compose.prod.yml   # production compose
```

### 3.2 docker-compose.yml (для разработки)

```yaml
version: "3.9"
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: 1c24pro
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  pgdata:
```

---

## 5. Backend (FastAPI)

### 4.1 Стек
- Python 3.11+ / FastAPI (async)
- PostgreSQL 16 + SQLAlchemy 2.0 (async)
- Alembic — миграции БД
- Redis 7 — OTP, rate limiting
- DaData API — ИНН lookup
- SMS.ru — SMS
- aiosmtplib — email
- python-jose — JWT
- Ruff — линтинг
- pytest + httpx — тесты

### 4.2 API Endpoints

```
# ═══ AUTH (passwordless — телефон + SMS-код) ═══
POST /api/v1/auth/send-code              → SMS-код на телефон
     Request:  {phone: "+7..."}
     Response: {sent: true, is_new_user: bool, ttl: 300}

POST /api/v1/auth/verify-code            → проверка кода
     Request:  {phone: "+7...", code: "123456"}
     Response: {verified: true, needs_registration: bool,
                access_token?, refresh_token?, temp_token?}

POST /api/v1/auth/complete-registration  → завершение регистрации (только для новых)
     Request:  {inn, referral_code?}  + Header: Authorization: Bearer <temp_token>
     Response: {user_id, access_token, refresh_token}
     NOTE: email НЕ обязателен, добавляется позже через PATCH /me

POST /api/v1/auth/refresh                → обновление JWT
POST /api/v1/auth/logout                 → инвалидация refresh token

# ═══ INN ═══
POST /api/v1/inn/lookup                  → DaData → OrganizationResponse

# ═══ UPLOAD (chunked, для .dt/.bak до 50 ГБ) ═══
POST   /api/v1/uploads/init              → создать upload сессию
       Request:  {filename, size_bytes, config_code}
       Response: {upload_id, chunk_size: 5242880, chunks_expected, db_name}

PUT    /api/v1/uploads/{id}/chunk/{n}    → загрузить chunk (binary body)
GET    /api/v1/uploads/{id}/status       → {chunks_received, chunks_expected, status}
POST   /api/v1/uploads/{id}/complete     → склеить → уведомить админа

# ═══ DASHBOARD (ЛК клиента, требует JWT) ═══
GET    /api/v1/me                        → профиль + org + trial info
PATCH  /api/v1/me                        → обновить email, имя
       Request: {email?, first_name?, last_name?}
       → если email добавлен: отправить код подтверждения на email
GET    /api/v1/me/databases              → список баз [{status, web_url, rdp_url, size, db_name}]
GET    /api/v1/me/uploads                → загрузки [{filename, config_code, status, progress}]

# ═══ ADMIN (требует role=admin) ═══
GET    /api/v1/admin/uploads             → все загрузки (новые первые)
PATCH  /api/v1/admin/uploads/{id}        → обновить статус загрузки
GET    /api/v1/admin/users               → список пользователей + орг
POST   /api/v1/admin/databases           → создать запись о базе
PATCH  /api/v1/admin/databases/{id}      → ввести ссылки, изменить статус
       Request: {status, web_url, rdp_url, config_name}
       → автоматически email+SMS клиенту при статусе "active"

# ═══ ОРГАНИЗАЦИЯ — СОТРУДНИКИ (MVP: только owner) ═══
POST   /api/v1/org/invite               → пригласить по телефону (owner)
GET    /api/v1/org/invites              → список приглашений
DELETE /api/v1/org/invites/{id}         → отменить приглашение
GET    /api/v1/org/members              → список сотрудников
POST   /api/v1/org/members/{id}/disable → отключить (owner)
POST   /api/v1/org/members/{id}/enable  → восстановить (owner)
POST   /api/v1/org/transfer-ownership   → передать владение (owner, требует SMS)

# ═══ AUTH — ДОПОЛНЕНИЯ ═══
POST   /api/v1/auth/accept-invite       → принять приглашение (при регистрации)

# ═══ ПОДДЕРЖКА ═══
POST   /api/v1/support/ownership-claim  → запрос восстановления доступа (ручной)

GET    /health                           → {status, version, uptime}

# ═══ ОПЛАТА (ЮKassa) ═══
POST   /api/v1/payments/create          → создать платёж → redirect на ЮKassa
POST   /api/v1/payments/webhook         → webhook от ЮKassa (без JWT, проверка подписи)
GET    /api/v1/payments/history          → история платежей организации
POST   /api/v1/payments/invoice         → выставить счёт юрлицу (PDF)
GET    /api/v1/subscription             → текущая подписка
PATCH  /api/v1/subscription             → изменить тариф / отменить автопродление
```

### 4.3 Модели данных

**Organization:**
| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID, PK | |
| inn | string(12), unique, index | ИНН организации |
| kpp | string(9), nullable | |
| ogrn | string(15), nullable | |
| name_short | string(500) | ООО «Рассвет» |
| name_full | string(1000), nullable | Полное наименование |
| type | string(10) | LEGAL / INDIVIDUAL |
| director_name | string(300), nullable | |
| address | text, nullable | |
| okved | string(10), nullable | |
| status | string(20), default ACTIVE | ACTIVE / LIQUIDATING / LIQUIDATED |
| created_at | datetime | |
| updated_at | datetime | |

**User:**
| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID, PK | |
| organization_id | FK → Organization | |
| phone | string(20), unique, index | +7XXXXXXXXXX |
| email | string(255), nullable, unique, index | Добавляется позже в ЛК |
| phone_verified | boolean, default false | |
| email_verified | boolean, default false | |
| is_owner | boolean, default false | Владелец аккаунта компании |
| role | string(20), default "user" | owner / admin / user |
| status | string(20), default "active" | active / disabled |
| referral_code | string(20), unique | 8 символов, генерируется |
| referred_by | FK → User, nullable | Кто привёл (реферал) |
| invited_by | FK → User, nullable | Кем приглашён в организацию |
| disabled_at | datetime, nullable | Когда отключён |
| disabled_by | FK → User, nullable | Кем отключён |
| trial_started_at | datetime | |
| trial_ends_at | datetime | +30 дней от регистрации |
| created_at | datetime | |
| last_login_at | datetime, nullable | |

**OTPLog:**
| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID, PK | |
| target | string(255) | Телефон или email |
| channel | string(10) | sms / email |
| code_hash | string(255) | SHA-256 |
| ip_address | string(45), nullable | |
| verified | boolean | |
| attempts | int, default 0 | |
| created_at | datetime | |
| expires_at | datetime | |

**Invite (приглашение сотрудника):**
| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID, PK | |
| organization_id | FK → Organization | |
| phone | string(20) | Телефон приглашённого |
| invited_by | FK → User | Кто пригласил (owner) |
| status | string(20), default "pending" | pending / accepted / expired / cancelled |
| created_at | datetime | |
| expires_at | datetime | +7 дней |

> MVP: все приглашённые получают роль `user`. Фаза 2: выбор роли при приглашении.

**Payment (платёж):**
| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID, PK | |
| organization_id | FK → Organization | |
| yookassa_id | string(50), unique | ID платежа в ЮKassa |
| amount | decimal(10,2) | Сумма в рублях |
| status | string(20) | pending / succeeded / canceled / refunded |
| payment_method | string(20) | bank_card / sbp / invoice |
| plan | string(20) | start / business / corporation |
| period | string(20) | monthly / quarterly / annual |
| users_count | int | Кол-во оплаченных пользователей |
| metadata | jsonb, nullable | |
| created_at | datetime | |
| paid_at | datetime, nullable | |

**Subscription (подписка организации):**
| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID, PK | |
| organization_id | FK → Organization, unique | Одна подписка на организацию |
| plan | string(20) | trial / start / business / corporation |
| status | string(20) | trial / active / past_due / canceled |
| users_limit | int | Макс. пользователей |
| current_period_start | datetime | |
| current_period_end | datetime | |
| auto_renew | boolean, default true | |
| created_at | datetime | |
| updated_at | datetime | |

**Upload (chunked upload сессия):**
| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID, PK | upload_id |
| organization_id | FK → Organization | |
| user_id | FK → User | кто загрузил |
| filename | string(500) | оригинальное имя файла |
| size_bytes | bigint | ожидаемый размер |
| mime_type | string(100) | application/octet-stream |
| chunk_size | int, default 5242880 | 5 МБ |
| chunks_expected | int | = ceil(size / chunk_size) |
| chunks_received | int, default 0 | сколько chunks получено |
| status | string(20) | pending / uploading / uploaded / processing / error |
| storage_path | string(500) | /uploads/{org_id}/{upload_id}/ |
| created_at | datetime | |
| completed_at | datetime, nullable | |

**Database (база 1С клиента):**
| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID, PK | |
| organization_id | FK → Organization | |
| upload_id | FK → Upload, nullable | из какой загрузки |
| name | string(200) | «Бухгалтерия предприятия» |
| config_name | string(100) | «Бухгалтерия 3.0», «ЗУП 3.1» |
| status | string(20) | preparing / active / readonly / blocked / deleted |
| web_url | string(500), nullable | https://1c24.pro:15009/buh_rassvet |
| rdp_url | string(500), nullable | ссылка на .rdp файл |
| size_gb | decimal(10,2), nullable | размер базы |
| last_backup_at | datetime, nullable | |
| admin_notes | text, nullable | заметки админа |
| created_at | datetime | |
| updated_at | datetime | |

### 4.4 Flow — Вход / Регистрация (passwordless)

```
ВХОД (существующий пользователь):
1. POST /auth/send-code {phone} → SMS-код → {is_new_user: false}
2. POST /auth/verify-code {phone, code} → JWT tokens → redirect в ЛК

РЕГИСТРАЦИЯ (новый пользователь):
1. POST /auth/send-code {phone} → SMS-код → {is_new_user: true}
2. POST /auth/verify-code {phone, code} → {needs_registration: true, temp_token}
3. Фронт показывает форму: email + ИНН
4. POST /inn/lookup {inn} → DaData → превью названия компании
5. POST /auth/complete-registration {email, inn, referral_code?}
   → создание Organization → создание User (owner, trial 30 дней)
   → JWT tokens → redirect в ЛК
```

### 4.5 Flow — Загрузка базы (chunked upload)

```
1. Клиент в ЛК нажимает «Загрузить базу»
2. POST /uploads/init {filename: "buh.bak", size_bytes: 2500000000}
   → {upload_id, chunk_size: 5242880, chunks_expected: 477}
3. Фронт нарезает файл на chunks по 5 МБ
4. PUT /uploads/{id}/chunk/0  (binary body)
   PUT /uploads/{id}/chunk/1  ...
   ... (прогресс-бар на фронте, ~477 запросов)
5. Если соединение оборвалось:
   GET /uploads/{id}/status → {chunks_received: 234}
   → фронт продолжает с chunk 234
6. POST /uploads/{id}/complete
   → бэкенд склеивает chunks в один файл
   → статус: "uploaded"
   → email + Telegram уведомление админу
7. АДМИН вручную:
   → забирает файл из /uploads/{org_id}/{upload_id}/
   → разворачивает на SQL Server
   → в админке вводит web_url + rdp_url → Сохранить
   → автоматический email + SMS клиенту: «Ваша база готова!»
8. Клиент видит в ЛК: статус 🟢, ссылки на веб и RDP
```

### 4.6 Архитектура имён баз данных

**Проблема:** на одном SQL Server и в одном кластере 1С — десятки/сотни баз разных клиентов. Имена не должны пересекаться, по имени должно быть понятно: чья база и какая конфигурация.

**Формат имени:**
```
{org_slug}_{config_code}_{seq}

Примеры:
  rassvet_bp30_1       ← ООО «Рассвет», Бухгалтерия 3.0, база #1
  rassvet_zup31_1      ← ООО «Рассвет», ЗУП 3.1
  ip_sidorov_ut11_1    ← ИП Сидоров, Управление торговлей 11
  tekhnomir_erp25_2    ← ООО «Техномир», ERP 2.5, вторая база
```

**Одно имя — везде:**
```
SQL Server:         CREATE DATABASE [rassvet_bp30_1]
Кластер 1С:         infobase name = rassvet_bp30_1
Apache publication: Alias /rassvet_bp30_1
Web URL:            https://1c24.pro:15009/rassvet_bp30_1
```

**Справочник конфигураций:**
```
bp30     → Бухгалтерия предприятия 3.0
bp_corp  → Бухгалтерия предприятия КОРП
zup31    → Зарплата и управление персоналом 3.1
zup_corp → ЗУП КОРП
ut11     → Управление торговлей 11
ka2      → Комплексная автоматизация 2
erp25    → 1С:ERP 2.5
unf3     → Управление нашей фирмой 3
do3      → Документооборот 3
roz2     → Розница 2
med      → Медицина
custom   → Нетиповая конфигурация
```

**org_slug — транслитерация из DaData:**
```python
def make_org_slug(name_short: str) -> str:
    """ООО «Рассвет» → rassvet, ИП Сидоров А.В. → ip_sidorov"""
    # Убрать ОПФ
    name = re.sub(r'^(ООО|ОАО|ЗАО|ПАО|АО|ИП)\s*[«"\']?', '', name_short)
    name = re.sub(r'[»"\']', '', name).strip()
    # Транслитерация → lowercase → только a-z0-9_ → max 20 символов
    return transliterate(name)[:20]
```

**Генерация имени (при создании Database админом):**
```
1. org_slug хранится в Organization (вычисляется при создании из DaData)
2. config_code — админ выбирает из справочника (или клиент при загрузке)
3. seq = COUNT(databases WHERE org_id = X AND config_code = Y) + 1
4. db_name = f"{org_slug}_{config_code}_{seq}"
5. Проверка уникальности в БД, если занято → seq += 1
```

**Определение конфигурации из файла:**

| Фаза | .dt файл | .bak файл |
|------|----------|-----------|
| MVP | Клиент выбирает из списка при загрузке | Клиент выбирает из списка |
| Фаза 2 | 1cv8 /LoadInfoBase → /DumpConfigToFiles → metadata.xml | RESTORE → чтение таблицы Config → имя конфигурации |

**Новые поля в моделях:**
- **Organization.slug** — string(30), unique, транслитерированное имя
- **Database.db_name** — string(60), unique, полное имя для SQL/кластера/Apache

### 4.7 Безопасность

**OTP:**
- 6 цифр, хранение SHA-256 хеша в Redis
- TTL: 5 минут
- Максимум 5 попыток на 1 код
- Cooldown между отправками: 60 секунд
- Rate limit: 5 регистраций/минуту с одного IP

**JWT:**
- Алгоритм: HS256
- Access token: 60 минут
- Refresh token: 30 дней
- Payload: {sub: user_id, phone, role}

**Общее:**
- CORS: только 1c24.pro и localhost:5173
- HTTPS обязателен на проде
- Пароли (когда будут): bcrypt
- .env НИКОГДА не коммитить

### 4.6 Миграции (Alembic)

```bash
# Инициализация (один раз)
alembic init alembic
# Настроить alembic/env.py на async engine

# Создать миграцию
alembic revision --autogenerate -m "create users and organizations"

# Применить
alembic upgrade head

# Откатить
alembic downgrade -1
```

**Правило:** КАЖДОЕ изменение модели → новая миграция → коммит.

### 4.7 Тестирование (Backend)

```python
# tests/conftest.py
@pytest.fixture
async def client():
    """Async test client with test database"""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac

@pytest.fixture
async def mock_dadata(monkeypatch):
    """Mock DaData API responses"""
    async def mock_find(*args, **kwargs):
        return {"inn": "7707083893", "name_short": 'ООО "Тест"', ...}
    monkeypatch.setattr(dadata_service, "find_by_inn", mock_find)

@pytest.fixture
async def mock_sms(monkeypatch):
    """Mock SMS.ru — не отправлять реальные SMS в тестах"""
    async def mock_send(*args, **kwargs):
        return {"success": True}
    monkeypatch.setattr(sms_service, "send_otp", mock_send)
```

**Обязательные тесты:**
```
test_inn_lookup_valid          — ИНН 10 цифр → 200 + данные
test_inn_lookup_invalid        — ИНН 8 цифр → 422
test_inn_lookup_not_found      — несуществующий → 404
test_register_success          — полный flow → 200 + user_id
test_register_duplicate_phone  — повторный телефон → 409
test_register_duplicate_email  — повторный email → 409
test_otp_send_success          — отправка → 200
test_otp_send_cooldown         — повторная отправка < 60с → 429
test_otp_verify_correct        — верный код → 200 + JWT
test_otp_verify_wrong          — неверный код → verified: false
test_otp_verify_expired        — истёкший код → сообщение об истечении
test_otp_max_attempts          — 5 неверных попыток → блокировка
```

### 4.8 Линтинг (ruff.toml)

```toml
[tool.ruff]
target-version = "py311"
line-length = 100

[tool.ruff.lint]
select = ["E", "F", "I", "N", "W", "UP", "B", "A", "SIM"]

[tool.ruff.lint.isort]
known-first-party = ["app"]
```

---

## 6. Frontend (Landing Page)

### 5.1 Стек
- React 18 + Vite 5
- TypeScript (strict mode)
- Tailwind CSS 3
- ESLint + Prettier
- Axios для API

### 5.2 Дизайн-система

**Стиль:** Clean SaaS (Notion/Linear) + визуальная мощь (SpaceX/Tesla).

**Палитра (constants/design.ts):**
```typescript
export const COLORS = {
  primary: "#F97316",    // оранжевый — акценты, CTA
  dark: "#1C1917",       // тёмный — текст, кнопки
  bg: "#FAFAF8",         // фон
  bgGray: "#F5F5F5",     // чередование секций
  textMuted: "#78716C",  // вторичный текст
  textLight: "#A8A29E",  // подписи
  border: "#E7E5E4",     // разделители
  borderLight: "#F3F2F0",
  success: "#16A34A",    // статусы
  blue: "#3B82F6",       // акцент feature 02
  purple: "#8B5CF6",     // акцент feature 03
  pink: "#EC4899",       // акцент feature 04
} as const;
```

**Типографика:** system-ui. H1: 56px/800. H2: 42px/800. Body: 15-18px. Скругления: 10-12px кнопки, 16-20px карточки.

**Анимации:** scroll-reveal (translateY 20px + opacity), cubic-bezier(0.16,1,0.3,1), каскадные задержки.

### 5.3 Секции лендинга

Секции описаны в порядке сверху вниз:

**1. TopBar** — тёмная полоса: «Партнёрская программа: 10% с каждого клиента — на весь срок договора» + «Подробнее →»

**2. Navbar** — fixed. Лого (оранжевый квадрат «1С» + «24.pro»), ссылки (Возможности, Тарифы, Калькулятор, FAQ), кнопки (Войти ghost + Начать бесплатно dark). Тень на скролле.

**3. Hero** — fullscreen. Слева: бейдж, заголовок «Ваша 1С в облаке. Просто работает.», описание, 2 CTA, trust-бейджи (серверы в РФ, SLA, бэкапы, оплата, флаг РФ). Справа: дашборд-мокап (метрики, SVG-график, плавающие уведомления).

**4. BigNumbers** — тёмная (#1C1917). 4 колонки, анимированные счётчики: 690₽, 10 мин, 67 дней, 28%.

**5. Features** — 2×2 карточки с цветными акцентами: 01 Всё включено (orange), 02 SQL .bak (blue), 03 Конфигуратор (purple), 04 Self-service (pink).

**6. Pricing** — переключатель месяц/год (-15%), 3 карточки (Старт 890₽, Бизнес 790₽ ⭐, Корпорация 690₽).

**7. Calculator** — слайдеры (пользователи 1-50, базы 1-20), кнопки периода, автоподбор тарифа, итого.

**8. FAQ** — аккордеон, 6 вопросов.

**9. Register** — оранжевый фон, белая карточка: телефон, email, ИНН (debounce → DaData), оферта, кнопка → OTP ввод.

**10. Footer** — лого + копирайт.

### 5.4 Тарифы (constants/plans.ts)

```typescript
export const PLANS = [
  { id: "start", name: "Старт", price: 890, minUsers: 1, basesIncluded: 1, extraBase: 500, disk: 10, diskOverage: 5, support: "Email, чат", reaction: "<4ч" },
  { id: "business", name: "Бизнес", price: 790, minUsers: 5, basesIncluded: 3, extraBase: 400, disk: 20, diskOverage: 4, support: "Email, чат, тел", reaction: "<2ч", popular: true },
  { id: "corp", name: "Корпорация", price: 690, minUsers: 15, basesIncluded: 10, extraBase: 300, disk: 50, diskOverage: 3, support: "Перс. менеджер", reaction: "<1ч" },
] as const;

export const PREPAY_DISCOUNTS = { 1: 0, 3: 0.05, 6: 0.10, 12: 0.15 } as const;
export const VOLUME_DISCOUNTS = [
  { min: 1, discount: 0 }, { min: 5, discount: 0.05 },
  { min: 10, discount: 0.10 }, { min: 20, discount: 0.15 },
] as const;
// Скидки суммируются, максимум 28%
```

### 5.5 API Client (api/client.ts)

```typescript
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: `${API_BASE}/api/v1`,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// Interceptor: добавлять JWT токен
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

### 5.6 Типы (types/api.ts)

```typescript
export interface OrganizationResponse {
  inn: string;
  kpp?: string;
  ogrn?: string;
  name_short: string;
  name_full?: string;
  type: "LEGAL" | "INDIVIDUAL";
  director_name?: string;
  address?: string;
  status: string;
}

export interface RegisterRequest {
  phone: string;
  email: string;
  inn: string;
  referral_code?: string;
}

export interface RegisterResponse {
  user_id: string;
  message: string;
  verification_sent_to: string;
  verification_channel: "sms" | "email";
}

export interface VerifyOTPResponse {
  verified: boolean;
  access_token?: string;
  refresh_token?: string;
  message: string;
}
```

---

## 7. Внешние сервисы

| Сервис | Назначение | Ключ / настройка |
|--------|-----------|------------------|
| DaData | ИНН lookup (10K бесплатных/день) | API: `e2b6f3a566f82a547655b4f9c755132f81f81b09` |
| DaData Secret | | `7ce7b6a12dfac3392121fd6da1b8225a64a3f65d` |
| SMS.ru | Отправка SMS | `BD806F5C-99A7-F2CB-497D-199177F46D15` |
| SMTP | Email (OTP + уведомления) | smtp.yandex.ru:465, noreply@1c24.pro |
| PostgreSQL | Основная БД | localhost:5432/1c24pro |
| Redis | OTP, sessions, rate limiting | localhost:6379/0 |
| **ЮKassa** | Оплата: карты + СБП + счета юрлиц | shop_id + secret_key (получить при подключении) |
| **Telegram Bot** | Уведомления админу | TODO: создать бота, получить token + chat_id |

**⚠️ ВАЖНО:** ключи выше — для разработки. Для прода создать отдельные ключи и хранить в Vault / зашифрованных secrets.

### 6.1 ЮKassa — интеграция оплаты

**Способы оплаты:**
- Банковские карты (Visa, MasterCard, МИР)
- СБП (оплата по QR-коду)
- Выставление счёта для юрлиц (оплата по реквизитам)

**Flow оплаты:**
```
1. Клиент в ЛК → «Выбрать тариф» → выбирает тариф + период
2. POST /api/v1/payments/create
   {plan: "start", period: "monthly", users_count: 3}
3. Бэкенд → ЮKassa API: создание платежа
   POST https://api.yookassa.ru/v3/payments
   {
     amount: {value: "2070.00", currency: "RUB"},
     confirmation: {type: "redirect", return_url: "https://1c24.pro/dashboard"},
     capture: true,
     description: "1C24.PRO: тариф Старт, 3 пользователя, 1 мес",
     metadata: {org_id, plan, period, users_count},
     receipt: {
       customer: {email: "director@rassvet.ru"},
       items: [{
         description: "Облачная 1С — тариф Старт (3 польз.)",
         quantity: "1",
         amount: {value: "2070.00", currency: "RUB"},
         vat_code: 1
       }]
     }
   }
4. ЮKassa → redirect URL для оплаты
5. Фронт → redirect клиента на ЮKassa (карта / СБП / счёт)
6. Клиент оплачивает
7. ЮKassa → webhook POST /api/v1/payments/webhook
   {event: "payment.succeeded", object: {id, metadata, ...}}
8. Бэкенд:
   - Проверка подписи webhook
   - UPDATE org: plan, paid_until, status = "active"
   - Если был read-only → восстановление доступа
   - Email + SMS клиенту: «Оплата принята, тариф активирован»
```

**Для юрлиц — выставление счёта:**
```
POST /api/v1/payments/invoice
  {plan, period, users_count}
→ Генерация PDF-счёта с реквизитами ООО (наше юрлицо)
→ Email клиенту с PDF
→ Статус: "awaiting_payment"
→ После поступления (webhook или ручная проверка) → активация
```

**Автопродление:**
```
- За 7 дней: email «Подписка истекает через 7 дней»
- За 3 дня: email + SMS
- День 0: попытка автосписания (если клиент сохранил карту)
- Если не удалось: read-only (7 дней), затем блокировка
```

**Модели данных для оплаты:**

**Payment:**
| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID, PK | |
| organization_id | FK → Organization | |
| yookassa_id | string(50) | ID платежа в ЮKassa |
| amount | decimal(10,2) | Сумма |
| currency | string(3), default "RUB" | |
| status | string(20) | pending / succeeded / canceled / refunded |
| payment_method | string(20) | bank_card / sbp / invoice |
| plan | string(20) | start / business / corporation |
| period | string(20) | monthly / quarterly / annual |
| users_count | int | Кол-во пользователей |
| metadata | jsonb | Доп. данные |
| created_at | datetime | |
| paid_at | datetime, nullable | |

**Subscription (подписка организации):**
| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID, PK | |
| organization_id | FK → Organization, unique | |
| plan | string(20) | trial / start / business / corporation |
| status | string(20) | trial / active / past_due / canceled |
| users_limit | int | Макс. пользователей |
| current_period_start | datetime | |
| current_period_end | datetime | |
| auto_renew | boolean, default true | |
| payment_method_saved | boolean, default false | |
| created_at | datetime | |
| updated_at | datetime | |

**API — оплата:**
```
POST   /api/v1/payments/create          → создать платёж (redirect на ЮKassa)
POST   /api/v1/payments/webhook         → webhook от ЮKassa (подтверждение)
GET    /api/v1/payments/history          → история платежей
POST   /api/v1/payments/invoice         → выставить счёт юрлицу (PDF)
GET    /api/v1/subscription             → текущая подписка
PATCH  /api/v1/subscription             → изменить тариф / отменить автопродление
```

### 6.2 Telegram-бот (уведомления админу)

**Статус:** TODO — бот будет создан позже, токен добавится в .env

**Что отправляет:**
| Событие | Сообщение |
|---------|-----------|
| Новый клиент | 📥 Регистрация: ООО Рассвет, ИНН 7707083893, +7***67 |
| Файл загружен | 📤 Загрузка: ООО Рассвет, Бухгалтерия 3.0, 2.4 ГБ |
| Оплата прошла | 💳 Оплата: ООО Рассвет, Старт, 2070₽ |
| Тест заканчивается | ⏰ Через 3 дня: ООО Рассвет (тест) |

**Реализация (services/telegram.py):**
```python
async def send_admin_notification(message: str):
    """Отправить уведомление в Telegram-чат админу."""
    token = settings.TELEGRAM_BOT_TOKEN
    chat_id = settings.TELEGRAM_ADMIN_CHAT_ID
    if not token or not chat_id:
        logger.warning("Telegram not configured, skipping notification")
        return
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    await httpx_client.post(url, json={"chat_id": chat_id, "text": message})
```

**.env:**
```
TELEGRAM_BOT_TOKEN=           # TODO: создать бота через @BotFather
TELEGRAM_ADMIN_CHAT_ID=       # TODO: узнать chat_id
```

---

## 8. Деплой (Docker + VPS)

### 8.1 Архитектура деплоя

```
VPS (Ubuntu 22/24, 1c24.pro)
├── Docker Compose
│   ├── nginx        → порты 80, 443 (SSL) → проксирует в backend/frontend
│   ├── backend      → FastAPI (Gunicorn + Uvicorn) → порт 8000
│   ├── frontend     → собранная статика → отдаётся nginx
│   ├── postgres     → PostgreSQL 15 → порт 5432 (только внутри docker)
│   └── redis        → Redis 7 → порт 6379 (только внутри docker)
├── /app/uploads/    → загруженные файлы клиентов (volume)
├── /app/data/pg/    → данные PostgreSQL (volume)
└── certbot          → SSL сертификат Let's Encrypt
```

### 8.2 docker-compose.yml

```yaml
version: "3.8"

services:
  postgres:
    image: postgres:15-alpine
    restart: always
    environment:
      POSTGRES_DB: 1c24pro
      POSTGRES_USER: app
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - pg_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app -d 1c24pro"]
      interval: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    restart: always
    command: redis-server --requirepass ${REDIS_PASSWORD}
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "${REDIS_PASSWORD}", "ping"]
      interval: 5s
      retries: 5

  backend:
    build: ./backend
    restart: always
    depends_on:
      postgres: { condition: service_healthy }
      redis: { condition: service_healthy }
    env_file: .env
    environment:
      DATABASE_URL: postgresql+asyncpg://app:${DB_PASSWORD}@postgres:5432/1c24pro
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379/0
    volumes:
      - uploads:/app/uploads
    expose:
      - "8000"
    command: >
      gunicorn app.main:app
      --worker-class uvicorn.workers.UvicornWorker
      --workers 2
      --bind 0.0.0.0:8000
      --timeout 120

  frontend:
    build: ./frontend
    # Просто собирает статику, nginx её отдаёт
    volumes:
      - frontend_dist:/app/dist

  nginx:
    image: nginx:alpine
    restart: always
    depends_on: [backend, frontend]
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/conf.d:/etc/nginx/conf.d:ro
      - frontend_dist:/var/www/frontend:ro
      - certbot_conf:/etc/letsencrypt:ro
      - certbot_www:/var/www/certbot:ro
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
      interval: 10s
      retries: 3

  certbot:
    image: certbot/certbot
    volumes:
      - certbot_conf:/etc/letsencrypt
      - certbot_www:/var/www/certbot
    entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h; done'"

volumes:
  pg_data:
  uploads:
  frontend_dist:
  certbot_conf:
  certbot_www:
```

### 8.3 nginx.conf

```nginx
server {
    listen 80;
    server_name 1c24.pro www.1c24.pro;

    # Let's Encrypt challenge
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # Redirect HTTP → HTTPS
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name 1c24.pro www.1c24.pro;

    ssl_certificate /etc/letsencrypt/live/1c24.pro/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/1c24.pro/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;

    # API → backend
    location /api/ {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Для chunked upload — увеличиваем лимиты
        client_max_body_size 10M;        # chunk = 5 МБ, с запасом
        proxy_read_timeout 300s;
    }

    # Health check
    location /health {
        proxy_pass http://backend:8000/health;
    }

    # Frontend (статика)
    location / {
        root /var/www/frontend;
        try_files $uri $uri/ /index.html;    # SPA fallback

        # Кэширование статики
        location ~* \.(js|css|png|jpg|svg|ico|woff2)$ {
            expires 30d;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

### 8.4 .env (шаблон для VPS)

```bash
# ═══ Database ═══
DB_PASSWORD=сгенерировать_сложный_пароль_тут

# ═══ Redis ═══
REDIS_PASSWORD=сгенерировать_другой_пароль_тут

# ═══ JWT ═══
JWT_SECRET=сгенерировать_256бит_ключ_тут
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=60
JWT_REFRESH_TOKEN_EXPIRE_DAYS=30

# ═══ DaData ═══
DADATA_API_KEY=e2b6f3a566f82a547655b4f9c755132f81f81b09
DADATA_SECRET_KEY=7ce7b6a12dfac3392121fd6da1b8225a64a3f65d

# ═══ SMS.ru ═══
SMSRU_API_KEY=BD806F5C-99A7-F2CB-497D-199177F46D15

# ═══ Email ═══
SMTP_HOST=smtp.yandex.ru
SMTP_PORT=465
SMTP_USER=noreply@1c24.pro
SMTP_PASSWORD=пароль_от_почты

# ═══ ЮKassa ═══
YOOKASSA_SHOP_ID=          # получить при подключении
YOOKASSA_SECRET_KEY=       # получить при подключении

# ═══ Telegram ═══
TELEGRAM_BOT_TOKEN=        # TODO: @BotFather
TELEGRAM_ADMIN_CHAT_ID=    # TODO: узнать

# ═══ App ═══
APP_URL=https://1c24.pro
ENVIRONMENT=production
```

### 8.5 Пошаговая инструкция: первый деплой

```bash
# ═══ 1. Подключаемся к VPS ═══
ssh root@<IP_ВАШЕГО_VPS>

# ═══ 2. Устанавливаем Docker (если ещё нет) ═══
curl -fsSL https://get.docker.com | sh
apt install -y docker-compose-plugin

# ═══ 3. Клонируем проект ═══
cd /opt
git clone https://github.com/YOUR_USERNAME/1c24pro.git app
cd app

# ═══ 4. Создаём .env ═══
cp .env.example .env
nano .env
# → заполнить все пароли и ключи

# ═══ 5. Получаем SSL сертификат (первый раз) ═══
# Сначала запускаем nginx без SSL для challenge:
docker compose up -d nginx
certbot certonly --webroot -w /var/www/certbot \
  -d 1c24.pro -d www.1c24.pro \
  --email admin@1c24.pro --agree-tos --no-eff-email

# ═══ 6. Запускаем всё ═══
docker compose up -d --build

# ═══ 7. Применяем миграции БД ═══
docker compose exec backend alembic upgrade head

# ═══ 8. Проверяем ═══
curl https://1c24.pro/health
# → {"status": "ok", "version": "1.0.0"}

# Готово! Сайт работает на https://1c24.pro
```

### 8.6 Обновление (после изменений в коде)

```bash
ssh root@<IP>
cd /opt/app
git pull origin main
docker compose up -d --build
docker compose exec backend alembic upgrade head
# Готово — обновлено за 2 минуты
```

### 8.7 Полезные команды

```bash
# Логи
docker compose logs -f backend       # логи бэкенда
docker compose logs -f nginx          # логи nginx

# Перезапуск
docker compose restart backend        # перезапустить бэкенд

# БД
docker compose exec postgres psql -U app -d 1c24pro   # SQL консоль

# Бэкап БД
docker compose exec postgres pg_dump -U app 1c24pro > backup_$(date +%F).sql

# Статус
docker compose ps                     # все контейнеры
```

---

## 9. Дополнительные услуги (на сайте)
- Миграция «под ключ»: 5 000 ₽/база
- Доработки 1С: 2 500 ₽/час
- Консультации: 3 бесплатных/мес, далее 1 500 ₽/час
- Расширенные бэкапы: +500 ₽/мес
- Обучение: 5 000 ₽/сессия

## 10. Партнёрская программа
- Revenue Share 10% lifetime
- Реферальный код генерируется при регистрации (8 символов)
- 10% от всех платежей клиента на весь срок действия договора
- Вывод: раз в месяц на расчётный счёт
- На лендинге: тонкий баннер сверху

---

## 11. Приоритеты разработки

### MVP (неделя 1-2): Регистрация + Лендинг
- [ ] Инициализация проекта (monorepo, docker-compose, .env)
- [ ] Backend: модели (Organization, User, OTPLog, Invite, Upload, Database, Payment, Subscription) + Alembic
- [ ] Backend: Auth — /auth/send-code, verify-code, complete-registration, accept-invite
- [ ] Backend: /inn/lookup (DaData)
- [ ] Backend: /org/invite, /org/members, /org/members/{id}/disable, /org/transfer-ownership
- [ ] Backend: Chunked upload — /uploads/init, chunk, status, complete
- [ ] Backend: Dashboard — /me, /me/databases, /me/uploads
- [ ] Backend: Admin — /admin/uploads, /admin/databases, /admin/users
- [ ] Backend: Telegram уведомления (заглушка если нет токена)
- [ ] Backend: тесты (минимум 20 тестов)
- [ ] Frontend: Vite + Tailwind + TypeScript + React Router
- [ ] Frontend: Landing page (все 10 секций)
- [ ] Frontend: AuthPage (телефон → код → ИНН или приглашение)
- [ ] Frontend: DashboardPage (базы, загрузка, сотрудники, профиль)
- [ ] Frontend: AdminPage (очередь загрузок, ввод ссылок)
- [ ] Frontend: Chunked upload с прогресс-баром и resume
- [ ] Деплой: nginx + SSL

### Фаза 2 (неделя 3-4): Оплата + Уведомления
- [ ] Backend: ЮKassa — /payments/create, webhook, history, invoice
- [ ] Backend: /subscription GET, PATCH
- [ ] Backend: Генерация PDF-счёта для юрлиц
- [ ] Backend: Email-уведомления (шаблоны: приветствие, база готова, тест кончается, оплата)
- [ ] Backend: Cron — проверка окончания тестов, автопродление
- [ ] Frontend: Страница оплаты (выбор тарифа, redirect на ЮKassa)
- [ ] Frontend: История платежей в ЛК
- [ ] Telegram-бот: создать, подключить токен

### Фаза 3 (неделя 5-6): Полировка
- [ ] Роль admin (между owner и user)
- [ ] Разграничение доступа к базам внутри организации
- [ ] Партнёрский кабинет (рефералы, начисления)
- [ ] Мониторинг (размер базы, сеансы, бэкапы)
- [ ] Автоопределение конфигурации из .dt/.bak

---

## 12. Команды

```bash
# ═══ Разработка ═══
docker-compose up -d                      # PostgreSQL + Redis
cd backend && uvicorn app.main:app --reload  # API на :8000
cd frontend && npm run dev                   # Frontend на :5173

# ═══ Тесты ═══
cd backend && pytest -v                      # backend тесты
cd frontend && npm run lint                  # frontend lint

# ═══ Миграции ═══
cd backend && alembic revision --autogenerate -m "описание"
cd backend && alembic upgrade head

# ═══ Git ═══
git checkout -b feature/auth-register
# ... работа ...
git add -A && git commit -m "feat(auth): implement registration"
git push origin feature/auth-register
# → PR в develop → review → merge
```
