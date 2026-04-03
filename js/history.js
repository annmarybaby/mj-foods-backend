// History View Module
window.initHistory = async function() {
    const historyView = document.getElementById('view-history');
    if (!historyView) return;
    
    // FETCH FROM MYSQL
    let sales = await window.DB.getSales();
    if (!Array.isArray(sales)) sales = [];

    // Shallow copy and reverse to show newest first
    const sortedSales = [...sales].reverse();

    const historyHtml = sortedSales.map(s => {
        // Ensure items is an array for internal map
        if (!Array.isArray(s.items)) s.items = [];
        return `
        <div style="background: rgba(255,255,255,0.03); padding: 15px 20px; border-radius: 12px; margin-bottom: 15px; border: 1px solid var(--border-color);">
            <div class="flex-between">
                <div>
                    <strong style="font-size: 1.1rem;">${s.shop || 'Walk-in Customer'}</strong>
                    <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 6px;">
                        ${new Date(s.timestamp).toLocaleDateString('en-IN')} - ${new Date(s.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                </div>
                <div style="display:flex; align-items:center; gap: 15px;">
                    <div style="text-align: right">
                        <div style="font-weight: 700; font-size: 1.2rem;">${window.formatCurrency(s.total)}</div>
                        <span class="badge ${s.status === 'Paid' ? 'badge-success' : 'badge-warning'}" style="margin-top: 5px; display: inline-block;">${s.status}</span>
                    </div>
                    ${s.status === 'Pending' ? 
                        `<button onclick="window.markInvoicePaid(${s.id})" style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); color: var(--accent-emerald); border-radius: 8px; padding: 0 10px; height: 36px; cursor:pointer; font-size: 0.8rem; font-weight: 600;" title="Mark as Paid">✓ PAID</button>` : 
                        `<button onclick="window.markInvoiceUnpaid(${s.id})" style="background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.2); color: var(--accent-orange); border-radius: 8px; padding: 0 10px; height: 36px; cursor:pointer; font-size: 0.8rem; font-weight: 600;" title="Revert to Unpaid">↺ UNPAID</button>`}
                    <button onclick="window.sharePastInvoicePDF(${s.id})" style="background: rgba(18, 140, 126, 0.1); border: 1px solid rgba(18, 140, 126, 0.2); color: #25D366; border-radius: 8px; width: 36px; height: 36px; display:flex; align-items:center; justify-content:center; cursor:pointer;" title="Share PDF via WhatsApp">📄</button>
                    <button onclick="window.deleteInvoice(${s.id})" style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: var(--accent-danger); border-radius: 8px; width: 36px; height: 36px; display:flex; align-items:center; justify-content:center; cursor:pointer;" title="Delete Invoice">✖</button>
                </div>
            </div>
            ${s.items && s.items.length > 0 ? `
            <details style="margin-top: 15px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 15px;">
                <summary style="cursor: pointer; color: var(--accent-blue); font-size: 0.9rem; font-weight: 500; outline: none; transition: color 0.2s;">View Full Details (${s.items.length} items)</summary>
                <div style="margin-top: 12px; background: rgba(0,0,0,0.2); padding: 10px 15px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.03);">
                    <table style="width: 100%; font-size: 0.85rem; border-collapse: collapse;">
                        <thead>
                            <tr style="color: var(--text-muted); text-transform: uppercase; font-size: 0.75rem;">
                                <th style="text-align: left; padding: 6px 4px; border-bottom: 1px solid rgba(255,255,255,0.05);">Item</th>
                                <th style="text-align: center; padding: 6px 4px; border-bottom: 1px solid rgba(255,255,255,0.05);">Qty</th>
                                <th style="text-align: right; padding: 6px 4px; border-bottom: 1px solid rgba(255,255,255,0.05);">Price</th>
                                <th style="text-align: right; padding: 6px 4px; border-bottom: 1px solid rgba(255,255,255,0.05);">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${s.items.map(item => `
                                <tr>
                                    <td style="padding: 8px 4px; border-bottom: 1px solid rgba(255,255,255,0.02); color: #f8fafc;">${item.name}</td>
                                    <td style="text-align: center; padding: 8px 4px; border-bottom: 1px solid rgba(255,255,255,0.02); color: #cbd5e1;">${item.qty}</td>
                                    <td style="text-align: right; padding: 8px 4px; border-bottom: 1px solid rgba(255,255,255,0.02); color: #cbd5e1;">${window.formatCurrency(item.price)}</td>
                                    <td style="text-align: right; padding: 8px 4px; border-bottom: 1px solid rgba(255,255,255,0.02); color: #f8fafc; font-weight: 600;">${window.formatCurrency(item.total)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </details>
            ` : ''}
        `;
    }).join('') || '<div class="empty-state">No sales history available.</div>';

    historyView.innerHTML = `
        <div class="card" style="height: calc(100vh - 120px); border-top: 4px solid var(--accent-blue);">
            <div class="flex-between mb-4" style="padding-bottom: 15px; border-bottom: 1px solid var(--border-color);">
                <h3 style="margin: 0; color: var(--text-primary); font-size: 1.3rem;">Complete Order History</h3>
                <span class="badge badge-success" style="font-size: 0.8rem; padding: 6px 14px;">Total Orders: ${sales.length}</span>
            </div>
            <div style="height: calc(100% - 60px); overflow-y: auto; padding-right: 15px;">
                ${historyHtml}
            </div>
        </div>
    `;
};

window.markInvoicePaid = async function(id) {
    await window.DB.updateSaleStatus(id, 'Paid');
    window.initHistory();
    if (window.refreshDashboard) window.refreshDashboard();
};

window.markInvoiceUnpaid = async function(id) {
    await window.DB.updateSaleStatus(id, 'Pending');
    window.initHistory();
    if (window.refreshDashboard) window.refreshDashboard();
};

window.deleteInvoice = async function(id) {
    if (!confirm("Are you sure you want to delete this invoice permanently?")) return;
    await window.DB.deleteSale(id);
    window.initHistory();
    if (window.refreshDashboard) window.refreshDashboard();
};

window.sharePastInvoicePDF = async (id) => {
    // 1. Fetch sales from DB to get the most accurate data
    const sales = await window.DB.getSales();
    const sale = sales.find(s => s.id == id);
    
    if (!sale || !sale.items) return alert("Invoice details not found!");

    // 2. The unified generator handles everything
    return await window.shareInvoiceWhatsApp(sale);
};

