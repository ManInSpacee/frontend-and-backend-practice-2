import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../config/database.js';
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

router.post('/register', async (req, res) => {
  const { email, first_name, last_name, password, role } = req.body;
  if (!email || !first_name || !last_name || !password) {
    return res.status(400).json({ message: 'Все поля обязательны' });
  }
  try {
    const userRole = ['user', 'seller', 'admin'].includes(role) ? role : 'user';
    const user = await User.create({
      email, first_name, last_name,
      password: bcrypt.hashSync(password, 10),
      role: userRole,
    });
    res.status(201).json({ id: user.id, email, first_name, last_name, role: userRole });
  } catch (err) {
    res.status(409).json({ message: 'Email уже занят' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email и пароль обязательны' });
  const user = await User.findOne({ where: { email } });
  if (!user || user.blocked) return res.status(401).json({ message: 'Неверные данные или аккаунт заблокирован' });
  if (!bcrypt.compareSync(password, user.password)) return res.status(401).json({ message: 'Неверные данные' });
  res.json({ ...generateTokens({ id: user.id, email: user.email, role: user.role }), user: { id: user.id, email: user.email, role: user.role } });
});

router.post('/refresh', async (req, res) => {
  const refreshToken = req.headers['x-refresh-token'];
  if (!refreshToken) return res.status(401).json({ message: 'Refresh-токен не предоставлен' });
  try {
    const decoded = jwt.verify(refreshToken, jwtRefreshSecret);
    const user = await User.findByPk(decoded.id);
    if (!user || user.blocked) return res.status(401).json({ message: 'Пользователь не найден или заблокирован' });
    res.json(generateTokens({ id: user.id, email: user.email, role: user.role }));
  } catch {
    return res.status(401).json({ message: 'Недействительный refresh-токен' });
  }
});

router.get('/me', authMiddleware, roleMiddleware(['user', 'seller', 'admin']), async (req, res) => {
  const user = await User.findByPk(req.user.id);
  if (!user) return res.status(404).json({ message: 'Не найден' });
  res.json({ id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name, role: user.role });
});

export default router;
