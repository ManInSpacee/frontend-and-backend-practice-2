import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { loadDB, saveDB } from '../config/database.js';
import { jwtSecret, jwtExpiresIn, jwtRefreshSecret, jwtRefreshExpiresIn } from '../config/auth.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = Router();

function generateTokens(payload) {
  return {
    accessToken: jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiresIn }),
    refreshToken: jwt.sign(payload, jwtRefreshSecret, { expiresIn: jwtRefreshExpiresIn }),
  };
}

router.post('/register', (req, res) => {
  const { email, first_name, last_name, password, role } = req.body;
  if (!email || !first_name || !last_name || !password) {
    return res.status(400).json({ message: 'Все поля обязательны' });
  }
  const db = loadDB();
  if (db.users.find(u => u.email === email)) {
    return res.status(409).json({ message: 'Пользователь с таким email уже существует' });
  }
  const userRole = ['user', 'seller', 'admin'].includes(role) ? role : 'user';
  const newUser = {
    id: db.nextUserId++,
    email, first_name, last_name,
    password: bcrypt.hashSync(password, 10),
    role: userRole,
    blocked: false,
  };
  db.users.push(newUser);
  saveDB(db);
  res.status(201).json({ message: 'Регистрация прошла успешно', user: { id: newUser.id, email, first_name, last_name, role: userRole } });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email и пароль обязательны' });
  const db = loadDB();
  const user = db.users.find(u => u.email === email);
  if (!user) return res.status(401).json({ message: 'Неверный email или пароль' });
  if (user.blocked) return res.status(403).json({ message: 'Аккаунт заблокирован' });
  if (!bcrypt.compareSync(password, user.password)) return res.status(401).json({ message: 'Неверный email или пароль' });
  const { accessToken, refreshToken } = generateTokens({ id: user.id, email: user.email, role: user.role });
  res.json({ accessToken, refreshToken, user: { id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name, role: user.role } });
});

router.post('/refresh', (req, res) => {
  const refreshToken = req.headers['x-refresh-token'];
  if (!refreshToken) return res.status(401).json({ message: 'Refresh-токен не предоставлен' });
  try {
    const decoded = jwt.verify(refreshToken, jwtRefreshSecret);
    const db = loadDB();
    const user = db.users.find(u => u.id === decoded.id);
    if (!user) return res.status(401).json({ message: 'Пользователь не найден' });
    if (user.blocked) return res.status(403).json({ message: 'Аккаунт заблокирован' });
    res.json(generateTokens({ id: user.id, email: user.email, role: user.role }));
  } catch {
    return res.status(401).json({ message: 'Недействительный или истёкший refresh-токен' });
  }
});

router.get('/me', authMiddleware, roleMiddleware(['user', 'seller', 'admin']), (req, res) => {
  const db = loadDB();
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ message: 'Пользователь не найден' });
  res.json({ id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name, role: user.role });
});

export default router;
