// History View Module
window.initHistory = async function() {
    const historyView = document.getElementById('view-history');
    if (!historyView) return;
    
    // FETCH FROM MYSQL
    const sales = await window.DB.getSales();

    // Shallow copy and reverse to show newest first
    const sortedSales = [...sales].reverse();

    const historyHtml = sortedSales.map(s => `
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
        </div>
    `).join('') || '<div class="empty-state">No sales history available.</div>';

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
    const sales = JSON.parse(localStorage.getItem('mj_sales') || '[]');
    const sale = sales.find(s => s.id == id);
    if (!sale || !sale.items) return alert("Invoice details not found!");
    
    const shop = sale.shop_name || "Walk-in Customer";
    const grandTotal = window.formatCurrency(sale.total_amount);
    const saleDate = new Date(sale.timestamp || Date.now());
    
    let itemsHtml = sale.items.map(item => `
        <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px 0; font-size: 0.95rem;">${item.name}</td>
            <td style="padding: 10px 0; text-align: center; font-size: 0.95rem;">${item.qty}</td>
            <td style="padding: 10px 0; text-align: right; font-size: 0.95rem;">${window.formatCurrency(item.price)}</td>
            <td style="padding: 10px 0; text-align: right; font-weight: bold; font-size: 0.95rem;">${window.formatCurrency(item.total)}</td>
        </tr>
    `).join('');

    const receiptDiv = document.getElementById('print-receipt');
    receiptDiv.innerHTML = `<div style="font-family:'Segoe UI',Roboto,Arial,sans-serif; padding:40px; max-width:700px; margin:0 auto; color:#000; background:#fff; line-height: 1.4;">
        <div style="text-align:center; border-bottom:2px solid #000; padding-bottom:20px; margin-bottom:25px;">
            <div style="display:flex; align-items:center; justify-content:center; gap:20px; margin-bottom:10px;">
                <img src="assets/logo.jpeg" style="width:80px; height:80px; border-radius:10px; object-fit:cover;" onerror="this.style.display='none';">
                <div style="text-align:left;">
                    <h1 style="margin:0; font-size:2.2rem; font-weight:900; color:#000; letter-spacing:-1px;">MJ FOODS ENTERPRISES</h1>
                    <p style="margin:2px 0; font-size:0.9rem; font-weight:600; color:#444;">19/241 Kavaraparambu, Airport Road, Angamaly-683572</p>
                    <p style="margin:2px 0; font-size:0.85rem; color:#666;">FSSAI: 21323180000729 | Ph: +91 9495691397</p>
                </div>
            </div>
        </div>
        
        <div style="display:flex; justify-content:space-between; margin-bottom:30px;">
            <div>
                <p style="margin:0; font-size:0.8rem; color:#666; text-transform:uppercase; font-weight:bold;">Billed To:</p>
                <h3 style="margin:3px 0; font-size:1.3rem;">${shop}</h3>
            </div>
            <div style="text-align:right;">
                <p style="margin:0; font-size:0.8rem; color:#666; text-transform:uppercase; font-weight:bold;">Invoice Details:</p>
                <p style="margin:3px 0; font-weight:bold;">Date: ${saleDate.toLocaleDateString('en-IN')}</p>
                <p style="margin:0; font-size:0.9rem; color:#444;">Time: ${saleDate.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}</p>
            </div>
        </div>

        <table style="width:100%; border-collapse:collapse; margin-bottom:30px;">
            <thead>
                <tr style="border-bottom:2px solid #000; border-top:2px solid #000;">
                    <th style="padding:12px 5px; text-align:left; font-size:0.85rem; text-transform:uppercase;">Description</th>
                    <th style="padding:12px 5px; text-align:center; font-size:0.85rem; text-transform:uppercase;">Qty</th>
                    <th style="padding:12px 5px; text-align:right; font-size:0.85rem; text-transform:uppercase;">Rate</th>
                    <th style="padding:12px 5px; text-align:right; font-size:0.85rem; text-transform:uppercase;">Amount</th>
                </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
        </table>

        <div style="display:flex; justify-content:flex-end;">
            <div style="width:250px;">
                <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #ddd;">
                    <span style="font-weight:bold;">Total Amount:</span>
                    <span style="font-weight:bold;">${grandTotal}</span>
                </div>
                <div style="display:flex; justify-content:space-between; padding:15px 0; margin-top:5px; border-bottom:3px double #000;">
                    <span style="font-size:1.2rem; font-weight:900;">GRAND TOTAL:</span>
                    <span style="font-size:1.2rem; font-weight:900;">${grandTotal}</span>
                </div>
            </div>
        </div>

        <div style="margin-top:50px; text-align:center; border-top:1px dashed #ccc; padding-top:20px;">
            <p style="margin:0; font-weight:bold; font-size:1rem;">THANK YOU FOR YOUR BUSINESS!</p>
            <p style="margin:5px 0 0; font-size:0.85rem; color:#666;">MJ Foods — Quality & Trust</p>
        </div>
    </div>`;

    const originalDisplay = receiptDiv.style.display;
    const originalPos = receiptDiv.style.position;
    const originalLeft = receiptDiv.style.left;
    const originalTop = receiptDiv.style.top;
    
    receiptDiv.style.display = 'block';
    receiptDiv.style.position = 'absolute';
    receiptDiv.style.left = '-9999px';
    receiptDiv.style.top = '-9999px';

    const opt = {
        margin:       [0.5, 0.5],
        filename:     `Invoice_${shop.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 3, useCORS: true, letterRendering: true },
        jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    try {
        const pdfBlob = await html2pdf().set(opt).from(receiptDiv).output('blob');
        
        receiptDiv.style.display = originalDisplay;
        receiptDiv.style.position = originalPos;
        receiptDiv.style.left = originalLeft;
        receiptDiv.style.top = originalTop;

        const file = new File([pdfBlob], opt.filename, { type: 'application/pdf' });
        
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
                title: 'Invoice from MJ Foods',
                text: 'Here is your invoice from MJ Foods.',
                files: [file]
            });
        } else {
            console.log("Direct share not supported, saving.");
            html2pdf().set(opt).from(receiptDiv).save();
        }
    } catch (err) {
        console.error('Error sharing past PDF:', err);
        receiptDiv.style.display = originalDisplay;
        receiptDiv.style.position = originalPos;
        receiptDiv.style.left = originalLeft;
        receiptDiv.style.top = originalTop;
    }
};
