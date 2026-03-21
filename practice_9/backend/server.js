import express from "express";
import cors from "cors";
import { nanoid } from "nanoid";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

const ACCESS_SECRET = "access-secret";
const REFRESH_SECRET = "refresh-secret";
const ACCESS_EXPIRES_IN = "15s";
const REFRESH_EXPIRES_IN = "30s";

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Практика 9 — Refresh-токены",
    version: "1.0.0",
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
};

const swaggerSpec = swaggerJsdoc({
  swaggerDefinition,
  apis: ["./server.js"],
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

function generateAccessToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, ACCESS_SECRET, {
    expiresIn: ACCESS_EXPIRES_IN,
  });
}

function generateRefreshToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRES_IN,
  });
}

function authMiddleware(req, res, next) {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Токен не передан" });
  }

  const token = authorization.split(" ")[1];
  try {
    const payload = jwt.verify(token, ACCESS_SECRET);
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: "Невалидный токен" });
  }
}

const users = [];
const refreshTokens = new Set();

const products = [
  {
    id: nanoid(6),
    name: "Хлеб Бородинский",
    price: 45,
    category: "Выпечка",
    rating: 5,
    stock: 20,
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400",
  },
  {
    id: nanoid(6),
    name: "Молоко 3.2%",
    price: 89,
    category: "Молочные продукты",
    rating: 4,
    stock: 15,
    image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400",
  },
  {
    id: nanoid(6),
    name: "Яблоки Гала",
    price: 120,
    category: "Фрукты",
    rating: 4,
    stock: 50,
    image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400",
  },
  {
    id: nanoid(6),
    name: "Куриная грудка",
    price: 350,
    category: "Мясо",
    rating: 5,
    stock: 10,
    image: "https://images.unsplash.com/photo-1604503468506-a8da13d11d36?w=400",
  },
  {
    id: nanoid(6),
    name: "Паста Barilla",
    price: 95,
    category: "Бакалея",
    rating: 5,
    stock: 30,
    image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400",
  },
  {
    id: nanoid(6),
    name: "Апельсиновый сок",
    price: 130,
    category: "Напитки",
    rating: 4,
    stock: 25,
    image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400",
  },
];

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Регистрация пользователя
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string, example: user@mail.com }
 *               first_name: { type: string, example: Иван }
 *               last_name: { type: string, example: Иванов }
 *               password: { type: string, example: "123456" }
 *     responses:
 *       201: { description: Пользователь создан }
 *       400: { description: Не все поля заполнены }
 *       409: { description: Email уже занят }
 */
app.post("/api/auth/register", async (req, res) => {
  const { email, first_name, last_name, password } = req.body;

  if (!email || !first_name || !last_name || !password) {
    return res.status(400).json({ error: "Все поля обязательны" });
  }

  const existingUser = users.find((u) => u.email === email);
  if (existingUser) {
    return res
      .status(409)
      .json({ error: "Пользователь с такой почтой уже существует" });
  }

  const hashedPassword = await hashPassword(password);
  const newUser = {
    id: nanoid(6),
    email,
    first_name,
    last_name,
    password: hashedPassword,
  };
  users.push(newUser);

  res.status(201).json({ id: newUser.id, email, first_name, last_name });
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Вход в систему
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string, example: user@mail.com }
 *               password: { type: string, example: "123456" }
 *     responses:
 *       200: { description: Возвращает accessToken и refreshToken }
 *       401: { description: Неверные данные }
 */
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  const user = users.find((u) => u.email === email);
  if (!user) {
    return res.status(401).json({ error: "Неверный email или пароль" });
  }

  const isValid = await verifyPassword(password, user.password);
  if (!isValid) {
    return res.status(401).json({ error: "Неверный email или пароль" });
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  refreshTokens.add(refreshToken);

  return res.status(200).json({ accessToken, refreshToken });
});

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Обновление пары токенов
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     description: Передай refreshToken в заголовке Authorization Bearer
 *     responses:
 *       200: { description: Новая пара accessToken и refreshToken }
 *       401: { description: Невалидный или истёкший refresh-токен }
 */
app.post("/api/auth/refresh", (req, res) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Refresh-токен не передан" });
  }

  const refreshToken = authorization.split(" ")[1];

  if (!refreshTokens.has(refreshToken)) {
    return res.status(401).json({ error: "Невалидный refresh-токен" });
  }

  try {
    const payload = jwt.verify(refreshToken, REFRESH_SECRET);
    const user = users.find((u) => u.id === payload.id);
    if (!user) {
      return res.status(401).json({ error: "Пользователь не найден" });
    }

    refreshTokens.delete(refreshToken);

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    refreshTokens.add(newRefreshToken);

    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (e) {
    return res
      .status(401)
      .json({ error: "Невалидный или истёкший refresh-токен" });
  }
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Получить текущего пользователя
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Данные пользователя }
 *       401: { description: Токен не передан или невалиден }
 */
app.get("/api/auth/me", authMiddleware, (req, res) => {
  const user = users.find((u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: "Пользователь не найден" });
  res.json({
    id: user.id,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
  });
});

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Получить список товаров
 *     tags: [Products]
 *     responses:
 *       200: { description: Список товаров }
 */
app.get("/api/products", (_req, res) => {
  res.json(products);
});

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Создать товар
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string, example: Батон }
 *               price: { type: number, example: 35 }
 *               category: { type: string, example: Выпечка }
 *               rating: { type: number, example: 4 }
 *               stock: { type: number, example: 10 }
 *               image: { type: string, example: "https://..." }
 *     responses:
 *       201: { description: Товар создан }
 */
app.post("/api/products", (req, res) => {
  const { name, price, category, rating, stock, image } = req.body;
  const newProduct = {
    id: nanoid(6),
    name: name.trim(),
    price: Number(price),
    category: category.trim(),
    rating: Number(rating),
    stock: Number(stock),
    image: image.trim(),
  };
  products.push(newProduct);
  res.status(201).json(newProduct);
});

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Получить товар по id
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Товар }
 *       404: { description: Не найден }
 */
app.get("/api/products/:id", (req, res) => {
  const product = products.find((p) => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: "Товар не найден" });
  res.json(product);
});

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Обновить товар
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200: { description: Обновлённый товар }
 *       404: { description: Не найден }
 */
app.put("/api/products/:id", authMiddleware, (req, res) => {
  const product = products.find((p) => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: "Товар не найден" });
  Object.assign(product, req.body);
  res.json(product);
});

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Удалить товар
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Товар удалён }
 *       404: { description: Не найден }
 */
app.delete("/api/products/:id", authMiddleware, (req, res) => {
  const index = products.findIndex((p) => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Товар не найден" });
  products.splice(index, 1);
  res.json({ message: "Товар удалён" });
});

app.listen(port, () => {
  console.log(`Сервер запущен: http://localhost:${port}`);
  console.log(`Swagger UI: http://localhost:${port}/docs`);
});
