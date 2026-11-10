require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function resetAdmin() {
  const host = process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT) || 3306;
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD === 'your_mysql_password' ? '' : (process.env.DB_PASSWORD || '');
  const database = process.env.DB_NAME || 'tuyel_electricals';
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@tuyel.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';

  console.log(`\n🔑 Resetting admin credentials in database '${database}'...`);

  let connection;
  try {
    connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      database,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
    });

    // Ensure admin role exists
    const [roles] = await connection.query('SELECT id FROM roles WHERE name = "admin"');
    let adminRoleId = 1;
    if (roles.length > 0) {
      adminRoleId = roles[0].id;
    } else {
      const [res] = await connection.query('INSERT INTO roles (name, description) VALUES ("admin", "Full system access")');
      adminRoleId = res.insertId;
    }

    const hashed = await bcrypt.hash(adminPassword, 10);

    const [existing] = await connection.query(
      'SELECT id, email, role_id FROM users WHERE email = ?',
      [adminEmail]
    );

    if (existing.length > 0) {
      await connection.query(
        'UPDATE users SET password = ?, role_id = ?, is_active = 1 WHERE email = ?',
        [hashed, adminRoleId, adminEmail]
      );
      console.log(`✅ Admin password successfully updated for: ${adminEmail}`);
    } else {
      await connection.query(
        'INSERT INTO users (name, email, password, role_id, phone, is_active) VALUES (?, ?, ?, ?, ?, 1)',
        ['Admin', adminEmail, hashed, adminRoleId, '9876543210']
      );
      console.log(`✅ New Admin user successfully created: ${adminEmail}`);
    }

    console.log('\n============================================================');
    console.log('🎉 ADMIN CREDENTIALS VERIFIED');
    console.log('============================================================');
    console.log(`Email   : ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log('Role    : admin (Full system access)');
    console.log('============================================================\n');
  } catch (error) {
    console.error('❌ Failed to reset admin credentials:', error.message);
    if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('\nDatabase does not exist yet. Please run: npm run db:init\n');
    }
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

resetAdmin();

