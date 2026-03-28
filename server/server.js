// ═══════════════════════════════════════════════════════════════════
//  MJ FOODS ENTERPRISES — NODE.JS / MySQL SERVER
// ═══════════════════════════════════════════════════════════════════

const express = require('express');
const mysql   = require('mysql2/promise');
const cors    = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

// 1. DATABASE CONNECTION POOL
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'your_password_here', // Update this to your local password
    database: 'mj_foods_bakery',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// 2. API ENDPOINTS

/** ──────────────── SALES & BILLING ──────────────── */
app.get('/api/sales', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM sales ORDER BY timestamp DESC');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/sales', async (req, res) => {
    // ... same ...
});

app.put('/api/sales/:id', async (req, res) => {
    const { status } = req.body;
    try {
        await pool.query('UPDATE sales SET status = ? WHERE id = ?', [status, req.params.id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/sales/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM sales WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

/** ──────────────── EXPENSES ──────────────── */
app.get('/api/expenses', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM expenses ORDER BY timestamp DESC');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/expenses', async (req, res) => {
    // ... same ...
});

app.delete('/api/expenses/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM expenses WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

/** ──────────────── EMPLOYEES ──────────────── */
app.get('/api/employees', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM employees ORDER BY name ASC');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/employees', async (req, res) => {
    // ... same ...
});

app.delete('/api/employees/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM employees WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

/** ──────────────── SHOP ROUTES ──────────────── */
app.get('/api/shops', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM shops ORDER BY route, name ASC');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 3. START SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 MJ FOODS API RUNNING AT: http://localhost:${PORT}`);
    console.log(`📁 Database: mj_foods_bakery`);
});
