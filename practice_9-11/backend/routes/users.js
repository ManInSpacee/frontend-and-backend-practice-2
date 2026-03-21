import { Router } from 'express';
import { loadDB, saveDB } from '../config/database.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = Router();
router.use(authMiddleware, roleMiddleware(['admin']));

router.get('/', (_req, res) => {
  const db = loadDB();
  res.json(db.users.map(u => ({ id: u.id, email: u.email, first_name: u.first_name, last_name: u.last_name, role: u.role, blocked: u.blocked })));
});

router.put('/:id', (req, res) => {
  const { role, blocked } = req.body;
  const db = loadDB();
  const index = db.users.findIndex(u => u.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ message: 'Пользователь не найден' });
  const existing = db.users[index];
  db.users[index] = {
    ...existing,
    role: role || existing.role,
    blocked: blocked !== undefined ? blocked : existing.blocked,
  };
  saveDB(db);
  const u = db.users[index];
  res.json({ id: u.id, email: u.email, first_name: u.first_name, last_name: u.last_name, role: u.role, blocked: u.blocked });
});

router.delete('/:id', (req, res) => {
  const db = loadDB();
  const index = db.users.findIndex(u => u.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ message: 'Пользователь не найден' });
  db.users[index].blocked = true;
  saveDB(db);
  res.json({ message: 'Пользователь заблокирован' });
});

export default router;
