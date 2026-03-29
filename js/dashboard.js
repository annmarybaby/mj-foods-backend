let currentProfitPeriod = 'today';

window.refreshDashboard = async function() {
    const dashboardView = document.getElementById('view-dashboard');
    if (!dashboardView) return;

    // ── Data ──────────────────────────────────────────────────────────────────
    // 1. First, show what we have in cache immediately
    renderView(
        JSON.parse(localStorage.getItem('mj_sales') || '[]'),
        JSON.parse(localStorage.getItem('mj_expenses') || '[]'),
        JSON.parse(localStorage.getItem('mj_emp_ledger') || '[]'),
        JSON.parse(localStorage.getItem('mj_receipts') || '[]')
    );

    // 2. Then, fetch fresh data from the Cloud
    if (window.DB) {
        try {
            const [sales, exps] = await Promise.all([
                window.DB.getSales(),
                window.DB.getExpenses()
            ]);
            // Re-render with the latest Cloud data
            renderView(
                sales, 
                exps, 
                JSON.parse(localStorage.getItem('mj_emp_ledger') || '[]'),
                JSON.parse(localStorage.getItem('mj_receipts') || '[]')
            );
        } catch (e) {
            console.warn("⚠️ Dashboard could not sync with cloud.", e);
        }
    }
};

function renderView(sales, exps, salaryLogs, receipts) {
    const dashboardView = document.getElementById('view-dashboard');
    if (!dashboardView) return;
    const now = new Date();
    
    // Normalize "now" to midnight for consistent "Today" comparison
    const todayStr = now.toDateString();

    // Helper to check if a record falls within the selected period
    const isInPeriod = (record, period) => {
        let dateObj;
        if (record.timestamp) {
            dateObj = new Date(record.timestamp);
        } else if (record.dateVal) {
            dateObj = new Date(record.dateVal + 'T00:00:00');
        } else {
            return false;
        }

        if (period === 'today') return dateObj.toDateString() === todayStr;
        
        if (period === 'week') {
            const weekAgo = new Date();
            weekAgo.setDate(now.getDate() - 7);
            return dateObj >= weekAgo && dateObj <= now;
        }
        
        if (period === 'month') {
            return dateObj.getMonth() === now.getMonth() && 
                   dateObj.getFullYear() === now.getFullYear();
        }
        
        if (period === 'year') {
            return dateObj.getFullYear() === now.getFullYear();
        }
        
        return false;
    };

    // Today specific stats
    const tSales = Array.isArray(sales) ? sales : [];
    const tExps = Array.isArray(exps) ? exps : [];
    const tSalary = Array.isArray(salaryLogs) ? salaryLogs : [];
    const tReceipts = Array.isArray(receipts) ? receipts : [];

    const filteredSales = tSales.filter(s => isInPeriod(s, currentProfitPeriod));
    const periodSalesTotal = filteredSales.reduce((a, c) => a + (parseFloat(c.total) || 0), 0);

    const pUnitExpsTotal = tExps.filter(e => isInPeriod(e, currentProfitPeriod)).reduce((a, c) => a + (Math.abs(parseFloat(c.amt)) || 0), 0);
    const pSalariesTotal = tSalary.filter(s => isInPeriod(s, currentProfitPeriod)).reduce((a, c) => a + (Math.abs(parseFloat(c.paid)) || 0), 0);
    const pReceiptsTotal = tReceipts.filter(r => isInPeriod(r, currentProfitPeriod)).reduce((a, c) => a + (Math.abs(parseFloat(c.amt)) || 0), 0);

    const totalPeriodExps = pUnitExpsTotal + pSalariesTotal + pReceiptsTotal;
    const periodProfit = periodSalesTotal - totalPeriodExps;

    const todaySalesTotal = tSales.filter(s => isInPeriod(s, 'today')).reduce((a, c) => a + (parseFloat(c.total) || 0), 0);
    const pendingSalesTotal = tSales.filter(s => s.status === 'Pending').reduce((a, c) => a + (parseFloat(c.total) || 0), 0);

    const allOrders = tSales.slice().sort((a,b) => b.timestamp - a.timestamp);
    const recentSalesHtml = allOrders.map((s, idx) => {
        const dateObj = new Date(s.timestamp);
        const dateStr = dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
        const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const itemDetails = s.items ? s.items.map(it => `
            <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.03);font-size:0.75rem;">
                <span style="color:#94a3b8;">${it.qty} × ${it.name}</span>
                <span style="font-weight:600;color:#fff;">${window.formatCurrency(it.total)}</span>
            </div>
        `).join('') : '<div style="color:#64748b;font-size:0.7rem;">No items.</div>';

        return `
            <div style="background:rgba(255,255,255,0.02);padding:12px 16px;border-radius:12px;margin-bottom:10px;border:1px solid rgba(255,255,255,0.05); overflow:hidden;" class="order-card-wrapper">
                <div class="flex-between">
                    <div style="flex:1;">
                        <div style="display:flex;align-items:center;gap:6px;">
                            <strong style="font-size:1rem;color:#f1f5f9;">${s.shop || 'Walk-in'}</strong>
                            <span class="badge ${s.status==='Paid'?'badge-success':'badge-warning'}" style="font-size:0.6rem; padding: 2px 6px;">${s.status}</span>
                        </div>
                        <div style="font-size:0.7rem;color:#64748b;margin-top:2px;">${dateStr} · ${timeStr}</div>
                    </div>
                    <div style="text-align:right; margin-right:12px;">
                        <div style="font-weight:700;font-size:1.1rem;color:#fff;">${window.formatCurrency(s.total)}</div>
                        <button onclick="this.closest('.order-card-wrapper').querySelector('.order-details-drawer').classList.toggle('open')" 
                            style="background:none;border:none;color:#3b82f6;font-size:0.7rem;font-weight:600;cursor:pointer;padding:2px 0; text-decoration:underline;">Details</button>
                    </div>
                    <div style="display:flex;gap:5px;">
                        <button onclick="window.sharePastInvoicePDF(${s.timestamp})" style="background:rgba(255,255,255,0.05);border:none;color:#94a3b8;border-radius:6px;width:30px;height:30px;display:flex;align-items:center;justify-content:center;cursor:pointer;"><i data-lucide="printer" style="width:14px;"></i></button>
                        <button onclick="window.deleteInvoice(${s.timestamp})" style="background:rgba(239,68,68,0.05);border:none;color:#f87171;border-radius:6px;width:30px;height:30px;display:flex;align-items:center;justify-content:center;cursor:pointer;"><i data-lucide="trash-2" style="width:14px;"></i></button>
                    </div>
                </div>
                <div class="order-details-drawer" style="max-height:0;overflow:hidden;transition:max-height 0.3s ease-out;background:rgba(0,0,0,0.1);margin:8px -16px -12px;padding:0 16px;">
                    <div style="padding:12px 0;">${itemDetails}</div>
                </div>
            </div>`;
    }).join('') || '<div class="empty-state">No records found.</div>';

    dashboardView.innerHTML = `
        <!-- Details Modal -->
        <div id="stat-detail-modal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.85); z-index:2000; align-items:center; justify-content:center; backdrop-filter:blur(12px);">
            <div class="card" style="width:95%; max-width:750px; max-height:85vh; overflow-y:auto; border: 1px solid rgba(255,255,255,0.1); padding:0;">
                <div class="flex-between" style="padding:22px; border-bottom:1px solid rgba(255,255,255,0.1); background:rgba(255,255,255,0.02); position:sticky; top:0; z-index:10; backdrop-filter:blur(20px);">
                    <h2 id="sd-modal-title" style="margin:0; font-size: 1.4rem; color:#fff;">Stat Details</h2>
                    <button onclick="document.getElementById('stat-detail-modal').style.display='none'" style="background:rgba(255,255,255,0.1); border:none; color:white; width:36px; height:36px; border-radius:50%; cursor:pointer;">&times;</button>
                </div>
                <div id="sd-modal-content" style="padding:22px;"></div>
            </div>
        </div>

        <div class="welcome-banner glass-panel">
            <div>
                <h3 style="font-size: 1.5rem; margin-bottom: 5px;">Dashboard Metrics</h3>
                <p style="color: #94a3b8; margin: 0;">Overview for the ${currentProfitPeriod} period.</p>
            </div>
            <div>
                <img src="assets/logo.jpeg" style="width:90px;height:90px;object-fit:cover;border-radius:50%;border:3px solid rgba(255,255,255,0.1);" onerror="this.style.display='none'">
            </div>
        </div>

        <div class="grid-4 mb-4">
            <div class="stat-card" onclick="window.showStatDetails('sales')" style="cursor:pointer; transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
                <div class="flex-between"><span class="stat-icon" style="color:#10b981;"><i data-lucide="shopping-bag"></i></span><i data-lucide="chevron-right" style="width:14px; color:#64748b;"></i></div>
                <div class="stat-details"><span class="label">Today's Sales</span><span class="value">${window.formatCurrency(todaySalesTotal)}</span></div>
            </div>
            <div class="stat-card warning" onclick="window.showStatDetails('pending')" style="cursor:pointer; transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
                <div class="flex-between"><span class="stat-icon" style="color:#f59e0b;"><i data-lucide="alert-circle"></i></span><i data-lucide="chevron-right" style="width:14px; color:#64748b;"></i></div>
                <div class="stat-details"><span class="label">Total Unpaid</span><span class="value" style="color:#fbbf24;">${window.formatCurrency(pendingSalesTotal)}</span></div>
            </div>
            <div class="stat-card danger" onclick="window.showStatDetails('expenses')" style="cursor:pointer; transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
                <div class="flex-between"><span class="stat-icon" style="color:#ef4444;"><i data-lucide="trending-down"></i></span><i data-lucide="chevron-right" style="width:14px; color:#64748b;"></i></div>
                <div class="stat-details">
                    <span class="label">${currentProfitPeriod.charAt(0).toUpperCase() + currentProfitPeriod.slice(1)} Outgoings</span>
                    <span class="value">${window.formatCurrency(totalPeriodExps)}</span>
                </div>
            </div>
            <div class="stat-card blue" onclick="window.showStatDetails('profit')" style="cursor:pointer; transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
                <div class="flex-between">
                    <span class="stat-icon" style="color:#3b82f6;"><i data-lucide="activity"></i></span>
                    <select onchange="event.stopPropagation(); window.switchProfitPeriod(this.value)" style="width:auto;padding:4px 8px;font-size:0.7rem;background:rgba(0,0,0,0.2);border:1px solid rgba(255,255,255,0.1);color:white;border-radius:6px;outline:none;">
                        <option value="today" ${currentProfitPeriod === 'today' ? 'selected' : ''}>Today</option>
                        <option value="week" ${currentProfitPeriod === 'week' ? 'selected' : ''}>Weekly</option>
                        <option value="month" ${currentProfitPeriod === 'month' ? 'selected' : ''}>Monthly</option>
                        <option value="year" ${currentProfitPeriod === 'year' ? 'selected' : ''}>Yearly</option>
                    </select>
                </div>
                <div class="stat-details">
                    <span class="label">${currentProfitPeriod.charAt(0).toUpperCase() + currentProfitPeriod.slice(1)} Net Profit</span>
                    <span class="value" style="color:${periodProfit>=0?'#10b981':'#f87171'}">${window.formatCurrency(periodProfit)}</span>
                </div>
            </div>
        </div>

        <div class="responsive-grid-2" style="margin-bottom:20px;">
            ${buildPendingCustomersSection(sales)}
            ${buildPendingExpensesSection(receipts)}
        </div>

        <div class="responsive-grid-2">
            <div class="card" style="display:flex;flex-direction:column;max-height:600px;">
                <h3 class="mb-4">Recent Sales</h3>
                <div style="flex:1;overflow-y:auto;padding-right:8px;">${recentSalesHtml}</div>
            </div>
            <div style="display:flex;flex-direction:column;gap:20px;">
                <div class="card" style="border-top: 4px solid #ef4444;">
                    <h3 class="mb-4">Add Quick Expense</h3>
                    <div style="display:flex;flex-direction:column;gap:10px;">
                        <div class="form-group" style="margin: 0;">
                            <label style="font-size: 0.7rem;">Category</label>
                            <select id="dash-exp-category" style="padding: 10px; font-size: 0.85rem;">
                                <option value="Groceries">Groceries / Raw Materials</option>
                                <option value="Van Service">Van Service</option>
                                <option value="Petrol">Petrol / Fuel</option>
                                <option value="Utilities">Utilities</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div class="form-group" style="margin: 0;">
                            <label style="font-size: 0.7rem;">Amount (₹)</label>
                            <input type="number" id="dash-exp-amt" placeholder="Amount" style="padding: 10px; font-size: 0.85rem;">
                        </div>
                        <button class="btn btn-danger" onclick="window.recordDashboardExpense()" style="width:100%; height:42px; font-weight:700;">Save Expense</button>
                    </div>
                </div>
                <div class="card">
                    <h3>Navigational Links</h3>
                    <div class="grid-2 mt-4">
                        <button class="btn btn-primary" style="height:70px;flex-direction:column;gap:5px;font-size:0.9rem;" onclick="document.querySelector('[data-view=\\'billing\\']').click()">
                            <i data-lucide="plus" style="width:18px;"></i>New Bill
                        </button>
                        <button class="btn btn-secondary" style="height:70px;flex-direction:column;gap:5px;font-size:0.9rem;" onclick="document.querySelector('[data-view=\\'employees\\']').click()">
                            <i data-lucide="users" style="width:18px;"></i>Staff Info
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    if (window.lucide) window.lucide.createIcons();
};

window.showStatDetails = function(type) {
    const period = currentProfitPeriod.toUpperCase();
    const modal = document.getElementById('stat-detail-modal');
    const title = document.getElementById('sd-modal-title');
    const content = document.getElementById('sd-modal-content');
    if (!modal || !content) return;

    modal.style.display = 'flex';
    content.innerHTML = '<div style="text-align:center; padding:40px; color:#64748b;">Loading details...</div>';

    const sales      = JSON.parse(localStorage.getItem('mj_sales')       || '[]');
    const exps       = JSON.parse(localStorage.getItem('mj_expenses')     || '[]');
    const salaryLogs = JSON.parse(localStorage.getItem('mj_emp_ledger')   || '[]');
    const receipts   = JSON.parse(localStorage.getItem('mj_receipts')     || '[]');
    const now = new Date();
    const todayStr = now.toDateString();

    const isInPeriod = (record) => {
        let dateObj;
        if (record.timestamp) dateObj = new Date(record.timestamp);
        else if (record.dateVal) dateObj = new Date(record.dateVal + 'T00:00:00');
        else return false;

        if (currentProfitPeriod === 'today') return dateObj.toDateString() === todayStr;
        if (currentProfitPeriod === 'week') {
            const weekAgo = new Date(); weekAgo.setDate(now.getDate() - 7);
            return dateObj >= weekAgo && dateObj <= now;
        }
        if (currentProfitPeriod === 'month') return dateObj.getMonth() === now.getMonth() && dateObj.getFullYear() === now.getFullYear();
        if (currentProfitPeriod === 'year') return dateObj.getFullYear() === now.getFullYear();
        return false;
    };

    let html = '';
    if (type === 'sales') {
        title.textContent = `${period} Sales Breakdown`;
        const list = sales.filter(s => isInPeriod(s));
        html = list.map(s => `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 16px; background:rgba(255,255,255,0.03); border-radius:10px; margin-bottom:8px; border: 1px solid rgba(255,255,255,0.05);">
                <div>
                    <div style="font-weight:700; color:#fff;">${s.shop || 'Walk-in'}</div>
                    <div style="font-size:0.75rem; color:#64748b; margin-top:2px;">${new Date(s.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                </div>
                <div style="display:flex; align-items:center; gap:15px;">
                    <div style="font-weight:800; color:#10b981;">${window.formatCurrency(s.total)}</div>
                    <button onclick="window.deleteInvoice(${s.timestamp}); window.showStatDetails('sales');" style="background:none; border:none; color:#f87171; cursor:pointer;"><i data-lucide="trash-2" style="width:14px;"></i></button>
                </div>
            </div>`).join('') || '<div style="text-align:center; padding:30px; color:#64748b;">No sales records.</div>';
    } 
    else if (type === 'pending') {
        title.textContent = `All Pending Customer Payments`;
        const list = sales.filter(s => s.status === 'Pending');
        html = list.map(s => `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 16px; background:rgba(255,255,255,0.03); border-radius:10px; margin-bottom:8px; border: 1px solid rgba(255,255,255,0.05);">
                <div>
                    <div style="font-weight:700; color:#fff;">${s.shop || 'Walk-in'}</div>
                    <div style="font-size:0.75rem; color:#64748b; margin-top:2px;">${new Date(s.timestamp).toLocaleDateString()}</div>
                </div>
                <div style="display:flex; align-items:center; gap:15px;">
                    <div style="font-weight:800; color:#fbbf24;">${window.formatCurrency(s.total)}</div>
                    <button onclick="window.deleteInvoice(${s.timestamp}); window.showStatDetails('pending');" style="background:none; border:none; color:#f87171; cursor:pointer;"><i data-lucide="trash-2" style="width:14px;"></i></button>
                </div>
            </div>`).join('') || '<div style="text-align:center; padding:30px; color:#64748b;">No pending payments.</div>';
    }
    else if (type === 'expenses') {
        title.textContent = `${period} Outgoings Breakdown`;
        const uList = exps.filter(e => isInPeriod(e));
        const sList = salaryLogs.filter(s => isInPeriod(s));
        const rList = receipts.filter(r => isInPeriod(r));

        html = `
            <div style="margin-bottom:24px;">
                <h4 style="margin:0 0 12px 0; font-size:0.8rem; text-transform:uppercase; color:#ef4444; letter-spacing:1px; border-bottom:1px solid rgba(239,68,68,0.2); padding-bottom:5px;">Unit & Quick Expenses</h4>
                ${uList.map(e => `
                    <div class="flex-between" style="padding:10px; border-bottom:1px solid rgba(255,255,255,0.03);">
                        <div>
                            <div style="font-weight:600; color:#f1f5f9;">${e.category}</div>
                            <div style="font-size:0.7rem; color:#64748b;">${new Date(e.timestamp).toLocaleDateString()}</div>
                        </div>
                        <div style="display:flex; align-items:center; gap:12px;">
                            <span style="font-weight:700; color:#f87171;">- ${window.formatCurrency(e.amt)}</span>
                            <button onclick="window.deleteExpense(${e.id}); window.showStatDetails('expenses');" style="background:none; border:none; color:#475569; cursor:pointer;"><i data-lucide="trash-2" style="width:14px;"></i></button>
                        </div>
                    </div>`).join('') || '<p style="font-size:0.8rem; color:#64748b; padding:10px;">None</p>'}
            </div>
            
            <div style="margin-bottom:24px;">
                <h4 style="margin:0 0 12px 0; font-size:0.8rem; text-transform:uppercase; color:#ef4444; letter-spacing:1px; border-bottom:1px solid rgba(239,68,68,0.2); padding-bottom:5px;">Salary / Wages Paid</h4>
                ${sList.map(s => `
                    <div class="flex-between" style="padding:10px; border-bottom:1px solid rgba(255,255,255,0.03);">
                        <div>
                            <div style="font-weight:600; color:#f1f5f9;">Wage Entry</div>
                            <div style="font-size:0.7rem; color:#64748b;">${s.dateStr}</div>
                        </div>
                        <div style="display:flex; align-items:center; gap:12px;">
                            <span style="font-weight:700; color:#f87171;">- ${window.formatCurrency(s.paid)}</span>
                            <button onclick="window.deleteLogEntry(${s.id},'${s.empId}'); window.showStatDetails('expenses');" style="background:none; border:none; color:#475569; cursor:pointer;"><i data-lucide="trash-2" style="width:14px;"></i></button>
                        </div>
                    </div>`).join('') || '<p style="font-size:0.8rem; color:#64748b; padding:10px;">None</p>'}
            </div>

            <div>
                <h4 style="margin:0 0 12px 0; font-size:0.8rem; text-transform:uppercase; color:#ef4444; letter-spacing:1px; border-bottom:1px solid rgba(239,68,68,0.2); padding-bottom:5px;">Vendor Bill Receipts</h4>
                ${rList.map(r => `
                    <div class="flex-between" style="padding:10px; border-bottom:1px solid rgba(255,255,255,0.03);">
                        <div>
                            <div style="font-weight:600; color:#f1f5f9;">${r.shop}</div>
                            <div style="font-size:0.7rem; color:#64748b;">${r.category} · ${new Date(r.dateVal).toLocaleDateString()}</div>
                        </div>
                        <div style="display:flex; align-items:center; gap:12px;">
                            <span style="font-weight:700; color:#f87171;">- ${window.formatCurrency(r.amt)}</span>
                            <button onclick="window.deleteReceipt(${r.id}); window.showStatDetails('expenses');" style="background:none; border:none; color:#475569; cursor:pointer;"><i data-lucide="trash-2" style="width:14px;"></i></button>
                        </div>
                    </div>`).join('') || '<p style="font-size:0.8rem; color:#64748b; padding:10px;">None</p>'}
            </div>
        `;
    }
    else if (type === 'profit') {
        title.textContent = `${period} Net Profit Breakdown`;
        const sTotal = sales.filter(s => isInPeriod(s)).reduce((a,c)=>a+(parseFloat(c.total)||0), 0);
        const uTotal = exps.filter(e => isInPeriod(e)).reduce((a,c)=>a+(parseFloat(c.amt)||0), 0);
        const rTotal = receipts.filter(r => isInPeriod(r)).reduce((a,c)=>a+(parseFloat(c.amt)||0), 0);
        const salTotal = salaryLogs.filter(s => isInPeriod(s)).reduce((a,c)=>a+(parseFloat(c.paid)||0), 0);
        
        const eTotal = uTotal + rTotal + salTotal;
        
        html = `
            <div style="padding:25px; border-radius:15px; background:rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05);">
                <div class="flex-between mb-4">
                    <span style="color:#94a3b8; font-weight:600;">Gross Sales Activity:</span>
                    <span style="font-weight:700; color:#10b981; font-size:1.4rem;">+ ${window.formatCurrency(sTotal)}</span>
                </div>
                <div style="margin:20px 0; padding:15px; background:rgba(239,68,68,0.03); border-radius:12px; border:1px solid rgba(239,68,68,0.1);">
                    <div style="font-size:0.75rem; color:#f87171; text-transform:uppercase; font-weight:700; margin-bottom:10px;">Total Outgoings Breakdown:</div>
                    <div class="flex-between mb-2"><span style="color:#94a3b8; font-size:0.85rem;">Unit Expenses:</span><span style="color:#fca5a5;">- ${window.formatCurrency(uTotal)}</span></div>
                    <div class="flex-between mb-2"><span style="color:#94a3b8; font-size:0.85rem;">Salary Payouts:</span><span style="color:#fca5a5;">- ${window.formatCurrency(salTotal)}</span></div>
                    <div class="flex-between"><span style="color:#94a3b8; font-size:0.85rem;">Bill Receipts:</span><span style="color:#fca5a5;">- ${window.formatCurrency(rTotal)}</span></div>
                </div>
                <div class="flex-between" style="padding-top:20px; border-top:2px solid rgba(255,255,255,0.1);">
                    <span style="font-weight:800; color:#fff; font-size:1.1rem;">NET PROFIT / LOSS:</span>
                    <span style="font-weight:900; color:${(sTotal-eTotal)>=0?'#10b981':'#ef4444'}; font-size:2.2rem;">${window.formatCurrency(sTotal-eTotal)}</span>
                </div>
            </div>
            <div style="margin-top:20px; font-size:0.75rem; color:#64748b; text-align:center;">
                To correct individual amounts, click on the **Sales** or **Outgoings** cards.
            </div>
        `;
    }

    content.innerHTML = html;
    if (window.lucide) window.lucide.createIcons();
};

window.switchProfitPeriod = (period) => {
    currentProfitPeriod = period;
    window.refreshDashboard();
};

window.recordDashboardExpense = () => {
    const category = document.getElementById('dash-exp-category').value;
    const amt = parseFloat(document.getElementById('dash-exp-amt').value);
    if (!amt || amt <= 0) return alert('Enter a valid amount');
    const expense = { id: Date.now(), category, amt, note: 'Added via Dashboard', timestamp: Date.now() };
    let exps = JSON.parse(localStorage.getItem('mj_expenses') || '[]');
    exps.push(expense);
    localStorage.setItem('mj_expenses', JSON.stringify(exps));
    document.getElementById('dash-exp-amt').value = '';
    window.refreshDashboard();
    if (window.showExpToast) window.showExpToast(`Recorded ₹${amt} expense`, 'success');
};

function buildPendingCustomersSection(sales) {
    const pending = sales.filter(s => s.status === 'Pending').sort((a,b) => a.timestamp - b.timestamp);
    if (pending.length === 0) return `<div class="card" style="border-top:4px solid #10b981;"><h3>No Pending Customer Debits</h3><p style="color:#64748b;font-size:0.8rem;">All customer accounts are clear.</p></div>`;
    const totalPending = pending.reduce((a,c) => a + (parseFloat(c.total) || 0), 0);
    const rows = pending.slice(0, 5).map(s => `
        <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
            <div><div style="font-weight:700;font-size:0.9rem;">${s.shop || 'Walk-in'}</div><div style="font-size:0.7rem;color:#64748b;">${new Date(s.timestamp).toLocaleDateString()}</div></div>
            <div style="display:flex;align-items:center;gap:8px;"><span style="font-weight:800;color:#fbbf24;font-size:0.9rem;">${window.formatCurrency(s.total)}</span><button onclick="window.markInvoicePaid(${s.timestamp})" style="background:rgba(16,185,129,0.1);color:#34d399;border:1px solid rgba(16,185,129,0.2);border-radius:6px;padding:3px 8px;font-size:0.7rem;font-weight:700;cursor:pointer;">Paid</button></div>
        </div>`).join('');
    return `<div class="card" style="border-top:4px solid #f59e0b;"><div class="flex-between mb-3"><h3>Pending Customer Debits</h3><span style="font-weight:900;color:#fbbf24;">${window.formatCurrency(totalPending)}</span></div><div>${rows}</div></div>`;
}

function buildPendingExpensesSection(receipts) {
    const unpaid = receipts.filter(r => !r.paid).sort((a,b) => new Date(a.dateVal) - new Date(b.dateVal));
    if (unpaid.length === 0) return `<div class="card" style="border-top:4px solid #10b981;"><h3>No Pending Vendor Bills</h3><p style="color:#64748b;font-size:0.8rem;">All supplier bills have been paid.</p></div>`;
    const totalUnpaid = unpaid.reduce((a,c) => a + (parseFloat(c.amt) || 0), 0);
    const rows = unpaid.slice(0, 5).map(r => `
        <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
            <div><div style="font-weight:700;font-size:0.9rem;">${r.shop}</div><div style="font-size:0.7rem;color:#8b5cf6;">${r.category}</div></div>
            <div style="display:flex;align-items:center;gap:8px;"><span style="font-weight:800;color:#f87171;font-size:0.9rem;">${window.formatCurrency(r.amt)}</span><button onclick="window.dashMarkReceiptPaid(${r.id})" style="background:rgba(16,185,129,0.1);color:#34d399;border:1px solid rgba(16,185,129,0.2);border-radius:6px;padding:3px 8px;font-size:0.7rem;font-weight:700;cursor:pointer;">Paid</button></div>
        </div>`).join('');
    return `<div class="card" style="border-top:4px solid #ef4444;"><div class="flex-between mb-3"><h3>Pending Vendor Bills</h3><span style="font-weight:900;color:#f87171;">${window.formatCurrency(totalUnpaid)}</span></div><div>${rows}</div></div>`;
}

window.dashMarkReceiptPaid = (id) => {
    let receipts = JSON.parse(localStorage.getItem('mj_receipts') || '[]');
    const r = receipts.find(r => r.id === id);
    if (r) { r.paid = true; localStorage.setItem('mj_receipts', JSON.stringify(receipts)); window.refreshDashboard(); }
};

window.deleteInvoice = (timestamp) => {
    if(!confirm("Permenantly delete this record? This cannot be undone.")) return;
    let sales = JSON.parse(localStorage.getItem('mj_sales') || '[]');
    sales = sales.filter(s => s.timestamp !== timestamp);
    localStorage.setItem('mj_sales', JSON.stringify(sales));
    window.refreshDashboard();
    if(window.initHistory) window.initHistory();
};

window.markInvoicePaid = (timestamp) => {
    let sales = JSON.parse(localStorage.getItem('mj_sales') || '[]');
    const idx = sales.findIndex(s => s.timestamp === timestamp);
    if(idx > -1) { sales[idx].status = 'Paid'; localStorage.setItem('mj_sales', JSON.stringify(sales)); window.refreshDashboard(); if(window.initHistory) window.initHistory(); }
};
