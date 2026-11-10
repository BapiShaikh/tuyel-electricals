-- ============================================================
-- TUYEL ELECTRICALS - MySQL Database Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS tuyel_electricals CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE tuyel_electricals;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS service_booking_history;
DROP TABLE IF EXISTS service_booking_images;
DROP TABLE IF EXISTS service_bookings;
DROP TABLE IF EXISTS services;
DROP TABLE IF EXISTS service_categories;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS inventory_transactions;
DROP TABLE IF EXISTS product_images;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS brands;
DROP TABLE IF EXISTS shop_settings;
DROP TABLE IF EXISTS banners;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS customers;
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- 1. ROLES
-- ============================================================
CREATE TABLE roles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO roles (name, description) VALUES 
  ('admin', 'Full system access'),
  ('staff', 'Limited admin access'),
  ('customer', 'Regular customer');

-- ============================================================
-- 2. USERS
-- ============================================================
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role_id INT DEFAULT 3,
  phone VARCHAR(20),
  is_active TINYINT(1) DEFAULT 1,
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 3. SHOP SETTINGS
-- ============================================================
CREATE TABLE shop_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value TEXT,
  setting_group VARCHAR(50) DEFAULT 'general',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO shop_settings (setting_key, setting_value, setting_group) VALUES
  ('shop_name', 'TUYEL ELECTRICALS', 'general'),
  ('shop_tagline', 'Your Trusted Partner for Electrical Products & Services.', 'general'),
  ('shop_email', 'tuyel.electricals@gmail.com', 'general'),
  ('shop_phone', '+91 6294 156854', 'general'),
  ('whatsapp_number', '916294156854', 'general'),
  ('shop_address', 'Vill- Sherpur (Near Primary School), West Bengal', 'general'),
  ('shop_village', 'Sherpur', 'general'),
  ('shop_pin', '742165', 'general'),
  ('google_maps_url', '', 'general'),
  ('currency_symbol', '₹', 'general'),
  ('cod_enabled', '1', 'payment'),
  ('upi_enabled', '1', 'payment'),
  ('upi_id', '6294156854@upi', 'payment'),
  ('announcement_text', '⚡ TUYEL ELECTRICALS - Free Home Visit for Motor & Fan Repairs in Sherpur & Nearby Villages!', 'general'),
  ('announcement_active', '1', 'general');

-- ============================================================
-- 4. BANNERS
-- ============================================================
CREATE TABLE banners (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(200),
  subtitle TEXT,
  image_path VARCHAR(500),
  button_text VARCHAR(100),
  button_link VARCHAR(500),
  sort_order INT DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 5. CATEGORIES
-- ============================================================
CREATE TABLE categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  slug VARCHAR(150) NOT NULL UNIQUE,
  description TEXT,
  image_path VARCHAR(500),
  parent_id INT DEFAULT NULL,
  sort_order INT DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL,
  INDEX idx_parent (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO categories (name, slug, description, parent_id, sort_order) VALUES
  -- Parent Categories
  ('Electrical Products', 'electrical-products', 'Wires, switches, MCBs and electrical accessories', NULL, 1),
  ('Fans', 'fans', 'All types of fans for home and office', NULL, 2),
  ('Motors & Pumps', 'motors-pumps', 'Water pumps, motors and accessories', NULL, 3),
  ('Home Appliances', 'home-appliances', 'Refrigerators, washing machines, inverters and more', NULL, 4),
  -- Electrical Products Sub-categories
  ('LED Lights', 'led-lights', 'Energy efficient LED lighting solutions', 1, 1),
  ('Bulbs & Tube Lights', 'bulbs-tube-lights', 'Traditional and energy saving bulbs', 1, 2),
  ('Wires & Cables', 'wires-cables', 'Electrical wires and cables', 1, 3),
  ('Switches & Sockets', 'switches-sockets', 'Modular switches and sockets', 1, 4),
  ('MCB & Circuit Breakers', 'mcb-circuit-breakers', 'Miniature circuit breakers', 1, 5),
  ('Electrical Boards', 'electrical-boards', 'Distribution boards and panels', 1, 6),
  ('Electrical Accessories', 'electrical-accessories', 'Connectors, tapes and accessories', 1, 7),
  -- Fans Sub-categories
  ('Ceiling Fans', 'ceiling-fans', 'Premium ceiling fans', 2, 1),
  ('Table Fans', 'table-fans', 'Portable table fans', 2, 2),
  ('Wall Fans', 'wall-fans', 'Wall mount fans', 2, 3),
  ('Exhaust Fans', 'exhaust-fans', 'Kitchen and bathroom exhaust fans', 2, 4),
  ('Fan Accessories', 'fan-accessories', 'Fan regulators and accessories', 2, 5),
  -- Motors Sub-categories
  ('Water Pumps', 'water-pumps', 'Monoblock and centrifugal pumps', 3, 1),
  ('Electric Motors', 'electric-motors', 'Single and three phase motors', 3, 2),
  ('Submersible Pumps', 'submersible-pumps', 'Borewell and drainage pumps', 3, 3),
  ('Motor Accessories', 'motor-accessories', 'Capacitors and motor parts', 3, 4),
  -- Appliances Sub-categories
  ('Refrigerators', 'refrigerators', 'Single and double door refrigerators', 4, 1),
  ('Inverters', 'inverters', 'Home UPS and inverters', 4, 2),
  ('Batteries', 'batteries', 'Inverter and UPS batteries', 4, 3),
  ('Stabilizers', 'stabilizers', 'Voltage stabilizers', 4, 4),
  ('Other Appliances', 'other-appliances', 'Other home appliances', 4, 5);

-- ============================================================
-- 6. BRANDS
-- ============================================================
CREATE TABLE brands (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  logo_path VARCHAR(500),
  description TEXT,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO brands (name, slug) VALUES
  ('Havells', 'havells'),
  ('Philips', 'philips'),
  ('Crompton', 'crompton'),
  ('Bajaj', 'bajaj'),
  ('Anchor', 'anchor'),
  ('Finolex', 'finolex'),
  ('Polycab', 'polycab'),
  ('Orient', 'orient'),
  ('Usha', 'usha'),
  ('Kirloskar', 'kirloskar'),
  ('Grundfos', 'grundfos'),
  ('Whirlpool', 'whirlpool'),
  ('Samsung', 'samsung'),
  ('LG', 'lg'),
  ('Luminous', 'luminous'),
  ('Exide', 'exide'),
  ('V-Guard', 'v-guard'),
  ('Legrand', 'legrand'),
  ('Schneider', 'schneider'),
  ('Siemens', 'siemens');

-- ============================================================
-- 7. PRODUCTS (Safe slug <= 191 chars for utf8mb4 max key limit)
-- ============================================================
CREATE TABLE products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(191) NOT NULL UNIQUE,
  sku VARCHAR(100) UNIQUE,
  model_number VARCHAR(100),
  category_id INT,
  brand_id INT,
  description TEXT,
  short_description VARCHAR(500),
  original_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  selling_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount_percent DECIMAL(5,2) DEFAULT 0,
  stock_quantity INT DEFAULT 0,
  low_stock_threshold INT DEFAULT 5,
  warranty_months INT DEFAULT 0,
  warranty_description VARCHAR(300),
  is_featured TINYINT(1) DEFAULT 0,
  is_bestseller TINYINT(1) DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  views INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE SET NULL,
  INDEX idx_category (category_id),
  INDEX idx_brand (brand_id),
  FULLTEXT INDEX ft_search (name, description, short_description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 8. PRODUCT IMAGES
-- ============================================================
CREATE TABLE product_images (
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT NOT NULL,
  image_path VARCHAR(500) NOT NULL,
  alt_text VARCHAR(200),
  is_primary TINYINT(1) DEFAULT 0,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 9. SERVICE CATEGORIES
-- ============================================================
CREATE TABLE service_categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  slug VARCHAR(150) NOT NULL UNIQUE,
  description TEXT,
  image_path VARCHAR(500),
  icon VARCHAR(100),
  sort_order INT DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO service_categories (name, slug, description, icon, sort_order) VALUES
  ('Home Electrical Services', 'home-electrical', 'Complete home wiring and electrical installation services', 'Zap', 1),
  ('Fan Repair Services', 'fan-repair', 'All types of fan repair and maintenance', 'Wind', 2),
  ('Motor Repair Services', 'motor-repair', 'Water motor and pump repair services', 'Settings', 3),
  ('Refrigerator Repair Services', 'refrigerator-repair', 'Refrigerator troubleshooting and repair', 'Thermometer', 4);

-- ============================================================
-- 10. SERVICES (Safe slug <= 191 chars)
-- ============================================================
CREATE TABLE services (
  id INT PRIMARY KEY AUTO_INCREMENT,
  category_id INT NOT NULL,
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(191) NOT NULL UNIQUE,
  description TEXT,
  short_description VARCHAR(500),
  image_path VARCHAR(500),
  starting_price DECIMAL(10,2) DEFAULT 0,
  price_note VARCHAR(200) DEFAULT 'Starting price, actual cost may vary',
  duration_estimate VARCHAR(100),
  is_active TINYINT(1) DEFAULT 1,
  is_featured TINYINT(1) DEFAULT 0,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES service_categories(id) ON DELETE CASCADE,
  INDEX idx_category (category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO services (category_id, name, slug, description, short_description, image_path, starting_price, duration_estimate, is_featured) VALUES
  -- Home Electrical Services
  (1, 'Home Wiring', 'home-wiring', 'Complete new home electrical wiring with proper planning and installation of wires, switches and distribution boards.', 'Complete electrical wiring for new or renovation work', 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800&q=80', 1500.00, '1-3 days', 1),
  (1, 'Electrical Installation', 'electrical-installation', 'Installation of electrical appliances, lights, fans and other electrical fixtures.', 'Professional installation of electrical fixtures', 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80', 200.00, '1-4 hours', 1),
  (1, 'Switch & Socket Repair', 'switch-socket-repair', 'Repair or replacement of faulty switches, sockets and modular plates.', 'Fix faulty switches and socket outlets', 'https://images.unsplash.com/photo-1563770660941-20978e870e26?w=800&q=80', 100.00, '30-60 min', 0),
  (1, 'Light Installation', 'light-installation', 'Installation of LED panels, tube lights, ceiling lights and outdoor lighting.', 'Professional light fixture installation', 'https://images.unsplash.com/photo-1550525811-e5869dd03032?w=800&q=80', 150.00, '30-90 min', 0),
  (1, 'Fan Installation', 'fan-installation', 'Safe ceiling fan installation with proper mounting and wiring.', 'Ceiling and wall fan installation service', 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80', 200.00, '1-2 hours', 0),
  (1, 'Electrical Fault Troubleshooting', 'fault-troubleshooting', 'Diagnosis and repair of electrical faults, tripping issues and short circuits.', 'Expert diagnosis and repair of electrical problems', 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=800&q=80', 300.00, '1-3 hours', 1),
  (1, 'MCB Installation', 'mcb-installation', 'Installation and replacement of MCBs, ELCBs and circuit breakers in the distribution board.', 'MCB and circuit breaker installation', 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80', 150.00, '1-2 hours', 0),
  -- Fan Repair Services
  (2, 'Ceiling Fan Repair', 'ceiling-fan-repair', 'Complete diagnosis and repair of ceiling fan problems including speed issues, noise and not working.', 'Fix all types of ceiling fan problems', 'https://images.unsplash.com/photo-1581092446327-9b52bd1570c2?w=800&q=80', 200.00, '1-2 hours', 1),
  (2, 'Table Fan Repair', 'table-fan-repair', 'Repair of table fans including motor, blade and capacitor issues.', 'Table fan repair and servicing', 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=800&q=80', 150.00, '1-2 hours', 0),
  (2, 'Exhaust Fan Repair', 'exhaust-fan-repair', 'Repair and replacement of kitchen and bathroom exhaust fans.', 'Exhaust fan repair service', 'https://images.unsplash.com/photo-1598970434795-0c54fe7c0648?w=800&q=80', 150.00, '1 hour', 0),
  (2, 'Fan Motor Repair', 'fan-motor-repair', 'Expert fan motor rewinding and repair service.', 'Fan motor winding and repair', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80', 300.00, '1-3 days', 1),
  (2, 'Capacitor Replacement', 'capacitor-replacement', 'Replacement of fan capacitors to restore proper fan speed and operation.', 'Fan capacitor replacement service', 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=800&q=80', 100.00, '30 min', 0),
  -- Motor Repair Services
  (3, 'Water Motor Repair', 'water-motor-repair', 'Diagnosis and repair of water motor problems including no water, low pressure and overheating.', 'Complete water motor repair service', 'https://images.unsplash.com/photo-1581092162384-8987c1d64718?w=800&q=80', 400.00, '2-4 hours', 1),
  (3, 'Water Pump Repair', 'water-pump-repair', 'Repair of monoblock and centrifugal water pumps.', 'Water pump repair and servicing', 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&q=80', 350.00, '2-3 hours', 1),
  (3, 'Motor Installation', 'motor-installation', 'Professional installation of new water motors and pumps.', 'New motor and pump installation', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80', 500.00, '2-4 hours', 0),
  (3, 'Motor Winding', 'motor-winding', 'Expert motor rewinding service to restore motor to full efficiency.', 'Professional motor rewinding', 'https://images.unsplash.com/photo-1581092446327-9b52bd1570c2?w=800&q=80', 800.00, '2-5 days', 0),
  (3, 'Motor Maintenance', 'motor-maintenance', 'Periodic maintenance and servicing of water motors and pumps.', 'Preventive motor maintenance', 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&q=80', 300.00, '1-2 hours', 0),
  -- Refrigerator Repair Services
  (4, 'Refrigerator Not Cooling', 'fridge-not-cooling', 'Diagnosis and repair of refrigerator cooling problems including gas refilling and compressor check.', 'Fix refrigerator cooling issues', 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=800&q=80', 500.00, '2-4 hours', 1),
  (4, 'Compressor Troubleshooting', 'compressor-troubleshooting', 'Expert compressor diagnosis, repair or replacement service.', 'Refrigerator compressor service', 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80', 800.00, '2-4 hours', 1),
  (4, 'Refrigerator Electrical Fault', 'fridge-electrical-fault', 'Repair of electrical faults in refrigerators including PCB, thermostat and relay issues.', 'Fix refrigerator electrical problems', 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800&q=80', 400.00, '1-3 hours', 0),
  (4, 'Refrigerator Servicing', 'fridge-servicing', 'Complete refrigerator cleaning, defrosting and general servicing.', 'General refrigerator service and cleaning', 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=800&q=80', 300.00, '2-3 hours', 0),
  (4, 'Refrigerator Maintenance', 'fridge-maintenance', 'Annual maintenance contract for refrigerators to prevent breakdowns.', 'Annual refrigerator maintenance plan', 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80', 600.00, '1-2 hours', 0);

-- ============================================================
-- 11. CUSTOMERS
-- ============================================================
CREATE TABLE customers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(150),
  address TEXT,
  village VARCHAR(100),
  pin_code VARCHAR(10),
  total_orders INT DEFAULT 0,
  total_bookings INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 12. SERVICE BOOKINGS
-- ============================================================
CREATE TABLE service_bookings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  booking_id VARCHAR(20) NOT NULL UNIQUE,
  customer_id INT,
  customer_name VARCHAR(100) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  service_category_id INT NOT NULL,
  service_id INT NOT NULL,
  address TEXT NOT NULL,
  village VARCHAR(100),
  pin_code VARCHAR(10),
  preferred_date DATE NOT NULL,
  preferred_time_slot VARCHAR(50),
  problem_description TEXT,
  status ENUM('pending','contacted','confirmed','assigned','on_the_way','in_progress','completed','cancelled') DEFAULT 'pending',
  technician_name VARCHAR(100),
  internal_notes TEXT,
  service_charge DECIMAL(10,2),
  completion_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
  FOREIGN KEY (service_category_id) REFERENCES service_categories(id),
  FOREIGN KEY (service_id) REFERENCES services(id),
  INDEX idx_phone (customer_phone),
  INDEX idx_status (status),
  INDEX idx_date (preferred_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 13. SERVICE BOOKING IMAGES
-- ============================================================
CREATE TABLE service_booking_images (
  id INT PRIMARY KEY AUTO_INCREMENT,
  booking_id INT NOT NULL,
  image_path VARCHAR(500) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES service_bookings(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 14. SERVICE BOOKING HISTORY
-- ============================================================
CREATE TABLE service_booking_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  booking_id INT NOT NULL,
  old_status VARCHAR(50),
  new_status VARCHAR(50),
  changed_by INT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES service_bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 15. ORDERS
-- ============================================================
CREATE TABLE orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id VARCHAR(20) NOT NULL UNIQUE,
  customer_id INT,
  customer_name VARCHAR(100) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  address TEXT NOT NULL,
  village VARCHAR(100),
  pin_code VARCHAR(10),
  order_notes TEXT,
  payment_method ENUM('cash_at_shop','cash_on_delivery','upi') DEFAULT 'cash_at_shop',
  payment_status ENUM('pending','paid','failed') DEFAULT 'pending',
  subtotal DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status ENUM('pending','confirmed','processing','ready_for_pickup','shipped','delivered','cancelled') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 16. ORDER ITEMS
-- ============================================================
CREATE TABLE order_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  product_id INT,
  product_name VARCHAR(255) NOT NULL,
  product_sku VARCHAR(100),
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 17. INVENTORY TRANSACTIONS
-- ============================================================
CREATE TABLE inventory_transactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT NOT NULL,
  transaction_type ENUM('purchase','sale','adjustment','return') NOT NULL,
  quantity INT NOT NULL,
  previous_stock INT NOT NULL,
  new_stock INT NOT NULL,
  reference_id INT,
  reference_type VARCHAR(50),
  notes TEXT,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- DEMO PRODUCTS
-- ============================================================
INSERT INTO products (name, slug, sku, category_id, brand_id, description, short_description, original_price, selling_price, discount_percent, stock_quantity, warranty_months, is_featured, is_bestseller) VALUES
  ('Havells LED Bulb 9W', 'havells-led-bulb-9w', 'HVL-LED-9W', 5, 1, 'Energy efficient 9W LED bulb with 6500K cool daylight. Ideal for home and office use. Saves up to 80% energy compared to incandescent bulbs.', '9W LED Bulb - 6500K Cool Daylight', 120.00, 89.00, 25.83, 150, 24, 1, 1),
  ('Philips LED Batten 20W', 'philips-led-batten-20w', 'PHL-BAT-20W', 5, 2, 'Philips 20W LED Batten light for bright and uniform illumination. Perfect replacement for fluorescent tube lights.', '20W LED Batten Tube Light', 450.00, 380.00, 15.56, 80, 24, 1, 1),
  ('Polycab 1.5mm House Wire (90m)', 'polycab-1-5mm-wire-90m', 'PLY-WIRE-1.5', 7, 7, 'FR PVC insulated copper conductor wire. Ideal for internal house wiring. 1.5 sq mm, 90m drum.', 'FR PVC 1.5sqmm Copper Wire 90m', 1350.00, 1199.00, 11.19, 40, 12, 1, 0),
  ('Havells Crabtree Modular Switch 6A', 'havells-modular-switch-6a', 'HVL-SW-6A', 8, 1, 'Premium quality Crabtree modular switch 6A 240V. Compatible with all modular plate systems.', 'Havells Modular Switch 6A', 85.00, 70.00, 17.65, 200, 12, 0, 1),
  ('Schneider Electric MCB 32A', 'schneider-mcb-32a', 'SCH-MCB-32A', 9, 19, 'Schneider Electric ACTI9 iC60N MCB 32A single pole. High performance overcurrent protection.', 'MCB 32A Single Pole', 420.00, 360.00, 14.29, 60, 24, 1, 0),
  ('Havells Stealth 1200mm Ceiling Fan', 'havells-stealth-1200mm', 'HVL-FAN-ST12', 12, 1, 'Premium BLDC motor ceiling fan with remote control. 5-star rated, saves 65% energy. Available in 1200mm sweep.', 'BLDC Ceiling Fan with Remote 1200mm', 3800.00, 3299.00, 13.18, 25, 24, 1, 1),
  ('Crompton Aura Prime 1200mm Fan', 'crompton-aura-prime-1200', 'CRO-FAN-AP12', 12, 3, 'Crompton Aura Prime 1200mm ceiling fan with anti-dust technology. High speed performance with decorative design.', 'Crompton 1200mm Ceiling Fan', 2200.00, 1850.00, 15.91, 30, 24, 1, 1),
  ('Bajaj Maxima 400mm Table Fan', 'bajaj-maxima-400mm-table-fan', 'BAJ-TF-400', 13, 4, 'Bajaj Maxima 400mm table fan with 3 speed settings. Powerful airflow with quiet operation. Ideal for personal use.', 'Bajaj 400mm Table Fan 3 Speed', 1299.00, 1099.00, 15.40, 40, 12, 0, 1),
  ('Kirloskar Star-1 0.5HP Water Pump', 'kirloskar-star-1-0-5hp', 'KIR-WP-05HP', 17, 10, 'Kirloskar Star-1 0.5HP monoblock water pump. Self priming, suitable for domestic water supply. Handles heads up to 25m.', '0.5HP Monoblock Water Pump', 3500.00, 2999.00, 14.31, 20, 12, 1, 1),
  ('Luminous Zelio+ 1100VA Inverter', 'luminous-zelio-1100va', 'LUM-INV-1100', 22, 15, 'Luminous Zelio+ 1100VA intelligent home UPS with 3 year warranty. Supports up to 2 ceiling fans, 6 LED lights and 1 TV.', '1100VA Home Inverter UPS', 5500.00, 4799.00, 12.75, 15, 36, 1, 1),
  ('Exide InvaMaster 150Ah Battery', 'exide-invamaster-150ah', 'EXI-BAT-150', 23, 16, 'Exide InvaMaster 150Ah tubular battery for inverter. Long backup time with low maintenance. Suitable for 1100VA-2KVA inverters.', '150Ah Tubular Inverter Battery', 12500.00, 11200.00, 10.40, 10, 60, 1, 1),
  ('V-Guard VND 400 Voltage Stabilizer', 'v-guard-vnd-400', 'VG-STAB-400', 24, 17, 'V-Guard VND 400 voltage stabilizer for refrigerators up to 400L. Protects against voltage fluctuations (170V-270V).', 'Voltage Stabilizer for Refrigerator', 1800.00, 1550.00, 13.89, 20, 24, 0, 0);

-- ============================================================
-- DEMO PRODUCT IMAGES
-- ============================================================
INSERT INTO product_images (product_id, image_path, alt_text, is_primary, sort_order) VALUES
  (1, 'https://images.unsplash.com/photo-1550525811-e5869dd03032?w=800&q=80', 'Havells LED Bulb 9W', 1, 1),
  (2, 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&q=80', 'Philips LED Batten 20W', 1, 1),
  (3, 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80', 'Polycab 1.5mm House Wire', 1, 1),
  (4, 'https://images.unsplash.com/photo-1563770660941-20978e870e26?w=800&q=80', 'Havells Crabtree Modular Switch', 1, 1),
  (5, 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80', 'Schneider Electric MCB 32A', 1, 1),
  (6, 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80', 'Havells Stealth 1200mm Ceiling Fan', 1, 1),
  (7, 'https://images.unsplash.com/photo-1598970434795-0c54fe7c0648?w=800&q=80', 'Crompton Aura Prime 1200mm Fan', 1, 1),
  (8, 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=800&q=80', 'Bajaj Maxima 400mm Table Fan', 1, 1),
  (9, 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80', 'Kirloskar Star-1 0.5HP Water Pump', 1, 1),
  (10, 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&q=80', 'Luminous Zelio+ 1100VA Inverter', 1, 1),
  (11, 'https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?w=800&q=80', 'Exide InvaMaster 150Ah Battery', 1, 1),
  (12, 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=800&q=80', 'V-Guard VND 400 Voltage Stabilizer', 1, 1);

-- ============================================================
-- ADMIN USER (password: Admin@123)
-- ============================================================
INSERT INTO users (name, email, password, role_id, phone)
VALUES ('Admin', 'admin@tuyel.com', '$2a$10$SGh1pDCbNRELhHsnnUyRueLIQdJ.B2xnt0GZZIkfQahYrsGvKP2DO', 1, '9876543210');
