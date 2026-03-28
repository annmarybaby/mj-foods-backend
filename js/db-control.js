// ═══════════════════════════════════════════════════════════════════
//  DATABASE CONTROL PANEL
// ═══════════════════════════════════════════════════════════════════

function initDatabase() {
    const view = document.getElementById('view-database');
    if (!view) return;

    view.innerHTML = `
        <div style="max-width:1200px; margin:0 auto; padding-bottom:100px;">
            <div class="flex-between mb-4">
                <div>
                    <h2 style="margin:0; font-size:1.8rem;">Database Control</h2>
                    <p style="color:#64748b; margin-top:4px;">Manage all business records, exports, and cloud backups.</p>
                </div>
                <div style="display:flex; gap:12px;">
                    <button onclick="window.exportFullBackup()" class="btn btn-secondary" style="border-radius:12px; height:45px; font-weight:700;">
                        <i data-lucide="download" style="width:16px;"></i> Export JSON
                    </button>
                    <button onclick="window.confirmFactoryReset()" class="btn btn-danger" style="border-radius:12px; height:45px; font-weight:700;">
                        <i data-lucide="trash-2" style="width:16px;"></i> Wipe Data
                    </button>
                </div>
            </div>

            <!-- Dashboard Stats Grid -->
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:20px; margin-bottom:30px;">
                ${renderStatCard('Sales Records', 'mj_sales', 'shopping-cart', '#3b82f6')}
                ${renderStatCard('Expense Logs', 'mj_expenses', 'wallet', '#ef4444')}
                ${renderStatCard('Employees', 'mj_employees', 'users', '#8b5cf6')}
                ${renderStatCard('Bill Receipts', 'mj_receipts', 'receipt', '#10b981')}
            </div>

            <div class="grid-2">
                <!-- Inspection Card -->
                <div class="card" style="padding:0; overflow:hidden;">
                    <div style="padding:20px; border-bottom:1px solid rgba(255,255,255,0.06); display:flex; justify-content:space-between; align-items:center;">
                        <h3 style="margin:0; font-size:1.1rem;">Live Data Inspector</h3>
                        <select id="data-selector" onchange="window.inspectData(this.value)" style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); color:white; padding:8px 12px; border-radius:10px; font-weight:700;">
                            <option value="mj_sales">Sales Records</option>
                            <option value="mj_expenses">Expenses</option>
                            <option value="mj_employees">Employee Directory</option>
                            <option value="mj_receipts">Uploaded Receipts</option>
                            <option value="mj_shops_v2">Shop Routes (Airport/Town)</option>
                        </select>
                    </div>
                    <div style="padding:22px; background:rgba(0,0,0,0.25);">
                        <div id="data-content" style="font-family:'Courier New', monospace; font-size:0.8rem; background:#0f172a; padding:20px; border-radius:12px; height:400px; overflow:auto; color:var(--accent-emerald); border:1px solid rgba(255,255,255,0.03);">
                            <!-- JSON Injected Here -->
                        </div>
                    </div>
                </div>

                <!-- Utilities Card -->
                <div class="card" style="padding:25px;">
                    <h3>Database Utilities</h3>
                    <div style="display:flex; flex-direction:column; gap:16px; margin-top:20px;">
                        <div style="background:rgba(59,130,246,0.05); border:1px solid rgba(59,130,246,0.15); border-radius:15px; padding:20px;">
                            <h4 style="margin:0 0 8px 0; color:#93c5fd;">Manually Force Sync</h4>
                            <p style="font-size:0.8rem; color:#64748b; margin-bottom:15px;">Instantly send your current local database to the cloud Firestore.</p>
                            <button onclick="window.cloudSyncTrigger()" class="btn btn-primary" style="width:100%; border-radius:10px;">Push All to Cloud</button>
                        </div>
                        <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); border-radius:15px; padding:20px;">
                            <h4 style="margin:0 0 8px 0;">Import Data</h4>
                            <p style="font-size:0.8rem; color:#64748b; margin-bottom:15px;">Upload a previously exported database JSON file.</p>
                            <input type="file" id="import-db-file" accept=".json" style="display:none;" onchange="window.handleImportData(event)">
                            <button onclick="document.getElementById('import-db-file').click()" class="btn btn-secondary" style="width:100%; border-radius:10px;">Select File & Restore</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    window.inspectData('mj_sales');
    if (window.lucide) window.lucide.createIcons();
}

function renderStatCard(title, storageKey, icon, color) {
    const data = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const count = Array.isArray(data) ? data.length : Object.keys(data).length;
    return `
        <div class="card" style="border-left:5px solid ${color}; padding:25px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <div style="color:#64748b; font-size:0.75rem; font-weight:800; text-transform:uppercase; letter-spacing:1px; margin-bottom:5px;">${title}</div>
                    <div style="font-size:1.8rem; font-weight:900;">${count}</div>
                </div>
                <div style="background:${color}15; color:${color}; padding:14px; border-radius:14px;"><i data-lucide="${icon}"></i></div>
            </div>
        </div>`;
}

window.inspectData = (key) => {
    const data = JSON.parse(localStorage.getItem(key) || '[]');
    const textContent = JSON.stringify(data, null, 4);
    document.getElementById('data-content').textContent = textContent;
};

window.exportFullBackup = () => {
    const fullDB = {};
    const keys = ['mj_sales', 'mj_expenses', 'mj_employees', 'mj_emp_ledger', 'mj_receipts', 'mj_shops_v2', 'mj_billing_draft_items', 'mj_billing_draft_shop'];
    keys.forEach(k => fullDB[k] = JSON.parse(localStorage.getItem(k) || '[]'));
    
    const blob = new Blob([JSON.stringify(fullDB, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MJ_Foods_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
};

window.handleImportData = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        try {
            const data = JSON.parse(ev.target.result);
            if (confirm('Are you sure? This will replace your current local data with the contents of this file.')) {
                Object.keys(data).forEach(k => {
                    localStorage.setItem(k, JSON.stringify(data[k]));
                });
                alert('Database Restore Successful! Refreshing...');
                location.reload();
            }
        } catch (err) { alert('Invalid file format.'); }
    };
    reader.readAsText(file);
};

window.confirmFactoryReset = () => {
    if (confirm('⚠️ WARNING: This will permanently DELETE all your local data including sales, expenses, and employee records. This CANNOT be undone. Are you sure?')) {
        const pin = prompt('Type "WIPE" to confirm:');
        if (pin === 'WIPE') {
            localStorage.clear();
            alert('Database Wiped Successfully. Refreshing...');
            location.reload();
        }
    }
};

document.addEventListener('DOMContentLoaded', initDatabase);
