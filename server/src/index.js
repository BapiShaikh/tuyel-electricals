require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');

const { pool, testConnection } = require('./config/database');
const routes = require('./routes');
const { errorHandler } = require('./middlewares/errorHandler');
const bcrypt = require('bcryptjs');

// Auto-sync admin user on boot
const ensureAdminUser = async () => {
  try {
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@tuyel.com').toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';

    const [roles] = await pool.query('SELECT id FROM roles WHERE name = "admin" LIMIT 1');
    let adminRoleId = 1;
    if (roles.length > 0) {
      adminRoleId = roles[0].id;
    } else {
      const [res] = await pool.query('INSERT INTO roles (name, description) VALUES ("admin", "Full system access")');
      adminRoleId = res.insertId;
    }

    const hashed = await bcrypt.hash(adminPassword, 10);
    const [users] = await pool.query('SELECT id, password FROM users WHERE LOWER(email) = ?', [adminEmail]);

    if (users.length === 0) {
      await pool.query(
        'INSERT INTO users (name, email, password, role_id, phone, is_active) VALUES (?, ?, ?, ?, ?, 1)',
        ['Admin', adminEmail, hashed, adminRoleId, '9876543210']
      );
      console.log(`👤 Admin account prepared: ${adminEmail} (password: ${adminPassword})`);
    } else {
      const isMatch = await bcrypt.compare(adminPassword, users[0].password);
      if (!isMatch) {
        await pool.query('UPDATE users SET password = ?, role_id = ?, is_active = 1 WHERE id = ?', [hashed, adminRoleId, users[0].id]);
        console.log(`🔑 Admin account credentials synced: ${adminEmail}`);
      }
    }
  } catch (err) {
    console.warn('⚠️  Admin sync note:', err.message);
  }
};

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(s => s.trim())
  : ['http://localhost:5173'];

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps, curl, or same-origin)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    // Allow any vercel preview / render / netlify domains
    if (origin.endsWith('.vercel.app') || origin.endsWith('.onrender.com') || origin.endsWith('.netlify.app')) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api/v1', routes);

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'TUYEL ELECTRICALS API is running', timestamp: new Date().toISOString() });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error Handler
app.use(errorHandler);

// Start Server
const startServer = async () => {
  try {
    await testConnection();
    await ensureAdminUser();
    app.listen(PORT, () => {
      console.log(`\n🚀 TUYEL ELECTRICALS Server running on port ${PORT}`);
      console.log(`📁 Environment: ${process.env.NODE_ENV}`);
      console.log(`🔗 API: http://localhost:${PORT}/api/v1`);
      console.log(`❤️  Health: http://localhost:${PORT}/health\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

