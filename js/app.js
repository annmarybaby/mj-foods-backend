window.initMobileNavigation = function() {
    const sidebar = document.querySelector('.sidebar');
    const toggle = document.getElementById('sidebar-toggle');
    const overlay = document.getElementById('sidebar-overlay');

    if (toggle) {
        toggle.onclick = (e) => {
            e.stopPropagation();
            const isOpen = sidebar.classList.toggle('open');
            if (overlay) {
                if (isOpen) overlay.style.display = 'block';
                else overlay.style.display = 'none';
            }
        };
    }

    if (overlay) {
        overlay.onclick = () => {
            sidebar.classList.remove('open');
            overlay.style.display = 'none';
        };
    }

    // Close on nav click
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            if (window.innerWidth <= 1024) {
                sidebar.classList.remove('open');
                if (overlay) overlay.classList.remove('active');
            }
        });
    });
};

document.addEventListener('DOMContentLoaded', () => {
    window.initMobileNavigation();
    
    // Navigation
    const navItems = document.querySelectorAll('.nav-item');
    const views = document.querySelectorAll('.view');
    const viewTitle = document.getElementById('view-title');
    const viewSubtitle = document.getElementById('view-subtitle');
    const viewDescriptions = {
        dashboard: 'Daily overview of sales, pending bills and expenses.',
        billing: 'Choose a shop, add items quickly, save the invoice and download it.',
        employees: 'Store employee details, phone numbers, wages and daily payments.',
        expenses: 'Track unit expenses and supplier bills in one clear place.',
        history: 'Review past invoices, payment status and full bill details.',
        ledger: 'See shop-wise balances, dues and payment status clearly.'
    };

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

            // Transitioning views: Always clear mobile state
            const sidebarEl = document.querySelector('.sidebar');
            const overlayEl = document.getElementById('sidebar-overlay');
            if (sidebarEl) sidebarEl.classList.remove('open');
            if (overlayEl) overlayEl.style.display = 'none';

            // Update Header Title
            if (viewTitle) viewTitle.textContent = item.querySelector('.text').textContent;
            if (viewSubtitle) viewSubtitle.textContent = viewDescriptions[item.dataset.view] || 'Manage daily operations with clear steps.';

            // Trigger view-specific refresh if needed...
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
            }
        });
    });

    // Time & Date Display
    const dateEl = document.getElementById('global-datetime');
    function updateTime() {
        if (!dateEl) return;
        const now = new Date();
        const options = { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        dateEl.textContent = now.toLocaleDateString('en-US', options);
    }
    if (dateEl) {
        setInterval(updateTime, 60000);
        updateTime();
    }

    const activeItem = document.querySelector('.nav-item.active');
    if (activeItem && viewSubtitle) {
        viewSubtitle.textContent = viewDescriptions[activeItem.dataset.view] || 'Manage daily operations with clear steps.';
    }

    // Init modules
    setTimeout(() => {
        if (window.refreshDashboard) window.refreshDashboard();
    }, 100);
});

// Format Currency Utility
window.formatCurrency = (num) => {
    return '₹' + parseFloat(num || 0).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2});
};
