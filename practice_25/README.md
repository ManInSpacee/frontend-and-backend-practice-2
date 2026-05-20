# Практики 25–26. Vite + React и GraphQL + Apollo

## Практика 25. Инструменты сборки: Vite + React

React-приложение, собранное через Vite, с применением техник оптимизации бандла.

Выполнено:
- Два маршрута через `react-router-dom`: `/` (Home) и `/about` (About).
- Страница `About` подключена через **`React.lazy` + `Suspense`** — попадает в отдельный чанк, грузится только при переходе на маршрут.
- Добавлен **rollup-plugin-visualizer** — после `npm run build` создаётся `dist/bundle-report.html` с визуальной картой всех модулей.
- Production-сборка отдаётся через nginx внутри Docker.

Изучено:
- **Code splitting** — бандл разбивается на части, чтобы при первой загрузке не качать всё сразу.
- **Lazy loading** — `lazy(() => import('./X'))` говорит сборщику вынести модуль в отдельный файл. Suspense показывает заглушку, пока чанк качается.
- **Tree-shaking** (автоматически в Vite) — выкидывает неиспользуемые экспорты ES-модулей.
- **Анализ бандла** — визуализатор показывает, какие зависимости тяжелее всего, чтобы знать, что оптимизировать.

Запуск:
```bash
cd practice_25
docker compose up --build      # http://localhost:3006

# Или локально (без Docker):
npm install
npm run dev                    # dev-сервер
npm run build                  # production-сборка → dist/bundle-report.html
```

---

## Практика 26. GraphQL и Apollo Server

GraphQL API для каталога книг и авторов на Apollo Standalone Server.

Выполнено:
- Схема SDL с типами `Book` и `Author` (связь "один-ко-многим").
- `Query`: `books`, `book(id)`, `authors`.
- `Mutation`: `createAuthor`, `createBook`.
- Вложенные резолверы `Author.books` и `Book.author` — для связей между типами.
- Apollo Sandbox (встроенный IDE) на http://localhost:4000.

Изучено:
- **GraphQL vs REST**: один эндпоинт `/graphql` вместо множества; клиент сам описывает нужные поля — нет overfetching/underfetching.
- **Схема (SDL)** — строгая типизация: `String!` обязательное, `[Book!]!` непустой массив.
- **Резолверы** — функции `(parent, args, context, info) => данные` для каждого поля. Вложенные резолверы вызываются только если клиент запросил это поле.
- **Аргументы резолвера**: `parent` — родительский объект (для связей), `args` — параметры запроса, `context` — общие зависимости (БД, юзер), `info` — метаданные.
- **`startStandaloneServer`** — упрощённый запуск HTTP+GraphQL "из коробки". Для боевых проектов используют `expressMiddleware` с собственным Express-приложением.

Запуск:
```bash
cd practice_26
docker compose up --build      # http://localhost:4000

# Или локально:
npm install
npm start
```

Примеры запросов:
```graphql
query {
  books {
    title
    year
    author { name }
  }
}

mutation {
  createBook(title: "Идиот", year: 1869, authorId: "2") {
    id
    title
    author { name }
  }
}
```
