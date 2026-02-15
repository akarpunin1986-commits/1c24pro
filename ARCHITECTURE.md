# Architecture Map (обновлено: 15.02.2026)

## Готово ✅
- [x] Инициализация проекта (monorepo, docker-compose, CI/CD)
- [x] Структура backend (FastAPI, SQLAlchemy, Alembic)
- [x] Структура frontend (React, TypeScript, Vite, Tailwind)

## В работе 🔄
_(пока ничего)_

## Не начато ⬜
- [ ] Backend: модели + миграции (Organization, User, OTPLog, Invite, Upload, Database, Payment, Subscription)
- [ ] Backend: Auth — /auth/send-code, verify-code, complete-registration, accept-invite
- [ ] Backend: /inn/lookup (DaData)
- [ ] Backend: /org/invite, members, transfer-ownership
- [ ] Backend: Chunked upload — /uploads/init, chunk, status, complete
- [ ] Backend: Dashboard — /me, /me/databases, /me/uploads
- [ ] Backend: Admin — /admin/uploads, /admin/databases, /admin/users
- [ ] Backend: Telegram уведомления
- [ ] Backend: тесты (минимум 20)
- [ ] Frontend: Landing page (все 10 секций)
- [ ] Frontend: AuthPage (телефон → код → ИНН / приглашение)
- [ ] Frontend: DashboardPage (базы, загрузка, сотрудники, профиль)
- [ ] Frontend: AdminPage (очередь загрузок, ввод ссылок)
- [ ] Frontend: Chunked upload с прогресс-баром и resume
- [ ] Оплата: ЮKassa integration
- [ ] Email-уведомления
- [ ] Деплой: nginx + SSL

## Известные проблемы
_(пока нет)_
