require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function initDb() {
  const host = process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT) || 3306;
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD === 'your_mysql_password' ? '' : (process.env.DB_PASSWORD || '');

  console.log(`\n🔌 Connecting to MySQL at ${host}:${port} as '${user}'...`);

  let connection;
  try {
    connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      multipleStatements: true,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
    });
  } catch (err) {
    console.error('\n❌ Could not connect to MySQL:');
    if (err.code === 'ECONNREFUSED') {
      console.error('------------------------------------------------------------');
      console.error('⚠️  MySQL server is NOT running on port 3306!');
      console.error('------------------------------------------------------------');
      console.error('HOW TO FIX:');
      console.error('1. If using XAMPP: Open XAMPP Control Panel and click [Start] next to MySQL.');
      console.error('2. If using WampServer: Start WampServer and ensure the icon is green.');
      console.error('3. If using Laragon: Click [Start All].');
      console.error('4. If using standalone MySQL: Open command prompt as Admin and run:');
      console.error('     net start MySQL80   (or: net start mysql)');
      console.error('5. Check server/.env to ensure DB_PORT, DB_USER, and DB_PASSWORD match your setup.');
      console.error('------------------------------------------------------------\n');
    } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('------------------------------------------------------------');
      console.error('⚠️  MySQL Access Denied (Incorrect Username or Password)');
      console.error('------------------------------------------------------------');
      console.error('HOW TO FIX:');
      console.error('Open "server/.env" and set DB_PASSWORD to your MySQL root password.');
      console.error('Example: DB_PASSWORD=your_actual_password');
      console.error('(If using XAMPP without a password, set: DB_PASSWORD=)');
      console.error('------------------------------------------------------------\n');
    } else {
      console.error(err.message);
    }
    process.exit(1);
  }

  try {
    console.log('📖 Reading database.sql...');
    const sqlPath = path.join(__dirname, '../../../database.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('⚡ Executing schema & seeding 17 tables with sample data...');
    await connection.query(sql);

    // Ensure Admin User with correct bcrypt hash for Admin@123 exists
    const bcrypt = require('bcryptjs');
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@tuyel.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
    const hashed = await bcrypt.hash(adminPassword, 10);

    const [existing] = await connection.query(
      'SELECT id FROM users WHERE email = ?',
      [adminEmail]
    );

    if (existing.length > 0) {
      await connection.query(
        'UPDATE users SET password = ?, role_id = 1, is_active = 1 WHERE email = ?',
        [hashed, adminEmail]
      );
    } else {
      await connection.query(
        'INSERT INTO users (name, email, password, role_id, phone, is_active) VALUES (?, ?, ?, 1, ?, 1)',
        ['Admin', adminEmail, hashed, '9876543210']
      );
    }

    console.log('\n============================================================');
    console.log('✅ DATABASE INITIALIZED SUCCESSFULLY!');
    console.log('============================================================');
    console.log('Database Name : tuyel_electricals');
    console.log(`Admin Account : ${adminEmail}`);
    console.log(`Admin Password: ${adminPassword}`);
    console.log('============================================================\n');
  } catch (error) {
    console.error('❌ Error executing database script:', error.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

initDb();
