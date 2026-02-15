# ФИНАЛЬНОЕ ЗАДАНИЕ: Сделать проект полностью рабочим

## СИТУАЦИЯ
Бэкенд написан правильно (auth routes, DaData, OTP, SMS — всё есть). Фронтенд — каркас без подключения к API. Формы — заглушки. Кодировка UTF-8 сломана. Нет .env. Dashboard в ЛК не загружает данные. Нет защиты роутов. После регистрации выкидывает обратно на /auth.

## ЦЕЛЬ
docker compose down && docker compose up -d --build → http://localhost:3000 → ВСЁ работает.

## ПРАВИЛА
- НЕ МЕНЯЙ backend/app/schemas.py, models.py — они работают
- НЕ ЛОМАЙ docker-compose.yml (только добавь env_file)
- Коммить после каждого блока: git add -A && git commit -m "fix(block-N): описание"
- ВСЕ файлы в UTF-8 без BOM
- Все кириллические строки — НАСТОЯЩАЯ кириллица, не мусор

---

## БЛОК 1: .env файлы + docker-compose

Создай `.env` в корне:
```
SMSRU_API_KEY=BD806F5C-99A7-F2CB-497D-199177F46D15
DADATA_API_KEY=e2b6f3a566f82a547655b4f9c755132f81f81b09
DADATA_SECRET_KEY=7ce7b6a12dfac3392121fd6da1b8225a64a3f65d
JWT_SECRET=dev_jwt_secret_change_in_production_min_32_chars_long_1c24pro
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=60
JWT_REFRESH_TOKEN_EXPIRE_DAYS=30
APP_NAME=1C24.PRO
ENVIRONMENT=development
DEBUG=true
```

Создай `frontend/.env`:
```
VITE_API_URL=http://localhost:8000
```

В docker-compose.yml в секцию backend добавь `env_file: [.env]` (перед environment).

Проверь backend/app/config.py — должен читать SMSRU_API_KEY, DADATA_API_KEY, DADATA_SECRET_KEY, JWT_SECRET из env. Если нет — добавь поля.

---

## БЛОК 2: Кодировка — ВСЕ файлы

Проблема: кириллица = мусор (двойная перекодировка). Открой КАЖДЫЙ .tsx и .py файл с кириллицей и замени ВСЕ сломанные строки на нормальные.

### backend/app/routes/auth.py:
- "Подождите 60 секунд перед повторной отправкой"
- f"1C24.PRO — код подтверждения: {code}. Никому не сообщайте."
- "Этот номер уже зарегистрирован"
- "ИНН не найден в ЕГРЮЛ/ЕГРИП"
- "Организация с этим ИНН уже зарегистрирована"
- Функция _make_org_slug: translit_map с НАСТОЯЩИМИ кириллическими буквами (а, б, в, г...), regex с ООО|ОАО|ЗАО|ПАО|АО|ИП

### Фронтенд: ВСЕ .tsx файлы — пройди по каждому и замени мусор на нормальную кириллицу.

---

## БЛОК 3: PrivateRoute + App.tsx

Создай `frontend/src/components/PrivateRoute.tsx`:
```tsx
import { Navigate } from "react-router-dom";
export const PrivateRoute: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const token = localStorage.getItem("access_token");
  if (!token) return <Navigate to="/auth" replace />;
  return <>{children}</>;
};
```

Обнови App.tsx — /dashboard и /admin обернуть в PrivateRoute.

---

## БЛОК 4: PhoneForm — маска +7 + API

Полностью перепиши PhoneForm.tsx:
- Маска: +7 всегда стоит, пользователь вводит 10 цифр
- Формат: +7 (999) 123-45-67
- При submit: вызвать sendCode из @/api/auth
- Кнопка disabled если <10 цифр
- Ошибки от API показывать под полем

---

## БЛОК 5: AuthPage — все шаги + API

Полностью перепиши AuthPage.tsx:
- Если уже есть access_token в localStorage → redirect на /dashboard
- Step phone → OTPInput → RegistrationForm (если needs_registration)
- handleVerify: вызвать verifyCode, если verified && !needs_registration → сохранить tokens → nav("/dashboard")
- handleRegister: вызвать completeRegistration → сохранить tokens → nav("/dashboard")
- Ошибки показывать в красном блоке

---

## БЛОК 6: OTPInput — таймер + авто-submit

Перепиши OTPInput.tsx:
- Маскированный телефон: +7 (***) ***-**-67
- Одно поле, 6 цифр, моноширинный шрифт, tracking
- При вводе 6 цифр — автоматически вызвать onVerify
- Таймер 60 секунд для повторной отправки

---

## БЛОК 7: RegistrationForm — ИНН + DaData

Перепиши RegistrationForm.tsx:
- Поле ИНН (10/12 цифр)
- При полном ИНН → POST /api/v1/inn/lookup → показать карточку: название, директор, адрес, статус
- Поле реферальный код (необязательное)
- Чекбокс "Принимаю оферту" (обязательный)
- Кнопка "Создать аккаунт" disabled без чекбокса/ИНН

---

## БЛОК 8: DashboardPage — загрузка из API + красивый UI

Полностью перепиши DashboardPage.tsx:
1. При загрузке вызвать GET /api/v1/me и GET /api/v1/me/databases
2. Показать РЕАЛЬНЫЕ данные: организация, телефон, email, ИНН, статус, trial
3. Карточки баз со статусами (зелёный/жёлтый/красный) и кнопками "Открыть веб"/"Открыть RDP"
4. Загрузка базы: ШАГ 1 — выбор конфигурации (dropdown: bp30, zup31, ut11, erp25, unf18, ka2, dt, med, other), ШАГ 2 — drag&drop файла
5. Профиль: телефон, email (с возможностью добавить), организация, ИНН, дней до конца теста
6. Sidebar или tabs: Базы | Загрузить | Сотрудники | Профиль
7. Прогресс-бар тестового периода
8. Кнопка "Выйти"
9. КРАСИВЫЙ современный дизайн, не бедный

---

## БЛОК 9: Dashboard mockup на лендинге (Hero секция)

Найди где написано "Dashboard mockup" (в Hero.tsx или отдельном компоненте) и замени на красивый статичный превью ЛК с тремя базами (Бухгалтерия, ЗУП, УТ), статусами "Работает", счётчиками 3 базы / 5 пользователей / 99.9% uptime.

---

## БЛОК 10: Проверь бэкенд routes/dashboard.py

GET /api/v1/me — должен возвращать данные из БД (не заглушку).
GET /api/v1/me/databases — должен возвращать список баз организации.
Если там заглушки — ДОПИШИ реальную логику с JWT → User → Organization.

---

## ФИНАЛ
```
docker compose down && docker compose up -d --build
docker compose exec backend alembic upgrade head
```

Чеклист:
1. Лендинг: русский текст (не мусор), mockup дашборда
2. /auth: маска +7, SMS приходит
3. Код → ИНН → DaData → Создать аккаунт → /dashboard
4. /dashboard: реальные данные, красивый UI, выбор конфигурации при загрузке
5. Повторный вход: телефон → код → сразу в ЛК
6. http://localhost:8000/docs работает
