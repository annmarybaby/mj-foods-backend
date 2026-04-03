// ═══════════════════════════════════════════════════════════════════
//  MJ FOODS ENTERPRISES — NODE.JS / MySQL SERVER (V3.0)
// ═══════════════════════════════════════════════════════════════════

const express = require('express');
const mysql   = require('mysql2/promise');
const cors    = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

async function ensureSchema() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS products (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL UNIQUE,
            price DECIMAL(10, 2) NOT NULL,
            category VARCHAR(100) DEFAULT 'Bakery'
        )
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS sales (
            id INT AUTO_INCREMENT PRIMARY KEY,
            shop VARCHAR(255) NOT NULL,
            total DECIMAL(10, 2) NOT NULL,
            items JSON NOT NULL,
            status ENUM('Paid', 'Pending') DEFAULT 'Pending',
            timestamp BIGINT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS expenses (
            id INT AUTO_INCREMENT PRIMARY KEY,
            category VARCHAR(100) NOT NULL,
            amt DECIMAL(10, 2) NOT NULL,
            note TEXT,
            timestamp BIGINT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS employees (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            role VARCHAR(100),
            phone VARCHAR(30) DEFAULT '',
            salary_type ENUM('Daily', 'Monthly') DEFAULT 'Daily',
            base_salary DECIMAL(10, 2) DEFAULT 0,
            id_photo LONGTEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS emp_ledger (
            id INT AUTO_INCREMENT PRIMARY KEY,
            emp_id INT NOT NULL,
            emp_name VARCHAR(255),
            date_str VARCHAR(20),
            attendance ENUM('Present', 'Absent') DEFAULT 'Present',
            paid DECIMAL(10, 2) DEFAULT 0,
            timestamp BIGINT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS receipts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            shop VARCHAR(255) NOT NULL,
            amt DECIMAL(10, 2) NOT NULL,
            date_val VARCHAR(20),
            category VARCHAR(100),
            paid BOOLEAN DEFAULT FALSE,
            note TEXT,
            photo_url LONGTEXT,
            timestamp BIGINT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS shops (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL UNIQUE,
            route ENUM('Airport', 'Town') NOT NULL,
            phone VARCHAR(30) DEFAULT ''
        )
    `);

    const [rows] = await pool.query(
        `SELECT COUNT(*) AS count
         FROM information_schema.columns
         WHERE table_schema = DATABASE()
           AND table_name = 'shops'
           AND column_name = 'phone'`
    );

    if (!rows[0]?.count) {
        await pool.query("ALTER TABLE shops ADD COLUMN phone VARCHAR(30) DEFAULT ''");
    }

    const [employeePhoneRows] = await pool.query(
        `SELECT COUNT(*) AS count
         FROM information_schema.columns
         WHERE table_schema = DATABASE()
           AND table_name = 'employees'
           AND column_name = 'phone'`
    );

    if (!employeePhoneRows[0]?.count) {
        await pool.query("ALTER TABLE employees ADD COLUMN phone VARCHAR(30) DEFAULT ''");
    }

    await pool.query(`
        INSERT IGNORE INTO shops (name, route) VALUES
        ('Domestic', 'Airport'),
        ('International', 'Airport'),
        ('0484', 'Airport'),
        ('Gallery', 'Airport'),
        ('Cargo', 'Airport'),
        ('Casino', 'Airport'),
        ('Saravanabhavan', 'Airport'),
        ('Achayi', 'Airport'),
        ('Cafe 24', 'Airport')
    `);

    await pool.query(`
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
        ('Bun Maska', 20.00, 'Bakery')
    `);
}

// 1. DATABASE CONNECTION POOL
const pool = mysql.createPool({
    host:     process.env.DB_HOST || 'localhost',
    port:     process.env.DB_PORT || 3306,
    user:     process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'mj_foods_bakery',
    ssl:      process.env.DB_HOST && !process.env.DB_HOST.includes('localhost') ? { rejectUnauthorized: false } : null,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// 2. API ENDPOINTS

/** ─── PRODUCTS ─── */
app.get('/api/products', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM products ORDER BY name ASC');
        res.json(rows);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/products', async (req, res) => {
    try {
        const { name, price, category } = req.body;
        const [result] = await pool.query('INSERT INTO products (name, price, category) VALUES (?, ?, ?)', [name, price, category]);
        res.json({ success: true, id: result.insertId });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.put('/api/products/:id', async (req, res) => {
    try {
        const { name, price, category } = req.body;
        await pool.query('UPDATE products SET name = ?, price = ?, category = ? WHERE id = ?', [name, price, category, req.params.id]);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.delete('/api/products/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

/** ─── SALES ─── */
app.get('/api/sales', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM sales ORDER BY timestamp DESC');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/sales', async (req, res) => {
    const { timestamp, shop, items, total, status } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO sales (timestamp, shop, items, total, status) VALUES (?, ?, ?, ?, ?)',
            [timestamp || Date.now(), shop, JSON.stringify(items), total, status || 'Pending']
        );
        res.json({ id: result.insertId });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/sales/:id', async (req, res) => {
    try {
        await pool.query('UPDATE sales SET status = ? WHERE id = ? OR timestamp = ?', [req.body.status, req.params.id, req.params.id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/sales/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM sales WHERE id = ? OR timestamp = ?', [req.params.id, req.params.id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

/** ─── EXPENSES ─── */
app.get('/api/expenses', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM expenses ORDER BY timestamp DESC');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/expenses', async (req, res) => {
    const { timestamp, category, amt, note } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO expenses (timestamp, category, amt, note) VALUES (?, ?, ?, ?)',
            [timestamp || Date.now(), category, amt, note]
        );
        res.json({ id: result.insertId });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/expenses/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM expenses WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

/** ─── EMPLOYEES & LEDGER ─── */
app.get('/api/employees', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM employees ORDER BY name ASC');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/employees', async (req, res) => {
    const { name, role, phone, salary_type, base_salary, id_photo } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO employees (name, role, phone, salary_type, base_salary, id_photo) VALUES (?, ?, ?, ?, ?, ?)',
            [name, role, phone || '', salary_type, base_salary, id_photo]
        );
        res.json({ id: result.insertId });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/employees/:id', async (req, res) => {
    const { name, role, phone, salary_type, base_salary, id_photo } = req.body;
    try {
        await pool.query(
            'UPDATE employees SET name = ?, role = ?, phone = ?, salary_type = ?, base_salary = ?, id_photo = ? WHERE id = ?',
            [name, role, phone || '', salary_type, base_salary, id_photo || '', req.params.id]
        );
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/employees/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM employees WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/ledger', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM emp_ledger ORDER BY timestamp DESC');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/ledger', async (req, res) => {
    const { emp_id, emp_name, date_str, attendance, paid, timestamp } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO emp_ledger (emp_id, emp_name, date_str, attendance, paid, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
            [emp_id, emp_name, date_str, attendance, paid, timestamp || Date.now()]
        );
        res.json({ id: result.insertId });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/ledger/:id', async (req, res) => {
    const { emp_id, emp_name, date_str, attendance, paid, timestamp } = req.body;
    try {
        await pool.query(
            'UPDATE emp_ledger SET emp_id = ?, emp_name = ?, date_str = ?, attendance = ?, paid = ?, timestamp = ? WHERE id = ?',
            [emp_id, emp_name, date_str, attendance, paid, timestamp || Date.now(), req.params.id]
        );
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

/** ─── RECEIPTS ─── */
app.get('/api/receipts', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM receipts ORDER BY timestamp DESC');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/receipts', async (req, res) => {
    const { shop, amt, date_val, category, paid, note, photo_url, timestamp } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO receipts (shop, amt, date_val, category, paid, note, photo_url, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [shop, amt, date_val, category, paid, note, photo_url, timestamp || Date.now()]
        );
        res.json({ id: result.insertId });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/receipts/:id', async (req, res) => {
    const { shop, amt, date_val, category, paid, note, photo_url } = req.body;
    try {
        await pool.query(
            'UPDATE receipts SET shop = ?, amt = ?, date_val = ?, category = ?, paid = ?, note = ?, photo_url = ? WHERE id = ?',
            [shop, amt, date_val, category, paid, note, photo_url, req.params.id]
        );
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/receipts/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM receipts WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

/** ─── SHOPS ─── */
app.get('/api/shops', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM shops ORDER BY route, name ASC');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/shops', async (req, res) => {
    const { name, route, phone } = req.body;
    try {
        const [result] = await pool.query('INSERT INTO shops (name, route, phone) VALUES (?, ?, ?)', [name, route, phone || '']);
        res.json({ id: result.insertId });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/shops/:id', async (req, res) => {
    const { name, route, phone } = req.body;
    try {
        await pool.query('UPDATE shops SET name = ?, route = ?, phone = ? WHERE id = ?', [name, route, phone || '', req.params.id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/shops/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM shops WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/', (req, res) => {
    res.send('<h1>✅ MJ Foods API: ONLINE</h1>');
});

// 3. START SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    console.log(`🚀 API RUNNING AT: http://localhost:${PORT}`);
    try {
        await ensureSchema();
        await pool.query('SELECT 1');
        console.log('✅ Database Connected Successfully!');
    } catch (err) {
        console.error('❌ Database Connection Failed:', err.message);
    }
});
