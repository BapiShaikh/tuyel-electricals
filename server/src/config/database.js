const mysql = require('mysql2/promise');

let dbPassword = process.env.DB_PASSWORD === 'your_mysql_password' ? '' : (process.env.DB_PASSWORD || '');
if (dbPassword.toLowerCase().startsWith('password-')) {
  dbPassword = dbPassword.substring('password-'.length);
}

let dbUser = (process.env.DB_USER || 'root').trim();
const host = (process.env.DB_HOST || 'localhost').trim();
const isTiDB = host.includes('tidbcloud.com') || (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('tidbcloud.com'));

const sslConfig = (process.env.DB_SSL === 'true' || isTiDB) ? {
  minVersion: 'TLSv1.2',
  rejectUnauthorized: false
} : undefined;

let pool;

// Priority 1: If discrete DB_HOST is configured and points to a remote host (like TiDB cloud),
// use it directly. This avoids URL parsing issues or typo in DATABASE_URL (like 'a' instead of '@').
if (process.env.DB_HOST && process.env.DB_HOST !== 'localhost') {
  pool = mysql.createPool({
    host: host,
    port: parseInt(process.env.DB_PORT) || (isTiDB ? 4000 : 3306),
    user: dbUser,
    password: dbPassword,
    database: (process.env.DB_NAME || 'tuyel_electricals').trim(),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    timezone: '+05:30',
    charset: 'utf8mb4',
    ssl: sslConfig,
    multipleStatements: true
  });
} else if (process.env.DATABASE_URL) {
  let dbUrl = process.env.DATABASE_URL.trim();
  // Auto-correct typo where 'a' was typed instead of '@' before gateway01
  if (dbUrl.includes('agateway01.')) {
    dbUrl = dbUrl.replace('agateway01.', '@gateway01.');
  }
  pool = mysql.createPool(dbUrl);
} else {
  pool = mysql.createPool({
    host: host,
    port: parseInt(process.env.DB_PORT) || 3306,
    user: dbUser,
    password: dbPassword,
    database: process.env.DB_NAME || 'tuyel_electricals',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    timezone: '+05:30',
    charset: 'utf8mb4',
    ssl: sslConfig,
    multipleStatements: true
  });
}

const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log(`✅ MySQL Database connected successfully to ${host || 'database'}`);
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
