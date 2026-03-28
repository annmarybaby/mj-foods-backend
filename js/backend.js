// ═══════════════════════════════════════════════════════════════════
//  FIREBASE BACKEND SYNC MODULE — VERSION 2.0 (Automatic)
// ═══════════════════════════════════════════════════════════════════

/**
 * INSTRUCTIONS FOR USER:
 * Paste your configuration object below in place of the 'demoConfig'
 */

const demoConfig = {
    apiKey: "AIzaSy_YOUR_REAL_API_KEY_HERE",
    authDomain: "mj-foods-demo.firebaseapp.com",
    projectId: "mj-foods-demo",
    storageBucket: "mj-foods-demo.appspot.com",
    messagingSenderId: "1234567890",
    appId: "1:1234567890:web:abcdef"
};

let db = null;
let isCloudActive = false;
const SYNC_KEYS = ['mj_sales', 'mj_expenses', 'mj_employees', 'mj_emp_ledger', 'mj_receipts', 'mj_shops_v2'];

// ── Initialization ────────────────────────────────────────────────────────────
function initBackend() {
    try {
        if (!firebase.apps.length) {
            firebase.initializeApp(demoConfig);
            db = firebase.firestore();
            isCloudActive = (demoConfig.apiKey !== "AIzaSy_YOUR_REAL_API_KEY_HERE");
            
            if (isCloudActive) {
                console.log("☁️  Backend: Cloud Storage Connected");
                updateCloudStatusUI(true);
                syncFromCloud();
                setupAutoPush();
            } else {
                console.log("📂 Backend: Local Storage Active (Cloud Pending)");
                updateCloudStatusUI(false);
            }
        }
    } catch (e) {
        console.warn("⚠️  Backend Error:", e);
        updateCloudStatusUI(false);
    }
}

// ── UI Status Indicator ───────────────────────────────────────────────────────
function updateCloudStatusUI(active) {
    const footer = document.querySelector('.sidebar-footer');
    if (!footer) return;
    
    // Remove if already exists
    const existing = document.getElementById('cloud-status-widget');
    if (existing) existing.remove();

    const widget = document.createElement('div');
    widget.id = 'cloud-status-widget';
    widget.style.cssText = `
        margin-bottom: 12px;
        padding: 10px 14px;
        background: ${active ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.08)'};
        border: 1px solid ${active ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'};
        border-radius: 12px;
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 0.72rem;
    `;
    
    widget.innerHTML = `
        <div style="width:8px; height:8px; border-radius:50%; background:${active ? '#10b981' : '#f59e0b'}; box-shadow:0 0 8px ${active ? '#10b981' : '#f59e0b'};"></div>
        <div style="flex:1; color:${active ? '#34d399' : '#fbbf24'}; font-weight:700;">
            ${active ? 'DATABASE CONNECTED' : 'LOCAL CACHE ACTIVE'}
        </div>
        <i data-lucide="${active ? 'cloud-check' : 'cloud-off'}" style="width:14px; color:${active ? '#10b981' : '#f59e0b'};"></i>
    `;
    
    footer.prepend(widget);
    if (window.lucide) window.lucide.createIcons();
}

// ── CLOUD -> LOCAL (Pull) ─────────────────────────────────────────────────────
async function syncFromCloud() {
    if (!isCloudActive || !db) return;

    for (const key of SYNC_KEYS) {
        try {
            const doc = await db.collection('bakery_data').doc(key).get();
            if (doc.exists) {
                const cloudData = doc.data().items || [];
                const localData = JSON.parse(localStorage.getItem(key) || '[]');
                if (JSON.stringify(cloudData) !== JSON.stringify(localData)) {
                    localStorage.setItem('__temp_sync__', 'true'); // Flag to prevent infinite loop
                    localStorage.setItem(key, JSON.stringify(cloudData));
                    localStorage.removeItem('__temp_sync__');
                }
            }
        } catch (err) { console.error(`Pull Error (${key}):`, err); }
    }
}

// ── LOCAL -> CLOUD (Push) ─────────────────────────────────────────────────────
async function pushToCloud() {
    if (!isCloudActive || !db) return;

    for (const key of SYNC_KEYS) {
        const localData = JSON.parse(localStorage.getItem(key) || '[]');
        if (localData.length >= 0) { // Set even if empty
            try {
                await db.collection('bakery_data').doc(key).set({
                    items: localData,
                    lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
            } catch (err) { console.error(`Push Error (${key}):`, err); }
        }
    }
    console.log("📤 All data backed up to cloud database.");
}

// ── MAGIC SYNC (The "Connector") ─────────────────────────────────────────────
// Intercept all localStorage saves to trigger cloud updates automatically
const originalSetItem = localStorage.setItem;
localStorage.setItem = function(key, value) {
    originalSetItem.apply(this, arguments);
    
    // If it's one of our MJ keys and not a temporary sync flag, push to cloud
    if (isCloudActive && SYNC_KEYS.includes(key) && !localStorage.getItem('__temp_sync__')) {
        pushToCloud();
    }
};

function setupAutoPush() {
    setInterval(pushToCloud, 300000); // Heartbeat backup every 5 mins
}

window.cloudSyncTrigger = pushToCloud;

// Initialize on Load
document.addEventListener('DOMContentLoaded', initBackend);
document.addEventListener('view-changed', () => { if(isCloudActive) syncFromCloud(); });
