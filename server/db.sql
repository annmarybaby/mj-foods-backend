-- ═══════════════════════════════════════════════════════════════════
--  MJ FOODS ENTERPRISES — MySQL / TiDB DATABASE SCHEMA
-- ═══════════════════════════════════════════════════════════════════

CREATE DATABASE IF NOT EXISTS mj_foods_bakery;
USE mj_foods_bakery;

-- 0. PRODUCTS & PRICES
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(100) DEFAULT 'Bakery'
);

-- SEED ALL 28 OFFICIAL ITEMS
INSERT IGNORE INTO products (name, price, category) VALUES 
('Carrot cake piece', 10.00, 'Bakery'),
('Parippuvada', 7.00, 'Bakery'),
('Uzhunnuvada', 9.00, 'Bakery'),
('Bonda', 7.00, 'Bakery'),
('Sabolavada', 7.00, 'Bakery'),
('Sugiyan', 9.00, 'Bakery'),
('Ella Ada', 10.00, 'Bakery'),
('Chi. Burger', 35.00, 'Bakery'),
('Veg. Burger', 28.00, 'Bakery'),
('Chi. Sandwich', 28.00, 'Bakery'),
('Veg. Sandwich', 20.00, 'Bakery'),
('Unnakai', 14.00, 'Bakery'),
('Erachi Pathiri', 15.00, 'Bakery'),
('Malabar Roll', 20.00, 'Bakery'),
('Egg Puffs', 15.00, 'Bakery'),
('Veg. Puffs', 11.00, 'Bakery'),
('Chicken Puffs', 18.00, 'Bakery'),
('Banana Puffs', 14.00, 'Bakery'),
('Chi. Cutlet', 15.00, 'Bakery'),
('Veg. Cutlet', 12.00, 'Bakery'),
('Chi. Roll', 16.00, 'Bakery'),
('Veg. Roll', 12.00, 'Bakery'),
('Thalassery Roll', 16.00, 'Bakery'),
('Chicken Samosa', 10.00, 'Bakery'),
('Elanchi', 13.00, 'Bakery'),
('Kaipola (8 piece)', 180.00, 'Main Order'),
('Chatti Pathiri (8 piece)', 200.00, 'Main Order'),
('Bun Maska', 20.00, 'Bakery');

-- 1. SALES & BILLING
CREATE TABLE IF NOT EXISTS sales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    shop VARCHAR(255) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    items JSON NOT NULL, -- Detailed list of products
    status ENUM('Paid', 'Pending') DEFAULT 'Pending',
    timestamp BIGINT NOT NULL, -- Unix timestamp from JS
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. UNIT EXPENSES (Daily costs)
CREATE TABLE IF NOT EXISTS expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(100) NOT NULL,
    amt DECIMAL(10, 2) NOT NULL,
    note TEXT,
    timestamp BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. EMPLOYEES
CREATE TABLE IF NOT EXISTS employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(100),
    salary_type ENUM('Daily', 'Monthly') DEFAULT 'Daily',
    base_salary DECIMAL(10, 2) DEFAULT 0,
    id_photo LONGTEXT, -- Base64 encoded image
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. EMPLOYEE LEDGER (Attendance & Wage Logs)
CREATE TABLE IF NOT EXISTS emp_ledger (
    id INT AUTO_INCREMENT PRIMARY KEY,
    emp_id INT NOT NULL,
    emp_name VARCHAR(255),
    date_str VARCHAR(20), -- Format: "2024-04-02"
    attendance ENUM('Present', 'Absent') DEFAULT 'Present',
    paid DECIMAL(10, 2) DEFAULT 0,
    timestamp BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. VENDOR BILL RECEIPTS
CREATE TABLE IF NOT EXISTS receipts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    shop VARCHAR(255) NOT NULL,
    amt DECIMAL(10, 2) NOT NULL,
    date_val VARCHAR(20),
    category VARCHAR(100),
    paid BOOLEAN DEFAULT FALSE,
    note TEXT,
    photo_url LONGTEXT, -- Stores Base64 string
    timestamp BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. SHOP ROUTES
CREATE TABLE IF NOT EXISTS shops (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    route ENUM('Airport', 'Town') NOT NULL,
    phone VARCHAR(30) DEFAULT ''
);

-- SEED DATA (AIRPORT SHOPS)
INSERT IGNORE INTO shops (name, route) VALUES 
('Domestic', 'Airport'), ('International', 'Airport'), ('0484', 'Airport'), 
('Gallery', 'Airport'), ('Cargo', 'Airport'), ('Casino', 'Airport'), 
('Saravanabhavan', 'Airport'), ('Achayi', 'Airport'), ('Cafe 24', 'Airport');
