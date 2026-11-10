# TUYEL ELECTRICALS — Complete Business Website

> **Your Trusted Partner for Electrical Products & Services**

A full-stack web application for a local electrical business featuring:

- 🛒 Online Product Shop with Cart & Ordering
- 🔧 Electrical Service Booking System
- 📊 Admin Dashboard with complete management
- 📱 WhatsApp Integration
- 📦 Inventory Management

---

## Tech Stack

| Layer       | Technology                     |
| ----------- | ------------------------------ |
| Frontend    | React 18 + Vite + Tailwind CSS |
| Backend     | Node.js + Express.js           |
| Database    | MySQL 8                        |
| Auth        | JWT + bcryptjs                 |
| File Upload | Multer                         |

---

## Project Structure

```
tuyel/
├── client/                 # React Frontend
│   └── src/
│       ├── pages/          # Public & Admin pages
│       ├── components/     # Reusable components
│       ├── layouts/        # PublicLayout & AdminLayout
│       ├── context/        # Auth, Cart, Settings contexts
│       ├── services/       # API client (axios)
│       └── utils/          # Helpers
├── server/                 # Node.js Backend
│   └── src/
│       ├── controllers/    # Route handlers
│       ├── routes/         # Express routes
│       ├── middlewares/    # Auth, upload, error
│       └── config/         # Database config
├── database.sql            # Complete MySQL schema
└── README.md
```

---

## Setup Instructions

### 1. Prerequisites

- Node.js 18+
- MySQL 8.0+

### 2. Database Setup

```bash
# Login to MySQL
mysql -u root -p

# Run the schema file
source d:/Bapi/tuyel/database.sql
```

### 3. Backend Setup

```bash
cd server

# Copy env file and configure
copy .env.example .env
# Edit .env: set DB_HOST, DB_USER, DB_PASSWORD, JWT_SECRET

# Install dependencies
npm install

# Start server
npm run dev
```

### 4. Frontend Setup

```bash
cd client

# Install dependencies
npm install

# Create .env
echo "VITE_API_URL=http://localhost:5000/api/v1" > .env

# Start dev server
npm run dev
```

---

## Admin Access

| Field    | Value                             |
| -------- | --------------------------------- |
| URL      | http://localhost:5173/admin/login |
| Email    | admin@tuyel.com                   |
| Password | Admin@123                         |

> ⚠️ **Change the password immediately after first login!**

---

## API Endpoints

### Authentication

| Method | Endpoint               | Description |
| ------ | ---------------------- | ----------- |
| POST   | `/api/v1/auth/login`   | Admin login |
| GET    | `/api/v1/auth/profile` | Get profile |

### Products (Public)

| Method | Endpoint               | Description                  |
| ------ | ---------------------- | ---------------------------- |
| GET    | `/api/v1/products`     | List products (with filters) |
| GET    | `/api/v1/products/:id` | Get product by ID or slug    |

### Products (Admin)

| Method | Endpoint               | Description    |
| ------ | ---------------------- | -------------- |
| POST   | `/api/v1/products`     | Create product |
| PUT    | `/api/v1/products/:id` | Update product |
| DELETE | `/api/v1/products/:id` | Delete product |

### Services (Public)

| Method | Endpoint                      | Description        |
| ------ | ----------------------------- | ------------------ |
| GET    | `/api/v1/services`            | List all services  |
| GET    | `/api/v1/services/categories` | Service categories |

### Bookings

| Method | Endpoint                      | Description             |
| ------ | ----------------------------- | ----------------------- |
| POST   | `/api/v1/bookings`            | Submit booking (public) |
| GET    | `/api/v1/bookings/track/:id`  | Track booking (public)  |
| GET    | `/api/v1/bookings`            | List bookings (admin)   |
| PUT    | `/api/v1/bookings/:id/status` | Update status (admin)   |

### Orders

| Method | Endpoint                    | Description           |
| ------ | --------------------------- | --------------------- |
| POST   | `/api/v1/orders`            | Place order (public)  |
| GET    | `/api/v1/orders`            | List orders (admin)   |
| PUT    | `/api/v1/orders/:id/status` | Update status (admin) |

### Dashboard (Admin)

| Method | Endpoint                             | Description      |
| ------ | ------------------------------------ | ---------------- |
| GET    | `/api/v1/dashboard/statistics`       | Key stats        |
| GET    | `/api/v1/dashboard/recent-orders`    | Recent orders    |
| GET    | `/api/v1/dashboard/recent-bookings`  | Recent bookings  |
| GET    | `/api/v1/dashboard/popular-products` | Popular products |

---

## Features

### Public Website

- 🏠 **Homepage** — Hero, categories, featured products, services, reviews
- 🛒 **Shop** — Filter by category, brand, price; sort; pagination
- 📦 **Product Detail** — Images gallery, cart, WhatsApp enquiry
- 🔧 **Services** — Grouped by category with booking CTA
- 📋 **Book a Service** — Full booking form with image upload
- 🛍️ **Cart & Checkout** — Cart management, order placement
- 🔍 **Track Booking** — Check booking status by ID + phone
- 📍 **Contact** — WhatsApp form, shop info
- ℹ️ **About** — Business info and stats

### Admin Panel

- 📊 **Dashboard** — Stats, recent orders, bookings, popular products
- 📦 **Products** — Add/edit/delete with images, pricing, stock
- 🏷️ **Categories** — Hierarchical category management
- 🏢 **Brands** — Brand management
- 🔧 **Services** — Service management with pricing
- 📋 **Service Bookings** — View, search, filter, update status
- 🛍️ **Orders** — Order management and status updates
- 👥 **Customers** — Customer list and history
- 📦 **Inventory** — Stock levels and low-stock alerts
- ⚙️ **Settings** — Shop info, WhatsApp number, payment methods

---

## WhatsApp Integration

All WhatsApp links use `https://wa.me/` click-to-chat format.

Configured via admin settings: `whatsapp_number` (format: `916294156854`)

---

## Security Features

- JWT authentication for admin routes
- bcrypt password hashing (salt rounds: 10)
- Helmet.js security headers
- CORS configuration
- Rate limiting (100 req / 15 min)
- Parameterized SQL queries (no SQL injection)
- File type & size validation for uploads
- Input validation on all forms

---

## Environment Variables

### Server (.env)

```
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=tuyel_electricals
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
ADMIN_EMAIL=admin@tuyel.com
ADMIN_PASSWORD=Admin@123
WHATSAPP_NUMBER=916294156854
CORS_ORIGIN=http://localhost:5173
```

### Client (.env)

```
VITE_API_URL=http://localhost:5000/api/v1
```
