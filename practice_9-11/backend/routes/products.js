import { Router } from 'express';
import { loadDB, saveDB } from '../config/database.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = Router();

router.get('/', authMiddleware, roleMiddleware(['user', 'seller', 'admin']), (_req, res) => {
  res.json(loadDB().products);
});

router.get('/:id', authMiddleware, roleMiddleware(['user', 'seller', 'admin']), (req, res) => {
  const product = loadDB().products.find(p => p.id === Number(req.params.id));
  if (!product) return res.status(404).json({ message: 'Товар не найден' });
  res.json(product);
});

router.post('/', authMiddleware, roleMiddleware(['seller', 'admin']), (req, res) => {
  const { name, category, description, price, stock } = req.body;
  if (!name || !category || price === undefined) {
    return res.status(400).json({ message: 'Обязательные поля: name, category, price' });
  }
  const db = loadDB();
  const newProduct = { id: db.nextProductId++, name, category, description: description || '', price: Number(price), stock: Number(stock) || 0 };
  db.products.push(newProduct);
  saveDB(db);
  res.status(201).json({ message: 'Товар добавлен', product: newProduct });
});

router.put('/:id', authMiddleware, roleMiddleware(['seller', 'admin']), (req, res) => {
  const db = loadDB();
  const index = db.products.findIndex(p => p.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ message: 'Товар не найден' });
  const { name, category, description, price, stock } = req.body;
  const existing = db.products[index];
  db.products[index] = {
    ...existing,
    name: name || existing.name,
    category: category || existing.category,
    description: description !== undefined ? description : existing.description,
    price: price !== undefined ? Number(price) : existing.price,
    stock: stock !== undefined ? Number(stock) : existing.stock,
  };
  saveDB(db);
  res.json({ message: 'Товар обновлён', product: db.products[index] });
});

router.delete('/:id', authMiddleware, roleMiddleware(['admin']), (req, res) => {
  const db = loadDB();
  const index = db.products.findIndex(p => p.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ message: 'Товар не найден' });
  db.products.splice(index, 1);
  saveDB(db);
  res.json({ message: 'Товар удалён' });
});

export default router;
