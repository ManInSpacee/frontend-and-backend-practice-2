import { Router } from 'express';
import { User } from '../config/database.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';
import { cacheMiddleware, saveToCache, invalidateUsersCache } from '../middleware/cache.js';

const router = Router();
router.use(authMiddleware, roleMiddleware(['admin']));

const TTL = 60; // 1 минута

router.get('/', cacheMiddleware(() => 'users:all', TTL), async (req, res) => {
  const users = await User.findAll({ attributes: ['id', 'email', 'first_name', 'last_name', 'role', 'blocked'] });
  await saveToCache(req.cacheKey, users, req.cacheTTL);
  res.json({ source: 'server', data: users });
});

router.get('/:id', cacheMiddleware((req) => `users:${req.params.id}`, TTL), async (req, res) => {
  const user = await User.findByPk(req.params.id, { attributes: ['id', 'email', 'first_name', 'last_name', 'role', 'blocked'] });
  if (!user) return res.status(404).json({ message: 'Не найден' });
  await saveToCache(req.cacheKey, user, req.cacheTTL);
  res.json({ source: 'server', data: user });
});

router.put('/:id', async (req, res) => {
  const { role, blocked } = req.body;
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ message: 'Не найден' });
  await user.update({ role: role ?? user.role, blocked: blocked ?? user.blocked });
  await invalidateUsersCache(user.id);
  res.json({ id: user.id, email: user.email, role: user.role, blocked: user.blocked });
});

router.delete('/:id', async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ message: 'Не найден' });
  await user.update({ blocked: true });
  await invalidateUsersCache(user.id);
  res.json({ message: 'Пользователь заблокирован' });
});

export default router;
