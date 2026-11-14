const mysql = require('mysql2/promise');

// Clean helper to sanitize and trim environment variables
const cleanEnv = (val) => {
  if (!val) return '';
  let s = val.toString().trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1).trim();
  }
  return s;
};

let dbPassword = cleanEnv(process.env.DB_PASSWORD);
if (dbPassword === 'your_mysql_password') dbPassword = '';
if (dbPassword.toLowerCase().startsWith('password-')) {
  dbPassword = dbPassword.substring('password-'.length);
}

let dbUser = cleanEnv(process.env.DB_USER) || 'root';
let host = cleanEnv(process.env.DB_HOST) || 'localhost';
let dbName = cleanEnv(process.env.DB_NAME) || 'tuyel_electricals';
let port = parseInt(cleanEnv(process.env.DB_PORT)) || 4000;

const isTiDB = host.includes('tidbcloud.com') || (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('tidbcloud.com'));

const sslConfig = (cleanEnv(process.env.DB_SSL) === 'true' || isTiDB) ? {
  minVersion: 'TLSv1.2',
  rejectUnauthorized: true
} : undefined;

let pool;
let isUsingUrl = false;

// If DATABASE_URL is explicitly set and DB_HOST is NOT set, use DATABASE_URL
if (process.env.DATABASE_URL && (!process.env.DB_HOST || process.env.DB_HOST === 'localhost')) {
  let dbUrl = cleanEnv(process.env.DATABASE_URL);
  if (dbUrl.includes('agateway01.')) {
    dbUrl = dbUrl.replace('agateway01.', '@gateway01.');
  }
  isUsingUrl = true;
  console.log('🔌 Connecting using DATABASE_URL mode');
  pool = mysql.createPool(dbUrl);
} else {
  // Use discrete variables
  console.log(`🔌 DB Connection Config:`);
  console.log(`   Host: [${host}] Port: [${port}]`);
  console.log(`   User: [${dbUser}]`);
  console.log(`   Database: [${dbName}]`);
  console.log(`   Password Length: ${dbPassword.length} (Preview: ${dbPassword ? dbPassword.substring(0, 2) + '...' + dbPassword.substring(dbPassword.length - 2) : 'EMPTY'})`);
  console.log(`   SSL: ${!!sslConfig}`);

  pool = mysql.createPool({
    host: host,
    port: port,
    user: dbUser,
    password: dbPassword,
    database: dbName,
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
    if (error.code === 'ER_ACCESS_DENIED_ERROR' || error.message.includes('Access denied')) {
      console.error('\n⚠️  AUTH FAILURE DIAGNOSIS:');
      console.error(`   Attempted User: [${dbUser}]`);
      console.error(`   Attempted Host: [${host}]`);
      console.error(`   Password Length in Render: ${dbPassword.length} chars (starts with "${dbPassword.substring(0, 2)}", ends with "${dbPassword.substring(dbPassword.length - 2)}")`);
      console.error('   Please verify that DB_PASSWORD in Render matches your TiDB Cloud password exactly.\n');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('\n⚠️  Database does not exist yet. Please run schema initialization.\n');
    }
    throw error;
  }
};

module.exports = { pool, testConnection };
