require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const path = require("path");
const rateLimit = require("express-rate-limit");
const bcrypt = require("bcryptjs");

const { pool, testConnection } = require("./config/database");
const routes = require("./routes");
const { errorHandler } = require("./middlewares/errorHandler");

const app = express();
const PORT = process.env.PORT || 5000;

// =====================================================
// 1. SECURITY MIDDLEWARE
// =====================================================

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  }),
);

// =====================================================
// 2. CORS CONFIGURATION
// =====================================================

const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header (e.g. curl)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin not allowed by CORS"));
    },

    credentials: true,

    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],

    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// =====================================================
// 3. RATE LIMITING
// =====================================================

const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,

  max: Number(process.env.RATE_LIMIT_MAX) || 100,

  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },

  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/", limiter);

// =====================================================
// 4. BODY PARSER
// =====================================================

app.use(express.json({ limit: "10mb" }));

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  }),
);

// =====================================================
// 5. COMPRESSION AND LOGGING
// =====================================================

app.use(compression());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// =====================================================
// 6. STATIC FILES
// =====================================================

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// =====================================================
// 7. HEALTH CHECK
// =====================================================

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "TUYEL ELECTRICALS API is running",
    timestamp: new Date().toISOString(),
  });
});

// =====================================================
// 8. API ROUTES
// =====================================================

app.use("/api/v1", routes);

// =====================================================
// 9. 404 HANDLER
// =====================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// =====================================================
// 10. GLOBAL ERROR HANDLER
// =====================================================

app.use(errorHandler);

// =====================================================
// 11. DATABASE SCHEMA VALIDATION
// =====================================================

const ensureDatabaseSchema = async () => {
  const requiredTables = ["roles", "users"];

  const [tables] = await pool.query(
    `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = DATABASE()
      AND table_name IN (?, ?)
    `,
    requiredTables,
  );

  const existingTables = tables.map((table) => table.table_name);

  const missingTables = requiredTables.filter(
    (table) => !existingTables.includes(table),
  );

  if (missingTables.length > 0) {
    throw new Error(
      `Database tables missing: ${missingTables.join(", ")}. ` +
        "Please run your database.sql initialization script.",
    );
  }

  console.log("✅ Database schema validation successful.");
};

// =====================================================
// 12. ADMIN USER INITIALIZATION
// =====================================================

const ensureAdminUser = async () => {
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@tuyel.com")
    .toLowerCase()
    .trim();

  // Do not trim or modify the actual password.
  const adminPassword = process.env.ADMIN_PASSWORD;

  // Check whether admin already exists.
  const [users] = await pool.query(
    "SELECT id FROM users WHERE LOWER(email) = ? LIMIT 1",
    [adminEmail],
  );

  // Never overwrite an existing admin password automatically.
  if (users.length > 0) {
    console.log("✅ Admin account already exists.");
    return;
  }

  if (!adminPassword) {
    throw new Error(
      "ADMIN_PASSWORD is required to create the initial admin account.",
    );
  }

  // Find admin role.
  const [roles] = await pool.query(
    "SELECT id FROM roles WHERE name = ? LIMIT 1",
    ["admin"],
  );

  let adminRoleId;

  if (roles.length > 0) {
    adminRoleId = roles[0].id;
  } else {
    const [result] = await pool.query(
      "INSERT INTO roles (name, description) VALUES (?, ?)",
      ["admin", "Full system access"],
    );

    adminRoleId = result.insertId;
  }

  // Hash password.
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  // Create initial admin account.
  await pool.query(
    `
      INSERT INTO users
      (name, email, password, role_id, phone, is_active)
      VALUES (?, ?, ?, ?, ?, 1)
    `,
    [
      "Admin",
      adminEmail,
      hashedPassword,
      adminRoleId,
      process.env.ADMIN_PHONE || "9876543210",
    ],
  );

  console.log(`✅ Initial admin account created: ${adminEmail}`);
};

// =====================================================
// 13. START SERVER
// =====================================================

const startServer = async () => {
  try {
    console.log("\n======================================");
    console.log("Starting TUYEL ELECTRICALS API");
    console.log("======================================");

    // Step 1: Verify database connection.
    await testConnection();

    // Step 2: Verify required database tables.
    await ensureDatabaseSchema();

    // Step 3: Create admin only if it does not exist.
    await ensureAdminUser();

    // Step 4: Start Express server.
    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log("\n======================================");
      console.log("🚀 SERVER STARTED SUCCESSFULLY");
      console.log("======================================");
      console.log(`Environment: ${process.env.NODE_ENV || "production"}`);
      console.log(`Port: ${PORT}`);
      console.log(`API: /api/v1`);
      console.log(`Health: /health`);
      console.log("======================================\n");
    });

    server.on("error", (error) => {
      console.error("HTTP server error:", error.message);
      process.exit(1);
    });
  } catch (error) {
    console.error("\n❌ SERVER STARTUP FAILED");
    console.error(error.message);

    await pool.end().catch(() => {});

    process.exit(1);
  }
};

startServer();
