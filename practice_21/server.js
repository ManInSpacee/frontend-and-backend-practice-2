import express from 'express';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import userRoutes from './routes/users.js';
import { initDB } from './config/database.js';
import { initRedis } from './middleware/cache.js';

const app = express();
const PORT = 3005;

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);

// Сначала подключаем PostgreSQL и Redis, потом запускаем сервер
Promise.all([initDB(), initRedis()]).then(() => {
  app.listen(PORT, () => console.log(`Сервер запущен: http://localhost:${PORT}`));
});
