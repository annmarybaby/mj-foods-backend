// Global State & Navigation
document.addEventListener('DOMContentLoaded', () => {
    // Navigation
    const navItems = document.querySelectorAll('.nav-item');
    const views = document.querySelectorAll('.view');
    const viewTitle = document.getElementById('view-title');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Update Active Nav Item
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');

            // Find Target View
            const targetId = `view-${item.dataset.view}`;
            
            // Switch Views
            views.forEach(v => {
                v.classList.remove('active');
                if(v.id === targetId) {
                    v.classList.add('active');
                }
            });

            // Update Title
            viewTitle.textContent = item.querySelector('.text').textContent;

            // Mobile: Close Sidebar on Link Click
            if (window.innerWidth <= 768) {
                document.querySelector('.sidebar').classList.remove('open');
            }

            // Trigger view-specific refresh if needed
            if (targetId === 'view-dashboard' && window.refreshDashboard) {
                window.refreshDashboard();
            } else if (targetId === 'view-history' && window.initHistory) {
                window.initHistory();
            } else if (targetId === 'view-ledger' && window.initLedger) {
                window.initLedger();
            } else if (targetId === 'view-employees' && window.initEmployees) {
                window.initEmployees();
            } else if (targetId === 'view-billing' && window.initBilling) {
                window.initBilling();
            } else if (targetId === 'view-database' && window.initDatabase) {
                window.initDatabase();
            }
        });
    });

    // Mobile Sidebar Toggle
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }

    if (overlay) {
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('open');
        });
    }

    // Time & Date Display
    const dateEl = document.getElementById('global-datetime');
    function updateTime() {
        const now = new Date();
        const options = { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        dateEl.textContent = now.toLocaleDateString('en-US', options);
    }
    setInterval(updateTime, 60000);
    updateTime();

    // Init modules if any global setup needed
    setTimeout(() => {
        if (window.refreshDashboard) window.refreshDashboard();
    }, 100);
});

// Format Currency Utility
window.formatCurrency = (num) => {
    return '₹' + parseFloat(num).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2});
};
