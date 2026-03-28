-- ═══════════════════════════════════════════════════════════════════
--  MJ FOODS ENTERPRISES — MySQL DATABASE SCHEMA
-- ═══════════════════════════════════════════════════════════════════

-- 1. DATABASE CREATE (IF NEEDED)
CREATE DATABASE IF NOT EXISTS mj_foods_bakery;
USE mj_foods_bakery;

-- 2. SALES & BILLING
CREATE TABLE IF NOT EXISTS sales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    shop_name VARCHAR(255) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status ENUM('Paid', 'Pending', 'Cancelled') DEFAULT 'Pending',
    items JSON, -- Stores the list of items [ { name, qty, price, total } ]
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. EXPENSES & UNIT COSTS
CREATE TABLE IF NOT EXISTS expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(100) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    note TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. BILL RECEIPTS (IMAGE REFERENCES)
CREATE TABLE IF NOT EXISTS receipts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    shop_name VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    date_val DATE,
    category VARCHAR(100),
    note TEXT,
    paid BOOLEAN DEFAULT FALSE,
    photo_url LONGTEXT, -- Stores Base64 or Image Path
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. EMPLOYEES & HR
CREATE TABLE IF NOT EXISTS employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(100),
    daily_wage DECIMAL(10, 2),
    id_photo LONGTEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. ATTENDANCE & PAYROLL (DAILY LOGS)
CREATE TABLE IF NOT EXISTS employee_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_name VARCHAR(255),
    date_val DATE,
    attendance ENUM('Present', 'Absent'),
    paid_amount DECIMAL(10, 2) DEFAULT 0,
    daily_wage DECIMAL(10, 2),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. SHOPS / CLIENTS ROUTES
CREATE TABLE IF NOT EXISTS shops (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    route ENUM('Airport', 'Town') NOT NULL
);

-- INSERT INITIAL AIRPORT SHOPS
INSERT IGNORE INTO shops (name, route) VALUES 
('Domestic', 'Airport'), ('International', 'Airport'), ('0484', 'Airport'), 
('Gallery', 'Airport'), ('Cargo', 'Airport'), ('Casino', 'Airport'), 
('Saravanabhavan', 'Airport'), ('Achayi', 'Airport'), ('Cafe 24', 'Airport');
