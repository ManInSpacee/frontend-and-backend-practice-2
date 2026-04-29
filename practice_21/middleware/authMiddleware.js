import jwt from 'jsonwebtoken';
import { jwtSecret } from '../config/auth.js';

export function authMiddleware(req, res, next) {
  const { authorization } = req.headers;
  if (!authorization?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Токен не предоставлен' });
  }
  try {
    req.user = jwt.verify(authorization.split(' ')[1], jwtSecret);
    next();
  } catch {
    return res.status(401).json({ message: 'Недействительный токен' });
  }
}
