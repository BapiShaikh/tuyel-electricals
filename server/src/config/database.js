const mysql = require('mysql2/promise');

const dbPassword = process.env.DB_PASSWORD === 'your_mysql_password' ? '' : (process.env.DB_PASSWORD || '');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: dbPassword,
  database: process.env.DB_NAME || 'tuyel_electricals',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+05:30',
  charset: 'utf8mb4',
  ssl: (process.env.DB_SSL === 'true' || (process.env.DB_HOST && process.env.DB_HOST.includes('tidbcloud.com'))) ? {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: false
  } : undefined
});

const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL Database connected successfully');
    connection.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n⚠️  Access Denied: Please check your MySQL password in server/.env (DB_PASSWORD=...)');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('\n⚠️  Database "tuyel_electricals" does not exist yet. Please run: npm run db:init');
    }
    throw error;
  }
};

module.exports = { pool, testConnection };
