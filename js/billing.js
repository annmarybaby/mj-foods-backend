// MENU FROM UPDATED PRICE LIST PDF
const fallbackMenu = [
    { name: 'Carrot cake piece', price: 10.0, category: 'Bakery' },
    { name: 'Parippuvada', price: 7.0, category: 'Bakery' },
    { name: 'Uzhunnuvada', price: 9.0, category: 'Bakery' },
    { name: 'Bonda', price: 7.0, category: 'Bakery' },
    { name: 'Sabolavada', price: 7.0, category: 'Bakery' },
    { name: 'Sugiyan', price: 9.0, category: 'Bakery' },
    { name: 'Ella Ada', price: 10.0, category: 'Bakery' },
    { name: 'Chi. Burger', price: 35.0, category: 'Bakery' },
    { name: 'Veg. Burger', price: 28.0, category: 'Bakery' },
    { name: 'Chi. Sandwich', price: 28.0, category: 'Bakery' },
    { name: 'Veg. Sandwich', price: 20.0, category: 'Bakery' },
    { name: 'Unnakai', price: 14.0, category: 'Bakery' },
    { name: 'Erachi Pathiri', price: 15.0, category: 'Bakery' },
    { name: 'Malabar Roll', price: 20.0, category: 'Bakery' },
    { name: 'Egg Puffs', price: 15.0, category: 'Bakery' },
    { name: 'Veg. Puffs', price: 11.0, category: 'Bakery' },
    { name: 'Chicken Puffs', price: 18.0, category: 'Bakery' },
    { name: 'Banana Puffs', price: 14.0, category: 'Bakery' },
    { name: 'Chi. Cutlet', price: 15.0, category: 'Bakery' },
    { name: 'Veg. Cutlet', price: 12.0, category: 'Bakery' },
    { name: 'Chi. Roll', price: 16.0, category: 'Bakery' },
    { name: 'Veg. Roll', price: 12.0, category: 'Bakery' },
    { name: 'Thalassery Roll', price: 16.0, category: 'Bakery' },
    { name: 'Chicken Samosa', price: 10.0, category: 'Bakery' },
    { name: 'Elanchi', price: 13.0, category: 'Bakery' },
    { name: 'Kaipola (8 piece)', price: 180.0, category: 'Main Order' },
    { name: 'Chatti Pathiri (8 piece)', price: 200.0, category: 'Main Order' },
    { name: 'Bun Maska', price: 20.0, category: 'Bakery' }
];

let dbProducts = []; 
let currentItems = [];
let billingShopList = [];
let activeProductFilter = 'all';
let lastSavedSale = null;
let editingProductId = null;
const SHOP_STORAGE_KEY = 'mj_custom_shops';
const SHOP_DELETED_KEY = 'mj_deleted_shop_names';
const DEFAULT_BILLING_SHOPS = [
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
const DEFAULT_BILLING_SHOP_NAMES = new Set(DEFAULT_BILLING_SHOPS.map(shop => shop.name.toLowerCase()));

function normalizeProduct(product) {
    return {
        name: (product?.name || '').trim(),
        price: parseFloat(product?.price || 0),
        category: product?.category || 'Bakery'
    };
}

function readLocalJson(key, fallback) {
    try {
        return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
    } catch (e) {
        return fallback;
    }
}

function writeLocalJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function getCustomShops() {
    return readLocalJson(SHOP_STORAGE_KEY, []);
}

function setCustomShops(shops) {
    writeLocalJson(SHOP_STORAGE_KEY, shops);
}

function getDeletedShopNames() {
    return readLocalJson(SHOP_DELETED_KEY, []);
}

function setDeletedShopNames(names) {
    writeLocalJson(SHOP_DELETED_KEY, names);
}

function buildVisibleShopList(rawShops) {
    const deleted = new Set(getDeletedShopNames().map(name => name.toLowerCase()));
    const remoteList = Array.isArray(rawShops) ? rawShops : [];
    const remoteMap = new Map(remoteList.map(shop => [String(shop.name || '').toLowerCase(), shop]));

    const baseShops = DEFAULT_BILLING_SHOPS
        .map(shop => remoteMap.get(shop.name.toLowerCase()) ? { ...shop, ...remoteMap.get(shop.name.toLowerCase()) } : { ...shop })
        .filter(shop => !deleted.has(shop.name.toLowerCase()));

    const customShops = getCustomShops()
        .map(shop => remoteMap.get(shop.name.toLowerCase()) ? { ...shop, ...remoteMap.get(shop.name.toLowerCase()) } : shop)
        .filter(shop => !deleted.has(String(shop.name || '').toLowerCase()));

    const merged = [...baseShops];
    customShops.forEach(shop => {
        if (!merged.some(item => item.name.toLowerCase() === shop.name.toLowerCase())) {
            merged.push(shop);
        }
    });

    return merged;
}

async function ensureProductCatalog() {
    let products = [];

    try {
        const remoteProducts = await window.DB.getProducts();
        products = Array.isArray(remoteProducts) ? remoteProducts.map(normalizeProduct).filter(p => p.name) : [];
    } catch (e) {
        products = [];
    }

    if (window.DB?.addProduct) {
        const existingNames = new Set(products.map(item => item.name.toLowerCase()));
        const missingItems = fallbackMenu.filter(item => !existingNames.has(item.name.toLowerCase()));

        for (const item of missingItems) {
            try {
                await window.DB.addProduct(item);
            } catch (e) {
                // Ignore and fall back to local seed list below.
            }
        }

        if (missingItems.length > 0 || products.length === 0) {
            try {
                const seededProducts = await window.DB.getProducts();
                products = Array.isArray(seededProducts) ? seededProducts.map(normalizeProduct).filter(p => p.name) : [];
            } catch (e) {
                products = [];
            }
        }
    }

    if (products.length === 0) {
        products = fallbackMenu.map(normalizeProduct);
    }

    const seen = new Set();
    dbProducts = products.filter(product => {
        const key = product.name.toLowerCase();
        if (!product.name || seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

async function initBilling() {
    const savedShop = localStorage.getItem('mj_billing_draft_shop') || '';
    const savedPhone = localStorage.getItem('mj_billing_draft_phone') || '';
    
    await ensureProductCatalog();

    const categorySummary = dbProducts.reduce((acc, item) => {
        const key = item.category || 'Bakery';
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {});

    const categoryFilters = ['all', ...Object.keys(categorySummary)];
    const filterHtml = categoryFilters.map(category => {
        const isAll = category === 'all';
        const count = isAll ? dbProducts.length : categorySummary[category];
        const label = isAll ? 'All Items' : category;
        return `
            <button
                class="billing-filter-chip ${activeProductFilter === category ? 'active' : ''}"
                onclick="window.setBillingFilter('${category.replace(/'/g, "\\'")}')"
                type="button"
                data-category="${category.replace(/"/g, '&quot;')}"
            >
                <span>${label}</span>
                <span class="billing-filter-count">${count}</span>
            </button>
        `;
    }).join('');

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
                <div class="shop-modal-grid" style="flex:1; overflow-y:auto; padding:15px; display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:20px;">
                    <div><h3 style="margin-bottom:12px; color:#3b82f6; text-transform:uppercase; font-size:0.8rem; font-weight: 800; letter-spacing: 1px;">Airport Route</h3><div id="route-airport-list" style="display:grid; gap:8px;"></div></div>
                    <div><h3 style="margin-bottom:12px; color:#10b981; text-transform:uppercase; font-size:0.8rem; font-weight: 800; letter-spacing: 1px;">Town Route</h3><div id="route-town-list" style="display:grid; gap:8px;"></div></div>
                </div>
                <div class="shop-modal-actions" style="padding:22px 30px; background:rgba(0,0,0,0.2); border-top:1px solid rgba(255,255,255,0.06); display:grid; grid-template-columns: 1.3fr 1fr 1fr auto; gap:15px;">
                    <input id="route-new-shop" placeholder="Shop Name..." style="padding:14px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); border-radius:12px; color:white;">
                    <input id="route-new-phone" type="tel" placeholder="Phone..." style="padding:14px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); border-radius:12px; color:white;">
                    <select id="route-new-route" style="padding:14px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); border-radius:12px; color:white;">
                        <option value="Airport">Airport</option>
                        <option value="Town">Town</option>
                    </select>
                    <button onclick="window.confirmRouteManual()" style="background:#3b82f6; color:white; border:none; border-radius:12px; padding:0 20px; font-weight:700; cursor:pointer;">Save Shop</button>
                </div>
            </div>
        </div>

        <!-- MAIN VIEW -->
        <div id="billing-container-inner" style="transition:all 0.4s ease; position: relative;">
            <!-- Overlay to block items if no shop selected -->
            <div id="shop-lock-overlay" style="display: ${savedShop ? 'none' : 'flex'}; position: absolute; inset: 0; background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(8px); z-index: 100; align-items: center; justify-content: center; border-radius: 24px; flex-direction: column; text-align: center; padding: 20px;">
                <div style="background: rgba(59, 130, 246, 0.1); padding: 30px; border-radius: 30px; border: 1px solid rgba(59, 130, 246, 0.2); max-width: 350px;">
                    <i data-lucide="store" style="width: 50px; height: 50px; color: #3b82f6; margin-bottom: 20px;"></i>
                    <h3 style="margin-bottom: 10px; font-size: 1.4rem;">Select Shop First</h3>
                    <p style="color: #94a3b8; font-size: 0.9rem; margin-bottom: 25px;">Please identify the destination shop before adding items to the invoice.</p>
                    <button onclick="window.showShopSelectionModal()" class="btn btn-primary" style="width: 100%;">Choose Shop Now</button>
                </div>
            </div>

            <div class="card mb-4" style="padding:15px; border-top: 4px solid #3b82f6; border-radius:18px; display:flex; flex-direction:row; justify-content:space-between; align-items:center; background: rgba(59, 130, 246, 0.05); flex-wrap: wrap; gap: 15px;">
                <div style="display:flex;align-items:center;gap:12px; min-width: 200px;">
                    <div style="background:rgba(59,130,246,0.1); padding:8px; border-radius:10px;"><i data-lucide="receipt" style="color:#3b82f6; width:20px;"></i></div>
                    <div>
                        <div style="font-size:0.65rem; color:#64748b; text-transform:uppercase; font-weight:800; letter-spacing:1px;">Generating Bill For</div>
                        <h3 id="display-shop-name" style="margin:0; font-size:1.1rem; color:#f1f5f9; text-shadow: 0 0 10px rgba(59,130,246,0.3); line-height: 1.2;">${savedShop || 'No Shop Selected'}</h3>
                        <div id="display-shop-phone" style="font-size:0.75rem; color:#94a3b8; margin-top:4px;">${savedPhone || 'No phone saved'}</div>
                    </div>
                </div>
                <div style="display:flex; gap:8px; width: auto;">
                    <button onclick="clearBillingDraft()" style="background:rgba(255,255,255,0.05); color:#94a3b8; border:1px solid rgba(255,255,255,0.1); border-radius:10px; padding:8px 12px; font-size:0.75rem; font-weight:700; cursor:pointer; flex: 1; white-space: nowrap;">New Bill</button>
                    <button onclick="window.showShopSelectionModal()" style="background:rgba(59,130,246,0.1); color:#3b82f6; border:1px solid rgba(59,130,246,0.2); border-radius:10px; padding:8px 12px; font-size:0.75rem; font-weight:700; cursor:pointer; flex: 1; white-space: nowrap;">Switch</button>
                </div>
            </div>

            <div class="billing-main-grid">
                <!-- CATALOG -->
                <div class="card" style="display:flex; flex-direction:column; padding:15px; border-radius:24px;">
                    <div class="billing-pos-header">
                        <div>
                            <div class="billing-section-kicker">Updated Price List</div>
                            <h3 style="margin:4px 0 0 0;">Item Catalog</h3>
                        </div>
                        <div class="billing-product-total">${dbProducts.length} items</div>
                    </div>
                    <div class="product-editor-collapsible" id="product-editor-wrap" style="display:none; margin-bottom:14px; background:rgba(0,0,0,0.2); border:1px solid rgba(255,255,255,0.07); border-radius:14px; padding:14px;">
                        <div class="product-editor-grid" style="display:grid; grid-template-columns: 1.2fr 0.7fr 0.8fr auto; gap:10px;">
                            <input id="product-name-input" type="text" placeholder="Item name" style="padding:10px 12px; border-radius:12px; border:1px solid rgba(255,255,255,0.08); background:rgba(0,0,0,0.2); color:white; outline:none;">
                            <input id="product-price-input" type="number" min="0" step="0.01" placeholder="Price ₹" style="padding:10px 12px; border-radius:12px; border:1px solid rgba(255,255,255,0.08); background:rgba(0,0,0,0.2); color:white; outline:none;">
                            <input id="product-category-input" type="text" placeholder="Category" value="Bakery" style="padding:10px 12px; border-radius:12px; border:1px solid rgba(255,255,255,0.08); background:rgba(0,0,0,0.2); color:white; outline:none;">
                            <button id="product-save-btn" onclick="window.saveCatalogProduct()" type="button" style="background:#10b981; color:white; border:none; border-radius:12px; padding:0 16px; font-weight:800; cursor:pointer;">Save</button>
                        </div>
                        <button onclick="resetCatalogEditor(); document.getElementById('product-editor-wrap').style.display='none';" type="button" style="margin-top:10px; background:none; border:none; color:#64748b; font-size:0.8rem; cursor:pointer;">✖ Cancel</button>
                    </div>
                    <div style="position:relative; margin-bottom:15px;">
                         <i data-lucide="search" style="position:absolute; left:14px; top:50%; transform:translateY(-50%); width:16px; color:#64748b;"></i>
                         <input type="text" id="pos-search" oninput="window.filterPOS(this.value)" placeholder="Search item name..." style="width:100%; padding:10px; border-radius:12px; border:1px solid rgba(255,255,255,0.08); background:rgba(0,0,0,0.2); color:white; font-size:0.9rem; padding-left:40px; outline:none;">
                    </div>
                    <div class="billing-filter-row">
                        ${filterHtml}
                    </div>
                    <div id="product-admin-list" style="display:grid; gap:8px; margin-bottom:14px; max-height:520px; overflow-y:auto;"></div>
                </div>

                <!-- CART -->
                <div class="card" style="display:flex; flex-direction:column; padding:0; border-radius:24px; overflow:hidden; border-top: 4px solid #10b981;">
                    <div style="padding:15px; border-bottom:1px solid rgba(255,255,255,0.05); display:flex; justify-content:space-between; align-items:center; background: rgba(16, 185, 129, 0.05);">
                        <h3 style="margin:0; font-size:1rem; font-weight:800;">Cart Summary</h3>
                        <span id="item-count-badge" class="badge" style="background:#3b82f6; font-size: 0.7rem; padding: 4px 8px;">0 items</span>
                    </div>
                    
                    <div id="current-invoice-list" style="flex:1; max-height: 400px; overflow-y:auto; padding:15px;">
                        <div style="text-align:center; padding:30px; color:#64748b; font-style:italic; font-size: 0.9rem;">No items in cart.</div>
                    </div>

                    <div style="padding:20px; background:rgba(0,0,0,0.3); border-top:1px solid rgba(255,255,255,0.06);">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                            <span style="color:#64748b; font-weight:800; text-transform:uppercase; font-size:0.7rem; letter-spacing: 1px;">Payable Amount</span>
                            <span id="grand-total" style="font-size:1.6rem; font-weight:900; color:#10b981; letter-spacing:-0.5px;">₹0.00</span>
                        </div>

                        <div class="billing-action-grid" style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:10px;">
                            <button id="billing-save-btn" class="btn btn-primary" onclick="window.saveBill(event)" style="height:50px; font-weight:900; font-size:0.95rem; border-radius:14px; box-shadow:0 8px 25px rgba(16, 185, 129, 0.2);">SAVE INVOICE</button>
                            <button class="btn btn-secondary" onclick="window.deleteBillDraft()" style="height:50px; font-weight:800; font-size:0.95rem; border-radius:14px; border-color:rgba(239,68,68,0.25); color:#f87171;">DELETE ITEMS</button>
                        </div>

                        <div class="billing-secondary-grid" style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px;">
                            <button class="btn btn-secondary billing-secondary-btn" title="Download PDF" style="height:44px; border-radius:10px; border-color:rgba(255,255,255,0.1); padding: 0 12px;" onclick="window.downloadSavedInvoice()"><i data-lucide="download" style="width:18px;"></i><span>PDF</span></button>
                            <button class="btn btn-secondary billing-secondary-btn" title="Direct Print" style="height:44px; border-radius:10px; border-color:rgba(255,255,255,0.1); padding: 0 12px;" onclick="window.printSavedInvoice()"><i data-lucide="printer" style="width:18px;"></i><span>Print</span></button>
                            <button class="btn btn-secondary billing-secondary-btn" title="WhatsApp Share" style="height:44px; border-radius:10px; border-color:rgba(37, 211, 102, 0.2); color:#25D366; padding: 0 12px;" onclick="window.shareToWhatsApp()"><i data-lucide="message-circle" style="width:18px;"></i><span>Share</span></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Hidden Receipt Buffer (Off-screen) -->
        <div id="print-receipt" style="position:fixed; left:-5000px; padding:40px; background:white; color:black; font-family:sans-serif; width:800px;"></div>

        <input type="hidden" id="shop-name" value="${savedShop}">
        <input type="hidden" id="shop-phone" value="${savedPhone}">
    `;

    renderBillingTable();
    renderProductAdminList();
    if (!savedShop) window.showShopSelectionModal();

    // Background shop load
    DB.getShops().then(shops => {
        window.renderRouteLists(shops);
    });

    if (window.lucide) window.lucide.createIcons();
}

window.initBilling = initBilling;
window.clearBillingDraft = clearBillingDraft;

document.addEventListener('DOMContentLoaded', () => {
    const billingView = document.getElementById('view-billing');
    if (billingView && billingView.classList.contains('active') && window.initBilling) {
        window.initBilling();
    }
});

window.showShopSelectionModal = async function () {
    const shops = await window.DB.getShops();
    const modal = document.getElementById('shop-init-modal');
    if (!modal) return;

    modal.style.display = 'flex';
    const search = document.getElementById('route-shop-search');
    if (search) search.value = '';
    window.renderRouteLists(shops);
};

window.renderRouteLists = function (rawShops) {
    // rawShops is an array of objects: [{id, name, route}, ...]
    const list = buildVisibleShopList(rawShops);
    billingShopList = list;
    
    const displayList = list;

    const chipHtml = (s) => `
        <div class="shop-row" data-shop-id="${s.id}" data-shop-name="${(s.name || '').toLowerCase()}">
            <button class="route-chip" onclick="window.confirmInitialShop('${s.name.replace(/'/g, "\\'")}', '${(s.phone || '').replace(/'/g, "\\'")}')" style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); padding:16px; border-radius:15px; cursor:pointer; font-weight:600; text-align:left; color:#f1f5f9; transition:all 0.2s; display:flex; justify-content:space-between; align-items:center; flex:1;">
                <span>
                    <strong style="display:block; color:#f8fafc;">${s.name}</strong>
                    <span style="display:block; font-size:0.72rem; color:#94a3b8; margin-top:4px;">${s.phone || 'No phone saved'} · ${s.route || 'Town'}</span>
                </span>
                <i data-lucide="chevron-right" style="width:14px; opacity:0.3;"></i>
            </button>
            <button onclick="window.editShopPrompt(${JSON.stringify(s.id)})" style="background:rgba(59,130,246,0.1); color:#60a5fa; border:none; padding:15px; border-radius:12px; cursor:pointer; font-weight:bold;" title="Edit Shop"><i data-lucide="pencil" style="width:16px;"></i></button>
            <button onclick="window.deleteShopPrompt(${JSON.stringify(s.id)})" style="background:rgba(239, 68, 68, 0.1); color:#ef4444; border:none; padding:15px; border-radius:12px; cursor:pointer; font-weight:bold;" title="Delete Shop">✖</button>
        </div>`;

    const r1 = document.getElementById('route-airport-list');
    const r2 = document.getElementById('route-town-list');
    
    if (r1) {
        const airportShops = displayList.filter(item => (item.route || '').toLowerCase().includes('airport'));
        r1.innerHTML = airportShops.map(chipHtml).join('') || '<div style="color:#64748b; padding:10px;">Select from Town or add new</div>';
    }
    
    if (r2) {
        const townShops = displayList.filter(item => !(item.route || '').toLowerCase().includes('airport'));
        r2.innerHTML = townShops.map(chipHtml).join('') || '<div style="color:#64748b; padding:10px;">No town shops saved</div>';
    }
    
    if (window.lucide) window.lucide.createIcons();
};

window.confirmInitialShop = function (name, phone = '') {
    localStorage.setItem('mj_billing_draft_shop', name);
    localStorage.setItem('mj_billing_draft_phone', phone);
    const input = document.getElementById('shop-name');
    const phoneInput = document.getElementById('shop-phone');
    const display = document.getElementById('display-shop-name');
    const phoneDisplay = document.getElementById('display-shop-phone');
    const lock = document.getElementById('shop-lock-overlay');

    if (input) input.value = name;
    if (phoneInput) phoneInput.value = phone;
    if (display) display.textContent = name;
    if (phoneDisplay) phoneDisplay.textContent = phone || 'No phone saved';
    if (lock) lock.style.display = 'none';

    document.getElementById('shop-init-modal').style.display = 'none';
};

window.deleteShopPrompt = async function(id) {
    if (!confirm("🗑️ Are you sure you want to delete this shop?")) return;
    const shop = billingShopList.find(item => String(item.id) === String(id));
    await window.DB.deleteShop(id);
    if (shop) {
        if (DEFAULT_BILLING_SHOP_NAMES.has(shop.name.toLowerCase())) {
            const deleted = new Set(getDeletedShopNames().map(name => name.toLowerCase()));
            deleted.add(shop.name.toLowerCase());
            setDeletedShopNames(Array.from(deleted));
        } else {
            const custom = getCustomShops().filter(item => item.name.toLowerCase() !== shop.name.toLowerCase());
            setCustomShops(custom);
        }
    }
    const updatedShops = await window.DB.getShops();
    window.renderRouteLists(updatedShops);

    if (shop && localStorage.getItem('mj_billing_draft_shop') === shop.name) {
        localStorage.removeItem('mj_billing_draft_shop');
        localStorage.removeItem('mj_billing_draft_phone');
        const display = document.getElementById('display-shop-name');
        const phoneDisplay = document.getElementById('display-shop-phone');
        const lock = document.getElementById('shop-lock-overlay');
        if (display) display.textContent = 'No Shop Selected';
        if (phoneDisplay) phoneDisplay.textContent = 'No phone saved';
        if (lock) lock.style.display = 'flex';
    }
};

window.editShopPrompt = async function(id) {
    const shop = billingShopList.find(item => item.id === id);
    if (!shop) return;

    const nextName = prompt('Edit shop name', shop.name);
    if (nextName === null) return;

    const trimmedName = nextName.trim();
    if (!trimmedName) return alert('Shop name cannot be empty.');

    const nextPhone = prompt('Edit phone number', shop.phone || '');
    if (nextPhone === null) return;

    const nextRoute = prompt('Edit route: Airport or Town', shop.route || 'Town');
    if (nextRoute === null) return;

    const trimmedRoute = nextRoute.trim();
    const normalizedRoute = trimmedRoute.toLowerCase() === 'airport' ? 'Airport' : 'Town';

    await window.DB.updateShop(id, {
        name: trimmedName,
        route: normalizedRoute,
        phone: nextPhone.trim()
    });

    if (DEFAULT_BILLING_SHOP_NAMES.has(shop.name.toLowerCase()) && shop.name.toLowerCase() !== trimmedName.toLowerCase()) {
        const deleted = new Set(getDeletedShopNames().map(name => name.toLowerCase()));
        deleted.add(shop.name.toLowerCase());
        setDeletedShopNames(Array.from(deleted));

        const custom = getCustomShops().filter(item => item.name.toLowerCase() !== trimmedName.toLowerCase());
        custom.push({ id, name: trimmedName, route: normalizedRoute, phone: nextPhone.trim() });
        setCustomShops(custom);
    } else if (!DEFAULT_BILLING_SHOP_NAMES.has(shop.name.toLowerCase())) {
        const custom = getCustomShops().map(item => item.name.toLowerCase() === shop.name.toLowerCase()
            ? { ...item, name: trimmedName, route: normalizedRoute, phone: nextPhone.trim() }
            : item
        );
        setCustomShops(custom);
    }

    const updatedShops = await window.DB.getShops();
    window.renderRouteLists(updatedShops);

    if (localStorage.getItem('mj_billing_draft_shop') === shop.name) {
        window.confirmInitialShop(trimmedName, nextPhone.trim());
    }
};

window.confirmRouteManual = async function () {
    const nameInput = document.getElementById('route-new-shop');
    const phoneInput = document.getElementById('route-new-phone');
    const routeInput = document.getElementById('route-new-route');
    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    const route = routeInput.value || 'Airport';
    
    if (!name) return alert("Please enter shop name");
    
    await window.DB.addShop({ name, route, phone });
    const custom = getCustomShops().filter(item => item.name.toLowerCase() !== name.toLowerCase());
    custom.push({ id: Date.now(), name, route, phone });
    setCustomShops(custom);
    nameInput.value = '';
    phoneInput.value = '';
    
    const updatedShops = await window.DB.getShops();
    window.renderRouteLists(updatedShops);
    window.confirmInitialShop(name, phone);
};

window.filterRouteShops = function (q) {
    const query = q.toLowerCase().trim();
    document.querySelectorAll('.shop-row').forEach(row => {
        const haystack = row.innerText.toLowerCase();
        row.style.display = haystack.includes(query) ? 'flex' : 'none';
    });
};

window.filterPOS = function (q) {
    renderProductAdminList();
};

window.setBillingFilter = function(category) {
    activeProductFilter = category;
    document.querySelectorAll('.billing-filter-chip').forEach(chip => {
        chip.classList.toggle('active', chip.dataset.category === category);
    });
    renderProductAdminList();
};

function renderPOSGrid(query = '') {
    const normalizedQuery = query.toLowerCase().trim();
    const grid = document.getElementById('pos-items-grid');
    const filtered = dbProducts.filter((item) => {
        const categoryMatches = activeProductFilter === 'all' || item.category === activeProductFilter;
        const queryMatches = !normalizedQuery || item.name.toLowerCase().includes(normalizedQuery);
        return categoryMatches && queryMatches;
    });

    const markup = filtered.map((item, i) => {
        const originalIndex = dbProducts.findIndex(product => product.name === item.name && product.price === item.price);
        return `
            <button class="pos-item-btn" onclick="window.quickAddItem(${originalIndex})" type="button">
                <div class="item-name">${item.name}</div>
                <div class="item-meta">${item.category}</div>
                <div class="item-price">₹${parseFloat(item.price).toFixed(2)}</div>
            </button>
        `;
    }).join('') || `<div class="billing-empty-state">No items match this search.</div>`;

    if (grid) {
        grid.innerHTML = markup;
        grid.style.display = 'none';
    }

    return markup;
}

function renderProductAdminList() {
    const list = document.getElementById('product-admin-list');
    if (!list) return;

    const query = (document.getElementById('pos-search')?.value || '').toLowerCase().trim();
    const filtered = dbProducts.filter(item => {
        const queryMatches = !query || item.name.toLowerCase().includes(query);
        const categoryMatches = activeProductFilter === 'all' || item.category === activeProductFilter;
        return queryMatches && categoryMatches;
    });

    list.innerHTML = filtered.map(item => `
        <div style="display:grid; grid-template-columns:1fr auto auto auto; gap:8px; align-items:center; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); padding:10px 12px; border-radius:12px;">
            <div>
                <div style="font-weight:700; color:#f8fafc;">${item.name}</div>
                <div style="font-size:0.74rem; color:#94a3b8;">${item.category} · ₹${parseFloat(item.price || 0).toFixed(2)}</div>
            </div>
            <button type="button" onclick="window.quickAddItemById('${String(item.id || item.name).replace(/'/g, "\\'")}')" style="background:rgba(16,185,129,0.12); border:none; color:#86efac; border-radius:10px; padding:8px 12px; font-weight:700; cursor:pointer;">Add</button>
            <button type="button" onclick="window.startEditCatalogProduct('${String(item.id || item.name).replace(/'/g, "\\'")}')" style="background:rgba(59,130,246,0.12); border:none; color:#93c5fd; border-radius:10px; padding:8px 12px; font-weight:700; cursor:pointer;">Edit</button>
            <button type="button" onclick="window.removeCatalogProduct('${String(item.id || item.name).replace(/'/g, "\\'")}')" style="background:rgba(239,68,68,0.12); border:none; color:#fca5a5; border-radius:10px; padding:8px 12px; font-weight:700; cursor:pointer;">Delete</button>
        </div>
    `).join('') || '<div style="padding:14px; color:#64748b; text-align:center;">No items available to manage.</div>';
}

function resetCatalogEditor() {
    editingProductId = null;
    const saveBtn = document.getElementById('product-save-btn');
    const nameInput = document.getElementById('product-name-input');
    const priceInput = document.getElementById('product-price-input');
    const categoryInput = document.getElementById('product-category-input');
    if (saveBtn) saveBtn.textContent = 'Add Item';
    if (nameInput) nameInput.value = '';
    if (priceInput) priceInput.value = '';
    if (categoryInput) categoryInput.value = 'Bakery';
}

window.startEditCatalogProduct = function(id) {
    const product = dbProducts.find(item => String(item.id) === String(id) || item.name === id);
    if (!product) return;
    editingProductId = product.id;
    document.getElementById('product-name-input').value = product.name;
    document.getElementById('product-price-input').value = product.price;
    document.getElementById('product-category-input').value = product.category || 'Bakery';
    const saveBtn = document.getElementById('product-save-btn');
    if (saveBtn) saveBtn.textContent = 'Save Edit';
};

window.saveCatalogProduct = async function() {
    const name = document.getElementById('product-name-input')?.value.trim();
    const price = parseFloat(document.getElementById('product-price-input')?.value || 0);
    const category = document.getElementById('product-category-input')?.value.trim() || 'Bakery';

    if (!name) return alert('Please enter item name.');
    if (!(price > 0)) return alert('Please enter a valid price.');

    const payload = { name, price, category };
    if (editingProductId) {
        await window.DB.updateProduct(editingProductId, payload);
    } else {
        await window.DB.addProduct(payload);
    }

    await ensureProductCatalog();
    resetCatalogEditor();
    renderPOSGrid(document.getElementById('pos-search')?.value || '');
    renderProductAdminList();
    if (window.lucide) window.lucide.createIcons();
};

window.removeCatalogProduct = async function(id) {
    const product = dbProducts.find(item => String(item.id) === String(id) || item.name === id);
    if (!product) return;
    if (!confirm(`Delete ${product.name}?`)) return;

    await window.DB.deleteProduct(product.id);
    dbProducts = dbProducts.filter(item => String(item.id) !== String(product.id));
    currentItems = currentItems.filter(item => item.name !== product.name);
    renderPOSGrid(document.getElementById('pos-search')?.value || '');
    renderProductAdminList();
    renderBillingTable();
};

window.quickAddItem = (idx) => {
    const item = dbProducts[idx];
    if (!item) return;
    
    const existing = currentItems.find(i => i.name === item.name);
    if (existing) {
        existing.qty++;
        existing.total = existing.qty * existing.price;
    } else {
        const price = parseFloat(item.price);
        currentItems.push({ name: item.name, price: price, qty: 1, total: price });
    }
    renderBillingTable();
};

window.quickAddItemById = (id) => {
    const item = dbProducts.find(product => String(product.id) === String(id) || product.name === id);
    if (!item) return;

    const existing = currentItems.find(i => i.name === item.name);
    if (existing) {
        existing.qty++;
        existing.total = existing.qty * existing.price;
    } else {
        const price = parseFloat(item.price);
        currentItems.push({ name: item.name, price, qty: 1, total: price });
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

function buildCurrentSale() {
    const shop = document.getElementById('shop-name')?.value || 'Walk-in';
    const phone = document.getElementById('shop-phone')?.value || '';
    const totalText = document.getElementById('grand-total')?.textContent || '0';
    const total = parseFloat(totalText.replace(/₹|,/g, '') || 0);

    return {
        shop,
        phone,
        total,
        status: 'Paid',
        timestamp: Date.now(),
        items: currentItems.map(item => ({ ...item }))
    };
}

window.saveBill = async (event) => {
    if (currentItems.length === 0) {
        return alert("Please add at least one item to the bill first.");
    }

    const sale = buildCurrentSale();

    // 1. Show processing
    const btn = event?.target;
    const originalText = btn ? btn.innerText : 'SAVE INVOICE';
    if (btn) {
        btn.disabled = true;
        btn.innerText = 'SAVING...';
    }

    try {
        const savedSale = await window.DB.addSale(sale);
        lastSavedSale = { ...sale, ...savedSale, phone: sale.phone };
        console.log("✅ Sale saved successfully.");
        alert("✅ Invoice saved successfully!");

        if (window.refreshDashboard) window.refreshDashboard();
        if (window.initHistory) window.initHistory();
    } catch (e) {
        console.warn("⚠️ Database connection failed. Saving locally.", e);
        lastSavedSale = sale;
        alert("Invoice saved locally. Download is still available.");
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerText = originalText;
        }
    }
};

function clearBillingDraft() {
    currentItems = [];
    lastSavedSale = null;
    localStorage.removeItem('mj_billing_draft_shop');
    localStorage.removeItem('mj_billing_draft_phone');
    initBilling();
}

window.deleteBillDraft = () => {
    if (currentItems.length === 0 && !lastSavedSale) {
        return alert("There are no items to delete.");
    }
    if (!confirm('Delete the current invoice items from the billing screen?')) return;

    currentItems = [];
    lastSavedSale = null;
    renderBillingTable();
};

window.sharePDF = async () => {
    const sale = buildCurrentSale();

    if (sale.items.length === 0) return alert("Add items to generate invoice");

    return await window.generateInvoicePDF({ ...sale, phone: sale.phone });
};

window.downloadSavedInvoice = async () => {
    if (!lastSavedSale) {
        return alert("Save the invoice first, then download it.");
    }
    return await window.generateInvoicePDF(lastSavedSale);
};

window.shareToWhatsApp = async () => {
    const sale = lastSavedSale || buildCurrentSale();

    if (!sale.items.length) return alert("Add items to generate invoice");

    return await window.shareInvoiceWhatsApp(sale);
};

window.printSavedInvoice = () => {
    if (!lastSavedSale) {
        return alert("Save the invoice first, then print it.");
    }
    return window.printInvoiceDocument(lastSavedSale);
};

window.printInvoice = () => {
    const sale = buildCurrentSale();
    if (!sale.items.length) return alert("Add items to print invoice");
    return window.printInvoiceDocument(sale);
};
