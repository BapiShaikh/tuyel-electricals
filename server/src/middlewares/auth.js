const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [rows] = await pool.query('SELECT id, name, email, role_id FROM users WHERE id = ? AND is_active = 1', [decoded.id]);
    if (rows.length === 0) return res.status(401).json({ success: false, message: 'User not found or inactive.' });
    req.user = { ...decoded, ...rows[0] };
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') return res.status(401).json({ success: false, message: 'Token expired. Please login again.' });
    return res.status(401).json({ success: false, message: 'Invalid token.' });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'staff')) return next();
  return res.status(403).json({ success: false, message: 'Access denied. Admin rights required.' });
};

const requireSuperAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  return res.status(403).json({ success: false, message: 'Access denied. Super admin rights required.' });
};

module.exports = { authenticate, requireAdmin, requireSuperAdmin };

