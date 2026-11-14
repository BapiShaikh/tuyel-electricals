const mysql = require("mysql2/promise");

const requiredEnv = (name) => {
  const value = process.env[name];

  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
};

const host = requiredEnv("DB_HOST").trim();
const port = Number(process.env.DB_PORT || 4000);
const user = requiredEnv("DB_USER").trim();
const password = requiredEnv("DB_PASSWORD");
const database = requiredEnv("DB_NAME").trim();

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("Invalid DB_PORT");
}

const isTiDB = host.endsWith(".tidbcloud.com");

const pool = mysql.createPool({
  host,
  port,
  user,
  password,
  database,
  ssl:
    isTiDB || process.env.DB_SSL === "true"
      ? {
          minVersion: "TLSv1.2",
          rejectUnauthorized: true,
        }
      : undefined,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: "utf8mb4",
  timezone: "+05:30",
});

const testConnection = async () => {
  let connection;

  try {
    connection = await pool.getConnection();
    await connection.ping();

    console.log("✅ Database connected successfully!");
    console.log(`📦 Database: ${database}`);
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);

    if (
      error.code === "ER_ACCESS_DENIED_ERROR" ||
      error.message.includes("Access denied")
    ) {
      console.error("Check DB_USER and DB_PASSWORD in Render.");
    }

    throw error;
  } finally {
    if (connection) connection.release();
  }
};

module.exports = { pool, testConnection };
