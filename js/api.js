// ═══════════════════════════════════════════════════════════════════
//  MJ FOODS ENTERPRISES — FRONTEND API WRAPPER (MySQL / Express)
// ═══════════════════════════════════════════════════════════════════

// Use localhost for testing, change to mj-foods-backend.onrender.com for live production
const API_BASE = (
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1' || 
    window.location.hostname.startsWith('192.168.')
) ? 'http://localhost:3000/api' : 'https://mj-foods-backend.onrender.com/api'; 

const DB = {
    // ── SALES & BILLING ───────────────────────────────────────────────────
    async getSales() {
        try {
            const res = await fetch(`${API_BASE}/sales`);
            if (!res.ok) throw new Error('API Error');
            const data = await res.json();
            localStorage.setItem('mj_sales', JSON.stringify(data));
            return data;
        } catch (e) {
            console.warn("⚠️ API Offline (Sales). Using local cache.");
            return JSON.parse(localStorage.getItem('mj_sales') || '[]');
        }
    },
    async addSale(sale) {
        try {
            const res = await fetch(`${API_BASE}/sales`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    shop_name: sale.shop,
                    total_amount: sale.total,
                    status: sale.status || 'Pending',
                    items: sale.items
                })
            });
            return await res.json();
        } catch (e) {
            console.error("❌ Failed to save sale to MySQL.");
            // Store locally temporarily
            let local = JSON.parse(localStorage.getItem('mj_sales') || '[]');
            local.push(sale);
            localStorage.setItem('mj_sales', JSON.stringify(local));
        }
    },
    async updateSaleStatus(id, status) {
        try {
            await fetch(`${API_BASE}/sales/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
        } catch (e) { console.error("❌ Failed to update status."); }
    },
    async deleteSale(id) {
        try {
            await fetch(`${API_BASE}/sales/${id}`, { method: 'DELETE' });
        } catch (e) { console.error("❌ Failed to delete sale."); }
    },

    // ── EXPENSES ──────────────────────────────────────────────────────────
    async getExpenses() {
        try {
            const res = await fetch(`${API_BASE}/expenses`);
            const data = await res.json();
            localStorage.setItem('mj_expenses', JSON.stringify(data));
            return data;
        } catch (e) {
            return JSON.parse(localStorage.getItem('mj_expenses') || '[]');
        }
    },
    async addExpense(exp) {
        try {
            await fetch(`${API_BASE}/expenses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    category: exp.category,
                    amount: exp.amt,
                    note: exp.note
                })
            });
        } catch (e) { console.error("❌ Failed to save expense to MySQL."); }
    },
    async deleteExpense(id) {
        try {
            await fetch(`${API_BASE}/expenses/${id}`, { method: 'DELETE' });
        } catch (e) { console.error("❌ Failed to delete expense."); }
    },

    // ── EMPLOYEES ─────────────────────────────────────────────────────────
    async getEmployees() {
        try {
            const res = await fetch(`${API_BASE}/employees`);
            const data = await res.json();
            localStorage.setItem('mj_employees', JSON.stringify(data));
            return data;
        } catch (e) {
            return JSON.parse(localStorage.getItem('mj_employees') || '[]');
        }
    },
    async addEmployee(emp) {
        try {
            await fetch(`${API_BASE}/employees`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: emp.name,
                    role: emp.role,
                    daily_wage: emp.daily_wage,
                    id_photo: emp.id_photo
                })
            });
        } catch (e) { console.error("❌ Failed to save employee to MySQL."); }
    },
    async deleteEmployee(id) {
        try {
            await fetch(`${API_BASE}/employees/${id}`, { method: 'DELETE' });
        } catch (e) { console.error("❌ Failed to delete employee."); }
    },

    // ── SHOP ROUTES ───────────────────────────────────────────────────────
    async getShops() {
        try {
            const res = await fetch(`${API_BASE}/shops`);
            const data = await res.json();
            const shops = { airport: [], town: [] };
            data.forEach(s => {
                if (s.route === 'Airport') shops.airport.push(s.name);
                else shops.town.push(s.name);
            });
            localStorage.setItem('mj_shops_v2', JSON.stringify(shops));
            return shops;
        } catch (e) {
            return JSON.parse(localStorage.getItem('mj_shops_v2') || '{airport:[], town:[]}');
        }
    }
};

window.DB = DB;
