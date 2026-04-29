# Практики 21–22 (23). Redis-кеширование и балансировка нагрузки

## Практика 21. Redis-кеширование (RBAC + PostgreSQL)

На основе практики 11 (RBAC — роли user/seller/admin) переведены данные с JSON-файла на **PostgreSQL** (Sequelize ORM), добавлен **Redis** как кеш-слой.

Выполнено:
- Модели `User` и `Product` в Sequelize, автомиграция через `sync({ alter: true })`, сид при первом запуске.
- JWT-авторизация: access-токен (45 мин) + refresh-токен (7 дней), RBAC-middleware без изменений.
- `cacheMiddleware(keyBuilder, ttl)` — универсальный Express-middleware: проверяет Redis перед обращением к БД, возвращает `{ source: "cache", data }` при попадании.
- `saveToCache` / `invalidateUsersCache` / `invalidateProductsCache` — явная инвалидация при мутациях (PUT, DELETE, POST).
- TTL: пользователи — 60 с, продукты — 600 с.
- Все сервисы (PostgreSQL на порту 5433, Redis на порту 6379) запускаются через `docker-compose.yml` в корне репозитория.

Изучено:
- Зачем нужен кеш: снижение нагрузки на БД при повторяющихся read-запросах.
- TTL (Time To Live) — время жизни записи в кеше; короткий TTL для часто меняющихся данных, длинный — для стабильных.
- Инвалидация кеша: при изменении данных старые ключи удаляются явно (`DEL`), а не ждут протухания.
- Паттерн cache-aside: приложение само управляет кешем (читает → промах → идёт в БД → пишет в кеш).

Запуск:
```bash
# из корня репозитория
docker compose up -d postgres redis

# из папки practice_21
npm install
node server.js   # порт 3005
```

---

## Практика 22 (23). Балансировка нагрузки: Nginx + HAProxy

Три идентичных Express-сервера в Docker, два балансировщика — **Nginx** (порт 80) и **HAProxy** (порт 8080).

Выполнено:
- `Dockerfile` для backend-сервера: `node:22-alpine`, `os.hostname()` в ответе — видно, какой контейнер ответил.
- `docker-compose.yml`: сервисы `backend1/2/3` (один и тот же образ), `nginx`, `haproxy`.
- **Nginx**: алгоритм Round Robin, `backend3` — резервный (`backup`), включается только если оба основных недоступны. Таймауты `proxy_connect_timeout 2s` / `proxy_read_timeout 2s` — быстрое переключение при падении сервера.
- **HAProxy**: Round Robin, `backend3` — `backup`, healthcheck через `GET /health`.

Изучено:
- Балансировка нагрузки — зачем: горизонтальное масштабирование, отказоустойчивость.
- Round Robin: запросы распределяются по кругу между серверами.
- Резервный (backup) сервер: не участвует в балансировке пока хоть один основной жив.
- Healthcheck: балансировщик периодически проверяет `/health` — выводит упавший сервер из ротации автоматически.
- Docker-сети: контейнеры общаются по именам сервисов (`backend1:3000`), не через `localhost`.
- `upstream` в Nginx vs `backend` секция в HAProxy — аналогичные концепции с разным синтаксисом.

Запуск:
```bash
# из папки practice_22
docker compose up --build -d

# Nginx:   http://localhost/
# HAProxy: http://localhost:8080/
```

Имитация падения сервера:
```bash
docker stop practice_22-backend1-1
```
