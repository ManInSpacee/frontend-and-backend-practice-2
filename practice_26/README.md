# Практика 26. GraphQL и Apollo Server

## Описание
GraphQL API для управления каталогом книг и авторов на Apollo Server. Демонстрирует систему типов GraphQL, резолверы (включая вложенные для связей), Query и Mutation операции. Тестирование через встроенный Apollo Sandbox.

## Стек технологий
- Backend: Node.js, Apollo Server 4 (standalone)
- Язык запросов: GraphQL (SDL)
- Контейнеризация: Docker, Docker Compose

## Запуск проекта

### Требования
- Docker и Docker Compose

### Шаги
1. Перейти в папку: `cd practice_26`
2. Запустить: `docker compose up --build`
3. Открыть Apollo Sandbox в браузере: http://localhost:4000

### Локальный запуск (без Docker)
```bash
npm install
npm start
```

## Что реализовано
- Типы `Book` и `Author` со связью "один-ко-многим"
- `Query`: `books`, `book(id)`, `authors`
- `Mutation`: `createAuthor`, `createBook`
- Вложенные резолверы: `Author.books` и `Book.author`

## Примеры запросов
```graphql
query {
  books {
    title
    year
    author { name }
  }
}

query {
  authors {
    name
    books { title year }
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
