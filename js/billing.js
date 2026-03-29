// ═══════════════════════════════════════════════════════════════════
//  BILLING MODULE  — with Airport / Town shop categories
// ═══════════════════════════════════════════════════════════════════

const menu = [
    { n: "Carrot cake piece", p: 10 }, { n: "Parippuvada", p: 7 }, { n: "Uzhunnuvada", p: 9 },
    { n: "Bonda", p: 7 }, { n: "Sabolavada", p: 7 }, { n: "Sugiyan", p: 9 },
    { n: "Ella Ada", p: 10 }, { n: "Chi. Burger", p: 35 }, { n: "Veg. Burger", p: 28 },
    { n: "Chi. Sandwich", p: 28 }, { n: "Veg. Sandwich", p: 20 }, { n: "Unnakai", p: 14 },
    { n: "Erachi Pathiri", p: 15 }, { n: "Malabar Roll", p: 20 }, { n: "Egg Puffs", p: 15 },
    { n: "Veg. Puffs", p: 11 }, { n: "Chicken Puffs", p: 18 }, { n: "Banana Puffs", p: 14 },
    { n: "Chi. Cutlet", p: 15 }, { n: "Veg. Cutlet", p: 12 }, { n: "Chi. Roll", p: 16 },
    { n: "Veg. Roll", p: 12 }, { n: "Thalassery Roll", p: 16 }, { n: "Chicken Samosa", p: 10 },
    { n: "Elanchi", p: 13 }, { n: "Kaipola (8 piece)", p: 180 }, { n: "Chatti Pathiri (8 piece)", p: 200 },
    { n: "Bun Maska", p: 20 }
];
menu.sort((a, b) => a.n.localeCompare(b.n));

const DEFAULT_AIRPORT_SHOPS = [
    'Domestic', 'International', '0484', 'Gallery',
    'Cargo', 'Casino', 'Saravanabhavan', 'Achayi', 'Cafe 24'
];

let currentItems = JSON.parse(localStorage.getItem('mj_billing_draft_items') || '[]');

function saveBillingDraft() {
    localStorage.setItem('mj_billing_draft_items', JSON.stringify(currentItems));
    const shopInput = document.getElementById('shop-name');
    if (shopInput) localStorage.setItem('mj_billing_draft_shop', shopInput.value);
}

function clearBillingDraft(skipModal = false) {
    currentItems = [];
    localStorage.removeItem('mj_billing_draft_items');
    localStorage.removeItem('mj_billing_draft_shop');
    const shopInput = document.getElementById('shop-name');
    if (shopInput) shopInput.value = '';
    const displayShop = document.getElementById('display-shop-name');
    if (displayShop) displayShop.textContent = 'None';
    
    // Dim the UI until new shop is picked
    const inner = document.getElementById('billing-container-inner');
    if (inner) {
        inner.style.opacity = '0.05';
        inner.style.pointerEvents = 'none';
    }
    
    renderBillingTable();
    if (!skipModal) window.showShopSelectionModal();
}

async function getShops() {
    return await window.DB.getShops();
}

// ── initBilling ─────────────────────────────────────────────────────────────
async function initBilling() {
    const shops = await getShops();
    const posGridHtml = menu.map((item, i) => `
        <button class="pos-item-btn" onclick="window.quickAddItem(${i})">
            <span class="item-name">${item.n}</span>
            <span class="item-price">${window.formatCurrency(item.p)}</span>
        </button>`).join('');

    const savedShop = localStorage.getItem('mj_billing_draft_shop') || '';

    document.getElementById('view-billing').innerHTML = `
        <!-- SELECTION MODAL -->
        <div id="shop-init-modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:2000;align-items:center;justify-content:center;backdrop-filter:blur(15px);">
            <div style="background:#1a2540; border:1px solid rgba(255,255,255,0.1); border-radius:30px; width:95%; max-width:850px; max-height:85vh; overflow:hidden; display:flex; flex-direction:column;">
                <div style="padding:30px; border-bottom:1.5px solid rgba(255,255,255,0.06);">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                        <h2 style="margin:0; font-size:1.8rem; color:#fff; display:flex; align-items:center; gap:12px;"><i data-lucide="map-pin" style="color:#3b82f6;"></i> Select Billing Destination</h2>
                    </div>
                    <div style="position:relative;">
                        <i data-lucide="search" style="position:absolute; left:16px; top:50%; transform:translateY(-50%); width:18px; color:#64748b;"></i>
                        <input type="text" id="route-shop-search" oninput="window.filterRouteShops(this.value)" placeholder="Search for a shop..." style="width:100%; padding:14px; border-radius:15px; border:1px solid rgba(255,255,255,0.08); background:rgba(0,0,0,0.3); color:white; font-size:1.05rem; padding-left:48px; outline:none;">
                    </div>
                </div>
                <div style="flex:1; overflow-y:auto; padding:30px; display:grid; grid-template-columns:1fr 1fr; gap:30px;">
                    <div><h3 style="margin-bottom:15px; color:#3b82f6; text-transform:uppercase; font-size:0.9rem;">Airport Route</h3><div id="route-airport-list" style="display:grid; gap:10px;"></div></div>
                    <div><h3 style="margin-bottom:15px; color:#10b981; text-transform:uppercase; font-size:0.9rem;">Town Route</h3><div id="route-town-list" style="display:grid; gap:10px;"></div></div>
                </div>
                <div style="padding:22px 30px; background:rgba(0,0,0,0.2); border-top:1px solid rgba(255,255,255,0.06); display:grid; grid-template-columns: 1.5fr 1fr 0.5fr; gap:15px;">
                    <input id="route-new-shop" placeholder="Shop Name..." style="padding:14px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); border-radius:12px; color:white;">
                    <input id="route-new-phone" type="tel" placeholder="Phone (e.g. 919876543210)" style="padding:14px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); border-radius:12px; color:white;">
                    <button onclick="window.confirmRouteManual()" style="background:#3b82f6; color:white; border:none; border-radius:12px; padding:0 20px; font-weight:700; cursor:pointer;">Select</button>
                </div>
            </div>
        </div>

        <!-- MAIN VIEW -->
        <div id="billing-container-inner" style="opacity:${savedShop ? 1 : 0.05}; pointer-events:${savedShop ? 'all' : 'none'}; transition:all 0.4s ease;">
            <div class="card mb-4" style="padding:15px 22px; border-top: 4px solid #3b82f6; border-radius:18px; display:flex; justify-content:space-between; align-items:center;">
                <div style="display:flex;align-items:center;gap:12px;">
                    <div style="background:rgba(59,130,246,0.1); padding:8px; border-radius:10px;"><i data-lucide="receipt" style="color:#3b82f6; width:20px;"></i></div>
                    <div>
                        <div style="font-size:0.7rem; color:#64748b; text-transform:uppercase; font-weight:800; letter-spacing:1px;">Generating Bill For</div>
                        <h3 id="display-shop-name" style="margin:0; font-size:1.2rem; color:#f1f5f9;">${savedShop || 'None'}</h3>
                    </div>
                </div>
                <div style="display:flex; gap:10px;">
                    <button onclick="clearBillingDraft()" style="background:rgba(255,255,255,0.05); color:#94a3b8; border:1px solid rgba(255,255,255,0.1); border-radius:10px; padding:10px 18px; font-size:0.8rem; font-weight:700; cursor:pointer;">New Bill</button>
                    <button onclick="window.showShopSelectionModal()" style="background:rgba(59,130,246,0.1); color:#3b82f6; border:1px solid rgba(59,130,246,0.2); border-radius:10px; padding:10px 18px; font-size:0.8rem; font-weight:700; cursor:pointer;">Switch Target</button>
                </div>
            </div>

            <div class="billing-main-grid">
                <div class="card" style="padding:22px; border-radius:24px;">
                    <input type="text" id="menu-search" oninput="window.filterMenu(this.value)" placeholder="🔍 Search menu catalogue..." style="width:100%;padding:14px;border-radius:12px;border:1px solid rgba(255,255,255,0.1);background:rgba(0,0,0,0.2);color:white;margin-bottom:20px;">
                    <div class="pos-grid" id="pos-grid-container">${posGridHtml}</div>
                </div>
                <div class="card" style="border-top:4px solid var(--accent-blue);padding:0; border-radius:24px; overflow:hidden;">
                    <div style="padding:22px; border-bottom:1px solid var(--border-color); display:flex; justify-content:space-between; align-items:center;">
                        <h3 style="margin:0; font-size:1.1rem; font-weight:900;">Invoice Items</h3>
                        <div id="item-count-badge" style="background:#3b82f6; color:white; padding:4px 10px; border-radius:15px; font-size:0.7rem; font-weight:800;">${currentItems.length} items</div>
                    </div>
                    <div id="bill-body-scroller" style="max-height:450px; overflow-y:auto;"><table style="width:100%;"><tbody id="bill-body"></tbody></table></div>
                    <div style="padding:22px;background:rgba(0,0,0,0.2); border-top:1px solid var(--border-color);">
                        <div class="flex-between mb-4">
                            <span style="color:#64748b; font-size:0.85rem; font-weight:800; text-transform:uppercase;">Grand Total</span>
                            <h2 style="margin:0; font-size:2.4rem; color:#10b981; font-weight:900;" id="grand-total">₹0.00</h2>
                        </div>
                        
                        <div style="display:flex; flex-direction:column; gap:12px;">
                            <button class="btn btn-warning" style="height:65px; width:100%; font-weight:900; font-size:1.25rem; border-radius:16px;" onclick="window.saveBill('Pending')">GENERATE & PRINT</button>
                            
                            <div style="position:relative; display:flex; gap:10px;">
                                <button onclick="window.prepareAndPrint()" class="btn btn-secondary" style="flex:1; height:48px; border-radius:12px; font-weight:700;"><i data-lucide="printer" style="width:16px;"></i></button>
                                <div style="position:relative; flex:2;">
                                    <button id="share-dropdown-btn" onclick="window.toggleShareMenu(event)" class="btn btn-primary" style="width:100%; height:48px; border-radius:12px; font-weight:800; display:flex; align-items:center; justify-content:center; gap:8px;">
                                        <i data-lucide="share-2" style="width:18px;"></i> Share
                                    </button>
                                    <div id="share-menu" style="display:none; position:absolute; bottom:60px; right:0; width:220px; background:#1a2540; border:1px solid rgba(255,255,255,0.1); border-radius:16px; z-index:100; box-shadow:0 10px 40px rgba(0,0,0,0.6); overflow:hidden;">
                                        <div onclick="window.shareWhatsAppWeb()" style="padding:15px; cursor:pointer; font-size:0.85rem; border-bottom:1px solid rgba(255,255,255,0.05); display:flex; align-items:center; gap:10px; background:rgba(37,211,102,0.08);">
                                            <i data-lucide="phone" style="width:16px; color:#25D366;"></i> <strong>WhatsApp Web</strong> (Direct)
                                        </div>
                                        <div onclick="window.sharePDF()" style="padding:15px; cursor:pointer; font-size:0.85rem; border-bottom:1px solid rgba(255,255,255,0.05); display:flex; align-items:center; gap:10px;">
                                            <i data-lucide="share" style="width:16px; color:#3b82f6;"></i> Native Device Share
                                        </div>
                                        <div onclick="window.sendWhatsApp('text')" style="padding:15px; cursor:pointer; font-size:0.85rem; border-bottom:1px solid rgba(255,255,255,0.05); display:flex; align-items:center; gap:10px;">
                                            <i data-lucide="message-circle" style="width:16px; color:#25D366;"></i> Send Quick Text
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <input type="hidden" id="shop-name" value="${savedShop}">
            <input type="hidden" id="shop-phone" value="${localStorage.getItem('mj_billing_draft_phone') || ''}">
        </div>
    `;

    renderBillingTable();
    if (!savedShop) window.showShopSelectionModal();
    if (window.lucide) window.lucide.createIcons();
}

window.showShopSelectionModal = async function() {
    const shops = await getShops();
    const modal = document.getElementById('shop-init-modal');
    if (!modal) return;
    modal.style.display = 'flex';
    document.getElementById('route-shop-search').value = '';
    window.renderRouteLists(shops);
};

window.renderRouteLists = function(shops) {
    const chipHtml = (n) => `<div class="route-chip" onclick="window.confirmInitialShop('${n.replace(/'/g,"\\'")}')" style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07); padding:16px; border-radius:15px; cursor:pointer; font-weight:600; display:flex; justify-content:space-between; align-items:center; color:#f1f5f9;"><span>${n}</span><i data-lucide="chevron-right" style="width:14px; opacity:0.3;"></i></div>`;
    document.getElementById('route-airport-list').innerHTML = (shops.airport || []).map(chipHtml).join('') || 'None.';
    document.getElementById('route-town-list').innerHTML = (shops.town || []).map(chipHtml).join('') || 'None.';
    if (window.lucide) window.lucide.createIcons();
};

window.filterRouteShops = function(q) {
    q = q.toLowerCase();
    document.querySelectorAll('.route-chip').forEach(c => {
        c.style.display = c.innerText.toLowerCase().includes(q) ? 'flex' : 'none';
    });
};

window.confirmInitialShop = function(name, phone = '') {
    const input = document.getElementById('shop-name');
    const phoneInput = document.getElementById('shop-phone');
    const inner = document.getElementById('billing-container-inner');
    const display = document.getElementById('display-shop-name');
    if (input) input.value = name;
    if (phoneInput) phoneInput.value = phone;
    if (display) display.textContent = name;
    if (inner) { inner.style.opacity = '1'; inner.style.pointerEvents = 'all'; }
    document.getElementById('shop-init-modal').style.display = 'none';
    localStorage.setItem('mj_billing_draft_shop', name);
    localStorage.setItem('mj_billing_draft_phone', phone);
};

window.confirmRouteManual = function() {
    const name = (document.getElementById('route-new-shop')?.value || '').trim();
    const phone = (document.getElementById('route-new-phone')?.value || '').trim();
    if (name) window.confirmInitialShop(name, phone);
};

// ── Core Functionality ───────────────────────────────────────────────────────
window.quickAddItem = (idx) => {
    const item = menu[idx];
    const existing = currentItems.find(i => i.name === item.n);
    if (existing) { existing.qty++; existing.total = existing.qty * existing.price; }
    else currentItems.push({ name: item.n, qty: 1, price: item.p, total: item.p });
    saveBillingDraft();
    renderBillingTable();
};

function renderBillingTable() {
    const body = document.getElementById('bill-body');
    if (!body) return;
    let grandTotal = 0;
    
    // Update badge count
    const badge = document.getElementById('item-count-badge');
    if (badge) badge.textContent = `${currentItems.length} items`;
    
    if (currentItems.length === 0) {
        body.innerHTML = '<tr><td style="padding:60px 20px; text-align:center; color:#64748b; font-style:italic;">No items in invoice.</td></tr>';
        document.getElementById('grand-total').textContent = '₹0.00'; return;
    }
    body.innerHTML = currentItems.map((item, index) => {
        grandTotal += item.total;
        return `<tr style="border-bottom: 1.5px solid rgba(255,255,255,0.03);"><td style="padding:18px 22px;"><div style="display:flex; justify-content:space-between; margin-bottom:8px;"><strong style="font-size:1.1rem; color:#fff;">${item.name}</strong><span style="font-weight:900; color:#fff;">${window.formatCurrency(item.total)}</span></div><div style="display:flex; align-items:center; gap:12px;"><span style="font-size:0.75rem; color:#64748b;">${window.formatCurrency(item.price)} each</span><div style="display:flex; align-items:center; gap:8px; background:rgba(255,255,255,0.05); border-radius:10px; padding:4px 10px;"><button onclick="window.updateItemQty(${index},-1)" style="background:none; border:none; color:#3b82f6; cursor:pointer; font-weight:900; font-size:1.2rem;">-</button><span style="font-size:0.9rem; min-width:20px; text-align:center; font-weight:900;">${item.qty}</span><button onclick="window.updateItemQty(${index},1)" style="background:none; border:none; color:#3b82f6; cursor:pointer; font-weight:900; font-size:1.2rem;">+</button></div></div></td></tr>`;
    }).join('');
    document.getElementById('grand-total').textContent = window.formatCurrency(grandTotal);
}

window.updateItemQty = (index, delta) => {
    currentItems[index].qty += delta;
    if (currentItems[index].qty <= 0) currentItems.splice(index, 1);
    else currentItems[index].total = currentItems[index].qty * currentItems[index].price;
    saveBillingDraft();
    renderBillingTable();
};

window.saveBill = async (status) => {
    const shop = document.getElementById('shop-name').value || 'Walk-in';
    const total = parseFloat(document.getElementById('grand-total').textContent.replace(/[₹,]/g, ''));
    if (!total) return;
    const sale = { shop, total, status, timestamp: Date.now(), items: currentItems };
    
    // SAVE TO MYSQL BACKEND
    await window.DB.addSale(sale);
    
    window.prepareAndPrint();
    
    // Clear and reset for next bill
    clearBillingDraft(); 
    
    if (window.refreshDashboard) window.refreshDashboard();
};

window.prepareAndPrint = () => {
    const shop = document.getElementById('shop-name')?.value || 'Walk-in';
    const grandTotal = document.getElementById('grand-total')?.textContent;
    if (currentItems.length === 0) return;
    const itemsHtml = currentItems.map(item => `<tr style="border-bottom:1px solid #eee;"><td style="padding:10px 0;">${item.name}</td><td style="text-align:center;">${item.qty}</td><td style="text-align:right;">${window.formatCurrency(item.price)}</td><td style="text-align:right;font-weight:bold;">${window.formatCurrency(item.total)}</td></tr>`).join('');
    document.getElementById('print-receipt').innerHTML = receiptHTML(shop, grandTotal, itemsHtml);
    setTimeout(() => window.print(), 100);
};

window.sendWhatsApp = (type) => {
    const shop = document.getElementById('shop-name')?.value || 'Customer';
    const total = document.getElementById('grand-total').textContent;
    const phone = document.getElementById('shop-phone')?.value || '';
    if (currentItems.length === 0) return;
    
    if (type === 'text') {
        let text = `*MJ FOODS BILL*\nCustomer: ${shop}\nTotal: ${total}\n\n`;
        currentItems.forEach(i => { text += `• ${i.name} (${i.qty}) -> ${window.formatCurrency(i.total)}\n`; });
        const waUrl = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(text)}` : `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
        window.open(waUrl, '_blank');
    }
    document.getElementById('share-menu').style.display = 'none';
};

window.shareViaEmail = () => {
    const shop = document.getElementById('shop-name').value || 'Customer';
    const total = document.getElementById('grand-total').textContent;
    const body = `Invoice for ${shop}\nTotal amount: ${total}`;
    window.open(`mailto:?subject=MJ Foods Invoice&body=${encodeURIComponent(body)}`);
    document.getElementById('share-menu').style.display = 'none';
};

window.sharePDF = async () => {
    const shop = document.getElementById('shop-name')?.value || 'Walk-in';
    const grandTotal = document.getElementById('grand-total')?.textContent;
    if (currentItems.length === 0) return;
    
    // Build receipt HTML for PDF extraction
    const itemsHtml = currentItems.map(item => `
        <tr style="border-bottom:1px solid #eee;">
            <td style="padding:10px 0;">${item.name}</td>
            <td style="padding:10px 0;text-align:center;">${item.qty}</td>
            <td style="padding:10px 0;text-align:right;">${window.formatCurrency(item.price)}</td>
            <td style="padding:10px 0;text-align:right;font-weight:bold;">${window.formatCurrency(item.total)}</td>
        </tr>`).join('');
    
    const receiptDiv = document.getElementById('print-receipt');
    receiptDiv.innerHTML = receiptHTML(shop, grandTotal, itemsHtml);
    
    // Ensure styles are applied before capture
    const opt = { 
        margin: [0.5, 0.5], 
        filename: `Invoice_${shop.replace(/[^a-z0-9]/gi, '_')}.pdf`, 
        image: { type:'jpeg', quality:1 }, 
        html2canvas: { scale: 3, useCORS: true, logging: false, letterRendering: true, windowWidth: 800 }, 
        jsPDF: { unit:'in', format:'a4', orientation:'portrait' } 
    };

    try {
        // Use a slight delay to ensure browser paiting
        await new Promise(r => setTimeout(r, 100));
        const pdfBlob = await html2pdf().set(opt).from(receiptDiv).output('blob');
        const file = new File([pdfBlob], opt.filename, { type: 'application/pdf' });
        
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
                title: 'MJ Foods Invoice',
                text: `Invoice for ${shop}`,
                files: [file]
            });
        } else {
            html2pdf().set(opt).from(receiptDiv).save();
            alert("Direct sharing not supported. Downloaded instead!");
        }
    } catch (e) { console.error("PDF Generate Error", e); }
    document.getElementById('share-menu').style.display = 'none';
};

function receiptHTML(shop, grandTotal, itemsHtml) {
    return `
    <div style="font-family:'Segoe UI',Roboto,Arial,sans-serif; padding:40px; max-width:700px; margin:0 auto; color:#000; background:#fff; line-height: 1.4;">
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
            <div><p style="margin:0; font-size:0.8rem; color:#666; text-transform:uppercase; font-weight:bold;">Billed To:</p><h3 style="margin:3px 0; font-size:1.3rem;">${shop}</h3></div>
            <div style="text-align:right;"><p style="margin:0; font-size:0.8rem; color:#666; text-transform:uppercase; font-weight:bold;">Invoice Details:</p><p style="margin:3px 0; font-weight:bold;">Date: ${new Date().toLocaleDateString('en-IN')}</p></div>
        </div>
        <table style="width:100%; border-collapse:collapse; margin-bottom:30px;">
            <thead><tr style="border-bottom:2px solid #000; border-top:2px solid #000;"><th align="left">Description</th><th align="center">Qty</th><th align="right">Amount</th></tr></thead>
            <tbody>${itemsHtml}</tbody>
        </table>
        <div style="display:flex; justify-content:flex-end;"><div style="width:250px;"><div style="display:flex; justify-content:space-between; padding:15px 0; border-bottom:3px double #000;"><span style="font-size:1.2rem; font-weight:900;">GRAND TOTAL:</span><span style="font-size:1.2rem; font-weight:900;">${grandTotal}</span></div></div></div>
        <div style="margin-top:50px; text-align:center; border-top:1px dashed #ccc; padding-top:20px;"><p style="margin:0; font-weight:bold; font-size:1rem;">THANK YOU FOR YOUR BUSINESS!</p></div>
    </div>`;
}

window.filterMenu = (q) => {
    q = q.toLowerCase();
    document.querySelectorAll('#pos-grid-container .pos-item-btn').forEach(b => {
        b.style.display = b.querySelector('.item-name').innerText.toLowerCase().includes(q) ? 'flex' : 'none';
    });
};

window.shareWhatsAppWeb = async () => {
    const shop = document.getElementById('shop-name')?.value || 'Client';
    const total = document.getElementById('grand-total').textContent;
    const phone = document.getElementById('shop-phone')?.value || '';
    if (currentItems.length === 0) return;

    // 1. Generate & Auto-Download PDF
    const itemsHtml = currentItems.map(item => `<tr style="border-bottom:1px solid #eee;"><td style="padding:10px 0;">${item.name}</td><td style="text-align:center;">${item.qty}</td><td style="text-align:right;">${window.formatCurrency(item.price)}</td><td style="text-align:right;font-weight:bold;">${window.formatCurrency(item.total)}</td></tr>`).join('');
    const receiptDiv = document.getElementById('print-receipt');
    receiptDiv.innerHTML = receiptHTML(shop, total, itemsHtml);
    
    const opt = { 
        margin: 0.5, 
        filename: `Invoice_${shop.replace(/ /g,'_')}.pdf`, 
        html2canvas: { scale:2 }, 
        jsPDF: { unit:'in', format:'a4' } 
    };

    try {
        await html2pdf().set(opt).from(receiptDiv).save();
        
        // 2. Open WhatsApp Web to that contact
        const text = `Hi ${shop}, here is your MJ Foods invoice for ${total}. I have attached the PDF version.`;
        const waUrl = phone ? `https://web.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(text)}` : `https://web.whatsapp.com/send?text=${encodeURIComponent(text)}`;
        
        setTimeout(() => {
            window.open(waUrl, '_blank');
            alert(`✅ Invoice Downloaded Successfully!\n\nI have opened WhatsApp for you. Now just DRAG the "Invoice_${shop}.pdf" file into the chat.`);
        }, 1000);
    } catch (e) {
        console.error("WhatsApp Web Share Failed", e);
    }
    document.getElementById('share-menu').style.display = 'none';
};

window.toggleShareMenu = (e) => {
    e.stopPropagation();
    const menu = document.getElementById('share-menu');
    menu.style.display = menu.style.display === 'flex' || menu.style.display === 'block' ? 'none' : 'block';
};

window.initBilling = initBilling;
document.addEventListener('DOMContentLoaded', initBilling);
