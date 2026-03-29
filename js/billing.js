const menu = [
    { n: 'Banana Puffs', p: 14.00, c: 'Bakery' },
    { n: 'Bonda', p: 7.00, c: 'Bakery' },
    { n: 'Bun Maska', p: 20.00, c: 'Bakery' },
    { n: 'Carrot cake piece', p: 10.00, c: 'Bakery' },
    { n: 'Chatti Pathiri (8 piece)', p: 200.00, c: 'Main Order' },
    { n: 'Chi. Burger', p: 35.00, c: 'Bakery' },
    { n: 'Chi. Cutlet', p: 15.00, c: 'Bakery' },
    { n: 'Chicken puff', p: 18.00, c: 'Bakery' },
    { n: 'Egg puff', p: 15.00, c: 'Bakery' },
    { n: 'Parippu vada', p: 7.00, c: 'Bakery' },
    { n: 'Samosa', p: 10.00, c: 'Bakery' },
    { n: 'Uzhunnu vada', p: 10.00, c: 'Bakery' },
    { n: 'Vada piece', p: 10.00, c: 'Bakery' }
];

const DEFAULT_AIRPORT_SHOPS = ['Airways 1', 'Coffee Day Airport', 'Domestic Terminal A', 'International Gate 4'];

let currentItems = [];

// ── initBilling ─────────────────────────────────────────────────────────────
async function initBilling() {
    const savedShop = localStorage.getItem('mj_billing_draft_shop') || '';
    
    // POS Menu Grid Builder
    const posGridHtml = menu.map((item, i) => `
        <button class="pos-item-btn" onclick="window.quickAddItem(${i})" style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); padding:18px; border-radius:18px; text-align:center; transition:all 0.2s; cursor:pointer;">
            <div style="font-weight:700; color:#fff; margin-bottom:8px; font-size:1rem;">${item.n}</div>
            <div style="font-size:0.8rem; background:rgba(16,185,129,0.1); color:#10b981; display:inline-block; padding:3px 10px; border-radius:10px; font-weight:800;">₹${item.p.toFixed(2)}</div>
        </button>`).join('');

    document.getElementById('view-billing').innerHTML = `
        <!-- SELECTION MODAL -->
        <div id="shop-init-modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.9);z-index:2000;align-items:flex-start;justify-content:center;padding:50px 20px;backdrop-filter:blur(20px);">
            <div class="card" style="width:100%;max-width:850px;max-height:85vh;overflow:hidden;display:flex;flex-direction:column;border:1px solid rgba(255,255,255,0.1);box-shadow:0 30px 80px rgba(0,0,0,0.8);background:#0f172a; border-radius:30px;">
                <div style="padding:40px; border-bottom:1.5px solid rgba(255,255,255,0.06);">
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
                    <input id="route-new-phone" type="tel" placeholder="Phone..." style="padding:14px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); border-radius:12px; color:white;">
                    <button onclick="window.confirmRouteManual()" style="background:#3b82f6; color:white; border:none; border-radius:12px; padding:0 20px; font-weight:700; cursor:pointer;">Select</button>
                </div>
            </div>
        </div>

        <!-- MAIN VIEW -->
        <div id="billing-container-inner" style="transition:all 0.4s ease;">
            <div class="card mb-4" style="padding:15px 22px; border-top: 4px solid #3b82f6; border-radius:18px; display:flex; justify-content:space-between; align-items:center; background: rgba(59, 130, 246, 0.05);">
                <div style="display:flex;align-items:center;gap:12px;">
                    <div style="background:rgba(59,130,246,0.1); padding:8px; border-radius:10px;"><i data-lucide="receipt" style="color:#3b82f6; width:20px;"></i></div>
                    <div>
                        <div style="font-size:0.7rem; color:#64748b; text-transform:uppercase; font-weight:800; letter-spacing:1px;">Generating Bill For</div>
                        <h3 id="display-shop-name" style="margin:0; font-size:1.2rem; color:#f1f5f9; text-shadow: 0 0 10px rgba(59,130,246,0.3);">${savedShop || 'No Shop Selected'}</h3>
                    </div>
                </div>
                <div style="display:flex; gap:10px;">
                    <button onclick="clearBillingDraft()" style="background:rgba(255,255,255,0.05); color:#94a3b8; border:1px solid rgba(255,255,255,0.1); border-radius:10px; padding:10px 18px; font-size:0.8rem; font-weight:700; cursor:pointer;">New Bill</button>
                    <button onclick="window.showShopSelectionModal()" style="background:rgba(59,130,246,0.1); color:#3b82f6; border:1px solid rgba(59,130,246,0.2); border-radius:10px; padding:10px 18px; font-size:0.8rem; font-weight:700; cursor:pointer;">Switch Target</button>
                </div>
            </div>

            <div style="display:grid; grid-template-columns: 2fr 1fr; gap:25px; min-height:0;" class="pos-main-grid">
                <!-- CATALOG -->
                <div class="card" style="display:flex; flex-direction:column; padding:24px; border-radius:24px;">
                    <div style="position:relative; margin-bottom:20px;">
                         <i data-lucide="search" style="position:absolute; left:16px; top:50%; transform:translateY(-50%); width:18px; color:#64748b;"></i>
                         <input type="text" id="pos-search" oninput="window.filterPOS(this.value)" placeholder="Search menu catalogue..." style="width:100%; padding:14px; border-radius:15px; border:1px solid rgba(255,255,255,0.08); background:rgba(0,0,0,0.2); color:white; font-size:1rem; padding-left:48px; outline:none;">
                    </div>
                    <div id="pos-items-grid" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(160px, 1fr)); gap:15px; overflow-y:auto; padding:5px;">
                        ${posGridHtml}
                    </div>
                </div>

                <!-- CART -->
                <div class="card" style="display:flex; flex-direction:column; padding:0; border-radius:24px; overflow:hidden; border-top: 4px solid #10b981;">
                    <div style="padding:22px; border-bottom:1px solid rgba(255,255,255,0.05); display:flex; justify-content:space-between; align-items:center;">
                        <h3 style="margin:0; font-size:1.1rem; font-weight:800;">Invoice Items</h3>
                        <span id="item-count-badge" class="badge" style="background:#3b82f6;">0 items</span>
                    </div>
                    
                    <div id="current-invoice-list" style="flex:1; overflow-y:auto; padding:20px;">
                        <div style="text-align:center; padding:40px; color:#64748b; font-style:italic;">No items added yet.</div>
                    </div>

                    <div style="padding:24px; background:rgba(0,0,0,0.2); border-top:1px solid rgba(255,255,255,0.06);">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:25px;">
                            <span style="color:#64748b; font-weight:800; text-transform:uppercase; font-size:0.75rem;">Grand Total</span>
                            <span id="grand-total" style="font-size:2rem; font-weight:900; color:#10b981; letter-spacing:-1px;">₹0.00</span>
                        </div>

                        <button class="btn btn-primary" onclick="window.saveBill()" style="width:100%; height:55px; font-weight:900; font-size:1.15rem; margin-bottom:12px; border-radius:16px; box-shadow:0 10px 30px rgba(59,130,246,0.2);">GENERATE & PRINT</button>
                        
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                            <button class="btn btn-secondary" style="height:48px; border-radius:12px; border-color:rgba(255,255,255,0.1);" onclick="window.window.print()"><i data-lucide="printer"></i></button>
                            <button class="btn btn-secondary" style="height:48px; border-radius:12px; border-color:rgba(59,130,246,0.2); color:#3b82f6;" onclick="window.sharePDF()"><i data-lucide="share-2"></i> Share</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Hidden Receipt Buffer (Off-screen) -->
        <div id="print-receipt" style="position:fixed; left:-5000px; padding:40px; background:white; color:black; font-family:sans-serif; width:800px;"></div>
        
        <input type="hidden" id="shop-name" value="${savedShop}">
    `;

    renderBillingTable();
    if (!savedShop) window.showShopSelectionModal();
    
    // Background shop load
    getShops().then(shops => {
        window.renderRouteLists(shops);
    });

    if (window.lucide) window.lucide.createIcons();
}

window.showShopSelectionModal = async function() {
    const shops = await getShops();
    const modal = document.getElementById('shop-init-modal');
    if (!modal) return;
    
    if (!shops.airport || shops.airport.length === 0) shops.airport = DEFAULT_AIRPORT_SHOPS;
    if (!shops.town || shops.town.length === 0) shops.town = ['Regular Town', 'Downtown Outlet'];

    modal.style.display = 'flex';
    const search = document.getElementById('route-shop-search');
    if (search) search.value = '';
    window.renderRouteLists(shops);
};

window.renderRouteLists = function(shops) {
    const chipHtml = (n) => `<button class="route-chip" onclick="window.confirmInitialShop('${n.replace(/'/g,"\\'")}')" style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); padding:16px; border-radius:15px; cursor:pointer; font-weight:600; text-align:left; color:#f1f5f9; transition:all 0.2s; display:flex; justify-content:space-between; align-items:center; width:100%;"><span>${n}</span><i data-lucide="chevron-right" style="width:14px; opacity:0.3;"></i></button>`;
    const r1 = document.getElementById('route-airport-list');
    const r2 = document.getElementById('route-town-list');
    if (r1) r1.innerHTML = (shops.airport || []).map(chipHtml).join('') || '<div style="color:#64748b;">None</div>';
    if (r2) r2.innerHTML = (shops.town || []).map(chipHtml).join('') || '<div style="color:#64748b;">None</div>';
    if (window.lucide) window.lucide.createIcons();
};

window.confirmInitialShop = function(name) {
    localStorage.setItem('mj_billing_draft_shop', name);
    const input = document.getElementById('shop-name');
    const display = document.getElementById('display-shop-name');
    if (input) input.value = name;
    if (display) display.textContent = name;
    document.getElementById('shop-init-modal').style.display = 'none';
};

window.confirmRouteManual = function() {
    const name = document.getElementById('route-new-shop').value;
    const phone = document.getElementById('route-new-phone').value;
    if (!name) return alert("Please enter shop name");
    localStorage.setItem('mj_billing_draft_shop', name);
    localStorage.setItem('mj_billing_draft_phone', phone);
    window.confirmInitialShop(name);
};

window.filterRouteShops = function(q) {
    q = q.toLowerCase();
    document.querySelectorAll('.route-chip').forEach(c => {
        c.style.display = c.innerText.toLowerCase().includes(q) ? 'flex' : 'none';
    });
};

window.filterPOS = function(q) {
    q = q.toLowerCase();
    document.querySelectorAll('.pos-item-btn').forEach(btn => {
        const name = btn.querySelector('div').innerText.toLowerCase();
        btn.style.display = name.includes(q) ? 'block' : 'none';
    });
};

window.quickAddItem = (idx) => {
    const item = menu[idx];
    const existing = currentItems.find(i => i.name === item.n);
    if (existing) {
        existing.qty++;
        existing.total = existing.qty * existing.price;
    } else {
        currentItems.push({ name: item.n, price: item.p, qty: 1, total: item.p });
    }
    renderBillingTable();
};

function renderBillingTable() {
    const list = document.getElementById('current-invoice-list');
    const totalEl = document.getElementById('grand-total');
    const badge = document.getElementById('item-count-badge');
    if (!list) return;

    if (currentItems.length === 0) {
        list.innerHTML = '<div style="text-align:center; padding:40px; color:#64748b; font-style:italic;">No items added yet.</div>';
        totalEl.textContent = '₹0.00';
        badge.textContent = '0 items';
        return;
    }

    let grandTotal = 0;
    list.innerHTML = currentItems.map((item, idx) => {
        grandTotal += item.total;
        return `
            <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); padding:15px; border-radius:15px; margin-bottom:12px;">
                <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:10px;">
                    <div style="font-weight:700; color:#fff; font-size:1rem;">${item.name}</div>
                    <div style="font-weight:800; color:#10b981;">₹${item.total.toFixed(2)}</div>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div style="font-size:0.75rem; color:#64748b;">₹${item.price.toFixed(2)} each</div>
                    <div style="display:flex; align-items:center; gap:12px; background:rgba(0,0,0,0.2); padding:5px 12px; border-radius:10px;">
                        <button onclick="updateQty(${idx}, -1)" style="background:none; border:none; color:white; font-size:1.2rem; cursor:pointer; width:20px;">-</button>
                        <span style="font-size:0.9rem; font-weight:800; color:#3b82f6; min-width:20px; text-align:center;">${item.qty}</span>
                        <button onclick="updateQty(${idx}, 1)" style="background:none; border:none; color:white; font-size:1.2rem; cursor:pointer; width:20px;">+</button>
                    </div>
                </div>
            </div>`;
    }).join('');

    totalEl.textContent = window.formatCurrency(grandTotal);
    badge.textContent = `${currentItems.length} items`;
    if (window.lucide) window.lucide.createIcons();
}

window.updateQty = (idx, delta) => {
    currentItems[idx].qty += delta;
    if (currentItems[idx].qty <= 0) {
        currentItems.splice(idx, 1);
    } else {
        currentItems[idx].total = currentItems[idx].qty * currentItems[idx].price;
    }
    renderBillingTable();
};

window.saveBill = async () => {
    const shop = document.getElementById('shop-name')?.value || 'Walk-in';
    const total = parseFloat(document.getElementById('grand-total')?.textContent.replace(/₹|,/g,'') || 0);
    if (currentItems.length === 0) return alert("Add items first!");
    
    const sale = { shop, total, status: 'Pending', timestamp: Date.now(), items: currentItems };
    
    try {
        await window.DB.saveSale(sale);
        window.sharePDF(); // Generate PDF automatically
        alert("✅ Sale saved to cloud!");
        clearBillingDraft();
    } catch (e) {
        console.error("Save Error", e);
        window.sharePDF(); // Still allow PDF even if DB is offline
    }
};

function clearBillingDraft() {
    currentItems = [];
    localStorage.removeItem('mj_billing_draft_shop');
    localStorage.removeItem('mj_billing_draft_phone');
    initBilling();
}

window.sharePDF = async () => {
    const shop = document.getElementById('shop-name')?.value || 'Customer';
    const grandTotal = document.getElementById('grand-total')?.textContent;
    if (currentItems.length === 0) return;
    
    const itemsHtml = currentItems.map(item => `
        <tr style="border-bottom:1px solid #eee;">
            <td style="padding:15px 0; font-size:14px;">${item.name}</td>
            <td style="padding:15px 0; text-align:center; font-size:14px;">${item.qty}</td>
            <td style="padding:15px 0; text-align:right; font-size:14px;">${window.formatCurrency(item.price)}</td>
            <td style="padding:15px 0; text-align:right; font-weight:bold; font-size:14px;">${window.formatCurrency(item.total)}</td>
        </tr>`).join('');
    
    const receiptDiv = document.getElementById('print-receipt');
    receiptDiv.innerHTML = `
        <div style="background:white; color:black; padding:40px; border: 1px solid #ddd;">
            <div style="text-align:center; margin-bottom:30px;">
                <h1 style="margin:0; font-size:28px;">MJ FOODS</h1>
                <p style="margin:5px 0; color:#666;">Bakery & Sweets | KOTTARAKKARA</p>
                <div style="margin:20px 0; height:2px; background:#333;"></div>
            </div>
            
            <div style="display:flex; justify-content:space-between; margin-bottom:30px;">
                <div>
                    <div style="color:#888; text-transform:uppercase; font-size:10px; font-weight:bold;">Customer</div>
                    <div style="font-size:18px; font-weight:bold;">${shop}</div>
                </div>
                <div style="text-align:right;">
                    <div style="color:#888; text-transform:uppercase; font-size:10px; font-weight:bold;">Date</div>
                    <div>${new Date().toLocaleDateString()}</div>
                </div>
            </div>
            
            <table style="width:100%; border-collapse:collapse; margin-bottom:40px;">
                <thead>
                    <tr style="border-bottom:2px solid #333; text-align:left;">
                        <th style="padding-bottom:10px; font-size:12px;">ITEM</th>
                        <th style="padding-bottom:10px; text-align:center; font-size:12px;">QTY</th>
                        <th style="padding-bottom:10px; text-align:right; font-size:12px;">PRICE</th>
                        <th style="padding-bottom:10px; text-align:right; font-size:12px;">TOTAL</th>
                    </tr>
                </thead>
                <tbody>${itemsHtml}</tbody>
            </table>
            
            <div style="display:flex; justify-content:flex-end;">
                <div style="width:200px;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                        <span>Grand Total:</span>
                        <span style="font-size:22px; font-weight:900;">${grandTotal}</span>
                    </div>
                </div>
            </div>
            
            <div style="margin-top:60px; text-align:center; color:#888; font-size:12px; border-top:1px solid #eee; padding-top:20px;">
                Thank you for your business! <br> MJ Foods Enterprises
            </div>
        </div>`;
    
    const opt = { 
        margin: [0.3, 0.3], 
        filename: `Invoice_${shop.replace(/ /g,'_')}.pdf`, 
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { scale: 3, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    try {
        await html2pdf().set(opt).from(receiptDiv).save();
        alert("✅ PDF Generated!");
    } catch (e) { 
        console.error(e); 
        alert("⚠️ PDF Error. Try Browser Print.");
    }
};
