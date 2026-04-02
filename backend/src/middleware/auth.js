import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';

const loadUserById = async (userId) => {
  const { rows } = await query(
    'SELECT id, username, email, role, is_active FROM users WHERE id = $1',
    [userId]
  );

  return rows[0] || null;
};

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await loadUserById(decoded.userId);

    if (!user || !user.is_active) {
      return res.status(401).json({ success: false, message: 'User not found or inactive' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired' });
    }

    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

 

export const requireAdmin = (req, res, next) => {
  // Legacy портфолионы тек супер-админ ғана өзгерте алады
  if (req.user?.role !== 'superadmin') {
    return res.status(403).json({ success: false, message: 'Legacy әкімші құқығы қажет' });
  }
  next();
};

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await loadUserById(decoded.userId);
      if (user?.is_active) req.user = user;
    }
  } catch {}
  next();
};
