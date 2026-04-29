import { Router } from 'express';
import { Product } from '../config/database.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';
import { cacheMiddleware, saveToCache, invalidateProductsCache } from '../middleware/cache.js';

const router = Router();

const TTL = 600; // 10 минут

router.get('/', authMiddleware, roleMiddleware(['user', 'seller', 'admin']),
  cacheMiddleware(() => 'products:all', TTL),
  async (req, res) => {
    const products = await Product.findAll();
    await saveToCache(req.cacheKey, products, req.cacheTTL);
    res.json({ source: 'server', data: products });
  }
);

router.get('/:id', authMiddleware, roleMiddleware(['user', 'seller', 'admin']),
  cacheMiddleware((req) => `products:${req.params.id}`, TTL),
  async (req, res) => {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Не найден' });
    await saveToCache(req.cacheKey, product, req.cacheTTL);
    res.json({ source: 'server', data: product });
  }
);

router.post('/', authMiddleware, roleMiddleware(['seller', 'admin']), async (req, res) => {
  const { name, price, description } = req.body;
  if (!name || price === undefined) return res.status(400).json({ message: 'name и price обязательны' });
  const product = await Product.create({ name, price: Number(price), description: description || '' });
  await invalidateProductsCache();
  res.status(201).json({ message: 'Товар добавлен', product });
});

router.put('/:id', authMiddleware, roleMiddleware(['seller', 'admin']), async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) return res.status(404).json({ message: 'Не найден' });
  const { name, price, description } = req.body;
  await product.update({ name: name ?? product.name, price: price !== undefined ? Number(price) : product.price, description: description ?? product.description });
  await invalidateProductsCache(product.id);
  res.json({ message: 'Товар обновлён', product });
});

router.delete('/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) return res.status(404).json({ message: 'Не найден' });
  await product.destroy();
  await invalidateProductsCache(product.id);
  res.json({ message: 'Товар удалён' });
});

export default router;
