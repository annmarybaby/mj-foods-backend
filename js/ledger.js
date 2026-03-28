// Debit & Credit View Module
window.initLedger = function() {
    const ledgerView = document.getElementById('view-ledger');
    if (!ledgerView) return;

    const sales = JSON.parse(localStorage.getItem('mj_sales') || '[]');
    
    // Process data to group by shop and calculate debit (pending) and credit (paid)
    const shopBalances = {};

    sales.forEach(s => {
        const shopName = s.shop || 'Walk-in Customer';
        if (!shopBalances[shopName]) {
            shopBalances[shopName] = {
                name: shopName,
                totalDebit: 0,
                totalPaid: 0,
                lastTransaction: 0,
                transactions: 0
            };
        }
        
        if (s.status === 'Pending') {
            shopBalances[shopName].totalDebit += s.total;
        } else {
            shopBalances[shopName].totalPaid += s.total;
        }
        
        if (s.timestamp > shopBalances[shopName].lastTransaction) {
            shopBalances[shopName].lastTransaction = s.timestamp;
        }
        shopBalances[shopName].transactions++;
    });

    const shopList = Object.values(shopBalances).sort((a, b) => b.totalDebit - a.totalDebit);
    const totalCompanyDebit = shopList.reduce((a, b) => a + b.totalDebit, 0);

    const ledgerHtml = shopList.map(shop => `
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.02)'" onmouseout="this.style.background='transparent'">
            <td style="padding: 16px;">
                <div style="font-weight: 700; color: #f1f5f9; font-size: 1rem;">${shop.name}</div>
                <div style="font-size: 0.75rem; color: #64748b; margin-top: 4px;">Last Activity: ${shop.lastTransaction ? new Date(shop.lastTransaction).toLocaleDateString() : 'N/A'}</div>
            </td>
            <td style="padding: 16px; text-align: center;">
                <span class="badge" style="background: rgba(59, 130, 246, 0.1); color: #93c5fd;">${shop.transactions} Bills</span>
            </td>
            <td style="padding: 16px; text-align: right;">
                <div style="font-weight: 600; color: #34d399;">${window.formatCurrency(shop.totalPaid)}</div>
            </td>
            <td style="padding: 16px; text-align: right;">
                <div style="font-weight: 800; color: ${shop.totalDebit > 0 ? '#ef4444' : '#64748b'}; font-size: 1.1rem;">
                    ${window.formatCurrency(shop.totalDebit)}
                </div>
            </td>
            <td style="padding: 16px; text-align: center;">
                <button onclick="window.viewShopDetails('${shop.name.replace(/'/g, "\\'")}')" 
                    style="background: #3b82f6; border: none; color: white; border-radius: 8px; padding: 8px 16px; cursor: pointer; font-size: 0.82rem; font-weight: 700; display:flex; align-items:center; gap:6px; margin: 0 auto;">
                    <i data-lucide="eye" style="width:14px;"></i> View & Settle
                </button>
            </td>
        </tr>
    `).join('') || '<tr><td colspan="5" style="padding: 50px; text-align: center; color: #64748b;">No transactions recorded.</td></tr>';

    ledgerView.innerHTML = `
        <div class="grid-2 mb-4">
            <div class="stat-card warning" style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(0,0,0,0));">
                <div class="flex-between">
                    <span class="stat-icon" style="color: #f59e0b;"><i data-lucide="alert-circle"></i></span>
                </div>
                <div class="stat-details">
                    <span class="label">Total Outstanding Debt</span>
                    <span class="value" style="color: #fbbf24;">${window.formatCurrency(totalCompanyDebit)}</span>
                </div>
            </div>
            <div class="stat-card" style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(0,0,0,0));">
                <div class="flex-between">
                    <span class="stat-icon" style="color: #10b981;"><i data-lucide="users"></i></span>
                </div>
                <div class="stat-details">
                    <span class="label">Active Accounts</span>
                    <span class="value">${shopList.length}</span>
                </div>
            </div>
        </div>

        <div class="card" style="padding: 0; overflow: hidden; border-top: 4px solid #f59e0b;">
            <div style="padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center;">
                <h3 style="margin: 0;">Shop Balances (Debit & Credit)</h3>
                <div style="font-size: 0.8rem; color: #64748b;">Grouped by outstanding payment</div>
            </div>
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; text-align: left;">
                    <thead>
                        <tr style="background: rgba(255,255,255,0.02); text-transform: uppercase; font-size: 0.7rem; color: #64748b; letter-spacing: 1px;">
                            <th style="padding: 16px;">Shop Name</th>
                            <th style="padding: 16px; text-align: center;">Transactions</th>
                            <th style="padding: 16px; text-align: right;">Total Paid</th>
                            <th style="padding: 16px; text-align: right;">Pending (Debit)</th>
                            <th style="padding: 16px; text-align: center;">Update Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${ledgerHtml}
                    </tbody>
                </table>
            </div>
        </div>
        
        <!-- Shop Detail Modal -->
        <div id="shop-detail-modal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.8); z-index:1000; align-items:center; justify-content:center; backdrop-filter:blur(10px);">
            <div class="card" style="width:90%; max-width:800px; max-height:85vh; overflow-y:auto; border: 1px solid rgba(255,255,255,0.1); padding: 0;">
                <div class="flex-between" style="border-bottom: 1px solid rgba(255,255,255,0.1); padding: 25px; background: rgba(255,255,255,0.02);">
                    <div>
                        <h2 id="modal-shop-name" style="margin:0; color:#fff; font-size: 1.5rem;">Shop Details</h2>
                        <p style="margin:5px 0 0; color:#64748b; font-size:0.9rem;">Review individual bills and settle payments</p>
                    </div>
                    <button onclick="document.getElementById('shop-detail-modal').style.display='none'" style="background:rgba(255,255,255,0.1); border:none; color:white; width:40px; height:40px; border-radius:50%; cursor:pointer; font-size: 1.2rem;">&times;</button>
                </div>
                <div id="modal-shop-content" style="padding: 25px;"></div>
            </div>
        </div>
    `;

    if (window.lucide) window.lucide.createIcons();
};

window.viewShopDetails = function(shopName) {
    const sales = JSON.parse(localStorage.getItem('mj_sales') || '[]');
    const shopSales = sales.filter(s => (s.shop || 'Walk-in Customer') === shopName).reverse();
    
    document.getElementById('modal-shop-name').textContent = shopName;
    const modalContent = document.getElementById('modal-shop-content');
    
    const rows = shopSales.map(s => `
        <div style="background:rgba(255,255,255,0.03); padding:18px; border-radius:12px; margin-bottom:15px; border:1px solid rgba(255,255,255,0.05); display:flex; justify-content:space-between; align-items:center;">
            <div>
                <div style="font-weight:700; font-size:1.1rem; color: #fff;">${window.formatCurrency(s.total)}</div>
                <div style="font-size:0.8rem; color:#64748b; margin-top:4px;">${new Date(s.timestamp).toLocaleDateString()} ${new Date(s.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                <div style="font-size:0.75rem; color:#93c5fd; margin-top:2px;">${s.items ? s.items.length : 0} items in bill</div>
            </div>
            <div style="text-align:right; display: flex; align-items: center; gap: 15px;">
                <span class="badge ${s.status === 'Paid' ? 'badge-success' : 'badge-warning'}" style="font-size:0.8rem; padding: 6px 12px;">${s.status}</span>
                
                ${s.status === 'Pending' ? `
                    <button onclick="window.updateStatusFromLedger(${s.timestamp}, 'Paid', '${shopName.replace(/'/g, "\\'")}')" 
                        style="background:#10b981; color:white; border:none; border-radius:8px; padding:10px 20px; font-size:0.85rem; font-weight:700; cursor:pointer; box-shadow: 0 4px 12px rgba(16,185,129,0.2);">
                        Mark as Paid
                    </button>
                ` : `
                    <button onclick="window.updateStatusFromLedger(${s.timestamp}, 'Pending', '${shopName.replace(/'/g, "\\'")}')" 
                        style="background:rgba(245, 158, 11, 0.1); color:#fbbf24; border:1px solid rgba(245, 158, 11, 0.3); border-radius:8px; padding:10px 20px; font-size:0.85rem; font-weight:700; cursor:pointer;">
                        Revert to Not Paid
                    </button>
                `}
            </div>
        </div>
    `).join('');
    
    modalContent.innerHTML = rows || '<div style="text-align:center; padding:50px; color:#64748b; font-style: italic;">No bills found for this account.</div>';
    document.getElementById('shop-detail-modal').style.display = 'flex';
};

window.updateStatusFromLedger = function(timestamp, newStatus, shopName) {
    let sales = JSON.parse(localStorage.getItem('mj_sales') || '[]');
    const index = sales.findIndex(s => s.timestamp === timestamp);
    if(index > -1) {
        sales[index].status = newStatus;
        localStorage.setItem('mj_sales', JSON.stringify(sales));
        
        // Refresh EVERYTHING
        window.viewShopDetails(shopName);
        window.initLedger();
        if (window.refreshDashboard) window.refreshDashboard();
        if (window.initHistory) window.initHistory();
    }
};
