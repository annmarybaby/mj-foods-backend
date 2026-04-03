// ═══════════════════════════════════════════════════════════════════
//  MJ FOODS ENTERPRISES — FRONTEND API WRAPPER (MySQL / Express)
// ═══════════════════════════════════════════════════════════════════

const API_BASE = (
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1' || 
    window.location.hostname.startsWith('192.168.') ||
    window.location.protocol === 'file:'
) ? 'http://localhost:3000/api' : 'https://mj-foods-backend.onrender.com/api'; 

function readJson(key, fallback) {
    try {
        return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
    } catch (e) {
        return fallback;
    }
}

function writeJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function normalizeSaleRecord(sale) {
    const normalizedItems = Array.isArray(sale?.items)
        ? sale.items
        : (() => {
            if (typeof sale?.items !== 'string') return [];
            try {
                const parsed = JSON.parse(sale.items);
                return Array.isArray(parsed) ? parsed : [];
            } catch (e) {
                return [];
            }
        })();

    return {
        ...sale,
        id: sale?.id ?? sale?.timestamp ?? Date.now(),
        timestamp: sale?.timestamp || Date.now(),
        total: parseFloat(sale?.total || 0),
        items: normalizedItems
    };
}

const DEFAULT_SHOPS = [
    { id: 1001, name: 'Domestic', route: 'Airport', phone: '' },
    { id: 1002, name: 'International', route: 'Airport', phone: '' },
    { id: 1003, name: 'Cafe 24', route: 'Airport', phone: '' },
    { id: 1004, name: 'Gallery', route: 'Airport', phone: '' },
    { id: 1005, name: 'Cargo', route: 'Airport', phone: '' },
    { id: 1006, name: 'Casino', route: 'Airport', phone: '' },
    { id: 1007, name: 'Achayi', route: 'Airport', phone: '' },
    { id: 1008, name: 'Saravanabhavan', route: 'Airport', phone: '' },
    { id: 1009, name: 'Sterlling', route: 'Airport', phone: '' },
    { id: 1010, name: 'Lf canteen', route: 'Airport', phone: '' },
    { id: 1011, name: 'Dine spot', route: 'Town', phone: '' },
    { id: 1012, name: 'Allankar', route: 'Town', phone: '' },
    { id: 1013, name: 'Ksrtc', route: 'Town', phone: '' },
    { id: 1014, name: 'Ksrtc canteen', route: 'Town', phone: '' },
    { id: 1015, name: 'NH', route: 'Town', phone: '' },
    { id: 1016, name: 'Moolans karooty', route: 'Town', phone: '' },
    { id: 1017, name: 'Moolans angamaly', route: 'Town', phone: '' }
];

const DB = {
    // ── SALES ─────────────────────────────────────────────────────────────
    async getSales() {
        try {
            const res = await fetch(`${API_BASE}/sales`);
            if (!res.ok) throw new Error('API Error');
            const data = await res.json();
            const normalized = Array.isArray(data) ? data.map(normalizeSaleRecord) : [];
            localStorage.setItem('mj_sales', JSON.stringify(normalized));
            return normalized;
        } catch (e) {
            return readJson('mj_sales', []).map(normalizeSaleRecord);
        }
    },
    async addSale(sale) {
        const cached = readJson('mj_sales', []).map(normalizeSaleRecord);
        const optimisticSale = normalizeSaleRecord({ ...sale, id: sale.id || sale.timestamp });
        try {
            const res = await fetch(`${API_BASE}/sales`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sale)
            });
            if (!res.ok) throw new Error('API Error');
            const created = await res.json();
            const finalSale = normalizeSaleRecord({ ...sale, id: created.id || optimisticSale.id });
            writeJson('mj_sales', [finalSale, ...cached.filter(item => String(item.timestamp) !== String(finalSale.timestamp))]);
            return finalSale;
        } catch (e) {
            writeJson('mj_sales', [optimisticSale, ...cached.filter(item => String(item.timestamp) !== String(optimisticSale.timestamp))]);
            console.error("❌ MySQL Save Failed (Sale)");
            return optimisticSale;
        }
    },
    async updateSaleStatus(id, status) {
        const cached = readJson('mj_sales', []).map(normalizeSaleRecord);
        try {
            const res = await fetch(`${API_BASE}/sales/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            if (!res.ok) throw new Error('API Error');
        } catch (e) { console.error("❌ Status Update Failed"); }

        writeJson('mj_sales', cached.map(item => (
            String(item.id) === String(id) || String(item.timestamp) === String(id)
                ? { ...item, status }
                : item
        )));
    },
    async deleteSale(id) {
        const cached = readJson('mj_sales', []).map(normalizeSaleRecord);
        try {
            const res = await fetch(`${API_BASE}/sales/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('API Error');
        } catch (e) { console.error("❌ Delete Failed"); }

        writeJson('mj_sales', cached.filter(item => String(item.id) !== String(id) && String(item.timestamp) !== String(id)));
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
        const cached = readJson('mj_expenses', []);
        try {
            const res = await fetch(`${API_BASE}/expenses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(exp)
            });
            if (!res.ok) throw new Error('API Error');
            const created = await res.json().catch(() => ({}));
            const nextExpense = { id: created.id || Date.now(), ...exp, timestamp: exp.timestamp || Date.now() };
            writeJson('mj_expenses', [nextExpense, ...cached]);
            return nextExpense;
        } catch (e) {
            const nextExpense = { id: Date.now(), ...exp, timestamp: exp.timestamp || Date.now() };
            writeJson('mj_expenses', [nextExpense, ...cached]);
            console.error("❌ MySQL Save Failed (Expense)");
            return nextExpense;
        }
    },
    async deleteExpense(id) {
        const cached = readJson('mj_expenses', []);
        try {
            const res = await fetch(`${API_BASE}/expenses/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('API Error');
        } catch (e) { console.error("❌ Delete Failed"); }
        writeJson('mj_expenses', cached.filter(item => String(item.id) !== String(id)));
    },

    // ── EMPLOYEES & LEDGER ────────────────────────────────────────────────
    async getEmployees() {
        try {
            const res = await fetch(`${API_BASE}/employees`);
            const data = await res.json();
            localStorage.setItem('mj_employees', JSON.stringify(Array.isArray(data) ? data : []));
            return data;
        } catch (e) {
            return readJson('mj_employees', []);
        }
    },
    async addEmployee(emp) {
        const cached = readJson('mj_employees', []);
        const optimisticEmployee = {
            id: Date.now(),
            name: emp.name,
            role: emp.role || 'Staff',
            phone: emp.phone || '',
            salary_type: emp.salary_type || 'Daily',
            base_salary: parseFloat(emp.base_salary || 0),
            id_photo: emp.id_photo || ''
        };
        try {
            const res = await fetch(`${API_BASE}/employees`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(emp)
            });
            if (!res.ok) throw new Error('API Error');
            const created = await res.json();
            const finalEmployee = { ...optimisticEmployee, id: created.id || optimisticEmployee.id };
            writeJson('mj_employees', [...cached.filter(item => item.name !== finalEmployee.name), finalEmployee]);
            return finalEmployee;
        } catch (e) {
            writeJson('mj_employees', [...cached.filter(item => item.name !== optimisticEmployee.name), optimisticEmployee]);
            console.error("❌ MySQL Save Failed (Employee)");
            return optimisticEmployee;
        }
    },
    async updateEmployee(id, emp) {
        const cached = readJson('mj_employees', []);
        try {
            const res = await fetch(`${API_BASE}/employees/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(emp)
            });
            if (!res.ok) throw new Error('API Error');
        } catch (e) {
            console.error("❌ Update Employee Failed");
        }

        writeJson('mj_employees', cached.map(item => (
            String(item.id) === String(id) ? { ...item, ...emp, id: item.id } : item
        )));
    },
    async deleteEmployee(id) {
        const cached = readJson('mj_employees', []);
        try {
            const res = await fetch(`${API_BASE}/employees/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('API Error');
        } catch (e) {
            console.error("❌ Delete Failed (Employee)");
        }

        writeJson('mj_employees', cached.filter(item => String(item.id) !== String(id)));
    },
    async getLedger() {
        try {
            const res = await fetch(`${API_BASE}/ledger`);
            const data = await res.json();
            localStorage.setItem('mj_emp_ledger', JSON.stringify(data));
            return data;
        } catch (e) {
            return JSON.parse(localStorage.getItem('mj_emp_ledger') || '[]');
        }
    },
    async addLedgerEntry(entry) {
        const cached = readJson('mj_emp_ledger', []);
        const optimisticEntry = { id: Date.now(), ...entry, timestamp: entry.timestamp || Date.now() };
        try {
            const res = await fetch(`${API_BASE}/ledger`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(entry)
            });
            if (!res.ok) throw new Error('API Error');
            const created = await res.json().catch(() => ({}));
            const finalEntry = { ...optimisticEntry, id: created.id || optimisticEntry.id };
            writeJson('mj_emp_ledger', [finalEntry, ...cached]);
            return finalEntry;
        } catch (e) {
            writeJson('mj_emp_ledger', [optimisticEntry, ...cached]);
            console.error("❌ MySQL Save Failed (Ledger)");
            return optimisticEntry;
        }
    },
    async updateLedgerEntry(id, entry) {
        const cached = readJson('mj_emp_ledger', []);
        try {
            const res = await fetch(`${API_BASE}/ledger/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(entry)
            });
            if (!res.ok) throw new Error('API Error');
        } catch (e) {
            console.error("❌ Ledger Update Failed");
        }

        writeJson('mj_emp_ledger', cached.map(item => (
            String(item.id) === String(id) ? { ...item, ...entry, id: item.id } : item
        )));
    },

    // ── RECEIPTS ──────────────────────────────────────────────────────────
    async getReceipts() {
        try {
            const res = await fetch(`${API_BASE}/receipts`);
            const data = await res.json();
            localStorage.setItem('mj_receipts', JSON.stringify(data));
            return data;
        } catch (e) {
            return JSON.parse(localStorage.getItem('mj_receipts') || '[]');
        }
    },
    async addReceipt(rec) {
        const cached = readJson('mj_receipts', []);
        try {
            const res = await fetch(`${API_BASE}/receipts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(rec)
            });
            if (!res.ok) throw new Error('API Error');
            const created = await res.json().catch(() => ({}));
            const nextReceipt = {
                id: created.id || rec.id || Date.now(),
                shop: rec.shop,
                amt: parseFloat(rec.amt || 0),
                dateVal: rec.dateVal || rec.date_val || '',
                date_val: rec.date_val || rec.dateVal || '',
                category: rec.category || 'Other',
                paid: !!rec.paid,
                note: rec.note || '',
                photo_url: rec.photo_url || rec.photo || '',
                photo: rec.photo || rec.photo_url || '',
                timestamp: rec.timestamp || Date.now()
            };
            writeJson('mj_receipts', [nextReceipt, ...cached.filter(item => String(item.id) !== String(nextReceipt.id))]);
            return nextReceipt;
        } catch (e) {
            const nextReceipt = {
                id: rec.id || Date.now(),
                shop: rec.shop,
                amt: parseFloat(rec.amt || 0),
                dateVal: rec.dateVal || rec.date_val || '',
                date_val: rec.date_val || rec.dateVal || '',
                category: rec.category || 'Other',
                paid: !!rec.paid,
                note: rec.note || '',
                photo_url: rec.photo_url || rec.photo || '',
                photo: rec.photo || rec.photo_url || '',
                timestamp: rec.timestamp || Date.now()
            };
            writeJson('mj_receipts', [nextReceipt, ...cached.filter(item => String(item.id) !== String(nextReceipt.id))]);
            console.error("❌ MySQL Save Failed (Receipt)");
            return nextReceipt;
        }
    },
    async updateReceipt(id, rec) {
        const cached = readJson('mj_receipts', []);
        try {
            const res = await fetch(`${API_BASE}/receipts/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(rec)
            });
            if (!res.ok) throw new Error('API Error');
        } catch (e) {
            console.error("❌ Receipt Update Failed");
        }

        writeJson('mj_receipts', cached.map(item => (
            String(item.id) === String(id)
                ? { ...item, ...rec, id: item.id, dateVal: rec.dateVal || rec.date_val || item.dateVal, photo: rec.photo || rec.photo_url || item.photo }
                : item
        )));
    },
    async deleteReceipt(id) {
        const cached = readJson('mj_receipts', []);
        try {
            const res = await fetch(`${API_BASE}/receipts/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('API Error');
        } catch (e) {
            console.error("❌ Receipt Delete Failed");
        }

        writeJson('mj_receipts', cached.filter(item => String(item.id) !== String(id)));
    },

    // ── SHOP ROUTES ───────────────────────────────────────────────────────
    async getShops() {
        try {
            const res = await fetch(`${API_BASE}/shops`);
            if (!res.ok) throw new Error('API Error');
            const data = await res.json();
            const normalized = Array.isArray(data) && data.length > 0 ? data : readJson('mj_shops_raw', DEFAULT_SHOPS);
            // Store raw data for management
            writeJson('mj_shops_raw', normalized);
            
            const shops = { airport: [], town: [] };
            normalized.forEach(s => {
                const route = s.route || 'Town';
                if (route.toLowerCase().includes('airport')) shops.airport.push(s.name);
                else shops.town.push(s.name);
            });
            writeJson('mj_shops_v2', shops);
            return normalized; // Return full objects now for management
        } catch (e) {
            const fallback = readJson('mj_shops_raw', DEFAULT_SHOPS);
            writeJson('mj_shops_raw', fallback);
            return fallback;
        }
    },
    async addShop(shop) {
        const cached = readJson('mj_shops_raw', []);
        const nextShop = {
            id: Date.now(),
            name: shop.name,
            route: shop.route || 'Town',
            phone: shop.phone || ''
        };

        try {
            const res = await fetch(`${API_BASE}/shops`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(shop)
            });
            if (!res.ok) throw new Error('API Error');
            const created = await res.json();
            const merged = [...cached.filter(item => item.name !== nextShop.name), { ...nextShop, id: created.id || nextShop.id }];
            writeJson('mj_shops_raw', merged);
            return created;
        } catch (e) {
            const merged = [...cached.filter(item => item.name !== nextShop.name), nextShop];
            writeJson('mj_shops_raw', merged);
            console.error("❌ Add Shop Failed");
            return { id: nextShop.id };
        }
    },
    async updateShop(id, shop) {
        const cached = readJson('mj_shops_raw', []);
        try {
            const res = await fetch(`${API_BASE}/shops/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(shop)
            });
            if (!res.ok) throw new Error('API Error');
        } catch (e) {
            console.error("❌ Update Shop Failed");
        }

        const updated = cached.map(item => String(item.id) === String(id) ? { ...item, ...shop, id: item.id } : item);
        writeJson('mj_shops_raw', updated);
    },
    async deleteShop(id) {
        const cached = readJson('mj_shops_raw', []);
        try {
            const res = await fetch(`${API_BASE}/shops/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('API Error');
        } catch (e) {
            console.error("❌ Delete Shop Failed");
        }

        const filtered = cached.filter(item => String(item.id) !== String(id));
        writeJson('mj_shops_raw', filtered);
    },
    // ── PRODUCTS ──────────────────────────────────────────────────────────
    async getProducts() {
        try {
            const res = await fetch(`${API_BASE}/products`);
            if (!res.ok) throw new Error('API Error');
            const data = await res.json();
            writeJson('mj_products', data);
            return data;
        } catch (e) {
            return readJson('mj_products', []);
        }
    },
    async addProduct(product) {
        const cached = readJson('mj_products', []);
        try {
            const res = await fetch(`${API_BASE}/products`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(product)
            });
            if (!res.ok) throw new Error('API Error');
            const created = await res.json();
            const merged = [...cached.filter(item => item.name !== product.name), { ...product, id: created.id || Date.now() }];
            writeJson('mj_products', merged);
            return created;
        } catch (e) {
            const merged = [...cached.filter(item => item.name !== product.name), { ...product, id: Date.now() }];
            writeJson('mj_products', merged);
            console.error("❌ Add Product Failed");
            return { id: Date.now() };
        }
    },
    async updateProduct(id, product) {
        const cached = readJson('mj_products', []);
        try {
            const res = await fetch(`${API_BASE}/products/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(product)
            });
            if (!res.ok) throw new Error('API Error');
        } catch (e) {
            console.error("❌ Update Product Failed");
        }

        writeJson('mj_products', cached.map(item => (
            String(item.id) === String(id) ? { ...item, ...product, id: item.id } : item
        )));
    },
    async deleteProduct(id) {
        const cached = readJson('mj_products', []);
        try {
            const res = await fetch(`${API_BASE}/products/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('API Error');
        } catch (e) {
            console.error("❌ Delete Product Failed");
        }

        writeJson('mj_products', cached.filter(item => String(item.id) !== String(id)));
    }
};


window.DB = DB;
