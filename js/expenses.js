// ═══════════════════════════════════════════════════════════════════
//  EXPENSES MODULE  — with Bill Receipt Photo Tracker
// ═══════════════════════════════════════════════════════════════════

function initExpenses() {
    const expensesView = document.getElementById('view-expenses');
    if (!expensesView) return;

    expensesView.innerHTML = `
        <!-- ══ RECEIPT IMAGE LIGHTBOX ════════════════════════════════════ -->
        <div id="receipt-lightbox" onclick="window.closeLightbox()"
            style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.92);z-index:1000;align-items:center;justify-content:center;cursor:zoom-out;backdrop-filter:blur(10px);">
            <img id="lightbox-img" style="max-width:90vw;max-height:88vh;border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,0.6);">
            <button onclick="window.closeLightbox()" style="position:fixed;top:20px;right:24px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);color:white;border-radius:50%;width:40px;height:40px;display:flex;align-items:center;justify-content:center;cursor:pointer;">
                <i data-lucide="x"></i>
            </button>
        </div>

        <div style="max-width:1200px;margin:0 auto;">
            <!-- Header section -->
            <div class="flex-between mb-4">
                <div>
                    <h2 style="margin:0;font-size:1.8rem;color:#fff;">Unit Expenses</h2>
                    <p style="color:#64748b;margin:4px 0 0;">Track shop bills, fuel, and service costs.</p>
                </div>
                <div style="text-align:right;">
                    <div style="font-size:1.5rem;font-weight:700;color:var(--accent-danger);" id="total-unpaid-receipts">₹0.00</div>
                    <div style="font-size:0.75rem;color:#64748b;text-transform:uppercase;font-weight:700;letter-spacing:1px;">Total Unpaid Bills</div>
                </div>
            </div>

            <!-- ══ TABS ══════════════════════════════════════════════════════ -->
            <div style="display:flex;gap:0;margin-bottom:22px;background:#1a2540;border-radius:12px;overflow:hidden;border:1px solid rgba(255,255,255,0.07);">
                <button id="etab-expenses" onclick="window.switchExpTab('expenses')"
                    style="flex:1;padding:13px;font-size:0.82rem;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;cursor:pointer;font-family:inherit;border:none;border-bottom:3px solid #ef4444;background:rgba(239,68,68,0.08);color:#f87171;">
                    <i data-lucide="clipboard-list" style="width:16px;margin-right:6px;"></i> Expense Records
                </button>
                <button id="etab-receipts" onclick="window.switchExpTab('receipts')"
                    style="flex:1;padding:13px;font-size:0.82rem;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;cursor:pointer;font-family:inherit;border:none;border-bottom:3px solid transparent;background:transparent;color:#64748b;">
                    <i data-lucide="receipt" style="width:16px;margin-right:6px;"></i> Bill Receipts
                </button>
            </div>

            <!-- ══ PANEL: EXPENSE RECORDS ════════════════════════════════════ -->
            <div id="epanel-expenses">
                <div class="grid-2">
                    <!-- Add Form -->
                    <div class="card" style="border-top:4px solid var(--accent-danger)">
                        <h3 class="mb-4">Record Unit Expense</h3>
                        <div class="form-group">
                            <label>Expense Category</label>
                            <select id="exp-category">
                                <option value="Groceries">Groceries / Raw Materials</option>
                                <option value="Van Service">Van Service / Maintenance</option>
                                <option value="Petrol">Petrol / Fuel</option>
                                <option value="Utilities">Utilities &amp; Rent</option>
                                <option value="Other">Other Expenses</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Amount (₹)</label>
                            <input type="number" id="exp-amt" placeholder="Enter amount">
                        </div>
                        <div class="form-group">
                            <label>Note (Optional)</label>
                            <input type="text" id="exp-note" placeholder="Description of expense">
                        </div>
                        <button class="btn btn-danger mt-4" style="width:100%" onclick="window.addExpense()">
                            Save Expense Record
                        </button>
                    </div>

                    <!-- Recent Expenses List -->
                    <div class="card">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                            <h3 style="margin:0;">Recent Expenses</h3>
                            <button onclick="window.clearAllExpenses()"
                                style="background:rgba(239,68,68,0.1);color:#f87171;border:1px solid rgba(239,68,68,0.25);border-radius:8px;padding:7px 14px;font-size:0.8rem;font-weight:600;cursor:pointer;font-family:inherit; display:flex; align-items:center; gap:6px;"
                                onmouseover="this.style.background='rgba(239,68,68,0.22)'"
                                onmouseout="this.style.background='rgba(239,68,68,0.1)'">
                                <i data-lucide="trash-2" style="width:14px;"></i> Clear All
                            </button>
                        </div>
                        <div class="table-container" style="max-height:370px;overflow-y:auto;margin-top:0;">
                            <table id="expense-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Category</th>
                                        <th style="text-align:right">Amount</th>
                                        <th style="width:40px;"></th>
                                    </tr>
                                </thead>
                                <tbody id="expense-body"></tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <!-- ══ PANEL: BILL RECEIPTS ══════════════════════════════════════ -->
            <div id="epanel-receipts" style="display:none;">
                <!-- Add Receipt Form -->
                <div class="card" style="border-top:4px solid #8b5cf6;margin-bottom:22px;">
                    <h3 class="mb-4" style="color:#a78bfa; display:flex; align-items:center; gap:8px;"><i data-lucide="file-plus-2"></i> Add Bill Receipt</h3>
                    <div class="receipt-form-grid">
                        <div class="form-group" style="margin:0;">
                            <label>Shop / Supplier Name *</label>
                            <input type="text" id="rec-shop" placeholder="e.g. Al Madeena Grocery">
                        </div>
                        <div class="form-group" style="margin:0;">
                            <label>Bill Amount (₹) *</label>
                            <input type="number" id="rec-amt" placeholder="Enter total bill amount">
                        </div>
                        <div class="form-group" style="margin:0;">
                            <label>Bill Date *</label>
                            <input type="date" id="rec-date" value="${new Date().toISOString().split('T')[0]}">
                        </div>
                        <div class="form-group" style="margin:0;">
                            <label>Category</label>
                            <select id="rec-category">
                                <option value="Groceries">Groceries / Raw Materials</option>
                                <option value="Van Service">Van Service / Maintenance</option>
                                <option value="Petrol">Petrol / Fuel</option>
                                <option value="Utilities">Utilities &amp; Rent</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div class="form-group" style="margin:0;grid-column:1/-1;">
                            <label>Note (Optional)</label>
                            <input type="text" id="rec-note" placeholder="Additional notes…">
                        </div>

                        <!-- Photo Upload -->
                        <div style="grid-column:1/-1;">
                            <label style="font-size:0.82rem;color:#94a3b8;display:block;margin-bottom:8px;">
                                <i data-lucide="camera" style="width:14px;vertical-align:middle;margin-right:4px;"></i> Bill Photo (Optional)
                            </label>
                            <div id="photo-upload-area"
                                onclick="document.getElementById('rec-photo-input').click()"
                                ondragover="event.preventDefault();this.style.borderColor='#8b5cf6'"
                                ondragleave="this.style.borderColor='rgba(139,92,246,0.3)'"
                                ondrop="window.handlePhotoDrop(event)"
                                style="border:2px dashed rgba(139,92,246,0.3);border-radius:12px;padding:28px;text-align:center;cursor:pointer;transition:all 0.2s;background:rgba(139,92,246,0.04);"
                                onmouseover="this.style.borderColor='#8b5cf6';this.style.background='rgba(139,92,246,0.08)'"
                                onmouseout="this.style.borderColor='rgba(139,92,246,0.3)';this.style.background='rgba(139,92,246,0.04)'">
                                <div id="photo-preview-area">
                                    <i data-lucide="image-plus" style="width:32px;height:32px;color:#64748b;margin-bottom:8px;"></i>
                                    <div style="color:#64748b;font-size:0.85rem;">Click or drag &amp; drop to upload bill photo</div>
                                    <div style="color:#475569;font-size:0.75rem;margin-top:4px;">JPG, PNG, WEBP supported</div>
                                    <div id="ocr-status" style="display:none;margin-top:8px;font-size:0.7rem;color:#a78bfa;font-weight:700;">
                                        <i data-lucide="scan" style="width:12px;vertical-align:middle;animation:spin 2s linear infinite;"></i> Scanning for amount...
                                    </div>
                                </div>
                            </div>
                            <input type="file" id="rec-photo-input" accept="image/*" capture="environment"
                                style="display:none;" onchange="window.handlePhotoSelect(event)">
                        </div>

                        <!-- Payment Status -->
                        <div style="grid-column:1/-1;display:flex;align-items:center;gap:14px;">
                            <label style="font-size:0.82rem;color:#94a3b8;">Payment Status:</label>
                            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;">
                                <input type="radio" name="rec-paid" id="rec-paid-yes" value="paid" checked style="accent-color:#10b981;">
                                <span style="color:#34d399;font-weight:600;font-size:0.88rem;">
                                    <i data-lucide="check-circle" style="width:14px;vertical-align:middle;margin-right:2px;"></i> Paid
                                </span>
                            </label>
                            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;">
                                <input type="radio" name="rec-paid" id="rec-paid-no" value="unpaid" style="accent-color:#ef4444;">
                                <span style="color:#f87171;font-weight:600;font-size:0.88rem;">
                                    <i data-lucide="hourglass" style="width:14px;vertical-align:middle;margin-right:2px;"></i> Unpaid / Pending
                                </span>
                            </label>
                        </div>
                    </div>

                    <button onclick="window.addReceipt()" class="btn btn-primary" style="height:44px;font-weight:700;box-shadow:0 10px 20px rgba(139,92,246,0.2); width:100%; margin-top:18px;">
                        <i data-lucide="upload-cloud" style="width:16px;margin-right:6px;"></i> Upload Receipt
                    </button>
                </div>

                <!-- Filter Bar -->
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;flex-wrap:wrap;gap:10px;">
                    <div style="display:flex;gap:6px;">
                        <button onclick="window.filterReceipts('all')" id="rfilt-all"
                            style="background:rgba(139,92,246,0.15);color:#a78bfa;border:1px solid rgba(139,92,246,0.3);border-radius:8px;padding:7px 14px;font-size:0.8rem;font-weight:600;cursor:pointer;font-family:inherit;">All</button>
                        <button onclick="window.filterReceipts('unpaid')" id="rfilt-unpaid"
                            style="background:rgba(239,68,68,0.08);color:#f87171;border:1px solid rgba(239,68,68,0.2);border-radius:8px;padding:7px 14px;font-size:0.8rem;font-weight:600;cursor:pointer;font-family:inherit;display:flex;align-items:center;gap:4px;">
                            <i data-lucide="hourglass" style="width:12px;"></i> Unpaid
                        </button>
                        <button onclick="window.filterReceipts('paid')" id="rfilt-paid"
                            style="background:rgba(16,185,129,0.08);color:#34d399;border:1px solid rgba(16,185,129,0.2);border-radius:8px;padding:7px 14px;font-size:0.8rem;font-weight:600;cursor:pointer;font-family:inherit;display:flex;align-items:center;gap:4px;">
                            <i data-lucide="check-circle" style="width:12px;"></i> Paid
                        </button>
                    </div>
                    <div id="receipt-stats" style="font-size:0.82rem;color:#64748b;"></div>
                </div>

                <!-- Receipts Grid -->
                <h3 class="mb-4" style="display:flex; align-items:center; gap:8px;"><i data-lucide="layout-grid"></i> Uploaded Bill Receipts</h3>
                <div id="receipts-grid" class="receipts-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:16px;"></div>
            </div>
        </div>
    `;

    renderExpenses();
    renderReceipts();
    if (window.lucide) window.lucide.createIcons();
}

// ── Tab switch ────────────────────────────────────────────────────────────────
window.switchExpTab = (tab) => {
    ['expenses','receipts'].forEach(t => {
        const panel = document.getElementById(`epanel-${t}`);
        if (panel) panel.style.display = t === tab ? '' : 'none';
        const btn = document.getElementById(`etab-${t}`);
        if (btn) {
            const active = t === tab;
            btn.style.borderBottomColor = active ? (t==='expenses' ? '#ef4444' : '#8b5cf6') : 'transparent';
            btn.style.background        = active ? (t==='expenses' ? 'rgba(239,68,68,0.08)' : 'rgba(139,92,246,0.08)') : 'transparent';
            btn.style.color             = active ? (t==='expenses' ? '#f87171' : '#a78bfa') : '#64748b';
        }
    });
    if (window.lucide) window.lucide.createIcons();
};

// ── Photo handling ────────────────────────────────────────────────────────────
let _pendingPhoto = null;

window.handlePhotoSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
        readPhotoFile(file);
        window.scanReceiptForAmount(file);
    }
};

window.handlePhotoDrop = (event) => {
    event.preventDefault();
    document.getElementById('photo-upload-area').style.borderColor = 'rgba(139,92,246,0.3)';
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        readPhotoFile(file);
        window.scanReceiptForAmount(file);
    }
};

function readPhotoFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        _pendingPhoto = e.target.result;
        const area = document.getElementById('photo-preview-area');
        if (!area) return;
        
        area.innerHTML = `
            <div style="position:relative;display:inline-block;margin-bottom:10px;background:#000;border-radius:10px;padding:5px;border:1px solid rgba(255,255,255,0.1);">
                <img src="${_pendingPhoto}" style="max-height:180px;max-width:100%;display:block;border-radius:6px;object-fit:contain;">
                <button onclick="event.stopPropagation();window.clearPhotoPreview()"
                    style="position:absolute;top:-10px;right:-10px;background:#ef4444;color:white;border:none;border-radius:50%;width:28px;height:28px;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 10px rgba(0,0,0,0.5);">
                    <i data-lucide="x" style="width:14px;"></i>
                </button>
            </div>
            <div style="color:#34d399;font-size:0.85rem;font-weight:700;display:flex;align-items:center;justify-content:center;gap:5px;">
                <i data-lucide="check-circle" style="width:14px;"></i> Photo Attached
            </div>
            <div id="ocr-status" style="margin-top:10px;font-size:0.75rem;color:#a78bfa;font-weight:600;display:none;">
                <i data-lucide="refresh-cw" style="width:14px;vertical-align:middle;animation:spin 2s linear infinite;margin-right:6px;"></i> Scanning receipt for amount...
            </div>`;
        if (window.lucide) window.lucide.createIcons();
    };
    reader.readAsDataURL(file);
}

// ── Receipt Scanner (OCR) ───────────────────────────────────────────────────
window.scanReceiptForAmount = (file) => {
    if (!window.Tesseract) return;

    const statusEl = document.getElementById('ocr-status');
    if (statusEl) statusEl.style.display = 'block';

    window.Tesseract.recognize(file, 'eng')
        .then(({ data: { text } }) => {
            console.log("OCR Extracted Text:", text);
            const amount = extractTotalAmount(text);
            if (amount) {
                const amtInput = document.getElementById('rec-amt');
                if (amtInput) amtInput.value = amount;
                showExpToast(`Scan Successful: Total ₹${amount} detected!`, 'success');
            }
        })
        .finally(() => {
            if (statusEl) statusEl.style.display = 'none';
        });
};

function extractTotalAmount(text) {
    // 1. Clean up text and normalize
    const cleanText = text.replace(/[^0-9.\n ]/g, ' '); // Remove weird symbols like (-) that might cause "-4"
    const lines = text.toUpperCase().replace(/,/g, '').split('\n');
    let candidates = [];

    // 2. Look for lines containing "TOTAL", "NET", "AMOUNT", "GRAND"
    const keywords = ['TOTAL', 'NET', 'AMOUNT', 'GRAND', 'PAYABLE', 'SUM', 'TOTAL AMT', 'TOTAL VALUE'];
    
    lines.forEach(line => {
        if (keywords.some(k => line.includes(k))) {
            const matches = line.match(/(\d+\.\d{2}|\d+\.\d{1}|\d{2,8})/g);
            if (matches) matches.forEach(m => {
                const val = parseFloat(m);
                if (val > 0) candidates.push(val);
            });
        }
    });

    // 3. Fallback: Find the largest number in the entire text (often the total)
    const allMatches = text.replace(/,/g, '').match(/(\d+\.\d{2}|\d+\.\d{1}|\d{2,8})/g);
    if (allMatches) {
        const sorted = allMatches
            .map(m => parseFloat(m))
            .filter(n => n < 500000 && n > 5 && n !== 2023 && n !== 2024 && n !== 2025 && n !== 2026 && n !== 2027)
            .sort((a,b) => b-a);
        
        if (sorted[0]) {
            console.log("OCR Detected Max Value:", sorted[0]);
            // If the max value is significantly larger than candidates, prefer it as receipts can be messy
            return sorted[0];
        }
    }

    return candidates.length > 0 ? Math.max(...candidates) : null;
}

window.clearPhotoPreview = () => {
    _pendingPhoto = null;
    const input = document.getElementById('rec-photo-input');
    if (input) input.value = '';
    const area = document.getElementById('photo-preview-area');
    if (area) {
        area.innerHTML = `
            <i data-lucide="image-plus" style="width:32px;height:32px;color:#64748b;margin-bottom:8px;"></i>
            <div style="color:#64748b;font-size:0.85rem;">Click or drag &amp; drop to upload bill photo</div>
            <div style="color:#475569;font-size:0.75rem;margin-top:4px;">JPG, PNG, WEBP supported</div>`;
        if (window.lucide) window.lucide.createIcons();
    }
}

// ── Add Receipt ───────────────────────────────────────────────────────────────
window.addReceipt = async () => {
    const shop     = document.getElementById('rec-shop').value.trim();
    const amt      = parseFloat(document.getElementById('rec-amt').value);
    const dateVal  = document.getElementById('rec-date').value;
    const category = document.getElementById('rec-category').value;
    const note     = document.getElementById('rec-note').value.trim();
    const paidEl   = document.querySelector('input[name="rec-paid"]:checked');
    const paid     = paidEl ? paidEl.value === 'paid' : true;

    if (!shop)            return showExpToast('Enter shop/supplier name.', 'error');
    if (!amt || amt <= 0) return showExpToast('Enter a valid bill amount.', 'error');
    if (!dateVal)         return showExpToast('Select the bill date.', 'error');

    const receipt = {
        id: Date.now(),
        shop, amt, dateVal, date_val: dateVal, category, note, paid,
        photo: _pendingPhoto || null,
        photo_url: _pendingPhoto || null,
        timestamp: Date.now()
    };

    await window.DB.addReceipt(receipt);

    // Reset
    document.getElementById('rec-shop').value = '';
    document.getElementById('rec-amt').value  = '';
    document.getElementById('rec-note').value = '';
    window.clearPhotoPreview();

    await renderReceipts();
    showExpToast(`Receipt from "${shop}" saved!`, 'success');
    if (window.refreshDashboard) window.refreshDashboard();
};

window.toggleReceiptPaid = async (id) => {
    const receipts = await window.DB.getReceipts();
    const r = receipts.find(r => String(r.id) === String(id));
    if (!r) return;
    const nextPaid = !r.paid;
    await window.DB.updateReceipt(id, {
        shop: r.shop,
        amt: r.amt,
        date_val: r.date_val || r.dateVal,
        category: r.category,
        paid: nextPaid,
        note: r.note || '',
        photo_url: r.photo_url || r.photo || ''
    });
    await renderReceipts();
    showExpToast(nextPaid ? 'Marked as Paid' : 'Marked as Pending', 'success');
    if (window.refreshDashboard) window.refreshDashboard();
};

window.deleteReceipt = async (id) => {
    if (!confirm('Delete this receipt?')) return;
    await window.DB.deleteReceipt(id);
    await renderReceipts();
    showExpToast('Receipt deleted.', 'info');
    if (window.refreshDashboard) window.refreshDashboard();
};

// ── Lightbox ──────────────────────────────────────────────────────────────────
window.openLightbox = (src) => {
    document.getElementById('lightbox-img').src = src;
    document.getElementById('receipt-lightbox').style.display = 'flex';
};
window.closeLightbox = () => {
    document.getElementById('receipt-lightbox').style.display = 'none';
};

// ── Filter ────────────────────────────────────────────────────────────────────
let _receiptFilter = 'all';
window.filterReceipts = (f) => {
    _receiptFilter = f;
    renderReceipts();
};

function getCategoryIcon(cat) {
    const icons = {
        'Groceries': 'shopping-cart',
        'Van Service': 'truck',
        'Petrol': 'fuel',
        'Utilities': 'zap',
        'Other': 'package'
    };
    return `<i data-lucide="${icons[cat] || 'package'}" style="width:16px;"></i>`;
}

async function renderReceipts() {
    const fetched = await window.DB.getReceipts();
    const all = (Array.isArray(fetched) ? fetched : []).map(r => ({
        ...r,
        amt: parseFloat(r.amt || 0),
        paid: !!r.paid,
        dateVal: r.dateVal || r.date_val,
        photo: r.photo || r.photo_url || null
    })).sort((a,b) => b.timestamp - a.timestamp);
    const filtered = _receiptFilter === 'all' ? all : all.filter(r => _receiptFilter === 'paid' ? r.paid : !r.paid);
    const grid = document.getElementById('receipts-grid');
    const stats = document.getElementById('receipt-stats');
    const unpaidEl = document.getElementById('total-unpaid-receipts');

    if (!grid) return;

    const totalAmt = all.reduce((s,r) => s + r.amt, 0);
    const unpaidAmt = all.filter(r => !r.paid).reduce((s,r) => s + r.amt, 0);

    if (stats) stats.innerHTML = `<span style="color:#a78bfa;font-weight:600;">${all.length} total</span> &nbsp;·&nbsp; <span style="color:#f87171;">₹${unpaidAmt.toLocaleString('en-IN')} pending</span>`;
    if (unpaidEl) unpaidEl.textContent = `₹${unpaidAmt.toLocaleString('en-IN')}`;

    if (filtered.length === 0) {
        grid.innerHTML = '<div style="grid-column:1/-1;padding:60px;text-align:center;color:#475569;font-style:italic;">No receipts found.</div>';
        return;
    }

    grid.innerHTML = filtered.map(r => {
        const dateFormatted = new Date(r.dateVal).toLocaleDateString('en-IN', { day:'2-digit', month:'short' });
        return `
            <div style="background:#1a2540;border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:16px;display:flex;flex-direction:column;">
                ${r.photo ? `
                    <div onclick="window.openLightbox('${r.photo}')" style="cursor:zoom-in;border-radius:10px;overflow:hidden;background:#0f172a;margin-bottom:12px;border:1px solid rgba(255,255,255,0.07);position:relative;">
                        <img src="${r.photo}" style="height:120px;width:100%;object-fit:cover;">
                        <div style="position:absolute;bottom:0;left:0;right:0;background:rgba(0,0,0,0.5);font-size:0.65rem;color:#ccc;padding:4px;text-align:center;">View photo</div>
                    </div>` : ''}
                <div class="flex-between mb-2">
                    <div style="font-weight:700;color:#f1f5f9;">${r.shop}</div>
                    <div style="font-weight:800;color:#fbbf24;">₹${r.amt.toLocaleString('en-IN')}</div>
                </div>
                <div style="display:flex;align-items:center;gap:8px;font-size:0.75rem;color:#64748b;margin-bottom:12px;">
                    ${getCategoryIcon(r.category)} <span>${r.category}</span> &nbsp;·&nbsp; <span>${dateFormatted}</span>
                </div>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-top:auto;padding-top:10px;border-top:1px solid rgba(255,255,255,0.06);">
                    <span style="font-size:0.72rem;font-weight:700;color:${r.paid ? '#34d399' : '#f87171'};display:flex;align-items:center;gap:4px;">
                        <i data-lucide="${r.paid ? 'check-circle' : 'hourglass'}" style="width:12px;"></i> ${r.paid ? 'PAID' : 'PENDING'}
                    </span>
                    <div style="display:flex;gap:6px;">
                        <button onclick="window.toggleReceiptPaid(${r.id})" style="background:rgba(255,255,255,0.05);color:#94a3b8;border:1px solid rgba(255,255,255,0.1);border-radius:6px;padding:4px 8px;font-size:0.7rem;cursor:pointer;">
                            ${r.paid ? 'Mark Unpaid' : 'Mark Paid'}
                        </button>
                        <button onclick="window.deleteReceipt(${r.id})" style="color:#475569;border:none;background:none;cursor:pointer;"><i data-lucide="trash-2" style="width:14px;"></i></button>
                    </div>
                </div>
            </div>`;
    }).join('');
    if (window.lucide) window.lucide.createIcons();
}

// ── EXPENSE RECORDS ───────────────────────────────────────────────────────────
window.addExpense = async () => {
    const category = document.getElementById('exp-category').value;
    const amt      = parseFloat(document.getElementById('exp-amt').value);
    const note     = document.getElementById('exp-note').value.trim();

    if (!amt || amt <= 0) return showExpToast('Enter a valid expense amount.', 'error');

    // SAVE TO MYSQL BACKEND
    await window.DB.addExpense({ category, amt, note });

    document.getElementById('exp-amt').value = '';
    document.getElementById('exp-note').value = '';
    renderExpenses();
    showExpToast('Expense recorded!', 'success');
    if (window.refreshDashboard) window.refreshDashboard();
};

window.deleteExpense = (id) => {
    if (!confirm('Delete this record?')) return;
    window.DB.deleteExpense(id).then(() => {
        renderExpenses();
        if (window.refreshDashboard) window.refreshDashboard();
    });
};

window.clearAllExpenses = () => {
    showExpToast('Clear all is disabled for shared cloud data.', 'info');
};

async function renderExpenses() {
    let exps = await window.DB.getExpenses();
    const body = document.getElementById('expense-body');
    if (!body) return;

    // Safety: ensure it is an array
    if (!Array.isArray(exps)) exps = [];

    if (exps.length === 0) {
        body.innerHTML = '<tr><td colspan="4" style="padding:40px;text-align:center;color:#475569;font-style:italic;">No records.</td></tr>';
        return;
    }

    body.innerHTML = exps.slice().reverse().map(e => `
        <tr>
            <td style="font-size:0.8rem;color:#64748b;">${new Date(e.timestamp).toLocaleDateString('en-IN',{day:'2-digit',month:'short'})}</td>
            <td>
                <div style="font-weight:600;">${e.category}</div>
                <div style="font-size:0.75rem;color:#64748b;">${e.note || ''}</div>
            </td>
            <td style="text-align:right;font-weight:700;color:#f87171;">₹${e.amt.toLocaleString('en-IN')}</td>
            <td style="text-align:center;">
                <button onclick="window.deleteExpense(${e.id})" style="color:#475569;background:none;border:none;cursor:pointer;"><i data-lucide="trash-2" style="width:14px;"></i></button>
            </td>
        </tr>`).join('');
    if (window.lucide) window.lucide.createIcons();
}

function showExpToast(msg, type='info') {
    let t = document.getElementById('exp-toast');
    if (!t) {
        t = document.createElement('div'); t.id = 'exp-toast';
        t.style.cssText = 'position:fixed;bottom:26px;right:26px;z-index:9999;padding:10px 16px;border-radius:10px;font-size:0.82rem;font-weight:600;opacity:0;transform:translateY(8px);transition:0.25s;display:flex;align-items:center;gap:8px;box-shadow:0 6px 20px rgba(0,0,0,0.3);';
        document.body.appendChild(t);
    }
    const colors = type === 'success' ? ['rgba(16,185,129,0.1)','#10b981'] : ['rgba(239,68,68,0.1)','#ef4444'];
    t.style.background = colors[0]; t.style.color = colors[1]; t.style.border = `1px solid ${colors[1]}`;
    t.innerHTML = `<span>${msg}</span>`;
    t.style.opacity = '1'; t.style.transform = 'translateY(0)';
    setTimeout(() => { t.style.opacity='0'; t.style.transform='translateY(8px)'; }, 2500);
}

document.addEventListener('DOMContentLoaded', initExpenses);
